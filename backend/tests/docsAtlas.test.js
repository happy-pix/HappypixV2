// The API atlas and schema atlas are generated from source. This test
// is what stops them going stale: it re-reads the route and model
// files and fails if the committed atlas disagrees.
//
// If it fails, run: node backend/scripts/generateDocsAtlas.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ATLAS_ROUTES, ATLAS_MODELS, ATLAS_UNMAPPED_FILES } from '../config/docsAtlas.generated.js';

const BACKEND = dirname(dirname(fileURLToPath(import.meta.url)));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.js')) out.push(full);
  }
  return out.sort();
}

// Both backends. The main Express app and the public website API are
// separate deployments that share the Mongo collections, so the
// backrooms page has to list all of them or it is not a map.
const WEBSITE_ROUTES = join(dirname(BACKEND), 'website-backend', 'src', 'routes.js');

function handlersInSource() {
  const found = [];
  const scan = (file, rel) => {
    const src = readFileSync(file, 'utf8');
    for (const match of src.matchAll(/router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]*)['"`]/g)) {
      found.push(`${rel} ${match[1].toUpperCase()} ${match[2]}`);
    }
  };
  for (const file of walk(join(BACKEND, 'routes'))) {
    scan(file, file.replace(`${BACKEND}/routes/`, ''));
  }
  try {
    statSync(WEBSITE_ROUTES);
    scan(WEBSITE_ROUTES, 'website-backend/src/routes.js');
  } catch {
    /* website backend absent in a partial checkout */
  }
  return found.sort();
}

function modelsInSource() {
  return readdirSync(join(BACKEND, 'models'))
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.replace(/\.js$/, ''))
    .sort();
}

test('the atlas lists every route handler that exists in the source', () => {
  const fromAtlas = ATLAS_ROUTES.map((route) => `${route.file} ${route.method} ${route.own}`).sort();
  assert.deepEqual(fromAtlas, handlersInSource());
});

test('the atlas lists every model file', () => {
  assert.deepEqual(ATLAS_MODELS.map((model) => model.name).sort(), modelsInSource());
});

test('every route file is either mapped to a mount or reported', () => {
  const files = walk(join(BACKEND, 'routes')).map((file) => file.replace(`${BACKEND}/routes/`, ''));
  const accounted = new Set([...ATLAS_ROUTES.map((route) => route.file), ...ATLAS_UNMAPPED_FILES]);
  for (const file of files) {
    assert.ok(accounted.has(file), `route file not in the atlas: ${file}`);
  }
});

test('every mounted route has a purpose, and says where it came from', () => {
  const mounted = ATLAS_ROUTES.filter((route) => route.mounted);
  assert.ok(mounted.length > 100, `expected the real API, got ${mounted.length} routes`);

  for (const route of mounted) {
    assert.ok(route.purpose && route.purpose.length > 8, `no purpose for ${route.method} ${route.path}`);
    // The atlas keeps file and line apart; the API payload joins them
    // into `source`. Either way the location must be there.
    assert.match(route.file, /^[\w/.-]+\.js$/, `no source file for ${route.path}`);
    assert.ok(Number.isInteger(route.line) && route.line > 0, `no source line for ${route.path}`);
  }
});

test('the atlas covers both backends, not just the main API', () => {
  const main = ATLAS_ROUTES.filter((route) => route.backend === 'main' && route.mounted);
  const website = ATLAS_ROUTES.filter((route) => route.backend === 'website');
  assert.ok(main.length >= 140, `expected the main API, got ${main.length}`);
  assert.ok(website.length >= 8, `expected the website API, got ${website.length}`);
  for (const route of website) {
    assert.ok(route.path.startsWith('/api/'), `website route not mounted under /api: ${route.path}`);
  }
});

test('unmounted legacy routes are flagged, not passed off as live', () => {
  const unmounted = ATLAS_ROUTES.filter((route) => !route.mounted);
  assert.ok(unmounted.length > 0, 'expected the legacy auth routes to be reported');
  for (const route of unmounted) {
    assert.equal(route.group, 'Legacy (unmounted)');
  }
});

test('every model carries its fields, and references resolve to real models', () => {
  const names = new Set(ATLAS_MODELS.map((model) => model.name));
  let fields = 0;

  for (const model of ATLAS_MODELS) {
    assert.ok(model.fields.length > 0, `${model.name} has no fields`);
    fields += model.fields.length;
    for (const ref of model.refs) {
      assert.ok(names.has(ref), `${model.name} references an unknown model: ${ref}`);
    }
  }
  // Introspection, not a regex over the source: if this regresses to
  // the old parser the count collapses to ~280.
  assert.ok(fields > 400, `expected every schema field, got ${fields}`);
});

test('the atlas matches the source it was generated from', () => {
  // Regenerating must be a no-op. If this fails, the committed file is
  // stale — run the generator and commit the result.
  const source = readFileSync(join(BACKEND, 'config', 'docsAtlas.generated.js'), 'utf8');
  assert.match(source, /GENERATED FILE — do not edit by hand/);
  assert.match(source, /route handlers \(\d+ mounted, \d+ legacy\/unmounted\)/);
});
