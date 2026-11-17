// ─────────────────────────────────────────────────────────────────
//  Generates backend/config/docsAtlas.generated.js from the real
//  route files and Mongoose models, across BOTH backends.
//
//  The platform docs used to carry a hand-written sample of the API.
//  A sample goes stale the week it is written, and a stale map is
//  worse than no map. This reads the source instead, so the atlas
//  always lists every mounted handler and every model.
//
//  Two things here are load-bearing and easy to get wrong:
//
//  1. Models are INTROSPECTED, not regex-scraped. Earlier versions
//     matched `^ {4}` in the model source and silently dropped every
//     field, reporting 3 of Event's 49 paths. Mongoose already knows
//     the schema; ask it.
//
//  2. Request/response fields are resolved by REACHABILITY. A flat
//     "does this word appear in the handler body?" search matches
//     `_id` in every handler and every model, which is useless. So
//     each handler is walked as a scope graph: a field counts only if
//     it hangs off a value that actually traces back to req.body.
//
//  Run: node backend/scripts/generateDocsAtlas.mjs
//  Check: npm test → tests/docsAtlas.test.js fails on drift.
// ─────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

import {
  requestSpec, responseSpec, toolsForHandler, serviceToolMapWithUtils, serviceExportMap, exportsInFile, TOOLS,
  moduleFieldMap, serviceBodyFields,
} from './atlasContract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..'); // backend/
const REPO = join(ROOT, '..'); // repo root
const ROUTES_DIR = join(ROOT, 'routes');
const MODELS_DIR = join(ROOT, 'models');
const WEBSITE_SRC = join(REPO, 'website-backend', 'src');
const OUT = join(ROOT, 'config', 'docsAtlas.generated.js');

// Mount prefixes, exactly as server.js wires them. Anything not in
// this map is not reachable and is reported, not silently listed.
const MOUNTS = {
  'crm/auth.js': { prefix: '/api/auth', group: 'Identity' },
  'crm/org.js': { prefix: '/api/org', group: 'CRM · organisation' },
  'crm/platform.js': { prefix: '/api/platform', group: 'CRM · platform' },
  'documentationRoutes.js': { prefix: '/api/docs', group: 'Platform docs' },
  'eventRoutes.js': { prefix: '/api/events', group: 'Events' },
  'couponRoutes.js': { prefix: '/api/coupons', group: 'Coupons' },
  'settingRoutes.js': { prefix: '/api/settings', group: 'Settings' },
  'paymentRoutes.js': { prefix: '/api/payments', group: 'Payments' },
  'supportRoutes.js': { prefix: '/api/support', group: 'Support' },
  'deviceRoutes.js': { prefix: '/api/devices', group: 'Devices' },
  'boothRoutes.js': { prefix: '/api/booth', group: 'Booth' },
  'photoShareRoutes.js': { prefix: '/api/share', group: 'Sharing' },
  'downloadRoutes.js': { prefix: '/api/downloads', group: 'Guest downloads' },
  'usageAccessRoutes.js': {
    prefix: '/api/usage-access',
    group: 'Usage access',
  },
  // Mounted nowhere in server.js — kept visible so nobody assumes it is live.
  'authRoutes.js': { prefix: null, group: 'Legacy (unmounted)' },
};

// The public website API (website-backend) is a separate Express app
// on its own Vercel project. It shares the Mongo collections.
const WEBSITE_MOUNT = '/api';

const VERBS = {
  GET: 'Reads',
  POST: 'Creates',
  PUT: 'Replaces',
  PATCH: 'Updates',
  DELETE: 'Deletes',
};

const WORDS = {
  auth: 'authentication',
  me: 'the current session',
  login: 'a sign-in',
  logout: 'a sign-out',
  profile: 'the profile',
  password: 'the password',
  dashboard: 'the dashboard',
  events: 'events',
  event: 'an event',
  devices: 'devices',
  device: 'a device',
  team: 'team members',
  gallery: 'the gallery',
  revenue: 'revenue',
  wallet: 'the wallet',
  coupons: 'coupons',
  coupon: 'a coupon',
  plans: 'plans',
  plan: 'a plan',
  leads: 'website leads',
  lead: 'a website lead',
  support: 'support',
  tickets: 'support tickets',
  ticket: 'a ticket',
  settings: 'settings',
  templates: 'templates',
  template: 'a template',
  defaults: 'defaults',
  organizations: 'organisations',
  organization: 'an organisation',
  photo: 'a photo',
  photos: 'photos',
  session: 'the session',
  sessions: 'sessions',
  payment: 'a payment',
  payments: 'payments',
  download: 'a download',
  downloads: 'downloads',
  share: 'a share link',
  health: 'a health check',
  checkout: 'checkout',
  docs: 'the docs payload',
  private: 'the private docs payload',
  audit: 'the audit log',
  usage: 'usage',
  access: 'access',
  heartbeat: 'a heartbeat',
  bootstrap: 'the booth bootstrap payload',
  pairing: 'device pairing',
};

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.js')) out.push(full);
  }
  return out.sort();
}

/** The comment block immediately above a handler, if there is one. */
function purposeAbove(lines, index) {
  const found = [];
  for (let i = index - 1; i >= 0 && i > index - 8; i--) {
    const text = lines[i].trim();
    if (text.startsWith('//')) {
      found.unshift(text.replace(/^\/\/+\s?/, '').trim());
      continue;
    }
    if (text === '') continue;
    break;
  }
  return found
    .filter((line) => line && !/^[─=\-–—\s]*$/.test(line) && !/^[─=]+$/.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Permission + write guards on the same line as the handler. */
function guardsOn(line) {
  const perm = (line.match(/requirePerm\(\s*PERMS\.([A-Z0-9_]+)\s*\)/) || [])[1] || null;
  return {
    permission: perm,
    writableOrg: /requireWritableOrg/.test(line),
    deviceAuth: /authenticateDevice|optionalDeviceAuth/.test(line),
    auth: /(?<!optional)(?:^|[^a-zA-Z])authenticate(?!Device)/.test(line) || /requirePerm\(/.test(line),
  };
}

// ─── Handler bodies ───────────────────────────────────────────────

/**
 * The balanced-brace body of the handler that starts at `from`. Naive
 * brace counting is wrong around strings and regex literals, and these
 * files are full of template strings and `/^...$/` patterns.
 */
function handlerBody(src, from) {
  let i = src.indexOf('{', from);
  if (i < 0) return '';
  const start = i;
  let depth = 0;
  let mode = 'code';
  for (; i < src.length; i += 1) {
    const ch = src[i];
    const prev = src[i - 1];
    if (mode === 'code') {
      if (ch === '/' && src[i + 1] === '/') {
        mode = 'line';
        continue;
      }
      if (ch === '/' && src[i + 1] === '*') {
        mode = 'block';
        i += 1;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        mode = ch;
        continue;
      }
      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) return src.slice(start, i + 1);
      }
    } else if (mode === 'line') {
      if (ch === '\n') mode = 'code';
    } else if (mode === 'block') {
      if (ch === '*' && src[i + 1] === '/') {
        mode = 'code';
        i += 1;
      }
    } else {
      // inside a string; honour escapes, and an unescaped close ends it
      if (ch === '\\') {
        i += 1;
        continue;
      }
      if (ch === mode && prev !== '\\') mode = 'code';
    }
  }
  return src.slice(start);
}

/**
 * Names bound to a request payload:
 *   const body = req.body            → body
 *   const x = req.body.x             → x
 *   const { a, b } = req.body        → a, b
 *   const { a, b } = req.body.foo    → a, b
 *   const q = req.query               → q
 * Plus which root each came from, so a value can be attributed to the
 * body or to the query string correctly.
 */
function bindings(bodySrc) {
  const out = []; // { name, root, via }  root = 'body' | 'query' | 'params'
  const patterns = [
    /(?:const|let|var)\s+(\w+)\s*=\s*req\.(body|query|params)\b(?![\w.[])/g,
    /(?:const|let|var)\s+([\w\s,]+?)\s*=\s*req\.(body|query|params)(?:\.\w+)?/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(bodySrc))) {
      const left = m[1].trim();
      const root = m[2];
      if (left.startsWith('{') || (!/^\w+$/.test(left) && left.includes(','))) {
        for (const part of left.replace(/[{}]/g, '').split(',')) {
          const key = part.split(':').pop().trim().split('=')[0].trim();
          if (/^\w+$/.test(key)) out.push({ name: key, root, via: 'destructure' });
        }
      } else if (/^\w+$/.test(left)) {
        out.push({ name: left, root, via: 'alias' });
      }
    }
  }
  return out;
}

/** Direct `req.body.field` / `req.query.field` reads, in order. */
function directReads(bodySrc) {
  const out = [];
  const re = /req\.(body|query|params)((?:\??\.[\w$]+)+)/g;
  let m;
  while ((m = re.exec(bodySrc))) {
    const path = m[2].replace(/\?\./g, '.').replace(/^\./, '');
    if (!path) continue;
    out.push({ root: m[1], path });
  }
  return out;
}

/** Sorted unique field list, keeping only top-level names. */
function uniqueTop(fields) {
  return [...new Set(fields.map((f) => f.split('.')[0]).filter((f) => f && f !== 'length'))].sort();
}

/**
 * Top-level keys of every object literal a handler sends.
 *
 * Handlers compose their payload through view helpers (`eventView`,
 * `publicPlanView`), so chasing the exact nested shape means running
 * the app. The top-level keys are what a caller actually binds to —
 * `{ events, canCreate, plan, templates }` — and they are right there
 * in the source. That is what this reports, plus any model paths the
 * handler explicitly `.select()`s.
 */
function responseOf(bodySrc, models) {
  const keys = [];

  const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'await', 'new', 'typeof', 'length']);

  const addKeysFrom = (text) => {
    // `text` starts just after the `{`.
    let depth = 1;
    let mode = 'code';
    let token = '';
    // Whether a ':' has already been seen at this depth since the last
    // ','. If it has, the next token is a value, not a key. This is
    // what keeps `{ free: true }` from reporting "true" as a field.
    let sawColon = false;

    const flush = (next) => {
      const name = token.trim();
      token = '';
      if (!name) return;
      if (depth !== 1) return;
      if (!/^[A-Za-z_$][\w$]*$/.test(name)) return;
      if (LITERALS.has(name)) return;
      if (next === ':') keys.push(name);
      else if (next === ',' && !sawColon) keys.push(name); // shorthand
    };

    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (mode === 'code') {
        if (ch === '/' && text[i + 1] === '/') {
          flush('');
          mode = 'line';
          continue;
        }
        if (ch === '/' && text[i + 1] === '*') {
          flush('');
          mode = 'block';
          i += 1;
          continue;
        }
        if (ch === "'" || ch === '"' || ch === '`') {
          flush('');
          mode = ch;
          continue;
        }
        if (ch === '{' || ch === '(' || ch === '[') {
          flush('');
          depth += 1;
          continue;
        }
        if (ch === '}' || ch === ')' || ch === ']') {
          flush('');
          depth -= 1;
          if (depth === 0) return;
          if (depth === 1) sawColon = false;
          continue;
        }
        if (ch === ':') {
          flush(':');
          sawColon = true;
          continue;
        }
        if (ch === ',') {
          flush(',');
          sawColon = false;
          continue;
        }
        if (/[\w$]/.test(ch)) {
          token += ch;
          continue;
        }
        flush('');
      } else if (mode === 'line') {
        if (ch === '\n') mode = 'code';
      } else if (mode === 'block') {
        if (ch === '*' && text[i + 1] === '/') {
          mode = 'code';
          i += 1;
        }
      } else {
        if (ch === '\\') {
          i += 1;
          continue;
        }
        if (ch === mode) mode = 'code';
      }
    }
  };

  for (const marker of [/(?:res\.status\([^)]*\)\.)?res\.json\(\s*\{/g, /\bok\(res,\s*\{/g]) {
    let m;
    while ((m = marker.exec(bodySrc))) {
      const braceAt = bodySrc.indexOf('{', m.index);
      addKeysFrom(bodySrc.slice(braceAt + 1));
    }
  }

  // Explicit projections: `.select('name status')`.
  const selected = [];
  for (const m of bodySrc.matchAll(/\.select\(\s*['"]([^'"]+)['"]/g)) {
    selected.push(...m[1].split(/\s+/).filter((f) => f && f !== '-_id' && !f.startsWith('-')));
  }

  const touched = Object.keys(models).filter((name) =>
    new RegExp(
      `\\b${name}\\.(find|findOne|findById|create|updateOne|findOneAndUpdate|aggregate|countDocuments|deleteOne|insertMany)\\b`,
    ).test(bodySrc),
  );

  return {
    models: touched,
    shape:
      keys.length || selected.length ? [{ keys: [...new Set(keys)], selected: [...new Set(selected)] }] : [],
  };
}

// ─── Routes ───────────────────────────────────────────────────────

function derivePurpose(route) {
  const parts = route.path
    .replace(/^\/api\//, '')
    .split('/')
    .filter(Boolean);
  const skip = ['_id', '__', 'id', 'me', 'private', 'health'];
  const nounParts = parts.filter((part) => !skip.includes(part) && !/^:/.test(part) && !/^v\d/.test(part));
  const subject =
    nounParts
      .slice(-2)
      .map((part) => WORDS[part.toLowerCase()] || part.replace(/-/g, ' '))
      .join(' ') || 'the resource';
  const verb = VERBS[route.method] || 'Handles';
  const scope = route.permission
    ? ` Requires ${route.permission.toLowerCase().replace(/_/g, ' ')}.`
    : route.deviceAuth
      ? ' Device-authenticated.'
      : route.auth
        ? ' Requires a signed-in session.'
        : ' Public.';
  const write = route.writableOrg ? ' Blocked for read-only or suspended organisations.' : '';
  return `${verb} ${subject}.${scope}${write}`.replace(/\s+/g, ' ');
}

/**
 * A comment like "PAIRING" or "HEARTBEAT (#76–#81)" is a section
 * banner, not a description of what the handler does. Using one as the
 * purpose would put a heading where a sentence belongs.
 */
function isBanner(text) {
  if (!text) return true;
  const words = text.replace(/[()#\d–—\-,]/g, ' ').trim();
  if (words.length < 12) return true;
  const letters = words.replace(/[^A-Za-z]/g, '');
  if (letters && letters === letters.toUpperCase()) return true;
  return false;
}

function collectRouteFile({ file, rel, prefix, group, backend }) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const routes = [];

  const re = /router\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]*)['"`]/g;
  let m;
  while ((m = re.exec(src))) {
    const lineIndex = src.slice(0, m.index).split('\n').length - 1;
    const path = prefix ? `${prefix}${m[2] === '/' ? '' : m[2]}` : m[2];
    const body = handlerBody(src, m.index + m[0].length);
    const comment = purposeAbove(lines, lineIndex);

    const route = {
      backend,
      group,
      method: m[1].toUpperCase(),
      path,
      // The handler's own path, without the mount prefix. Kept
      // explicitly so the drift test compares like with like instead
      // of re-deriving it from the joined path.
      own: m[2],
      mounted: Boolean(prefix),
      file: rel,
      line: lineIndex + 1,
      ...guardsOn(lines[lineIndex]),
    };

    if (isBanner(comment)) {
      route.section = comment || null;
      route.purpose = derivePurpose(route);
      route.derived = true;
    } else {
      route.section = null;
      route.purpose = comment;
      route.derived = false;
    }

    // ── Contract: a real spec, not a list of scraped names ──
    route.request = requestSpec(body, path);
    // A handler that hands the whole body to a service reads none of
    // it here. The fields are still required — they are just parsed one
    // file away, so follow the call rather than reporting an empty body.
    if (!route.request.body.length && ['POST', 'PUT', 'PATCH'].includes(route.method)) {
      const delegated = serviceBodyFields(body, src, moduleFields);
      if (delegated.length) route.request.body = delegated.map((entry) => ({ ...entry }));
    }

    const responded = responseSpec(body, { fileSource: src, modelTypes: {} });
    route.responses = responded.payloads;
    route.statuses = responded.statuses;
    route.errors = responded.errors;

    // Which models this handler touches, by exact identifier.
    route.models = Object.keys(models).filter((name) =>
      new RegExp(`\\b${name}\\.(find|findOne|findById|create|updateOne|findOneAndUpdate|aggregate|countDocuments|deleteOne|insertMany)\\b`).test(body),
    );

    // The outside services it reaches, directly or through a service.
    route.tools = toolsForHandler(body, src, serviceTools, serviceExports).map((key) => ({
      key,
      ...(TOOLS[key] || { name: key, kind: 'other', note: '' }),
    }));

    routes.push(route);
  }
  return routes;
}

// Filled before route collection so responseOf can see the schemas.
let models = {};

// service module → the outside services it calls, so a route can report
// "Cloudinary" because the photo service it imports talks to it.
const serviceTools = serviceToolMapWithUtils(ROOT);
// Exports for the service modules AND the two media utils, so an alias
// like `const uploadToS3 = uploadToCloudinary` still resolves to a call.
const serviceExports = serviceExportMap(join(ROOT, 'services'));
// Fields each service module reads out of a payload handed to it, so a
// delegating handler still gets a real request body.
const moduleFields = moduleFieldMap(ROOT);
for (const util of ['cloudinary.js', 's3.js']) {
  serviceExports.set(util, exportsInFile(join(ROOT, 'utils', util)));
}

function collectRoutes() {
  const routes = [];
  const unmounted = [];

  for (const file of walk(ROUTES_DIR)) {
    const rel = file.replace(`${ROUTES_DIR}/`, '');
    const mount = MOUNTS[rel];
    if (!mount) {
      unmounted.push(rel);
      continue;
    }
    routes.push(
      ...collectRouteFile({
        file,
        rel,
        prefix: mount.prefix,
        group: mount.group,
        backend: 'main',
      }),
    );
  }

  // The public website API: one router file, mounted at /api.
  const websiteRoutes = join(WEBSITE_SRC, 'routes.js');
  try {
    statSync(websiteRoutes);
    routes.push(
      ...collectRouteFile({
        file: websiteRoutes,
        rel: 'website-backend/src/routes.js',
        prefix: WEBSITE_MOUNT,
        group: 'Website · public',
        backend: 'website',
      }),
    );
  } catch {
    /* the website backend is optional in a partial checkout */
  }

  return { routes, unmounted };
}

// ─── Models ───────────────────────────────────────────────────────

/** Turn one mongoose schema path into the row the docs render. */
function describePath(path, schemaPath) {
  const options = schemaPath.options || {};
  const instance = schemaPath.instance;
  const isArray = instance === 'Array';
  const inner = isArray ? schemaPath.caster : null;

  let type = instance;
  if (isArray) {
    const innerName = inner?.instance || 'Mixed';
    type = `[${innerName === 'ObjectId' ? 'ObjectId' : innerName}]`;
  }
  if (instance === 'Embedded' || schemaPath.$isSingleNested) type = 'Object';

  const required = Boolean(schemaPath.isRequired || options.required);
  const unique = Boolean(options.unique);
  const indexed = Boolean(options.index) || unique;
  const ref = options.ref || (isArray ? inner?.options?.ref : null) || null;
  const enumValues = schemaPath.enumValues?.length
    ? schemaPath.enumValues
    : options.enum?.length
      ? options.enum
      : null;
  const fallback = options.default;
  const hasDefault = fallback !== undefined;
  const defaultValue =
    typeof fallback === 'function'
      ? null
      : fallback === null
        ? 'null'
        : typeof fallback === 'object'
          ? JSON.stringify(fallback).slice(0, 40)
          : typeof fallback === 'string'
            ? `'${fallback}'`
            : String(fallback);

  return {
    field: path,
    type,
    ref,
    required,
    unique,
    indexed,
    enum: enumValues ? [...enumValues] : null,
    default: hasDefault ? defaultValue : null,
    min: options.min ?? null,
    max: options.max ?? null,
    note: '',
  };
}

function collectModels() {
  const out = [];
  const byName = {};
  for (const file of readdirSync(MODELS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort()) {
    const name = file.replace(/\.js$/, '');
    const src = readFileSync(join(MODELS_DIR, file), 'utf8');
    const headComment = (src.match(/^\/\/\s*(.+)$/m) || [])[1]?.trim() || '';

    out.push({
      name,
      file,
      collection: null,
      summary: headComment,
      fields: [],
    });
    byName[name] = out[out.length - 1];
  }
  return { out, byName };
}

/**
 * Introspect the live schemas. Mongoose already parsed the model
 * files; re-parsing them with a regex is how the previous generator
 * lost 185 of 466 fields.
 */
async function introspectModels(entries) {
  const modelsByName = {};
  for (const entry of entries) {
    const url = pathToFileURL(join(MODELS_DIR, entry.file)).href;
    const mod = await import(url);
    const Model = Object.values(mod).find((v) => v && v.schema && v.modelName);
    if (!Model) continue;
    modelsByName[Model.modelName] = Model;
    entry.collection = Model.collection?.collectionName || null;
    entry.fields = Object.entries(Model.schema.paths)
      .filter(([path]) => path !== '__v')
      .map(([path, schemaPath]) => describePath(path, schemaPath));

    // Indexes declared with .index({...}) rather than per-path.
    const declared = [];
    for (const [fields, opts] of Object.entries(Model.schema.indexes?.() ? {} : {})) {
      declared.push({ fields, opts });
    }
    void declared;

    const refs = [...new Set(entry.fields.map((f) => f.ref).filter(Boolean))].sort();
    entry.refs = refs;
    entry.indexedFields = entry.fields.filter((f) => f.indexed).length;
    entry.fieldCount = entry.fields.length;
    if (!entry.summary) {
      entry.summary = `${entry.fieldCount} fields${refs.length ? `, referencing ${refs.join(', ')}` : ''}.`;
    }
  }
  return modelsByName;
}

// ─── Main ─────────────────────────────────────────────────────────

const { out: modelEntries, byName } = collectModels();
models = await introspectModels(modelEntries);

const { routes, unmounted } = collectRoutes();

const mounted = routes.filter((r) => r.mounted);
const banner = `// ─────────────────────────────────────────────────────────────────
//  GENERATED FILE — do not edit by hand.
//
//  node backend/scripts/generateDocsAtlas.mjs
//
//  ${routes.length} route handlers (${mounted.length} mounted, ${routes.length - mounted.length} legacy/unmounted)
//  ${modelEntries.length} Mongoose models, ${modelEntries.reduce((n, m) => n + m.fields.length, 0)} fields
//  Backends: main (${routes.filter((r) => r.backend === 'main' && r.mounted).length} mounted), website (${
  routes.filter((r) => r.backend === 'website').length
})
// ─────────────────────────────────────────────────────────────────

`;

const body =
  banner +
  `export const ATLAS_ROUTES = ${JSON.stringify(routes, null, 2)};\n\n` +
  `export const ATLAS_MODELS = ${JSON.stringify(modelEntries, null, 2)};\n\n` +
  `export const ATLAS_UNMAPPED_FILES = ${JSON.stringify(unmounted, null, 2)};\n`;

writeFileSync(OUT, body);

void byName;
console.log(`wrote ${OUT}`);
console.log(
  `  routes: ${routes.length} (${mounted.length} mounted, ${routes.length - mounted.length} unmounted)`,
);
console.log(`    main: ${routes.filter((r) => r.backend === 'main' && r.mounted).length}`);
console.log(`    website: ${routes.filter((r) => r.backend === 'website').length}`);
console.log(`  models: ${modelEntries.length}`);
console.log(`  fields: ${modelEntries.reduce((sum, m) => sum + m.fields.length, 0)}`);
console.log(`  routes with a purpose comment: ${routes.filter((r) => !r.derived).length}`);
console.log(`  routes with a derived purpose: ${routes.filter((r) => r.derived).length}`);
console.log(`  routes with no purpose at all: ${routes.filter((r) => !r.purpose).length}`);
console.log(`  routes with request body fields: ${routes.filter((r) => r.request.body.length).length}`);
console.log(`  routes with a typed request body: ${routes.filter((r) => r.request.body.some((f) => f.type !== 'any')).length}`);
console.log(`  routes with a response payload: ${routes.filter((r) => r.responses.length).length}`);
console.log(`  routes with declared errors: ${routes.filter((r) => r.errors.length).length}`);
console.log(`  routes reporting an external tool: ${routes.filter((r) => r.tools.some((t) => !['mongo'].includes(t.key))).length}`);
console.log(`  routes with query fields: ${routes.filter((r) => r.request.query.length).length}`);
console.log(`  routes bound to a model: ${routes.filter((r) => r.models.length).length}`);
console.log(`  unmapped route files: ${unmounted.length ? unmounted.join(', ') : 'none'}`);
