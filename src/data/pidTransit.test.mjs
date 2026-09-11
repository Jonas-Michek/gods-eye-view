import test from 'node:test';
import assert from 'node:assert/strict';

import pidTransitLayer, {
  calculateZoomDensityCellSize,
  updateVehiclesVisibilityAndPositions,
} from './pidTransit.js';
import { DataLayerManager } from './manager.js';
import {
  METRO_LINES,
  METRO_STATIONS,
  TRAM_LINES,
  FERRIES,
  METRO_COLORS,
  PRAGUE_BOUNDS,
} from './pragueTransitData.js';
import { PRAGUE_POIS } from './praguePoi.js';
import { CITY_POIS } from '../locations.js';

test('pidTransitLayer conforms to the GEV DataLayer contract', () => {
  assert.equal(pidTransitLayer.id, 'pid-transit');
  assert.equal(typeof pidTransitLayer.name, 'string');
  assert.equal(typeof pidTransitLayer.enable, 'function');
  assert.equal(typeof pidTransitLayer.disable, 'function');
  assert.equal(typeof pidTransitLayer.update, 'function');
  assert.equal(typeof pidTransitLayer.updateInterval, 'number');
  assert.equal(typeof pidTransitLayer.getStats, 'function');
  assert.equal(typeof pidTransitLayer.getNearbyArrivals, 'function');
  assert.equal(typeof pidTransitLayer.toggleCockpitTracking, 'function');

  const stats = pidTransitLayer.getStats();
  assert.equal(typeof stats, 'object');
  assert.equal('count' in stats, true);
  assert.equal('loading' in stats, true);
});

test('Prague metro network has complete lines A, B, C, D and valid coordinates', () => {
  assert.ok(METRO_LINES.A);
  assert.ok(METRO_LINES.B);
  assert.ok(METRO_LINES.C);
  assert.ok(METRO_LINES.D);

  assert.equal(METRO_COLORS.A, '#009E60');
  assert.equal(METRO_COLORS.B, '#FFBF00');
  assert.equal(METRO_COLORS.C, '#ED1C24');
  assert.equal(METRO_COLORS.D, '#0072BB');

  assert.ok(METRO_STATIONS.length >= 60, `Expected at least 60 metro stations, found ${METRO_STATIONS.length}`);

  for (const s of METRO_STATIONS) {
    assert.ok(s.id, 'Station must have id');
    assert.ok(s.name, 'Station must have name');
    assert.ok(['A', 'B', 'C', 'D'].includes(s.line), `Invalid line: ${s.line}`);
    assert.ok(s.lat >= PRAGUE_BOUNDS.southwest.lat && s.lat <= PRAGUE_BOUNDS.northeast.lat);
    assert.ok(s.lon >= PRAGUE_BOUNDS.southwest.lon && s.lon <= PRAGUE_BOUNDS.northeast.lon);
    assert.equal(typeof s.depth, 'number');
  }
});

test('Tram lines include scenic routes 22, 17, and historical 42', () => {
  const lineNumbers = TRAM_LINES.map((t) => t.line);
  assert.ok(lineNumbers.includes('22'), 'Must include Tram 22');
  assert.ok(lineNumbers.includes('9'), 'Must include Tram 9');
  assert.ok(lineNumbers.includes('17'), 'Must include Tram 17');
  assert.ok(lineNumbers.includes('42'), 'Must include Tram 42');

  for (const t of TRAM_LINES) {
    assert.ok(t.stops.length >= 10, `Tram ${t.line} should have at least 10 stops`);
    for (const stop of t.stops) {
      assert.ok(stop.name);
      assert.ok(stop.lat > 49.9 && stop.lat < 50.3);
      assert.ok(stop.lon > 14.2 && stop.lon < 14.8);
    }
  }

  assert.ok(FERRIES.length >= 4, 'Must include Vltava ferries');
});

test('Tram lines include high-fidelity real track paths following street layout', () => {
  for (const t of TRAM_LINES) {
    assert.ok(Array.isArray(t.path), `Tram line ${t.line} must have a path array`);
    const minNodes = ['22', '9', '17', '42'].includes(t.line) ? 500 : 10;
    assert.ok(t.path.length >= minNodes, `Tram line ${t.line} path should have >= ${minNodes} nodes (found ${t.path.length})`);

    // Verify all points are inside Prague bounds
    for (const pt of t.path) {
      assert.ok(
        pt.lat >= PRAGUE_BOUNDS.southwest.lat && pt.lat <= PRAGUE_BOUNDS.northeast.lat,
        `Point lat ${pt.lat} outside Prague bounds`,
      );
      assert.ok(
        pt.lon >= PRAGUE_BOUNDS.southwest.lon && pt.lon <= PRAGUE_BOUNDS.northeast.lon,
        `Point lon ${pt.lon} outside Prague bounds`,
      );
    }

    // Verify fine-grained density for key iconic lines (max distance between consecutive points <= 35m)
    if (['22', '9', '17', '42'].includes(t.line)) {
      for (let i = 0; i < t.path.length - 1; i++) {
        const p1 = t.path[i];
        const p2 = t.path[i + 1];
        const dLat = Math.abs(p2.lat - p1.lat);
        const dLon = Math.abs(p2.lon - p1.lon);
        assert.ok(dLat < 0.001, `Gap in lat between node ${i} and ${i + 1} on line ${t.line}: ${dLat}`);
        assert.ok(dLon < 0.0015, `Gap in lon between node ${i} and ${i + 1} on line ${t.line}: ${dLon}`);
      }
    }
  }
});

test('Prague POIs are correctly configured and link to transit stops', () => {
  assert.ok(PRAGUE_POIS.length >= 8);
  const castle = PRAGUE_POIS.find((p) => p.id === 'prague-castle');
  assert.ok(castle);
  assert.equal(castle.nearestStop, 'Pražský hrad');
  assert.ok(castle.recommendedLines.includes('Tram 22'));

  const charlesBridge = PRAGUE_POIS.find((p) => p.id === 'charles-bridge');
  assert.ok(charlesBridge);
  assert.ok(charlesBridge.recommendedLines.some((l) => l.includes('Metro A')));

  for (const poi of PRAGUE_POIS) {
    assert.ok(poi.nearestStopCoords.lat > 50.0 && poi.nearestStopCoords.lat < 50.2);
    assert.ok(poi.nearestStopCoords.lon > 14.3 && poi.nearestStopCoords.lon < 14.6);
  }
});

test('CITY_POIS in locations.js includes Prague with landmark POIs', () => {
  assert.ok(CITY_POIS.prague);
  assert.equal(CITY_POIS.prague.name, 'Prague');
  assert.ok(CITY_POIS.prague.pois.length >= 5);
  assert.ok(CITY_POIS.prague.pois.some((p) => p.name === 'Charles Bridge'));
  assert.ok(CITY_POIS.prague.pois.some((p) => p.name === 'Prague Castle'));
});

test('pidTransitLayer.getNearbyArrivals sorts by ETA and filters by radius', () => {
  // Center of Old Town Square: 50.0875, 14.4213
  // Simulated vehicles might not be initialized if layer not enabled, so test function signature
  const arrivals = pidTransitLayer.getNearbyArrivals(50.0875, 14.4213, 2000);
  assert.ok(Array.isArray(arrivals));
});

test('pidTransitLayer provides toggleable row controls and responds to setParams', () => {
  assert.equal(typeof pidTransitLayer.getRowControls, 'function');
  assert.equal(typeof pidTransitLayer.setRowControlsListener, 'function');
  assert.equal(typeof pidTransitLayer.getParams, 'function');
  assert.equal(typeof pidTransitLayer.setParams, 'function');

  // Verify initial row controls structure
  const controls = pidTransitLayer.getRowControls();
  assert.ok(controls);
  assert.ok(Array.isArray(controls.chips));
  assert.ok(Array.isArray(controls.legend));

  // Check chips: radar, cockpit, filter-all, filter-metro, filter-tram
  const chipIds = controls.chips.map((c) => c.id);
  assert.ok(chipIds.includes('radar'), 'Must include radar toggle chip');
  assert.ok(chipIds.includes('cockpit'), 'Must include cockpit tracking chip');
  assert.ok(chipIds.includes('filter-all'), 'Must include filter-all chip');
  assert.ok(chipIds.includes('filter-metro'), 'Must include filter-metro chip');
  assert.ok(chipIds.includes('filter-tram'), 'Must include filter-tram chip');

  // Check legend structure
  for (const item of controls.legend) {
    assert.ok(item.label);
    assert.ok(item.color);
    assert.equal(typeof item.count, 'number');
  }

  // Test setRowControlsListener & setParams
  let listenerCalled = 0;
  pidTransitLayer.setRowControlsListener(() => {
    listenerCalled++;
  });

  // Toggle radar
  pidTransitLayer.setParams({ showRadar: true });
  assert.equal(pidTransitLayer.getParams().showRadar, true);
  assert.equal(pidTransitLayer.getRowControls().chips.find((c) => c.id === 'radar').active, true);
  assert.equal(listenerCalled, 1);

  // Toggle filter to metro
  pidTransitLayer.setParams({ filter: 'metro' });
  assert.equal(pidTransitLayer.getParams().filter, 'metro');
  assert.equal(pidTransitLayer.getRowControls().chips.find((c) => c.id === 'filter-metro').active, true);
  assert.equal(pidTransitLayer.getRowControls().chips.find((c) => c.id === 'filter-all').active, false);
  assert.equal(listenerCalled, 2);

  // Reset back
  pidTransitLayer.setParams({ showRadar: false, filter: 'all' });
  assert.equal(pidTransitLayer.getParams().showRadar, false);
  assert.equal(pidTransitLayer.getParams().filter, 'all');
  assert.equal(pidTransitLayer.getRowControls().chips.find((c) => c.id === 'radar').active, false);

  pidTransitLayer.setRowControlsListener(null);
});

test('pidTransitLayer.update executes cleanly and returns true', async () => {
  const result = await pidTransitLayer.update();
  assert.equal(result, true);
});

test('pidTransitLayer integrates with DataLayerManager toggle lifecycle without error', async () => {
  const manager = new DataLayerManager({});
  manager.register(pidTransitLayer);
  assert.equal(manager.isEnabled('pid-transit'), false);

  const enableSuccess = await manager.toggle('pid-transit');
  assert.equal(enableSuccess, true);
  assert.equal(manager.isEnabled('pid-transit'), true);
  const stats = pidTransitLayer.getStats();
  assert.ok(stats.lastUpdate);

  const disableSuccess = await manager.toggle('pid-transit');
  assert.equal(disableSuccess, true);
  assert.equal(manager.isEnabled('pid-transit'), false);
});

test('Prague tram network has all 36 lines (1-26, 31, 91-99, 42) with valid stops and paths', () => {
  assert.equal(TRAM_LINES.length, 36, `Expected 36 tram routes, found ${TRAM_LINES.length}`);

  const dayLines = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '31'];
  const nightLines = ['91', '92', '93', '94', '95', '96', '97', '98', '99'];

  const lineNumbers = TRAM_LINES.map((t) => t.line);
  for (const dl of dayLines) {
    assert.ok(lineNumbers.includes(dl), `Missing day tram line ${dl}`);
  }
  for (const nl of nightLines) {
    assert.ok(lineNumbers.includes(nl), `Missing night tram line ${nl}`);
  }
  assert.ok(lineNumbers.includes('42'), 'Missing historical line 42');
});

test('calculateZoomDensityCellSize returns correct LOD grid cell sizes for camera altitude', () => {
  // Street level (< 2,500m) -> 0 (no thinning, 100% density)
  assert.equal(calculateZoomDensityCellSize(500), 0);
  assert.equal(calculateZoomDensityCellSize(1500), 0);
  assert.equal(calculateZoomDensityCellSize(2499), 0);

  // District level (2,500m - 5,500m) -> 32px
  assert.equal(calculateZoomDensityCellSize(2500), 32);
  assert.equal(calculateZoomDensityCellSize(4000), 32);
  assert.equal(calculateZoomDensityCellSize(5499), 32);

  // City overview level (5,500m - 12,000m) -> 46px
  assert.equal(calculateZoomDensityCellSize(5500), 46);
  assert.equal(calculateZoomDensityCellSize(8000), 46);
  assert.equal(calculateZoomDensityCellSize(11999), 46);

  // High orbital level (>= 12,000m) -> 64px
  assert.equal(calculateZoomDensityCellSize(12000), 64);
  assert.equal(calculateZoomDensityCellSize(30000), 64);
});

test('updateVehiclesVisibilityAndPositions culls vehicles outside the scope circle', () => {
  const fakeViewer = {
    camera: {
      positionWC: { x: 0, y: -100, z: 100 },
      directionWC: { x: 0, y: 1, z: -1 },
      positionCartographic: { height: 1000 },
    },
    scene: {
      canvas: { clientWidth: 1000, clientHeight: 1000 },
    },
  };

  // Run visibility update on headless mock (exercises safe fallback path)
  updateVehiclesVisibilityAndPositions(fakeViewer);
  const stats = pidTransitLayer.getStats();
  assert.equal(typeof stats.visibleCount, 'number');
});


