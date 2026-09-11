import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TRAM_MODEL_URL,
  MODEL_ENTER_DIST_M,
  MODEL_EXIT_DIST_M,
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
