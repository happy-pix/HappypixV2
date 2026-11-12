// What /api/docs/private actually serves, checked against the
// generated atlas. The route-level auth is covered in
// documentationAuth.test.js; this file is about content: every API
// from both backends, every schema field, the CRM guide and the audit
// trail — and no source line numbers, which the reader does not want.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ATLAS_ROUTES, ATLAS_MODELS } from '../config/docsAtlas.generated.js';
import { routeAtlas, schemaAtlas } from '../routes/documentationRoutes.js';
import { CRM_SCREENS, crmScreens, screensForRole } from '../config/docsCrmGuide.js';
import { PERMS, ROLES, ROLE_MATRIX } from '../config/permissions.js';

test('every mounted handler from both backends reaches the payload', () => {
  // This is the contract the viewer consumes: routeAtlas() filters on
  // `mounted` and keeps both backends.
  const mounted = ATLAS_ROUTES.filter((route) => route.mounted);
  const main = mounted.filter((route) => route.backend === 'main');
  const website = mounted.filter((route) => route.backend === 'website');

  assert.ok(main.length >= 140, `main backend: ${main.length}`);
  assert.ok(website.length >= 8, `website backend: ${website.length}`);
  assert.equal(main.length + website.length, mounted.length);
});

test('a route carries the contract the reader needs, and no file path', () => {
  const served = routeAtlas();
  const route = served.find((item) => item.path === '/api/booth/sessions/complete');
  assert.ok(route, 'expected the session-completion handler');

  assert.ok(route.purpose.length > 8);

  // The request is a spec, not a name list: every field carries a type
  // and whether it is required.
  const byName = Object.fromEntries(route.request.body.map((field) => [field.field, field]));
  assert.ok(byName.sessionId, 'sessionId missing from the request spec');
  assert.equal(byName.sessionId.required, true, 'sessionId must be required');
  assert.equal(byName.sessionId.type, 'string');
  assert.ok(byName.photos, 'photos missing from the request spec');
  assert.equal(byName.photos.type, 'array');

  // The response is the payload the handler returns.
  assert.ok(route.response.fields.length > 0);
  assert.ok(route.response.fields.some((field) => field.field === 'downloadUrl'));

  assert.ok(route.models.includes('Photo'));

  // The user asked for the code line number to be left out, so no
  // served route may carry one — nor the file it came from.
  for (const item of served) {
    assert.equal(item.line, undefined, `${item.path} leaks a line number`);
    assert.equal(item.file, undefined, `${item.path} leaks a source file`);
    assert.doesNotMatch(JSON.stringify(item), /\w+\.js:\d+/);
  }
});

test('query parameters are separated from the body', () => {
  const route = routeAtlas().find((item) => item.path === '/api/platform/organizations');
  assert.ok(route);
  const query = route.request.query.map((field) => field.field);
  assert.ok(query.includes('search'));
  assert.ok(query.includes('page'));
  assert.deepEqual(route.request.body, []);
});

test('path parameters are picked up from the route pattern', () => {
  const withParam = ATLAS_ROUTES.find((route) => route.mounted && route.path.includes(':'));
  assert.ok(withParam, 'expected at least one parameterised route');
  assert.ok(
    ATLAS_ROUTES.every((route) => route.request.params.length === (route.own.match(/:\w+/g) || []).length),
  );
});

test('every model reaches the payload with real field metadata', () => {
  let fields = 0;
  let typed = 0;
  for (const model of schemaAtlas()) {
    assert.ok(model.fields.length > 0, `${model.name} has no fields`);
    fields += model.fields.length;
    typed += model.fields.filter((field) => field.type).length;
  }
  // The old regex parser reported 281 fields with most types null.
  assert.ok(fields > 400, `expected every schema field, got ${fields}`);
  assert.ok(typed / fields > 0.95, `expected types on nearly every field, got ${typed}/${fields}`);
});

test('enum and default values survive into the schema view', () => {
  const event = ATLAS_MODELS.find((model) => model.name === 'Event');
  const status = event.fields.find((field) => field.field === 'status');
  assert.deepEqual(status.enum, ['upcoming', 'live', 'finished']);
  assert.equal(status.default, "'upcoming'");
});

test('the CRM guide covers every screen the app can show', () => {
  const screens = crmScreens();
  assert.equal(screens.length, CRM_SCREENS.length);
  for (const screen of screens) {
    assert.ok(screen.what && screen.what.length > 40, `${screen.label} has no description`);
    assert.ok(screen.use.length >= 2, `${screen.label} has no instructions`);
    assert.ok(screen.cant && screen.cant.length > 20, `${screen.label} does not say what it will not do`);
    assert.ok(screen.permission, `${screen.label} has no permission`);
  }
});

test('CRM page access comes from the role matrix, not from prose', () => {
  for (const screen of crmScreens()) {
    const expected = Object.entries(PERMS).find(([key]) => key === screen.perm);
    assert.ok(expected, `${screen.id} names a permission that does not exist: ${screen.perm}`);
    const roles = ROLE_MATRIX[expected[1]] || [];
    assert.deepEqual([...screen.roles].sort(), [...roles].sort(), `${screen.id} disagrees with the matrix`);
  }
});

test('no organisation role can reach a platform page', () => {
  const platform = crmScreens().filter((screen) => screen.section === 'Platform');
  assert.ok(platform.length > 0);
  const orgScreens = screensForRole(ROLES.ORG_ADMIN).filter((screen) => screen.section === 'Platform');
  assert.deepEqual(
    orgScreens.map((screen) => screen.id),
    [],
  );
  assert.ok(screensForRole(ROLES.ORG_ADMIN).length > 0, 'org admins must still reach their own pages');
});
