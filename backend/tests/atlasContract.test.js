// The atlas is supposed to be a SPECIFICATION, not a scrape. These
// tests pin the analyser against handlers whose contracts are known,
// so a refactor cannot quietly turn typed fields back into name lists.
//
// Each case was read out of the handler by hand and verified against
// the source; if one fails, either the handler changed or the analyser
// regressed — check the handler first.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ATLAS_ROUTES } from '../config/docsAtlas.generated.js';
import {
  inferType,
  objectEntries,
  requestSpec,
  responseSpec,
  moduleFieldMap,
  serviceBodyFields,
} from '../scripts/atlasContract.mjs';

const BACKEND = dirname(dirname(fileURLToPath(import.meta.url)));

const byPath = (path) => ATLAS_ROUTES.find((route) => route.path === path && route.mounted);

test('type inference distinguishes the cases that matter', () => {
  assert.equal(inferType('true'), 'boolean');
  assert.equal(inferType('false'), 'boolean');
  assert.equal(inferType("'live'"), 'string');
  assert.equal(inferType('42'), 'number');
  assert.equal(inferType('items.map((item) => item.id)'), 'array');
  assert.equal(inferType("String(body.name || '')"), 'string');
  assert.equal(inferType('Number(body.quantity)'), 'number');
  assert.equal(inferType('Boolean(body.active)'), 'boolean');
  assert.equal(inferType('!!body.consent'), 'boolean');
  assert.equal(inferType("body.status === 'live'"), 'boolean');
  // A ternary is not a boolean just because it contains `?`. This is
  // what made `downloadId` report as boolean.
  assert.equal(inferType('maybe ? maybe.id : null'), 'any');
  assert.equal(inferType('maybe ? 1 : null'), 'number');
  // Unknown stays unknown rather than being guessed at.
  assert.equal(inferType('someUndeclaredValue'), 'any');
});

test('object literals yield keys, not values', () => {
  const entries = objectEntries('{ events, canCreate: a !== b, plan, count: 3 }');
  assert.deepEqual(
    entries.map((entry) => entry.key),
    ['events', 'canCreate', 'plan', 'count'],
  );
  // A literal inside a value is not a key.
  const nested = objectEntries("{ ok: true, meta: { nested: 1 }, note: 'x' }");
  assert.deepEqual(nested.map((entry) => entry.key), ['ok', 'meta', 'note']);
});

test('a required field is the one the handler rejects without', () => {
  const route = byPath('/api/booth/sessions/complete');
  const sessionId = route.request.body.find((field) => field.field === 'sessionId');
  assert.equal(sessionId.required, true);
  assert.equal(sessionId.type, 'string');
  assert.match(sessionId.note || '', /required/i);

  // `digitalCopy` is optional with a default of true.
  const digitalCopy = route.request.body.find((field) => field.field === 'digitalCopy');
  assert.equal(digitalCopy.required, false);
  assert.equal(digitalCopy.type, 'boolean');
});

test('arrays are typed as arrays, not as unknown', () => {
  const route = byPath('/api/booth/sessions/complete');
  const photos = route.request.body.find((field) => field.field === 'photos');
  assert.equal(photos.type, 'array');
});

test('query parameters are typed and separated from the body', () => {
  const route = byPath('/api/platform/organizations');
  const query = route.request.query.map((field) => field.field);
  for (const field of ['page', 'limit', 'search', 'status']) {
    assert.ok(query.includes(field), `missing query field ${field}`);
  }
  assert.deepEqual(route.request.body, []);
});

test('path parameters come from the route pattern', () => {
  for (const route of ATLAS_ROUTES.filter((item) => item.mounted && item.path.includes(':'))) {
    const declared = [...route.own.matchAll(/:(\w+)/g)].map((m) => m[1]);
    assert.deepEqual(route.request.params.map((p) => p.field), declared);
  }
});

test('the response is the payload the handler returns', () => {
  const gallery = byPath('/api/org/gallery');
  const fields = gallery.responses[0].fields.map((field) => field.field);
  for (const field of ['enabled', 'photos', 'events', 'booths']) {
    assert.ok(fields.includes(field), `missing response field ${field}`);
  }

  const login = byPath('/api/auth/login');
  assert.ok(login.responses[0].fields.some((field) => field.field === 'token'));
});

test('a response envelope is expanded, not just its argument', () => {
  // The booth answers through stateEnvelope(state, {...}): the fields
  // are split between the helper and the call site.
  const heartbeat = byPath('/api/booth/heartbeat');
  assert.ok(heartbeat, 'heartbeat handler missing');
  const fields = heartbeat.responses.flatMap((payload) => payload.fields.map((f) => f.field));
  assert.ok(fields.includes('changed'), 'call-site field missing');
  assert.ok(fields.includes('state'), 'envelope field missing');
  assert.ok(fields.includes('serverTime'), 'envelope field missing');
});

test('declared errors carry their code', () => {
  const route = byPath('/api/booth/sessions/complete');
  const codes = route.errors.map((error) => error.code).filter(Boolean);
  assert.ok(codes.includes('BAD_SESSION'), `expected BAD_SESSION, got ${codes.join(', ')}`);
});

test('external tools are attributed per handler, not per file', () => {
  // crm/org.js imports the payment service for its checkout routes and
  // the media service for its gallery routes. A file-level answer
  // claimed Razorpay for all 55 handlers in it.
  const gallery = byPath('/api/org/gallery');
  const tools = (route) => (route.tools || []).map((tool) => tool.key);

  assert.ok(tools(gallery).includes('cloudinary'), 'gallery serves photo URLs through Cloudinary');

  const payments = ATLAS_ROUTES.filter((route) => route.mounted && tools(route).includes('razorpay'));
  const paymentPaths = payments.map((route) => route.path);
  assert.ok(paymentPaths.length > 0, 'nothing reports Razorpay');
  assert.ok(
    paymentPaths.length < 30,
    `Razorpay attributed to ${paymentPaths.length} endpoints — this is file-level bleed, not per-handler`,
  );
});

test('tools report what kind of service they are', () => {
  const gallery = byPath('/api/org/gallery');
  const cloudinary = gallery.tools.find((tool) => tool.key === 'cloudinary');
  assert.ok(cloudinary);
  assert.equal(cloudinary.kind, 'media');
  assert.ok(cloudinary.note.length > 10);

  const checkout = byPath('/api/checkout/order');
  const razorpay = checkout.tools.find((tool) => tool.key === 'razorpay');
  assert.ok(razorpay, 'checkout must report the payment gateway');
  assert.equal(razorpay.kind, 'payments');
});

test('every mounted route has a contract, even an empty one', () => {
  for (const route of ATLAS_ROUTES.filter((item) => item.mounted)) {
    assert.ok(route.request, `${route.path} has no request spec`);
    assert.ok(Array.isArray(route.request.body));
    assert.ok(Array.isArray(route.request.query));
    assert.ok(Array.isArray(route.request.params));
    assert.ok(Array.isArray(route.responses));
    assert.ok(Array.isArray(route.tools));
  }
});

test('a GET handler declares no request body', () => {
  for (const route of ATLAS_ROUTES.filter((item) => item.mounted && item.method === 'GET')) {
    assert.deepEqual(
      route.request.body,
      [],
      `${route.path} is a GET but reports a request body: ${route.request.body.map((f) => f.field).join(', ')}`,
    );
  }
});

test('a handler that hands its body to a service still gets a request spec', () => {
  // routes/crm/org.js calls eventPatch(req.body) and reads nothing
  // itself. Scanning only the route file reported an empty body for a
  // POST that requires a name.
  // POST, not the GET that shares this path.
  const route = ATLAS_ROUTES.find(
    (item) => item.path === '/api/org/events' && item.method === 'POST' && item.mounted,
  );
  assert.ok(route, 'event creation handler missing');
  const fields = route.request.body.map((field) => field.field);
  assert.ok(fields.includes('name'), 'name is required by eventPatch');
  assert.ok(fields.includes('startDate'));

  const startDate = route.request.body.find((field) => field.field === 'startDate');
  assert.equal(startDate.type, 'date');

  const digitalCopy = route.request.body.find((field) => field.field === 'digitalCopy');
  assert.equal(digitalCopy.type, 'boolean');
});

test('a service field is typed from the module that parses it', () => {
  const moduleFields = moduleFieldMap(BACKEND);
  const fields = moduleFields.get('services/eventService.js');
  assert.ok(fields, 'eventService should be scanned');
  assert.equal(fields.get('name').type, 'string');
  assert.equal(fields.get('templateIds').type, 'array');
  assert.equal(fields.get('digitalCopy').type, 'boolean');
});

test('configuration is not mistaken for a gateway call', () => {
  // eventService mentions `cashfreeSecretKey`; that is a stored field,
  // not a request to Cashfree. Only two booth routes actually switch
  // the gateway on.
  const withCashfree = ATLAS_ROUTES.filter(
    (route) => route.mounted && (route.tools || []).some((tool) => tool.key === 'cashfree'),
  );
  assert.ok(withCashfree.length <= 4, `Cashfree attributed to ${withCashfree.length} endpoints`);
  for (const route of withCashfree) {
    assert.match(route.path, /payment/, `${route.path} reports Cashfree without taking a payment`);
  }
});

test('the analyser reads a handler it has never seen before', () => {
  // Built from source rather than from a fixture, so this fails if the
  // parser only works on the shapes that happen to exist today.
  const source = readFileSync(join(BACKEND, 'routes', 'boothRoutes.js'), 'utf8');
  const sample = `
    router.post('/widgets', asyncRoute(async (req, res) => {
      const name = String(req.body.name || '');
      if (!name) throw badRequest('name is required.', 'BAD_NAME');
      const count = Number(req.body.count || 5);
      const tags = Array.isArray(req.body.tags) ? req.body.tags : [];
      const enabled = Boolean(req.body.enabled);
      const page = Number(req.query.page || 1);
      res.status(201).json({ id: 'x', name, count, tags, enabled, page });
    }));
  `;
  const body = sample.slice(sample.indexOf('{', sample.indexOf("asyncRoute(")));
  const spec = requestSpec(body, '/widgets');
  const fields = Object.fromEntries(spec.body.map((field) => [field.field, field]));

  assert.equal(fields.name.type, 'string');
  assert.equal(fields.name.required, true);
  assert.equal(fields.count.type, 'number');
  assert.equal(fields.count.default, '5');
  assert.equal(fields.tags.type, 'array');
  assert.equal(fields.enabled.type, 'boolean');
  assert.equal(spec.query[0].field, 'page');

  const response = responseSpec(body, { fileSource: source });
  assert.equal(response.payloads[0].status, 201);
  assert.deepEqual(
    response.payloads[0].fields.map((field) => field.field),
    ['id', 'name', 'count', 'tags', 'enabled', 'page'],
  );
  assert.ok(response.errors.some((error) => error.code === 'BAD_NAME'));
});
