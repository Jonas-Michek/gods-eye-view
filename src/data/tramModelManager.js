import * as Cesium from 'cesium';
import { TRAM_TRACK_PATHS } from './pragueTramTracks.js';

/**
 * @module tramModelManager
 * @description Manages close-zoom 3D Tatra T3 models for Prague Integrated Transport (PID) trams.
 * When camera is within range (~1,200m), trams seamlessly switch from 2D billboards to high-detail
 * solid red low-poly 3D Tatra T3 models that snap directly to track vector geometries and follow
 * street curves without being sideways or displaced.
 */

export const TRAM_MODEL_URL = '/models/tatra_t3.glb';
export const MODEL_ENTER_DIST_M = 1200; // Switch to 3D model below this distance
export const MODEL_EXIT_DIST_M = 1450;  // Switch back to 2D billboard above this distance (hysteresis)
export const MODEL_PRUNE_DIST_M = 2500; // Unload model from GPU memory beyond this distance
export const TRAM_HEADING_OFFSET_DEG = 90; // Rotate 90 deg clockwise to align glTF nose with track tangent

// Earth projection constants around Prague (lat ~50.08 deg)
const K_LAT = 111320;
const K_LON = 71440;

// Map of vehicleId -> { model: Cesium.Model|null, active: boolean, loading: boolean }
const _tramModels = new Map();
let _viewer = null;
let _enabled = false;
const _scratchHpr = new Cesium.HeadingPitchRoll();
const _scratchApproxPos = new Cesium.Cartesian3();
const _scratchTramPos = new Cesium.Cartesian3();

/**
 * Helper to compute bearing between two points
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Snap tram coordinate directly to nearest track polyline vector segment.
 * Ensures the 3D tram sits precisely on the tracks and aligns with track tangent.
 * @param {number} lat
 * @param {number} lon
 * @param {number} bearing
 * @param {Object} vehicle
 * @returns {{ lat: number, lon: number, alt: number, bearing: number, snapped: boolean }}
 */
export function snapTramToTrack(lat, lon, bearing, vehicle) {
  const path = (vehicle?.routeNodes && vehicle.routeNodes.length >= 2)
    ? vehicle.routeNodes
    : (vehicle?.line && TRAM_TRACK_PATHS[vehicle.line] ? TRAM_TRACK_PATHS[vehicle.line] : null);

  if (!path || path.length < 2) {
    return { lat, lon, alt: vehicle?.alt ?? 220, bearing, snapped: false };
  }

  let bestDistSq = Infinity;
  let bestPoint = { lat, lon, alt: path[0].alt || 220 };
  let bestSegBearing = bearing;

  const maxSearchDistM = 90; // Snap within 90m corridor
  const maxSearchDistSq = maxSearchDistM * maxSearchDistM;

  let startIdx = 0;
  let endIdx = path.length - 1;
  if (typeof vehicle?.currentNodeIndex === 'number') {
    startIdx = Math.max(0, vehicle.currentNodeIndex - 3);
    endIdx = Math.min(path.length - 1, vehicle.currentNodeIndex + 5);
  }

  for (let i = startIdx; i < endIdx; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dx = (p2.lon - p1.lon) * K_LON;
    const dy = (p2.lat - p1.lat) * K_LAT;
    const segLenSq = dx * dx + dy * dy;
    if (segLenSq < 0.01) continue;

    const vx = (lon - p1.lon) * K_LON;
    const vy = (lat - p1.lat) * K_LAT;
    let t = (vx * dx + vy * dy) / segLenSq;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;

    const projX = p1.lon * K_LON + t * dx;
    const projY = p1.lat * K_LAT + t * dy;
    const curX = lon * K_LON;
    const curY = lat * K_LAT;
    const distSq = (curX - projX) * (curX - projX) + (curY - projY) * (curY - projY);

    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      const alt1 = p1.alt || 220;
      const alt2 = p2.alt || 220;
      bestPoint = {
        lat: p1.lat + t * (p2.lat - p1.lat),
        lon: p1.lon + t * (p2.lon - p1.lon),
        alt: alt1 + t * (alt2 - alt1),
      };
      bestSegBearing = calculateBearing(p1.lat, p1.lon, p2.lat, p2.lon);
    }
  }

  if (bestDistSq < maxSearchDistSq) {
    let diff = Math.abs(bearing - bestSegBearing) % 360;
    if (diff > 180) diff = 360 - diff;
    const forward = diff < 90;
    const finalBearing = forward ? bestSegBearing : ((bestSegBearing + 180) % 360);
    return { ...bestPoint, bearing: finalBearing, snapped: true };
  }

  return { lat, lon, alt: vehicle?.alt ?? 220, bearing, snapped: false };
}

/**
 * Initialize 3D tram model manager with the Cesium viewer
 * @param {Cesium.Viewer} viewer
 */
export function initTramModelManager(viewer) {
  _viewer = viewer;
  _enabled = true;
}

/**
 * Check if the 3D tram model manager is active
 * @returns {boolean}
 */
export function isTramModelManagerActive() {
  return _enabled;
}

/**
 * Get count of active 3D tram models currently displayed
 * @returns {number}
 */
export function getActive3DModelCount() {
  let count = 0;
  for (const entry of _tramModels.values()) {
    if (entry.active && entry.model?.show) count++;
  }
  return count;
}

/**
 * Compute modelMatrix for vehicle at given position and bearing.
 * Applies TRAM_HEADING_OFFSET_DEG to ensure the nose points along the track.
 * @param {Cesium.Cartesian3} position - ECEF world coordinates
 * @param {number} bearingDeg - Track tangent bearing in degrees
 * @param {Cesium.Matrix4} [result] - Output matrix to mutate
 * @returns {Cesium.Matrix4}
 */
export function computeTramModelMatrix(position, bearingDeg = 0, result = new Cesium.Matrix4()) {
  const correctedHeading = ((bearingDeg || 0) + TRAM_HEADING_OFFSET_DEG) % 360;
  const headingRad = Cesium.Math.toRadians(correctedHeading);
  _scratchHpr.heading = headingRad;
  _scratchHpr.pitch = 0;
  _scratchHpr.roll = 0;
  return Cesium.Transforms.headingPitchRollToFixedFrame(
    position,
    _scratchHpr,
    Cesium.Ellipsoid.WGS84,
    undefined,
    result,
  );
}

/**
 * Update 3D models for all tram vehicles on each animation frame
 * @param {Cesium.Viewer} viewer
 * @param {Array<Object>} vehicles - Fleet of vehicles from pidTransit
 */
export function updateTramModels(viewer, vehicles) {
  if (!_enabled || !viewer || !vehicles || !Array.isArray(vehicles)) return;
  const cameraPos = viewer.camera?.positionWC;
  if (!cameraPos) return;

  const currentTramIds = new Set();

  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.type !== 'tram' || !Number.isFinite(v.lon) || !Number.isFinite(v.lat)) continue;
    currentTramIds.add(v.id);

    let entry = _tramModels.get(v.id);
    const wasActive = entry?.active ?? false;

    // Fast distance check before any expensive track snapping or allocations
    Cesium.Cartesian3.fromDegrees(
      v.lon,
      v.lat,
      v.alt || 220.0,
      undefined,
      _scratchApproxPos,
    );
    const dist = Cesium.Cartesian3.distance(cameraPos, _scratchApproxPos);
    const shouldBeActive = wasActive ? (dist < MODEL_EXIT_DIST_M) : (dist < MODEL_ENTER_DIST_M);

    if (!shouldBeActive && !wasActive) {
      // Vehicle is far from camera and wasn't active: skip immediately!
      // Do not snap to track, do not allocate, and do not touch billboard visibility!
      continue;
    }

    if (shouldBeActive) {
      // 1. Snap to track vector
      const snapped = snapTramToTrack(v.lat, v.lon, v.bearing || 0, v);

      // 2. Position model on track vector at true ground elevation
      const alt = (snapped.alt ?? 220.0) + 0.1;
      Cesium.Cartesian3.fromDegrees(snapped.lon, snapped.lat, alt, undefined, _scratchTramPos);

      if (!entry) {
        entry = { model: null, active: true, loading: true };
        _tramModels.set(v.id, entry);

        // Async load glTF model for this tram
        if (Cesium.Model && typeof Cesium.Model.fromGltfAsync === 'function') {
          Cesium.Model.fromGltfAsync({
            url: TRAM_MODEL_URL,
            asynchronous: false,
            scale: 1.0,
            scene: viewer.scene,
            id: `pid-3d-${v.id}`,
          }).then((model) => {
            if (!_enabled || !entry.active) {
              try { viewer.scene?.primitives?.remove(model); model.destroy?.(); } catch {}
              return;
            }
            entry.model = model;
            entry.loading = false;
            // Position and orient along track vector
            computeTramModelMatrix(_scratchTramPos, snapped.bearing, model.modelMatrix);
            viewer.scene?.primitives?.add(model);
          }).catch((err) => {
            console.warn('[PID Tram 3D] Failed to load 3D tram model:', err);
            entry.loading = false;
          });
        }
      } else {
        entry.active = true;
      }

      if (entry.model) {
        entry.model.show = true;
        computeTramModelMatrix(_scratchTramPos, snapped.bearing, entry.model.modelMatrix);
      }

      // Hide the 2D billboard so it doesn't clash with the 3D model
      if (v.billboard) {
        v.billboard.show = false;
      }
    } else {
      if (entry) {
        entry.active = false;
        if (entry.model) {
          entry.model.show = false;
        }

        // Memory pruning for far-away models
        if (dist > MODEL_PRUNE_DIST_M && entry.model) {
          try {
            viewer.scene?.primitives?.remove(entry.model);
            entry.model.destroy?.();
          } catch {}
          _tramModels.delete(v.id);
        }
      }

      // Restore 2D billboard visibility ONLY if it was previously hidden by active 3D model
      if (v.billboard && wasActive) {
        v.billboard.show = true;
      }
    }
  }

  // Cleanup removed vehicles
  for (const [id, entry] of _tramModels.entries()) {
    if (!currentTramIds.has(id)) {
      if (entry.model) {
        try {
          viewer.scene?.primitives?.remove(entry.model);
          entry.model.destroy?.();
        } catch {}
      }
      _tramModels.delete(id);
    }
  }
}

/**
 * Teardown and cleanup all 3D tram models
 * @param {Cesium.Viewer} [viewer]
 */
export function destroyTramModelManager(viewer) {
  _enabled = false;
  const targetViewer = viewer || _viewer;

  for (const entry of _tramModels.values()) {
    if (entry.model && targetViewer?.scene?.primitives) {
      try {
        targetViewer.scene.primitives.remove(entry.model);
        entry.model.destroy?.();
      } catch {}
    }
  }
  _tramModels.clear();
  _viewer = null;
}

export default {
  initTramModelManager,
  updateTramModels,
  destroyTramModelManager,
  isTramModelManagerActive,
  getActive3DModelCount,
  computeTramModelMatrix,
  snapTramToTrack,
  TRAM_MODEL_URL,
  MODEL_ENTER_DIST_M,
  MODEL_EXIT_DIST_M,
  TRAM_HEADING_OFFSET_DEG,
};
