import test from 'node:test';
import assert from 'node:assert/strict';
import cdTransitLayer, {
  searchStations,
  searchConnections,
} from './cdTransit.js';

test('cdTransitLayer conforms to the GEV DataLayer contract', () => {
  assert.equal(cdTransitLayer.id, 'cd-trains');
  assert.equal(typeof cdTransitLayer.name, 'string');
  assert.equal(typeof cdTransitLayer.enable, 'function');
  assert.equal(typeof cdTransitLayer.disable, 'function');
  assert.equal(typeof cdTransitLayer.update, 'function');
  assert.equal(typeof cdTransitLayer.updateInterval, 'number');
  assert.equal(typeof cdTransitLayer.getStats, 'function');
  assert.equal(typeof cdTransitLayer.selectConnection, 'function');
  assert.equal(typeof cdTransitLayer.clearActiveConnection, 'function');
  assert.equal(typeof cdTransitLayer.toggleCockpitTracking, 'function');
  assert.equal(typeof cdTransitLayer.flyToRoute, 'function');

  const stats = cdTransitLayer.getStats();
  assert.ok(stats, 'getStats should return an object');
  assert.equal(typeof stats.status, 'string');
});

test('cdTransitLayer client search APIs are defined and callable', () => {
  assert.equal(typeof searchStations, 'function');
  assert.equal(typeof searchConnections, 'function');
});

test('cdTransitLayer clearActiveConnection resets state safely without error', () => {
  assert.doesNotThrow(() => {
    cdTransitLayer.clearActiveConnection();
  });
  const stats = cdTransitLayer.getStats();
  assert.equal(stats.count, 0);
  assert.equal(stats.activeTrain, null);
});
