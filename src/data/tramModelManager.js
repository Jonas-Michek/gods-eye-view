import * as Cesium from 'cesium';

/**
 * @module tramModelManager
 * @description Manages close-zoom 3D Tatra T3 models for Prague Integrated Transport (PID) trams.
 * When camera is within range (~1,200m), trams seamlessly switch from 2D billboards to high-detail
 * 3D Tatra T3 models that follow street track curvature, heading, and elevation.
 *
 * Isolated from fleet generation/fetching so parallel work on tram loading won't collide.
 */

export const TRAM_MODEL_URL = '/models/tatra_t3.glb';
export const MODEL_ENTER_DIST_M = 1200; // Switch to 3D model below this distance
export const MODEL_EXIT_DIST_M = 1450;  // Switch back to 2D billboard above this distance (hysteresis)
export const MODEL_PRUNE_DIST_M = 2500; // Unload model from GPU memory beyond this distance

// Map of vehicleId -> { model: Cesium.Model|null, active: boolean, loading: boolean, lastPos: Cartesian3 }
const _tramModels = new Map();
let _viewer = null;
let _enabled = false;
const _scratchHpr = new Cesium.HeadingPitchRoll();

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
 * Compute modelMatrix for vehicle at given position and bearing
 * @param {Cesium.Cartesian3} position - ECEF world coordinates
 * @param {number} bearingDeg - Bearing in degrees (0 = North, 90 = East)
 * @param {Cesium.Matrix4} [result] - Output matrix to mutate
 * @returns {Cesium.Matrix4}
 */
export function computeTramModelMatrix(position, bearingDeg = 0, result = new Cesium.Matrix4()) {
  const headingRad = Cesium.Math.toRadians(bearingDeg || 0);
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

  for (const v of vehicles) {
    if (v.type !== 'tram' || !Number.isFinite(v.lon) || !Number.isFinite(v.lat)) continue;
    currentTramIds.add(v.id);

    const alt = (v.alt ?? 220.0) + 0.1;
    const tramPos = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, alt);
    const dist = Cesium.Cartesian3.distance(cameraPos, tramPos);

    let entry = _tramModels.get(v.id);
    const wasActive = entry?.active ?? false;
    const shouldBeActive = wasActive ? (dist < MODEL_EXIT_DIST_M) : (dist < MODEL_ENTER_DIST_M);

    if (shouldBeActive) {
      if (!entry) {
        entry = { model: null, active: true, loading: true };
        _tramModels.set(v.id, entry);

        // Async load glTF model for this tram
        if (Cesium.Model && typeof Cesium.Model.fromGltfAsync === 'function') {
          Cesium.Model.fromGltfAsync({
            url: TRAM_MODEL_URL,
            asynchronous: false,
            scale: 1.0,
            heightReference: Cesium.HeightReference ? Cesium.HeightReference.CLAMP_TO_GROUND : undefined,
            scene: viewer.scene,
            id: `pid-3d-${v.id}`,
          }).then((model) => {
            if (!_enabled || !entry.active) {
              try { viewer.scene?.primitives?.remove(model); model.destroy?.(); } catch {}
              return;
            }
            entry.model = model;
            entry.loading = false;
            // Position immediately
            computeTramModelMatrix(tramPos, v.bearing || 0, model.modelMatrix);
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
        computeTramModelMatrix(tramPos, v.bearing || 0, entry.model.modelMatrix);
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

      // Restore 2D billboard visibility when outside 3D threshold
      if (v.billboard && !v.hiddenByFilter) {
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
  TRAM_MODEL_URL,
  MODEL_ENTER_DIST_M,
  MODEL_EXIT_DIST_M,
};
