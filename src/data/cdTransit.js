/**
 * @module cdTransit
 * @description České dráhy (Czech Railways) 3D visualization and live connection layer for God's Eye View.
 *
 * Capabilities:
 * - Real-time connection search across Czech Republic via backend ČD mobile proxy
 * - High-fidelity 3D railway track polylines accurately hugging terrain and track curves
 * - Station pins with timetables and arrival/departure countdowns
 * - Live dead-reckoning train movement model with realtime delay badge
 * - Click-to-inspect and Cockpit Ride-Along driver chase camera
 */

import * as Cesium from 'cesium';
import { registerPickOwner, unregisterPickOwner } from './pickRegistry.js';
import { governorRequestRender } from '../renderGovernor.js';
import {
  findStation,
  resolveTrackPolyline,
  interpolateTrackPosition,
  haversineMeters,
} from './czechRailTracks.js';

// --- SVG Icons (Data URIs) ---

function createTrainIcon(type = 'Vlak', delayMinutes = 0) {
  const isDelayed = delayMinutes > 0;
  const statusColor = isDelayed ? '#ef4444' : '#10b981';
  const badgeColor = '#0284c7'; // ČD Cyan-Blue

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">
    <!-- Outer Glow / Background Shield -->
    <circle cx="36" cy="36" r="33" fill="rgba(15, 23, 42, 0.92)" stroke="${badgeColor}" stroke-width="3"/>
    
    <!-- Train Body -->
    <path d="M22 20 C22 15 26 13 36 13 C46 13 50 15 50 20 L50 45 C50 49 46 51 36 51 C26 51 22 49 22 45 Z" fill="${badgeColor}" stroke="#ffffff" stroke-width="2"/>
    
    <!-- Windshield -->
    <path d="M26 21 C26 18 28 17 36 17 C44 17 46 18 46 21 L46 29 C46 30 45 31 43 31 L29 31 C27 31 26 30 26 29 Z" fill="#0f172a"/>
    
    <!-- Twin Headlights -->
    <circle cx="28" cy="42" r="3" fill="#facc15"/>
    <circle cx="44" cy="42" r="3" fill="#facc15"/>
    
    <!-- Front Bumper -->
    <rect x="24" y="47" width="24" height="4" rx="2" fill="#334155"/>
    
    <!-- Status Dot (Green = On-time, Red = Delayed) -->
    <circle cx="56" cy="16" r="8" fill="${statusColor}" stroke="#ffffff" stroke-width="2.5"/>
    
    <!-- Train Type Label -->
    <rect x="18" y="53" width="36" height="15" rx="4" fill="#0f172a" stroke="${badgeColor}" stroke-width="1.5"/>
    <text x="36" y="64" font-family="'Inter', sans-serif" font-size="10" font-weight="900" fill="#38bdf8" text-anchor="middle">${type.slice(0, 4)}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createStationIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="20" fill="rgba(15, 23, 42, 0.9)" stroke="#38bdf8" stroke-width="3"/>
    <circle cx="24" cy="24" r="9" fill="#38bdf8"/>
    <circle cx="24" cy="24" r="4" fill="#ffffff"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const STATION_ICON = createStationIcon();

// --- Layer State ---
let _viewer = null;
let _enabled = false;
let _activeConnection = null;
let _trackPolyline = []; // Array of { lat, lon, distMeters }
let _trackEntity = null;
let _stationEntities = [];
let _trainEntity = null;
let _preUpdateRemove = null;
let _isCockpit = false;
let _stats = {
  status: 'idle',
  count: 0,
  activeTrain: null,
  delay: null,
};

/**
 * Initializes the České dráhy layer.
 * @param {Cesium.Viewer} viewer
 */
export function init(viewer) {
  _viewer = viewer;
  _enabled = true;
  _stats.status = 'nominal';

  registerPickOwner('cd-trains', (id) => {
    if (!id || typeof id !== 'string') return false;
    return id.startsWith('cd-');
  });

  setupClickHandler(viewer);
  governorRequestRender();
}

/**
 * Deactivates and tears down the ČD layer.
 */
export function destroy() {
  clearActiveConnection();
  if (_preUpdateRemove) {
    _preUpdateRemove();
    _preUpdateRemove = null;
  }
  unregisterPickOwner('cd-trains');
  _enabled = false;
  _viewer = null;
  _stats.status = 'unavailable';
}

/**
 * Return current layer stats for God's Eye View manager.
 */
export function getStats() {
  return {
    nominal: _enabled,
    status: _stats.status,
    count: _stats.count,
    activeTrain: _stats.activeTrain,
    delay: _stats.delay,
  };
}

/**
 * Handles clicks on ČD entities.
 */
function setupClickHandler(viewer) {
  if (!viewer || !viewer.screenSpaceEventHandler) return;

  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const picked = viewer.scene.pick(click.position);
    if (!picked || !picked.id) return;

    const id = typeof picked.id === 'string' ? picked.id : picked.id?.id;
    if (!id || !id.startsWith('cd-')) return;

    if (id === 'cd-active-train' && _activeConnection) {
      // Clicked on the active train -> toggle cockpit or show details
      toggleCockpitTracking();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/**
 * Clears existing rendered route, stations and train marker.
 */
export function clearActiveConnection() {
  if (_viewer && !_viewer.isDestroyed()) {
    if (_trackEntity) {
      _viewer.entities.remove(_trackEntity);
      _trackEntity = null;
    }
    for (const ent of _stationEntities) {
      _viewer.entities.remove(ent);
    }
    _stationEntities = [];
    if (_trainEntity) {
      _viewer.entities.remove(_trainEntity);
      _trainEntity = null;
    }
  }

  if (_preUpdateRemove) {
    _preUpdateRemove();
    _preUpdateRemove = null;
  }

  _activeConnection = null;
  _trackPolyline = [];
  _isCockpit = false;
  _stats.count = 0;
  _stats.activeTrain = null;
  _stats.delay = null;
  governorRequestRender();
}

/**
 * Activates and renders a selected ČD connection in 3D.
 *
 * @param {object} connection - Normalized connection object from ČD API
 */
export function selectConnection(connection) {
  if (!_viewer || !connection) return;
  clearActiveConnection();

  _activeConnection = connection;
  const train = connection.trains?.[0] || {};
  const fromName = connection.fromStation || train.fromStation || 'Praha hl.n.';
  const toName = connection.toStation || train.toStation || 'Brno hl.n.';

  _stats.activeTrain = train.trainName || 'Vlak ČD';
  _stats.delay = connection.delayText || 'Včas';
  _stats.count = 1;

  // 1. Resolve High-Fidelity Railway Track Geometry
  const intermediateStops = connection.trains.slice(1).map((t) => t.fromStation).filter(Boolean);
  _trackPolyline = resolveTrackPolyline(fromName, toName, intermediateStops);

  if (_trackPolyline.length < 2) {
    console.warn('[ČD Transit] Failed to resolve track polyline between', fromName, 'and', toName);
    return;
  }

  // 2. Render 3D Railway Track Polyline
  const positions = _trackPolyline.map((pt) =>
    Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, 210.0),
  );

  _trackEntity = _viewer.entities.add({
    id: `cd-track-${connection.id}`,
    name: `Trasa: ${train.trainName || 'Vlak'} (${fromName} -> ${toName})`,
    polyline: {
      positions,
      width: 5.5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.25,
        taperPower: 1.0,
        color: Cesium.Color.fromCssColorString('#0284c7'),
      }),
      depthFailMaterial: Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.65),
      clampToGround: true,
      classificationType: Cesium.ClassificationType.TERRAIN,
    },
  });

  // 3. Render Station Pins & Labels
  renderStationMarkers(fromName, toName, intermediateStops, connection);

  // 4. Spawn Animated Train Marker on Track
  spawnTrainMarker(train, connection.delayMinutes || 0);

  // 5. Start Smooth Dead-Reckoning Animation Loop
  startAnimationLoop();

  // 6. Fly Camera to Route Overview
  flyToRoute();
  governorRequestRender();
}

/**
 * Renders 3D pins for origin, destination, and intermediate stations.
 */
function renderStationMarkers(fromName, toName, intermediateStops, connection) {
  const allStops = [
    { name: fromName, role: 'origin', time: connection.firstDeparture },
    ...intermediateStops.map((name) => ({ name, role: 'stop' })),
    { name: toName, role: 'destination', time: connection.lastArrival },
  ];

  for (const stop of allStops) {
    const station = findStation(stop.name);
    if (!station) continue;

    const timeLabel = stop.time
      ? new Date(stop.time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
      : '';

    const ent = _viewer.entities.add({
      id: `cd-station-${stop.name}`,
      name: stop.name,
      position: Cesium.Cartesian3.fromDegrees(station.lon, station.lat, 220.0),
      billboard: {
        image: STATION_ICON,
        width: 32,
        height: 32,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(5000, 1.2, 250000, 0.5),
      },
      label: {
        text: `${stop.name}\n${timeLabel}`.trim(),
        font: 'bold 12px "Inter", sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -36),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        scaleByDistance: new Cesium.NearFarScalar(5000, 1.0, 200000, 0.4),
      },
    });
    _stationEntities.push(ent);
  }
}

/**
 * Spawns the 3D train marker entity on the track.
 */
function spawnTrainMarker(train, delayMinutes) {
  const trainIcon = createTrainIcon(train.trainType || 'Vlak', delayMinutes);
  const startPt = _trackPolyline[0];

  _trainEntity = _viewer.entities.add({
    id: 'cd-active-train',
    name: train.trainName || 'Vlak ČD',
    position: Cesium.Cartesian3.fromDegrees(startPt.lon, startPt.lat, 225.0),
    billboard: {
      image: trainIcon,
      width: 48,
      height: 48,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(2000, 1.3, 150000, 0.6),
    },
    label: {
      text: `${train.trainName || 'Vlak'}\n${train.line ? `[${train.line}] ` : ''}${train.fromStation} -> ${train.toStation}`,
      font: 'bold 13px "Inter", sans-serif',
      fillColor: Cesium.Color.fromCssColorString('#38bdf8'),
      outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
      outlineWidth: 3.5,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -42),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(2000, 1.0, 100000, 0.4),
    },
  });
}

/**
 * Calculates current progress along the track [0..1] based on schedule and live delay.
 */
function calculateCurrentProgress() {
  if (!_activeConnection) return 0;
  const first = _activeConnection.trains?.[0];
  const last = _activeConnection.trains?.[_activeConnection.trains.length - 1];
  if (!first || !last) return 0;

  const depTime = first.depTimestamp;
  const arrTime = last.arrTimestamp;
  const duration = arrTime - depTime;
  if (duration <= 0) return 0;

  const now = Date.now();
  const delayOffsetMs = (_activeConnection.delayMinutes || 0) * 60 * 1000;
  const effectiveNow = now - delayOffsetMs;

  if (effectiveNow < depTime) return 0;
  if (effectiveNow > arrTime) return 1;

  return (effectiveNow - depTime) / duration;
}

/**
 * Starts animation tick for smooth dead-reckoning movement and cockpit camera tracking.
 */
function startAnimationLoop() {
  if (_preUpdateRemove) return;

  _preUpdateRemove = _viewer.scene.preUpdate.addEventListener(() => {
    if (!_trainEntity || _trackPolyline.length < 2) return;

    const progress = calculateCurrentProgress();
    const interp = interpolateTrackPosition(_trackPolyline, progress);

    // Update train position in 3D
    const pos = Cesium.Cartesian3.fromDegrees(interp.lon, interp.lat, 225.0);
    _trainEntity.position = pos;

    // Cockpit / Ride-Along Camera
    if (_isCockpit && _viewer) {
      const headingRad = Cesium.Math.toRadians(interp.headingDeg);
      const pitchRad = Cesium.Math.toRadians(-18);
      _viewer.camera.lookAt(
        pos,
        new Cesium.HeadingPitchRange(headingRad, pitchRad, 450.0),
      );
    }
  });
}

/**
 * Toggles Cockpit / Ride-Along camera tracking for the active train.
 */
export function toggleCockpitTracking() {
  _isCockpit = !_isCockpit;
  if (!_isCockpit && _viewer) {
    _viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }
  governorRequestRender();
  return _isCockpit;
}

/**
 * Smoothly flies camera to encompass the full active railway route.
 */
export function flyToRoute() {
  if (!_viewer || _trackPolyline.length < 2) return;

  let minLat = 90;
  let maxLat = -90;
  let minLon = 180;
  let maxLon = -180;

  for (const pt of _trackPolyline) {
    if (pt.lat < minLat) minLat = pt.lat;
    if (pt.lat > maxLat) maxLat = pt.lat;
    if (pt.lon < minLon) minLon = pt.lon;
    if (pt.lon > maxLon) maxLon = pt.lon;
  }

  _viewer.camera.flyTo({
    destination: Cesium.Rectangle.fromDegrees(minLon - 0.2, minLat - 0.15, maxLon + 0.2, maxLat + 0.15),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-55),
    },
    duration: 2.2,
  });
}

/**
 * Client API to search stations using backend proxy.
 * @param {string} query
 * @returns {Promise<Array<{id: number, name: string, region: string}>>}
 */
export async function searchStations(query) {
  const norm = String(query || '').trim();
  if (!norm) return [];
  try {
    const res = await fetch(`/api/cd/stations?q=${encodeURIComponent(norm)}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    return json.stations || [];
  } catch (err) {
    console.warn('[ČD Transit] Station search failed:', err);
    return [];
  }
}

/**
 * Client API to search train connections using backend proxy.
 * @param {string} from
 * @param {string} to
 * @param {string|Date} [departure]
 * @returns {Promise<object>}
 */
export async function searchConnections(from, to, departure) {
  try {
    const depStr = departure ? new Date(departure).toISOString() : new Date().toISOString();
    const res = await fetch(
      `/api/cd/connections?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&dep=${encodeURIComponent(depStr)}`,
    );
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[ČD Transit] Connection search failed:', err);
    throw err;
  }
}

export async function enable(viewer) {
  init(viewer);
  return true;
}

export async function disable() {
  clearActiveConnection();
  _enabled = false;
  return true;
}

export async function update() {
  return true;
}

export const cdTransitLayer = {
  id: 'cd-trains',
  name: 'Vlaky ČD',
  icon: '🚆',
  source: 'České dráhy Mobile API',
  updateInterval: 30000,
  init,
  enable,
  disable,
  update,
  destroy,
  getStats,
  selectConnection,
  clearActiveConnection,
  searchStations,
  searchConnections,
  toggleCockpitTracking,
  flyToRoute,
};

export default cdTransitLayer;

