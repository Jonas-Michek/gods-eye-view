import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RAIL_STATIONS,
  findStation,
  resolveTrackPolyline,
  interpolateTrackPosition,
  haversineMeters,
} from './czechRailTracks.js';

test('czechRailTracks: findStation resolves by exact and partial names', () => {
  const praha = findStation('Praha hl.n.');
  assert.ok(praha, 'Praha hl.n. should exist');
  assert.equal(praha.name, 'Praha hl.n.');
  assert.equal(typeof praha.lat, 'number');
  assert.equal(typeof praha.lon, 'number');

  const brno = findStation('brno hl.n.');
  assert.ok(brno, 'Brno should be resolved case-insensitively');
  assert.equal(brno.name, 'Brno hl.n.');

  const ostrava = findStation('Ostrava');
  assert.ok(ostrava, 'Partial search for Ostrava should resolve');
});

test('czechRailTracks: resolveTrackPolyline produces curved path following rail corridor', () => {
  const path = resolveTrackPolyline('Praha hl.n.', 'Brno hl.n.');
  assert.ok(path.length > 10, `Path should have multiple curve points (found ${path.length})`);

  const first = path[0];
  const last = path[path.length - 1];

  assert.ok(Math.abs(first.lat - RAIL_STATIONS['Praha hl.n.'].lat) < 0.01);
  assert.ok(Math.abs(last.lat - RAIL_STATIONS['Brno hl.n.'].lat) < 0.01);

  const straightDist = haversineMeters(first.lat, first.lon, last.lat, last.lon);
  const trackDist = last.distMeters;

  // Rail track must be longer than the straight line (due to curves through Pardubice & Česká Třebová)
  assert.ok(trackDist > straightDist, `Track distance (${trackDist}m) should be greater than straight line (${straightDist}m)`);
  assert.ok(trackDist > 200000, 'Praha to Brno rail route is over 200 km');
});

test('czechRailTracks: resolveTrackPolyline connects Praha to Ostrava', () => {
  const path = resolveTrackPolyline('Praha hl.n.', 'Ostrava hl.n.', ['Pardubice hl.n.', 'Olomouc hl.n.']);
  assert.ok(path.length > 20, 'Praha to Ostrava should have many detailed points');

  const last = path[path.length - 1];
  assert.ok(last.distMeters > 300000, `Track distance should be > 300 km (got ${last.distMeters / 1000} km)`);
});

test('czechRailTracks: interpolateTrackPosition calculates smooth coordinates and bearing', () => {
  const path = resolveTrackPolyline('Praha hl.n.', 'Pardubice hl.n.');

  const start = interpolateTrackPosition(path, 0);
  assert.equal(typeof start.lat, 'number');
  assert.equal(typeof start.lon, 'number');
  assert.equal(typeof start.headingDeg, 'number');

  const mid = interpolateTrackPosition(path, 0.5);
  assert.notEqual(mid.lat, start.lat);
  assert.ok(mid.headingDeg >= 0 && mid.headingDeg <= 360);

  const end = interpolateTrackPosition(path, 1.0);
  assert.ok(Math.abs(end.lat - RAIL_STATIONS['Pardubice hl.n.'].lat) < 0.01);
});
