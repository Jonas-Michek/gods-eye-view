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
import { getKeyholeGeometry } from '../celestialRing.js';
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
import {
  initTramModelManager,
  updateTramModels,
  destroyTramModelManager,
} from './tramModelManager.js';

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

/** Prague baseline ground elevation in meters above WGS84 ellipsoid */
const PRAGUE_SURFACE_ALT = 215.0;

// --- State Variables ---
let _viewer = null;
let _enabled = false;
let _loading = false;
let _count = 0;
let _lastUpdate = null;
let _error = null;

let _polylineCollection = null;
let _trackEntities = [];
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
let _visibleCount = 0;

// Scratch projection vectors
const _scratchCartesian = new Cesium.Cartesian3();
const _scratchWinCoord = new Cesium.Cartesian2();
const _scratchCamDirVec = new Cesium.Cartesian3();
const _occupiedCellsSet = new Set();

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
 * Prepare fine-grained track nodes with annotated upcoming stops for smooth animation.
 */
function prepareRouteNodes(rawPath, stops) {
  if (!rawPath || rawPath.length === 0) {
    return (stops || []).map((s) => ({ ...s }));
  }

  const nodes = rawPath.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    alt: p.alt ?? PRAGUE_SURFACE_ALT,
  }));

  if (stops && stops.length > 0) {
    for (const stop of stops) {
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let i = 0; i < nodes.length; i++) {
        const d = haversineDistanceM(nodes[i].lat, nodes[i].lon, stop.lat, stop.lon);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      nodes[bestIdx].name = stop.name;
    }
  }

  let upcomingStop = stops && stops.length > 0 ? stops[stops.length - 1].name : '';
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].name) {
      upcomingStop = nodes[i].name;
    }
    nodes[i].nextStop = upcomingStop;
  }

  return nodes;
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
    const isMajor = ['9', '17', '22', '42'].includes(tramRoute.line);
    const count = isMajor ? 4 : (tramRoute.night ? 2 : 3);
    for (let i = 0; i < count; i++) {
      const forward = i % 2 === 0;
      const rawPath = tramRoute.path && tramRoute.path.length > 0 ? tramRoute.path : tramRoute.stops;
      const orderedPath = forward ? rawPath : [...rawPath].reverse();
      const orderedStops = forward ? tramRoute.stops : [...tramRoute.stops].reverse();
      const nodes = prepareRouteNodes(orderedPath, orderedStops);

      const startIdx = Math.floor(((i + 0.25) / count) * Math.max(1, nodes.length - 2));
      const direction = orderedStops[orderedStops.length - 1].name;
      const initialNextStop = nodes[startIdx + 1]?.nextStop || nodes[startIdx + 1]?.name || direction;

      fleet.push({
        id: `pid-tram-${tramRoute.line}-${i + 1}`,
        type: 'tram',
        line: tramRoute.line,
        lineName: `Tram ${tramRoute.line}`,
        direction,
        routeNodes: nodes,
        currentNodeIndex: startIdx,
        progress: Math.random() * 0.8,
        speedMps: 9, // ~32 km/h
        lat: nodes[startIdx].lat,
        lon: nodes[startIdx].lon,
        depth: 0,
        bearing: 0,
        delayMin: (Math.random() * 3.5).toFixed(1),
        fleetNumber: tramRoute.historical ? `Tatra T3 #${6100 + i}` : `Škoda 15T #${9250 + i}`,
        wheelchair: !tramRoute.historical,
        airConditioned: !tramRoute.historical,
        nextStop: initialNextStop,
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
    let fromNode = v.routeNodes[v.currentNodeIndex];
    let toNode = v.routeNodes[v.currentNodeIndex + 1];

    if (!fromNode || !toNode) {
      // Reverse route or wrap
      v.routeNodes.reverse();
      v.currentNodeIndex = 0;
      v.progress = 0;
      fromNode = v.routeNodes[0];
      toNode = v.routeNodes[1];
      if (!fromNode || !toNode) continue;
    }

    const legDist = haversineDistanceM(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);
    const speed = v.speedMps || 10;
    const progressInc = legDist > 0 ? (speed * dtSec) / legDist : 0.05;

    v.progress += progressInc;

    while (v.progress >= 1.0) {
      v.progress -= 1.0;
      v.currentNodeIndex++;
      if (v.currentNodeIndex >= v.routeNodes.length - 1) {
        v.routeNodes.reverse();
        v.currentNodeIndex = 0;
        // Re-compute upcoming stop in the new direction
        let upcomingStop = v.routeNodes[v.routeNodes.length - 1]?.name || v.direction;
        for (let k = v.routeNodes.length - 1; k >= 0; k--) {
          if (v.routeNodes[k].name) upcomingStop = v.routeNodes[k].name;
          v.routeNodes[k].nextStop = upcomingStop;
        }
        const lastNode = v.routeNodes[v.routeNodes.length - 1];
        if (lastNode?.name) v.direction = lastNode.name;
        break;
      }
    }

    const currFrom = v.routeNodes[v.currentNodeIndex];
    const currTo = v.routeNodes[v.currentNodeIndex + 1];
    if (currFrom && currTo) {
      v.lat = currFrom.lat + (currTo.lat - currFrom.lat) * v.progress;
      v.lon = currFrom.lon + (currTo.lon - currFrom.lon) * v.progress;
      const fromAlt = currFrom.alt ?? PRAGUE_SURFACE_ALT;
      const toAlt = currTo.alt ?? PRAGUE_SURFACE_ALT;
      v.alt = fromAlt + (toAlt - fromAlt) * v.progress;
      v.bearing = calculateBearing(currFrom.lat, currFrom.lon, currTo.lat, currTo.lon);
      v.nextStop = currTo.nextStop || currTo.name || v.direction;
    }
  }
}

function getGolemioToken() {
  const envToken = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOLEMIO_API_KEY)
    || (typeof process !== 'undefined' && (process.env?.VITE_GOLEMIO_API_KEY || process.env?.GOLEMIO_API_KEY))
    || null;
  const storageToken = typeof localStorage !== 'undefined' ? localStorage.getItem('gev:golemio-key') : null;
  return envToken || storageToken || null;
}

/**
 * Fetch live vehicle positions from Golemio API if token is present
 */
async function fetchGolemioPositions(token, { signal = null } = {}) {
  if (!token) return false;
  try {
    const url = 'https://api.golemio.cz/v2/vehiclepositions';
    const resp = await fetch(url, {
      signal,
      headers: {
        'x-access-token': token,
        Accept: 'application/json',
      },
    });
    if (!resp.ok) {
      _error = `Golemio HTTP ${resp.status}`;
      return false;
    }
    const data = await resp.json();
    if (!data || !Array.isArray(data.features)) {
      _error = 'Malformed Golemio response';
      return false;
    }

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
      syncGolemioFeatures(pragueFeatures);
      _count = _vehicles.length;
      _lastUpdate = Date.now();
      _error = null;
      return true;
    }
  } catch (err) {
    if (signal?.aborted || err?.name === 'AbortError') throw err;
    console.warn('[PID Transit] Golemio fetch error:', err);
  }
  return false;
}

/**
 * Merge live Golemio vehicle features into local _vehicles fleet
 */
function syncGolemioFeatures(features) {
  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const coords = f.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;
    const lon = coords[0];
    const lat = coords[1];
    const props = f.properties || {};
    const trip = props.trip || {};
    const lastPos = props.last_position || {};
    const routeType = trip.route_type;
    const line = trip.gtfs_route_short_name || '?';
    const type = routeType === 1 ? 'metro' : (routeType === 3 ? 'bus' : 'tram');
    const vehId = props.vehicle_id ? `pid-golemio-${props.vehicle_id}` : `pid-golemio-f-${i}`;

    let vehicle = _vehicles.find((v) => v.id === vehId);
    if (!vehicle) {
      vehicle = {
        id: vehId,
        type,
        line,
        lineName: type === 'metro' ? `Metro ${line}` : (type === 'bus' ? `Bus ${line}` : `Tram ${line}`),
        direction: trip.headsign || '',
        lat,
        lon,
        depth: type === 'metro' ? 20 : 0,
        bearing: lastPos.bearing || 0,
        speedMps: (lastPos.speed || 30) / 3.6,
        delayMin: lastPos.delay?.actual ? (lastPos.delay.actual / 60).toFixed(1) : '0.0',
        wheelchair: Boolean(trip.is_wheelchair_accessible),
        airConditioned: Boolean(trip.is_air_conditioned),
        nextStop: lastPos.next_stop?.name || trip.headsign || '',
        isLive: true,
      };
      _vehicles.push(vehicle);

      if (_billboardCollection && _viewer) {
        let icon = ICONS.tram;
        if (type === 'metro') icon = ICONS[`metro${line}`] || ICONS.metroA;
        else if (type === 'bus') icon = ICONS.bus;

        vehicle.billboard = _billboardCollection.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, (vehicle.alt || PRAGUE_SURFACE_ALT) + 2.5),
          image: icon,
          width: 28,
          height: 28,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(300, 1.2, 35000, 0.5),
          id: vehicle.id,
        });
      }
    } else {
      vehicle.lat = lat;
      vehicle.lon = lon;
      vehicle.bearing = lastPos.bearing || vehicle.bearing;
      vehicle.delayMin = lastPos.delay?.actual ? (lastPos.delay.actual / 60).toFixed(1) : vehicle.delayMin;
      vehicle.nextStop = lastPos.next_stop?.name || vehicle.nextStop;
    }
  }
}

/**
 * Render static railway, metro and tram corridors as glowing 3D polyline primitives
 */
function buildStaticTrackPolylines(viewer) {
  if (_trackEntities.length > 0 && viewer?.entities?.remove) {
    for (const ent of _trackEntities) {
      viewer.entities.remove(ent);
    }
    _trackEntities = [];
  }
  if (_polylineCollection) {
    viewer?.scene?.primitives?.remove?.(_polylineCollection);
    _polylineCollection = null;
  }

  if (viewer?.entities?.add) {
    // 1. Metro lines (visible on surface, with depthFailMaterial to shine through 3D buildings)
    Object.entries(METRO_LINES).forEach(([key, line]) => {
      const positions = line.stations.map((s) => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, PRAGUE_SURFACE_ALT + 3.0));
      const ent = viewer.entities.add({
        id: `pid-track-metro-${key}`,
        polyline: {
          positions,
          width: 5.5,
          material: Cesium.Color.fromCssColorString(line.color).withAlpha(0.95),
          depthFailMaterial: Cesium.Color.fromCssColorString(line.color).withAlpha(0.75),
          arcType: Cesium.ArcType ? Cesium.ArcType.GEODESIC : undefined,
        },
      });
      _trackEntities.push(ent);
    });

    // 2. Tram corridors (draped on surface across 3D tiles and 2D terrain)
    TRAM_LINES.forEach((tram) => {
      const coords = (tram.path && tram.path.length > 0) ? tram.path : tram.stops;
      const positions = coords.map((s) => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, (s.alt || PRAGUE_SURFACE_ALT) + 2.0));
      const ent = viewer.entities.add({
        id: `pid-track-tram-${tram.line}`,
        polyline: {
          positions,
          width: tram.scenic ? 4.5 : (tram.night ? 2.5 : 3.2),
          material: Cesium.Color.fromCssColorString(tram.color).withAlpha(tram.scenic ? 0.92 : (tram.night ? 0.75 : 0.85)),
          depthFailMaterial: Cesium.Color.fromCssColorString(tram.color).withAlpha(tram.scenic ? 0.6 : (tram.night ? 0.4 : 0.5)),
          clampToGround: true,
          classificationType: Cesium.ClassificationType ? Cesium.ClassificationType.BOTH : undefined,
          arcType: Cesium.ArcType ? Cesium.ArcType.GEODESIC : undefined,
        },
      });
      _trackEntities.push(ent);
    });

    // 3. Ferries
    FERRIES.forEach((ferry) => {
      const positions = [
        Cesium.Cartesian3.fromDegrees(ferry.start.lon, ferry.start.lat, 185.0),
        Cesium.Cartesian3.fromDegrees(ferry.end.lon, ferry.end.lat, 185.0),
      ];
      const ent = viewer.entities.add({
        id: `pid-ferry-line-${ferry.id}`,
        polyline: {
          positions,
          width: 2.5,
          material: Cesium.Color.fromCssColorString(FERRY_COLOR).withAlpha(0.8),
          depthFailMaterial: Cesium.Color.fromCssColorString(FERRY_COLOR).withAlpha(0.5),
        },
      });
      _trackEntities.push(ent);
    });
  } else if (viewer?.scene?.primitives?.add) {
    const polylines = viewer.scene.primitives.add(new Cesium.PolylineCollection());
    Object.entries(METRO_LINES).forEach(([key, line]) => {
      polylines.add({
        positions: line.stations.map((s) => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, PRAGUE_SURFACE_ALT + 3.0)),
        width: 5.0,
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString(line.color).withAlpha(0.92),
        }),
        id: `pid-track-metro-${key}`,
      });
    });
    TRAM_LINES.forEach((tram) => {
      const coords = (tram.path && tram.path.length > 0) ? tram.path : tram.stops;
      polylines.add({
        positions: coords.map((s) => Cesium.Cartesian3.fromDegrees(s.lon, s.lat, (s.alt || PRAGUE_SURFACE_ALT) + 2.0)),
        width: tram.scenic ? 4.0 : (tram.night ? 2.2 : 2.8),
        material: Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString(tram.color).withAlpha(tram.scenic ? 0.9 : 0.75),
        }),
        id: `pid-track-tram-${tram.line}`,
      });
    });
    FERRIES.forEach((ferry) => {
      polylines.add({
        positions: [
          Cesium.Cartesian3.fromDegrees(ferry.start.lon, ferry.start.lat, 185.0),
          Cesium.Cartesian3.fromDegrees(ferry.end.lon, ferry.end.lat, 185.0),
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
}

/**
 * Render billboards for stations, POIs and live moving vehicles
 */
function buildBillboardCollections(viewer) {
  if (_billboardCollection) {
    viewer?.scene?.primitives?.remove?.(_billboardCollection);
    _billboardCollection = null;
  }
  if (!viewer?.scene?.primitives?.add) return;

  const billboards = viewer.scene.primitives.add(new Cesium.BillboardCollection({
    scene: viewer?.scene,
    blendOption: Cesium.BlendOption ? Cesium.BlendOption.TRANSLUCENT : undefined,
  }));
  registerSpriteCollection('pid-transit', billboards);

  // Metro station markers (always on top via disableDepthTestDistance, at surface elevation)
  METRO_STATIONS.forEach((station) => {
    const iconKey = `metro${station.line}`;
    billboards.add({
      position: Cesium.Cartesian3.fromDegrees(station.lon, station.lat, PRAGUE_SURFACE_ALT + 5.0),
      image: ICONS[iconKey] || ICONS.metroA,
      width: 24,
      height: 24,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(500, 1.0, 40000, 0.4),
      id: `pid-station-${station.id}`,
    });
  });

  // Prague POI markers
  PRAGUE_POIS.forEach((poi) => {
    billboards.add({
      position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, PRAGUE_SURFACE_ALT + 6.0),
      image: ICONS.poi,
      width: 26,
      height: 26,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      scaleByDistance: new Cesium.NearFarScalar(500, 1.1, 50000, 0.5),
      id: `pid-poi-${poi.id}`,
    });
  });

  // Live Vehicle Billboards (always visible & pickable on top of 3D tiles)
  _vehicles.forEach((v) => {
    let icon = ICONS.bus;
    if (v.type === 'metro') {
      icon = ICONS[`metro${v.line}`] || ICONS.metroA;
    } else if (v.type === 'tram') {
      icon = ICONS.tram;
    } else if (v.type === 'ferry') {
      icon = ICONS.ferry;
    }

    const bb = billboards.add({
      position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, (v.alt || PRAGUE_SURFACE_ALT) + 2.5),
      image: icon,
      width: 28,
      height: 28,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
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
  for (const ent of _trackEntities) {
    if (!ent || !ent.id) continue;
    if (typeof ent.id === 'string') {
      if (ent.id.startsWith('pid-track-metro-')) {
        ent.show = (_filter === 'all' || _filter === 'metro');
      } else if (ent.id.startsWith('pid-track-tram-')) {
        ent.show = (_filter === 'all' || _filter === 'tram');
      } else if (ent.id.startsWith('pid-ferry-')) {
        ent.show = (_filter === 'all');
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

  updateVehiclesVisibilityAndPositions(_viewer);
  governorRequestRender();
}

/**
 * Compute the screen-space grid cell size for LOD density decimation
 * based on camera altitude.
 *
 * - Below 2,500m (Street level): 0 (100% density, all trams in circle visible)
 * - 2,500m - 5,500m (District level): 32px (reduces icon overlap)
 * - 5,500m - 12,000m (City level): 46px (clean overview of lines across Prague)
 * - Above 12,000m (Overview level): 64px (only major/páteřní routes)
 *
 * @param {number} cameraHeight Altitude in meters above ellipsoid
 * @returns {number} Cell size in screen pixels (0 = no thinning)
 */
export function calculateZoomDensityCellSize(cameraHeight) {
  if (cameraHeight >= 12000) return 64;
  if (cameraHeight >= 5500) return 46;
  if (cameraHeight >= 2500) return 32;
  return 0;
}

/**
 * Filter and update vehicles positions, culling those outside keyhole circle
 * and dynamically adjusting density according to camera zoom altitude.
 *
 * @param {Cesium.Viewer} viewer
 */
export function updateVehiclesVisibilityAndPositions(viewer) {
  if (!viewer) return;

  const scene = viewer.scene;
  const canvas = scene?.canvas;
  const camera = viewer.camera;
  const canProject = Boolean(canvas && scene && typeof Cesium?.SceneTransforms?.wgs84ToWindowCoordinates === 'function');

  let keyholeRadius = 0;
  let keyholeCenterX = 0;
  let keyholeCenterY = 0;
  let cameraHeight = 3000;

  if (canProject) {
    const w = canvas.clientWidth || canvas.width || 800;
    const h = canvas.clientHeight || canvas.height || 600;
    const keyhole = getKeyholeGeometry(w, h);
    if (keyhole && keyhole.radius > 0) {
      keyholeRadius = keyhole.radius + (keyhole.featherPx || 0);
      keyholeCenterX = keyhole.centerX;
      keyholeCenterY = keyhole.centerY;
    } else {
      keyholeRadius = Math.min(w, h) * 0.52;
      keyholeCenterX = w * 0.5;
      keyholeCenterY = h * 0.5;
    }
    if (camera?.positionCartographic?.height) {
      cameraHeight = camera.positionCartographic.height;
    }
  }

  const minScreenCellPx = calculateZoomDensityCellSize(cameraHeight);
  const occupiedCells = minScreenCellPx > 0 ? _occupiedCellsSet : null;
  if (occupiedCells) occupiedCells.clear();
  const keyholeRadiusSq = keyholeRadius * keyholeRadius;
  const camPosWC = camera?.positionWC;
  const camDirWC = camera?.directionWC;

  let visibleCount = 0;

  for (let i = 0; i < _vehicles.length; i++) {
    const v = _vehicles[i];
    if (!v.billboard) continue;

    // 1. Update billboard 3D position
    Cesium.Cartesian3.fromDegrees(
      v.lon,
      v.lat,
      (v.alt || PRAGUE_SURFACE_ALT) + 2.5,
      undefined,
      _scratchCartesian,
    );
    v.billboard.position = _scratchCartesian;

    // 2. Base category filter ('all' | 'metro' | 'tram')
    if (_filter === 'metro' && v.type !== 'metro') {
      v.billboard.show = false;
      continue;
    }
    if (_filter === 'tram' && v.type !== 'tram') {
      v.billboard.show = false;
      continue;
    }

    // 3. If selected vehicle or tracked camera, always show
    if (_selectedVehicle && v.id === _selectedVehicle.id) {
      v.billboard.show = true;
      visibleCount++;
      continue;
    }

    // If cannot project (headless / test), accept filter
    if (!canProject) {
      v.billboard.show = true;
      visibleCount++;
      continue;
    }

    // 4. Frustum culling / behind camera check
    if (camPosWC && camDirWC) {
      Cesium.Cartesian3.subtract(_scratchCartesian, camPosWC, _scratchCamDirVec);
      const dot = Cesium.Cartesian3.dot(camDirWC, _scratchCamDirVec);
      if (dot <= 0) {
        v.billboard.show = false;
        continue;
      }
    }

    // 5. Screen projection
    const winCoord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, _scratchCartesian, _scratchWinCoord);
    if (!winCoord) {
      v.billboard.show = false;
      continue;
    }

    // 6. Keyhole Circle Culling (vykreslovat jen v viewportu - tom kruhu)
    const dx = winCoord.x - keyholeCenterX;
    const dy = winCoord.y - keyholeCenterY;
    const distSq = dx * dx + dy * dy;

    if (distSq > keyholeRadiusSq) {
      v.billboard.show = false;
      continue;
    }

    // 7. Zoom-dependent density decimation (se zoomem se zmenšuje densita)
    if (occupiedCells) {
      const isPriority = v.type === 'metro' || ['9', '17', '22', '42'].includes(v.line);
      // At overview level (> 12km), only show priority lines
      if (cameraHeight >= 12000 && !isPriority) {
        v.billboard.show = false;
        continue;
      }

      const cellX = Math.floor(winCoord.x / minScreenCellPx);
      const cellY = Math.floor(winCoord.y / minScreenCellPx);
      const cellKey = (cellX * 73856093) ^ (cellY * 19349663);

      if (occupiedCells.has(cellKey)) {
        v.billboard.show = false;
        continue;
      }
      occupiedCells.add(cellKey);
    }

    // Passed all checks!
    v.billboard.show = true;
    visibleCount++;
  }

  _visibleCount = visibleCount;
}

/**
 * Animation loop for dead-reckoning movement
 */
function startAnimationLoop(viewer) {
  if (typeof requestAnimationFrame !== 'function') return;
  let lastTime = performance.now();
  let lastLODTime = 0;

  function onFrame(now) {
    if (!_enabled) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Step physics / track progress (60 FPS smooth motion)
    updateFleetMotion(dt);

    // Throttle screen projection / keyhole circle / LOD cell decimation to ~10 Hz (every 100ms)
    // while moving visible billboards smoothly at 60 FPS
    if (now - lastLODTime >= 100) {
      lastLODTime = now;
      updateVehiclesVisibilityAndPositions(viewer);
    } else {
      const vLen = _vehicles.length;
      for (let i = 0; i < vLen; i++) {
        const v = _vehicles[i];
        if (v.billboard && v.billboard.show) {
          Cesium.Cartesian3.fromDegrees(
            v.lon,
            v.lat,
            (v.alt || PRAGUE_SURFACE_ALT) + 2.5,
            undefined,
            _scratchCartesian,
          );
          v.billboard.position = _scratchCartesian;
        }
      }
    }

    // Update close-zoom 3D Tatra T3 models (fast distance gated)
    updateTramModels(viewer, _vehicles);

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
 * Overhead tracking camera locked above vehicle (Nad zemí ze shora)
 */
function updateCockpitCamera(viewer, vehicle) {
  if (!viewer || !vehicle) return;
  const headingRad = Cesium.Math.toRadians(vehicle.bearing || 0);

  // Surface elevation resolver: query scene height or globe height or fallback to vehicle alt
  let groundAlt = vehicle.alt || 240;
  try {
    const carto = Cesium.Cartographic.fromDegrees(vehicle.lon, vehicle.lat);
    if (viewer.scene?.sampleHeightSupported && typeof viewer.scene.sampleHeight === 'function') {
      const sampled = viewer.scene.sampleHeight(carto);
      if (Number.isFinite(sampled) && sampled > 50) groundAlt = sampled;
    } else if (viewer.scene?.globe && typeof viewer.scene.globe.getHeight === 'function') {
      const sampled = viewer.scene.globe.getHeight(carto);
      if (Number.isFinite(sampled) && sampled > 50) groundAlt = sampled;
    }
  } catch {
    // Safe fallback
  }

  // Above ground target: right on the surface
  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    vehicle.lon,
    vehicle.lat,
    groundAlt + 4.0,
  );

  // For Metro (and transit vehicles in general):
  // Position the camera above ground looking down from above (ze shora),
  // giving an expansive overhead 3D view of the city surface, buildings, and streets.
  const isMetro = vehicle.type === 'metro';
  const pitchRad = Cesium.Math.toRadians(isMetro ? -45 : -28);
  const rangeM = isMetro ? 240 : 130;

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

  const start = Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, PRAGUE_SURFACE_ALT + 20.0);
  const end = Cesium.Cartesian3.fromDegrees(poi.nearestStopCoords.lon, poi.nearestStopCoords.lat, PRAGUE_SURFACE_ALT + 5.0);

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
 * Handle pick / click on vehicles, stations, or POIs
 */
function setupClickHandling(viewer) {
  if (!viewer?.scene?.canvas || typeof Cesium?.ScreenSpaceEventHandler !== 'function') return;
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
    } else if (id.startsWith('pid-station-')) {
      const stId = id.replace('pid-station-', '');
      const station = METRO_STATIONS.find((s) => s.id === stId);
      if (station) {
        window.dispatchEvent(new CustomEvent('gev:pid-station-selected', { detail: station }));
        console.info(`[PID Transit] Selected station: ${station.name} (${station.line})`);
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
        window.dispatchEvent(new CustomEvent('gev:pid-cockpit-changed', { detail: { active: false } }));
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
  updateInterval: 15000,

  async init(viewer) {
    _viewer = viewer;
    return true;
  },

  async enable(viewer) {
    if (_enabled) return true;
    _viewer = viewer;
    _enabled = true;
    _loading = true;

    // 1. Register pick ownership
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
    initTramModelManager(viewer);
    applyFilter();
    setupClickHandling(viewer);
    startAnimationLoop(viewer);

    if (_showRadar) {
      showPragueGuide();
    }

    _loading = false;
    _lastUpdate = Date.now();
    governorRequestRender();
    console.info(`[PID Transit] Layer activated with ${_count} transit elements.`);
    return true;
  },

  async disable(viewer) {
    if (!_enabled) return true;
    _enabled = false;

    destroyTramModelManager(viewer);
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
      viewer?.camera?.lookAtTransform?.(Cesium.Matrix4.IDENTITY);
    }

    if (_polylineCollection) {
      viewer?.scene?.primitives?.remove?.(_polylineCollection);
      _polylineCollection = null;
    }
    if (_billboardCollection) {
      viewer?.scene?.primitives?.remove?.(_billboardCollection);
      _billboardCollection = null;
    }
    if (_laserPolyline) {
      viewer?.scene?.primitives?.remove?.(_laserPolyline);
      _laserPolyline = null;
    }
    if (_trackEntities && _trackEntities.length > 0) {
      _trackEntities.forEach((ent) => viewer?.entities?.remove?.(ent));
      _trackEntities = [];
    }

    unregisterPickOwner('pid-transit');
    governorRequestRender();
    return true;
  },

  async update(viewer, { signal = null } = {}) {
    if (!_enabled) return true;
    if (viewer) _viewer = viewer;
    const token = getGolemioToken();
    if (token) {
      try {
        await fetchGolemioPositions(token, { signal });
      } catch (err) {
        if (signal?.aborted || err?.name === 'AbortError') throw err;
        console.warn('[PID Transit] Golemio update error:', err);
      }
    }
    _lastUpdate = Date.now();
    governorRequestRender();
    return true;
  },

  async refresh(viewer) {
    return this.update(viewer);
  },

  destroy(viewer) {
    this.disable(viewer);
    _vehicles.length = 0;
    _viewer = null;
  },

  getStats() {
    const token = getGolemioToken();
    return {
      count: _count,
      visibleCount: _visibleCount,
      lastUpdate: _lastUpdate,
      loading: _loading,
      error: _error,
      mode: token ? 'live' : 'sim',
      fallback: !token,
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
        { label: 'Tramvaje', color: TRAM_COLOR, count: TRAM_LINES.length, blurb: '35 páteřních, denních i nočních linek PID + linka 42' },
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
      window.dispatchEvent(new CustomEvent('gev:pid-cockpit-changed', { detail: { active: false } }));
      return false;
    }
    const target = vehicle || _vehicles[0];
    if (!target) return false;
    _selectedVehicle = target;
    _trackedCameraActive = true;
    updateCockpitCamera(_viewer, target);
    if (_rowControlsListener) _rowControlsListener();
    window.dispatchEvent(new CustomEvent('gev:pid-cockpit-changed', { detail: { active: true, vehicle: target } }));
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
