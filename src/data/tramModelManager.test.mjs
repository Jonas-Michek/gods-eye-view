import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TRAM_MODEL_URL,
  MODEL_ENTER_DIST_M,
  MODEL_EXIT_DIST_M,
  TRAM_HEADING_OFFSET_DEG,
  snapTramToTrack,
  initTramModelManager,
  destroyTramModelManager,
  isTramModelManagerActive,
  computeTramModelMatrix,
  updateTramModels,
} from './tramModelManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('tramModelManager constants and hysteresis bounds are correctly configured', () => {
  assert.equal(TRAM_MODEL_URL, '/models/tatra_t3.glb');
  assert.ok(MODEL_ENTER_DIST_M >= 800 && MODEL_ENTER_DIST_M <= 1500, 'Enter distance should be between 800m and 1500m');
  assert.ok(MODEL_EXIT_DIST_M > MODEL_ENTER_DIST_M, 'Exit distance must be greater than enter distance for hysteresis');
});

test('public/models/tatra_t3.glb exists and is a valid binary glTF 2.0 asset', () => {
  const glbPath = path.resolve(__dirname, '../../public/models/tatra_t3.glb');
  assert.ok(fs.existsSync(glbPath), `Expected ${glbPath} to exist`);

  const buf = fs.readFileSync(glbPath);
  assert.ok(buf.length > 10000, `Expected GLB file to be > 10KB, got ${buf.length} bytes`);

  // Verify glTF 2.0 header: magic 'glTF' (0x46546C67), version 2
  const magic = buf.toString('utf8', 0, 4);
  assert.equal(magic, 'glTF', 'File must begin with glTF binary magic');
  const version = buf.readUInt32LE(4);
  assert.equal(version, 2, 'glTF version must be 2');
  const totalLength = buf.readUInt32LE(8);
  assert.equal(totalLength, buf.length, 'Header total length must match file size');
});

test('tramModelManager lifecycle handles init and destroy cleanly', () => {
  assert.equal(isTramModelManagerActive(), false);

  const mockViewer = {
    camera: {
      positionWC: { x: 0, y: 0, z: 0 },
    },
    scene: {
      primitives: {
        add: () => {},
        remove: () => {},
      },
    },
  };

  initTramModelManager(mockViewer);
  assert.equal(isTramModelManagerActive(), true);

  // updateTramModels executes without throwing
  updateTramModels(mockViewer, [
    { id: 'tram-1', type: 'tram', lon: 14.41, lat: 50.08, alt: 220, bearing: 90 },
    { id: 'bus-1', type: 'bus', lon: 14.41, lat: 50.08, alt: 220, bearing: 0 },
  ]);

  destroyTramModelManager(mockViewer);
  assert.equal(isTramModelManagerActive(), false);
});

test('snapTramToTrack projects vehicle onto track line within corridor and aligns bearing', () => {
  assert.equal(TRAM_HEADING_OFFSET_DEG, 90, 'Heading offset must be 90 degrees to align glTF nose with track');

  // Test route: a straight segment going East along latitude 50.08000 from lon 14.41000 to 14.42000
  const vehicle = {
    id: 'test-tram-1',
    line: '999',
    routeNodes: [
      { lat: 50.08000, lon: 14.41000, alt: 220 },
      { lat: 50.08000, lon: 14.42000, alt: 220 },
    ],
  };

  // 1. Point slightly north of the track (e.g., ~15m north, dy ≈ 0.000135 deg lat)
  const nearbyLat = 50.08013;
  const nearbyLon = 14.41500;
  const snapped = snapTramToTrack(nearbyLat, nearbyLon, 90, vehicle);

  assert.equal(snapped.snapped, true, 'Should snap when vehicle is within 90m corridor');
  assert.ok(Math.abs(snapped.lat - 50.08000) < 0.00001, `Snapped latitude should be 50.08000, got ${snapped.lat}`);
  assert.ok(Math.abs(snapped.lon - 14.41500) < 0.00001, `Snapped longitude should be 14.41500, got ${snapped.lon}`);
  // Bearing of (50.08, 14.41) -> (50.08, 14.42) is ~90 deg (due East)
  assert.ok(Math.abs(snapped.bearing - 90) < 1.0, `Bearing should align with track East (90 deg), got ${snapped.bearing}`);

  // 2. Point far away (> 90m north, dy ≈ 0.002 deg lat ≈ 220m)
  const farLat = 50.08200;
  const farSnapped = snapTramToTrack(farLat, nearbyLon, 90, vehicle);
  assert.equal(farSnapped.snapped, false, 'Should not snap when outside 90m corridor');
  assert.equal(farSnapped.lat, farLat);

  // 3. Fallback when vehicle has no route
  const fallback = snapTramToTrack(50.08, 14.41, 45, null);
  assert.equal(fallback.snapped, false);
  assert.equal(fallback.lat, 50.08);
  assert.equal(fallback.lon, 14.41);
  assert.equal(fallback.bearing, 45);
});

