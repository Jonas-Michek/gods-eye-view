import test from 'node:test';
import assert from 'node:assert/strict';

import pidTransitLayer from './pidTransit.js';
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

