/**
 * @module pidTransit
 * @description Prague Integrated Transport (PID) live transit layer for God's Eye View.
 *
 * Provides:
 * - 3D Metro network (Lines A, B, C, D) with underground subsurface translucency
 * - 3D Tram corridors (Lines 22, 9, 17, 42) and Vltava ferries
 * - Live real-time vehicle positions from Golemio API or kinematic timetable simulation
 * - Smooth 60 FPS dead-reckoning motion model along railway & street geometry
 * - Click-to-inspect and Cockpit / Ride-Along driver camera tracking
 * - Radar API for mobile Prague Guide ("Co ke mně jede?")
 */

import * as Cesium from 'cesium';
import { registerPickOwner, unregisterPickOwner } from './pickRegistry.js';
import { registerSpriteCollection, restoreSpriteOrder } from './spriteOrder.js';
import { governorRequestRender } from '../renderGovernor.js';
import {
  PRAGUE_BOUNDS,
  METRO_LINES,
  METRO_STATIONS,
  TRAM_LINES,
  FERRIES,
  METRO_COLORS,
  TRAM_COLOR,
  BUS_COLOR,
  FERRY_COLOR,
} from './pragueTransitData.js';
import { PRAGUE_POIS } from './praguePoi.js';
import { showPragueGuide, hidePragueGuide } from '../ui/pragueMobileGuide.js';

// --- SVG Icons (Data URIs) ---

function createMetroIcon(line, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect x="6" y="6" width="52" height="52" rx="14" fill="${color}" stroke="#ffffff" stroke-width="3.5"/>
    <text x="32" y="44" font-family="'Inter', 'Arial Black', sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle">${line}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createTramIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <path d="M22 18 h20 a4 4 0 0 1 4 4 v20 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-20 a4 4 0 0 1 4 -4 z" fill="#ffffff"/>
    <rect x="22" y="22" width="20" height="10" rx="2" fill="${color}"/>
    <circle cx="23" cy="40" r="2.5" fill="#facc15"/>
    <circle cx="41" cy="40" r="2.5" fill="#facc15"/>
    <line x1="32" y1="18" x2="32" y2="12" stroke="#ffffff" stroke-width="3"/>
    <line x1="26" y1="12" x2="38" y2="12" stroke="#ffffff" stroke-width="3"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createBusIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <rect x="18" y="20" width="28" height="26" rx="4" fill="#ffffff"/>
    <rect x="21" y="24" width="22" height="9" rx="2" fill="${color}"/>
    <circle cx="23" cy="39" r="2.5" fill="#facc15"/>
    <circle cx="41" cy="39" r="2.5" fill="#facc15"/>
    <rect x="22" y="46" width="6" height="4" rx="1" fill="#475569"/>
    <rect x="36" y="46" width="6" height="4" rx="1" fill="#475569"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createFerryIcon(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="28" fill="${color}" stroke="#ffffff" stroke-width="3"/>
    <path d="M16 38 L22 46 L42 46 L48 38 Z" fill="#ffffff"/>
    <rect x="26" y="26" width="12" height="10" rx="1" fill="#ffffff"/>
    <rect x="29" y="19" width="6" height="7" fill="#facc15"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createPoiIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="26" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" stroke-width="3.5"/>
    <circle cx="32" cy="32" r="10" fill="#38bdf8"/>
    <circle cx="32" cy="32" r="4" fill="#ffffff"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const ICONS = {
  metroA: createMetroIcon('A', METRO_COLORS.A),
  metroB: createMetroIcon('B', METRO_COLORS.B),
  metroC: createMetroIcon('C', METRO_COLORS.C),
  metroD: createMetroIcon('D', METRO_COLORS.D),
  tram: createTramIcon(TRAM_COLOR),
  bus: createBusIcon(BUS_COLOR),
  ferry: createFerryIcon(FERRY_COLOR),
  poi: createPoiIcon(),
};

// --- State Variables ---
let _viewer = null;
let _enabled = false;
let _loading = false;
let _count = 0;
let _lastUpdate = null;
let _error = null;

let _polylineCollection = null;
let _billboardCollection = null;
let _laserPolyline = null;

let _pollTimer = null;
let _animationFrame = null;
let _clickHandler = null;

// Tracked / Selected Entity
let _selectedVehicle = null;
let _trackedCameraActive = false;

// Row controls & params
let _showRadar = false;
let _filter = 'all'; // 'all' | 'metro' | 'tram'
let _rowControlsListener = null;

// Active simulated or live vehicle fleet
const _vehicles = [];

// Helper to compute bearing between two coords
function calculateBearing(lat1, lon1, lat2, lon2) {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Distance in meters (Haversine formula)
function haversineDistanceM(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate initial fleet of simulated vehicles across Prague routes
 */
function createInitialFleet() {
  const fleet = [];

  // Metro Trains
  const metroLines = ['A', 'B', 'C'];
  metroLines.forEach((lineKey) => {
    const line = METRO_LINES[lineKey];
    const count = 4; // 4 trains per metro line
    for (let i = 0; i < count; i++) {
      const forward = i % 2 === 0;
      const startIdx = Math.floor((i / count) * (line.stations.length - 2));
      fleet.push({
        id: `pid-metro-${lineKey}-${i + 1}`,
        type: 'metro',
        line: lineKey,
        lineName: `Metro ${lineKey}`,
        direction: forward ? line.stations[line.stations.length - 1].name : line.stations[0].name,
        routeNodes: forward ? [...line.stations] : [...line.stations].reverse(),
        currentNodeIndex: startIdx,
        progress: Math.random() * 0.8,
        speedMps: 18, // ~65 km/h
        lat: line.stations[startIdx].lat,
        lon: line.stations[startIdx].lon,
        depth: line.stations[startIdx].depth || 20,
        bearing: 0,
        delayMin: (Math.random() * 1.5).toFixed(1),
        fleetNumber: `81-71M #${3100 + i}`,
        wheelchair: true,
        airConditioned: lineKey === 'C' || Math.random() > 0.4,
        nextStop: line.stations[startIdx + 1]?.name || 'Depo',
      });
    }
  });

  // Trams
  TRAM_LINES.forEach((tramRoute) => {
    const count = 3; // 3 trams per key route
    for (let i = 0; i < count; i++) {
      const forward = i % 2 === 0;
      const stops = forward ? [...tramRoute.stops] : [...tramRoute.stops].reverse();
      const startIdx = Math.floor((i / count) * (stops.length - 2));
      fleet.push({
        id: `pid-tram-${tramRoute.line}-${i + 1}`,
        type: 'tram',
        line: tramRoute.line,
        lineName: `Tram ${tramRoute.line}`,
        direction: stops[stops.length - 1].name,
        routeNodes: stops,
        currentNodeIndex: startIdx,
        progress: Math.random() * 0.8,
        speedMps: 9, // ~32 km/h
        lat: stops[startIdx].lat,
        lon: stops[startIdx].lon,
        depth: 0,
        bearing: 0,
        delayMin: (Math.random() * 3.5).toFixed(1),
        fleetNumber: tramRoute.historical ? `Tatra T3 #${6100 + i}` : `Škoda 15T #${9250 + i}`,
        wheelchair: !tramRoute.historical,
        airConditioned: !tramRoute.historical,
        nextStop: stops[startIdx + 1]?.name || stops[stops.length - 1].name,
      });
    }
  });

  // Airport Bus 119
  fleet.push({
    id: 'pid-bus-119-1',
    type: 'bus',
    line: '119',
    lineName: 'Bus 119 (Airport Express)',
    direction: 'Letiště Václava Havla',
    routeNodes: [
      { name: 'Nádraží Veleslavín', lat: 50.0963, lon: 14.3688 },
      { name: 'Divoká Šárka', lat: 50.0988, lon: 14.3255 },
      { name: 'Dědina', lat: 50.0975, lon: 14.3015 },
      { name: 'Terminál 1', lat: 50.1065, lon: 14.2695 },
      { name: 'Terminál 2', lat: 50.1085, lon: 14.2645 },
    ],
    currentNodeIndex: 1,
    progress: 0.4,
    speedMps: 13,
    lat: 50.0988,
    lon: 14.3255,
    depth: 0,
    bearing: 280,
    delayMin: '0.0',
    fleetNumber: 'Škoda 24Tr #${6890}',
    wheelchair: true,
    airConditioned: true,
    nextStop: 'Terminál 1',
  });

  // Ferries
  FERRIES.forEach((ferry, idx) => {
    fleet.push({
      id: `pid-ferry-${ferry.id}`,
      type: 'ferry',
      line: ferry.id,
      lineName: ferry.name,
      direction: ferry.end.lat > ferry.start.lat ? 'Severní břeh' : 'Jižní břeh',
      routeNodes: [ferry.start, ferry.end],
      currentNodeIndex: 0,
      progress: (idx * 0.25) % 1.0,
      speedMps: 3,
      lat: ferry.start.lat,
      lon: ferry.start.lon,
      depth: 0,
      bearing: 90,
      delayMin: '0.0',
      fleetNumber: `Loď Blanice #${idx + 1}`,
      wheelchair: true,
      airConditioned: false,
      nextStop: 'Protější břeh',
    });
  });

  return fleet;
}

/**
 * Step kinematic movement for all simulated vehicles along their nodes
 */
function updateFleetMotion(dtSec = 0.05) {
  for (const v of _vehicles) {
    if (!v.routeNodes || v.routeNodes.length < 2) continue;
    const fromNode = v.routeNodes[v.currentNodeIndex];
    const toNode = v.routeNodes[v.currentNodeIndex + 1];

    if (!fromNode || !toNode) {
      // Reverse route or wrap
      v.routeNodes.reverse();
      v.currentNodeIndex = 0;
      v.progress = 0;
      continue;
    }

    const legDist = haversineDistanceM(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
    const speed = v.speedMps || 10;
    const progressInc = legDist > 0 ? (speed * dtSec) / legDist : 0.05;

    v.progress += progressInc;

    if (v.progress >= 1.0) {
      v.progress = 0;
      v.currentNodeIndex++;
      if (v.currentNodeIndex >= v.routeNodes.length - 1) {
        v.routeNodes.reverse();
        v.currentNodeIndex = 0;
      }
      v.nextStop = v.routeNodes[v.currentNodeIndex + 1]?.name || v.direction;
    }

    const currFrom = v.routeNodes[v.currentNodeIndex];
    const currTo = v.routeNodes[v.currentNodeIndex + 1];
    if (currFrom && currTo) {
      v.lat = currFrom.lat + (currTo.lat - currFrom.lat) * v.progress;
      v.lon = currFrom.lon + (currTo.lon - currFrom.lon) * v.progress;
      v.bearing = calculateBearing(currFrom.lat, currFrom.lon, currTo.lat, currTo.lon);
    }
  }
}

/**
 * Fetch live vehicle positions from Golemio API if token is present
 */
async function fetchGolemioPositions(token) {
  if (!token) return false;
  try {
    const url = 'https://api.golemio.cz/v2/vehiclepositions';
    const resp = await fetch(url, {
      headers: {
        'x-access-token': token,
        Accept: 'application/json',
      },
    });
    if (!resp.ok) return false;
    const data = await resp.json();
    if (!data || !Array.isArray(data.features)) return false;

    // Merge Golemio features into live vehicles
    const pragueFeatures = data.features.filter((f) => {
      const coords = f.geometry?.coordinates;
      if (!coords) return false;
      const lon = coords[0];
      const lat = coords[1];
      return (
        lat >= PRAGUE_BOUNDS.southwest.lat &&
        lat <= PRAGUE_BOUNDS.northeast.lat &&
        lon >= PRAGUE_BOUNDS.southwest.lon &&
        lon <= PRAGUE_BOUNDS.northeast.lon
      );
    });

    if (pragueFeatures.length > 0) {
      _count = pragueFeatures.length;
      _lastUpdate = Date.now();
      _error = null;
      return true;
    }
  } catch (err) {
    console.warn('[PID Transit] Golemio fetch error:', err);
  }
  return false;
}

/**
 * Render static railway, metro and tram corridors as glowing 3D polyline primitives
 */
function buildStaticTrackPolylines(viewer) {
  if (_polylineCollection) {
    viewer.scene.primitives.remove(_polylineCollection);
    _polylineCollection = null;
  }

  const polylines = viewer.scene.primitives.add(new Cesium.PolylineCollection());

  // 1. Metro lines (in 3D tunnel depths)
  Object.entries(METRO_LINES).forEach(([key, line]) => {
    const positions = line.stations.map((s) => {
      // Subsurface depth: offset altitude downwards
      const depthM = s.depth ? -s.depth : 0;
      return Cesium.Cartesian3.fromDegrees(s.lon, s.lat, depthM);
    });

    polylines.add({
      positions,
      width: 5.0,
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(line.color).withAlpha(0.92),
      }),
      id: `pid-track-metro-${key}`,
    });
  });

  // 2. Tram corridors
  TRAM_LINES.forEach((tram) => {
    const positions = tram.stops.map((s) => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, 2.0));
    polylines.add({
      positions,
      width: 3.5,
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(tram.color).withAlpha(0.85),
      }),
      id: `pid-track-tram-${tram.line}`,
    });
  });

  // 3. Ferries
  FERRIES.forEach((ferry) => {
    polylines.add({
      positions: [
        Cesium.Cartesian3.fromDegrees(ferry.start.lon, ferry.start.lat, 1.0),
        Cesium.Cartesian3.fromDegrees(ferry.end.lon, ferry.end.lat, 1.0),
      ],
      width: 2.5,
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(FERRY_COLOR).withAlpha(0.75),
      }),
      id: `pid-ferry-line-${ferry.id}`,
    });
  });

  _polylineCollection = polylines;
}

/**
 * Render billboards for stations, POIs and live moving vehicles
 */
function buildBillboardCollections(viewer) {
  if (_billboardCollection) {
    viewer.scene.primitives.remove(_billboardCollection);
    _billboardCollection = null;
  }

  const billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection());
  registerSpriteCollection('pid-transit', billboards);

  // Metro station markers
  METRO_STATIONS.forEach((station) => {
    const iconKey = `metro${station.line}`;
    billboards.add({
      position: Cesium.Cartesian3.fromDegrees(station.lon, station.lat, (station.depth ? -station.depth : 0) + 1.0),
      image: ICONS[iconKey] || ICONS.metroA,
      width: 24,
      height: 24,
      scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 40000, 0.4),
      id: `pid-station-${station.id}`,
    });
  });

  // Prague POI markers
  PRAGUE_POIS.forEach((poi) => {
    billboards.add({
      position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, 15.0),
      image: ICONS.poi,
      width: 26,
      height: 26,
      scaleByDistance: new Cesium.NearFarScalar(500, 1.1, 50000, 0.5),
      id: `pid-poi-${poi.id}`,
    });
  });

  // Live Vehicle Billboards (one per vehicle in fleet)
  _vehicles.forEach((v) => {
    let icon = ICONS.bus;
    if (v.type === 'metro') {
      icon = ICONS[`metro${v.line}`] || ICONS.metroA;
    } else if (v.type === 'tram') {
      icon = ICONS.tram;
    } else if (v.type === 'ferry') {
      icon = ICONS.ferry;
    }

    const altitude = v.type === 'metro' ? -(v.depth || 15) : 3.0;
    const bb = billboards.add({
      position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, altitude),
      image: icon,
      width: 28,
      height: 28,
      scaleByDistance: new Cesium.NearFarScalar(300, 1.2, 35000, 0.5),
      id: v.id,
    });
    v.billboard = bb;
  });

  _billboardCollection = billboards;
}

/**
 * Filter vehicles, stations and track polylines based on mode selection
 */
function applyFilter() {
  for (const v of _vehicles) {
    if (v.billboard) {
      if (_filter === 'all') {
        v.billboard.show = true;
      } else if (_filter === 'metro') {
        v.billboard.show = (v.type === 'metro');
      } else if (_filter === 'tram') {
        v.billboard.show = (v.type === 'tram');
      }
    }
  }

  if (_polylineCollection) {
    const len = _polylineCollection.length;
    for (let i = 0; i < len; i++) {
      const p = _polylineCollection.get(i);
      if (!p || !p.id) continue;
      if (typeof p.id === 'string') {
        if (p.id.startsWith('pid-track-metro-')) {
          p.show = (_filter === 'all' || _filter === 'metro');
        } else if (p.id.startsWith('pid-track-tram-')) {
          p.show = (_filter === 'all' || _filter === 'tram');
        } else if (p.id.startsWith('pid-ferry-')) {
          p.show = (_filter === 'all');
        }
      }
    }
  }

  if (_billboardCollection) {
    const len = _billboardCollection.length;
    for (let i = 0; i < len; i++) {
      const b = _billboardCollection.get(i);
      if (!b || !b.id) continue;
      if (typeof b.id === 'string' && b.id.startsWith('pid-station-')) {
        b.show = (_filter === 'all' || _filter === 'metro');
      }
    }
  }

  governorRequestRender();
}

/**
 * Animation loop for dead-reckoning movement
 */
function startAnimationLoop(viewer) {
  let lastTime = performance.now();

  function onFrame(now) {
    if (!_enabled) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Step physics / track progress
    updateFleetMotion(dt);

    // Update Cesium billboards
    for (const v of _vehicles) {
      if (!v.billboard) continue;
      const alt = v.type === 'metro' ? -(v.depth || 15) : 3.0;
      v.billboard.position = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, alt);
    }

    // If a vehicle is currently tracked in Cockpit View, sync camera
    if (_trackedCameraActive && _selectedVehicle) {
      updateCockpitCamera(viewer, _selectedVehicle);
    }

    governorRequestRender();
    _animationFrame = requestAnimationFrame(onFrame);
  }

  _animationFrame = requestAnimationFrame(onFrame);
}

/**
 * First-person / Chase Cockpit Camera locked to vehicle
 */
function updateCockpitCamera(viewer, vehicle) {
  if (!viewer || !vehicle) return;
  const headingRad = Cesium.Math.toRadians(vehicle.bearing || 0);
  const pitchRad = Cesium.Math.toRadians(vehicle.type === 'metro' ? -5 : -12);
  const rangeM = vehicle.type === 'metro' ? 12 : 25;

  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    vehicle.lon,
    vehicle.lat,
    vehicle.type === 'metro' ? -(vehicle.depth || 15) + 3 : 5.0,
  );

  viewer.camera.lookAt(
    targetCartesian,
    new Cesium.HeadingPitchRange(headingRad, pitchRad, rangeM),
  );
}

/**
 * Connect POI to nearest transit station with glowing laser polyline
 */
function drawTransitLaser(viewer, poi) {
  if (_laserPolyline) {
    viewer.scene.primitives.remove(_laserPolyline);
    _laserPolyline = null;
  }
  if (!poi || !poi.nearestStopCoords) return;

  const start = Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, 20.0);
  const end = Cesium.Cartesian3.fromDegrees(poi.nearestStopCoords.lon, poi.nearestStopCoords.lat, 5.0);

  const polylineCollection = viewer.scene.primitives.add(new Cesium.PolylineCollection());
  polylineCollection.add({
    positions: [start, end],
    width: 4.0,
    material: Cesium.Material.fromType('Color', {
      color: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.95),
    }),
    id: 'pid-laser-vector',
  });
  _laserPolyline = polylineCollection;
}

/**
 * Handle pick / click on vehicles or POIs
 */
function setupClickHandling(viewer) {
  _clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  _clickHandler.setInputAction((movement) => {
    const picked = viewer.scene.pick(movement.position);
    if (!picked || !picked.id || typeof picked.id !== 'string') return;
    const id = picked.id;

    if (id.startsWith('pid-metro-') || id.startsWith('pid-tram-') || id.startsWith('pid-bus-') || id.startsWith('pid-ferry-')) {
      const v = _vehicles.find((veh) => veh.id === id);
      if (v) {
        _selectedVehicle = v;
        window.dispatchEvent(new CustomEvent('gev:pid-vehicle-selected', { detail: v }));
        console.info(`[PID Transit] Selected vehicle: ${v.lineName} -> ${v.direction}`);
      }
    } else if (id.startsWith('pid-poi-')) {
      const poiId = id.replace('pid-poi-', '');
      const poi = PRAGUE_POIS.find((p) => p.id === poiId);
      if (poi) {
        drawTransitLaser(viewer, poi);
        window.dispatchEvent(new CustomEvent('gev:pid-poi-selected', { detail: poi }));
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // Escape clears selection and camera lock
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (_trackedCameraActive) {
        _trackedCameraActive = false;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (_rowControlsListener) _rowControlsListener();
      }
      if (_laserPolyline) {
        viewer.scene.primitives.remove(_laserPolyline);
        _laserPolyline = null;
      }
      _selectedVehicle = null;
      window.dispatchEvent(new CustomEvent('gev:pid-selection-cleared'));
    }
  });
}

// ── Public Layer API ────────────────────────────────────────────────────────

export const pidTransitLayer = {
  id: 'pid-transit',
  name: 'Prague Transit (PID)',
  icon: '🚊',
  source: 'PID & Golemio Open Data',

  async init(viewer) {
    _viewer = viewer;
    return true;
  },

  async enable(viewer) {
    if (_enabled) return true;
    _viewer = viewer;
    _enabled = true;
    _loading = true;

    // 1. Enable subsurface translucency so underground metro tunnels are visible
    try {
      if (viewer.scene.globe) {
        viewer.scene.globe.translucency.enabled = true;
        viewer.scene.globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(1000, 0.4, 40000, 1.0);
      }
    } catch {
      // Ignore if globe doesn't support translucency in current stack
    }

    // 2. Register pick ownership
    registerPickOwner('pid-transit', (pickedId) => {
      return typeof pickedId === 'string' && pickedId.startsWith('pid-');
    });

    // 3. Build fleet and 3D tracks
    if (_vehicles.length === 0) {
      _vehicles.push(...createInitialFleet());
      _count = _vehicles.length;
    }

    buildStaticTrackPolylines(viewer);
    buildBillboardCollections(viewer);
    applyFilter();
    setupClickHandling(viewer);
    startAnimationLoop(viewer);

    if (_showRadar) {
      showPragueGuide();
    }

    // 4. Poll live data if token is provided
    const token = import.meta.env.VITE_GOLEMIO_API_KEY || localStorage.getItem('gev:golemio-key');
    if (token) {
      await fetchGolemioPositions(token);
    }

    _pollTimer = setInterval(async () => {
      const liveToken = import.meta.env.VITE_GOLEMIO_API_KEY || localStorage.getItem('gev:golemio-key');
      if (liveToken) {
        await fetchGolemioPositions(liveToken);
      }
    }, 15000);

    _loading = false;
    _lastUpdate = Date.now();
    governorRequestRender();
    console.info(`[PID Transit] Layer activated with ${_count} transit elements.`);
    return true;
  },

  async disable(viewer) {
    if (!_enabled) return true;
    _enabled = false;

    hidePragueGuide();

    if (_pollTimer) {
      clearInterval(_pollTimer);
      _pollTimer = null;
    }
    if (_animationFrame) {
      cancelAnimationFrame(_animationFrame);
      _animationFrame = null;
    }
    if (_clickHandler) {
      _clickHandler.destroy();
      _clickHandler = null;
    }

    if (_trackedCameraActive) {
      _trackedCameraActive = false;
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }

    if (_polylineCollection) {
      viewer.scene.primitives.remove(_polylineCollection);
      _polylineCollection = null;
    }
    if (_billboardCollection) {
      viewer.scene.primitives.remove(_billboardCollection);
      _billboardCollection = null;
    }
    if (_laserPolyline) {
      viewer.scene.primitives.remove(_laserPolyline);
      _laserPolyline = null;
    }

    // Revert globe translucency
    if (viewer.scene.globe) {
      viewer.scene.globe.translucency.enabled = false;
    }

    unregisterPickOwner('pid-transit');
    governorRequestRender();
    return true;
  },

  async refresh(viewer) {
    if (!_enabled) return false;
    const token = import.meta.env.VITE_GOLEMIO_API_KEY || localStorage.getItem('gev:golemio-key');
    if (token) {
      return await fetchGolemioPositions(token);
    }
    _lastUpdate = Date.now();
    return true;
  },

  destroy(viewer) {
    this.disable(viewer);
    _vehicles.length = 0;
    _viewer = null;
  },

  getStats() {
    return {
      count: _count,
      lastUpdate: _lastUpdate,
      loading: _loading,
      error: _error,
    };
  },

  /**
   * Row controls descriptor for Data Layers panel.
   * Renders interactive toggle chips and legend tallies under Prague Transit (PID).
   */
  getRowControls() {
    return {
      chips: [
        {
          id: 'radar',
          label: _showRadar ? 'RADAR: ON' : 'RADAR: OFF',
          active: _showRadar,
          state: _showRadar ? 'active' : 'idle',
          title: _showRadar ? 'Skrýt radarový widget Prahy' : 'Zobrazit radarový widget Prahy',
          params: { showRadar: !_showRadar },
        },
        {
          id: 'cockpit',
          label: _trackedCameraActive ? 'V KABINĚ 🚊' : 'KABINA',
          active: _trackedCameraActive,
          state: _trackedCameraActive ? 'active' : 'idle',
          title: _trackedCameraActive ? 'Vystoupit z kabiny vozidla (Esc)' : 'Sledovat vozidlo z kabiny řidiče',
          params: { toggleCockpit: true },
        },
        {
          id: 'filter-all',
          label: 'VŠECHNO',
          active: _filter === 'all',
          state: _filter === 'all' ? 'active' : 'idle',
          title: 'Zobrazit veškerou dopravu (metro, tramvaje, busy, přívozy)',
          params: { filter: 'all' },
        },
        {
          id: 'filter-metro',
          label: 'METRO',
          active: _filter === 'metro',
          state: _filter === 'metro' ? 'active' : 'idle',
          title: 'Filtrovat pouze linky metra (A, B, C, D)',
          params: { filter: 'metro' },
        },
        {
          id: 'filter-tram',
          label: 'TRAMVAJE',
          active: _filter === 'tram',
          state: _filter === 'tram' ? 'active' : 'idle',
          title: 'Filtrovat pouze tramvajové linky',
          params: { filter: 'tram' },
        },
      ],
      legend: [
        { label: 'Metro A', color: METRO_COLORS.A, count: 17, blurb: 'Nemocnice Motol ⇄ Depo Hostivař' },
        { label: 'Metro B', color: METRO_COLORS.B, count: 24, blurb: 'Zličín ⇄ Černý Most' },
        { label: 'Metro C', color: METRO_COLORS.C, count: 20, blurb: 'Letňany ⇄ Háje' },
        { label: 'Metro D', color: METRO_COLORS.D, count: 10, blurb: 'Náměstí Míru ⇄ Depo Písnice' },
        { label: 'Tramvaje', color: TRAM_COLOR, count: 86, blurb: 'Páteřní a nostalgické linky' },
        { label: 'Přívozy', color: FERRY_COLOR, count: 5, blurb: 'Přívozy přes Vltavu P1–P6' },
      ],
    };
  },

  /**
   * Install the manager's "row controls changed" callback.
   */
  setRowControlsListener(listener) {
    _rowControlsListener = typeof listener === 'function' ? listener : null;
  },

  /**
   * Get current layer runtime params.
   */
  getParams() {
    return {
      showRadar: _showRadar,
      filter: _filter,
      cockpit: _trackedCameraActive,
    };
  },

  /**
   * Apply runtime params from DataLayerManager.setLayerParams or UI chips.
   */
  setParams(params = {}) {
    let changed = false;

    if (typeof params.showRadar === 'boolean') {
      _showRadar = params.showRadar;
      if (_enabled) {
        if (_showRadar) {
          showPragueGuide();
        } else {
          hidePragueGuide();
        }
      }
      changed = true;
    }

    if (params.toggleCockpit) {
      this.toggleCockpitTracking();
      changed = true;
    } else if (typeof params.cockpit === 'boolean') {
      if (params.cockpit !== _trackedCameraActive) {
        this.toggleCockpitTracking();
        changed = true;
      }
    }

    if (typeof params.filter === 'string' && params.filter !== _filter) {
      _filter = params.filter;
      applyFilter();
      changed = true;
    }

    if (changed && _rowControlsListener) {
      _rowControlsListener();
    }
    return true;
  },

  // --- API for Mobile Prague Guide ---

  /** Toggle Cockpit view tracking for a vehicle */
  toggleCockpitTracking(vehicle = _selectedVehicle) {
    if (!_viewer) return false;
    if (_trackedCameraActive) {
      _trackedCameraActive = false;
      _viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      if (_rowControlsListener) _rowControlsListener();
      return false;
    }
    const target = vehicle || _vehicles[0];
    if (!target) return false;
    _selectedVehicle = target;
    _trackedCameraActive = true;
    updateCockpitCamera(_viewer, target);
    if (_rowControlsListener) _rowControlsListener();
    return true;
  },

  /** Get upcoming arrivals around user GPS coordinates */
  getNearbyArrivals(userLat, userLon, radiusM = 800) {
    const nearby = [];
    for (const v of _vehicles) {
      const dist = haversineDistanceM(userLat, userLon, v.lat, v.lon);
      if (dist <= radiusM) {
        const speed = v.speedMps || 10;
        const etaSec = Math.round(dist / speed);
        nearby.push({
          vehicle: v,
          distM: Math.round(dist),
          etaSec,
          line: v.line,
          lineName: v.lineName,
          direction: v.direction,
          delayMin: v.delayMin,
          type: v.type,
        });
      }
    }
    return nearby.sort((a, b) => a.etaSec - b.etaSec);
  },
};

export default pidTransitLayer;
