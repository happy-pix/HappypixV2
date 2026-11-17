// ─────────────────────────────────────────────────────────────────
//  Contract analysis for the API atlas.
//
//  The atlas used to report "inferred" shapes: a list of field names
//  scraped out of the handler. That is not a specification — it does
//  not say whether a field is a string or a number, whether it is
//  required, what the default is, or what the response actually
//  contains. This module reads the handler properly and produces a
//  spec per endpoint:
//
//    request.body   [{ field, type, required, default, note }]
//    request.query  [{ field, type, required, default, note }]
//    request.params [{ field, note }]
//    response       { status, fields: [{ field, type, note }] }
//    errors         [{ status, code, message }]
//    tools          [{ name, kind, via }]
//
//  Everything here is derived from source. Where a value genuinely
//  cannot be known (a field passed straight through to a service),
//  the type is reported as `any` rather than guessed at.
// ─────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ─── Lexing helpers ───────────────────────────────────────────────

/**
 * Walk a string, calling `onCode` for characters outside strings and
 * comments. Returns the index of the matching close brace when `open`
 * is a brace, otherwise -1.
 *
 * Doing this by index rather than with a regex matters: these handlers
 * are full of template literals and `/regex/` patterns containing
 * braces, and a naive counter desynchronises on the first one.
 */
function matchBrace(src, openIndex, openChar = '{', closeChar = '}') {
  let depth = 0;
  let mode = 'code';
  for (let i = openIndex; i < src.length; i += 1) {
    const ch = src[i];
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
      if (ch === openChar) depth += 1;
      else if (ch === closeChar) {
        depth -= 1;
        if (depth === 0) return i;
      }
    } else if (mode === 'line') {
      if (ch === '\n') mode = 'code';
    } else if (mode === 'block') {
      if (ch === '*' && src[i + 1] === '/') {
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
  return -1;
}

/** Strip comments and string bodies so a search cannot match prose. */
export function stripNoise(src) {
  let out = '';
  let mode = 'code';
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
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
        out += ' ';
        continue;
      }
      out += ch;
    } else if (mode === 'line') {
      if (ch === '\n') {
        mode = 'code';
        out += '\n';
      }
    } else if (mode === 'block') {
      if (ch === '*' && src[i + 1] === '/') {
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
  return out;
}

// ─── Object literal parsing ───────────────────────────────────────

/**
 * Top-level entries of an object literal, with each key and the text
 * of its value expression.
 *
 *   '{ events, canCreate: a !== b, plan: await x() }'
 *     → [{ key:'events', value:'events', shorthand:true },
 *        { key:'canCreate', value:"a !== b" }, …]
 */
export function objectEntries(body) {
  const start = body.indexOf('{');
  if (start < 0) return [];
  const end = matchBrace(body, start);
  if (end < 0) return [];
  const inner = body.slice(start + 1, end);

  const entries = [];
  let depth = 0;
  let mode = 'code';
  let piece = '';

  const push = (text) => {
    const t = text.trim();
    if (!t) return;
    const colon = t.indexOf(':');
    if (colon > 0 && /^[A-Za-z_$][\w$]*$/.test(t.slice(0, colon).trim())) {
      entries.push({
        key: t.slice(0, colon).trim(),
        value: t.slice(colon + 1).trim(),
        shorthand: false,
      });
      return;
    }
    if (/^[A-Za-z_$][\w$]*$/.test(t)) {
      // `{ events }` — a shorthand property and a spread are different
      // things; a spread carries keys we cannot know statically.
      entries.push({ key: t, value: t, shorthand: true });
    }
  };

  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (mode === 'code') {
      if (ch === '{' || ch === '(' || ch === '[') {
        depth += 1;
        piece += ch;
        continue;
      }
      if (ch === '}' || ch === ')' || ch === ']') {
        depth -= 1;
        piece += ch;
        continue;
      }
      if (ch === ',' && depth === 0) {
        push(piece);
        piece = '';
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') {
        mode = ch;
        piece += ch;
        continue;
      }
      // A spread at depth 0 means unknown keys ride along.
      if (ch === '.' && inner[i + 1] === '.' && depth === 0) {
        push(piece);
        piece = '';
        entries.push({ key: '…', value: '...', spread: true });
        i += 2;
        continue;
      }
      piece += ch;
    } else if (mode === 'line') {
      if (ch === '\n') mode = 'code';
    } else if (mode === 'block') {
      if (ch === '*' && inner[i + 1] === '/') {
        mode = 'code';
        i += 1;
      }
    } else {
      if (ch === '\\') {
        piece += ch + (inner[i + 1] || '');
        i += 1;
        continue;
      }
      if (ch === mode) mode = 'code';
      piece += ch;
    }
  }
  push(piece);
  return entries;
}

// ─── Type inference ───────────────────────────────────────────────

const TYPE_RULES = [
  [/^\[|Array\.isArray|^Array\.from/, 'array'],
  [/\.map\(|\.filter\(|\.slice\(|\.split\(/, 'array'],
  [/^String\(|\.trim\(\)|\.toLowerCase\(\)|\.toUpperCase\(\)|^`/, 'string'],
  [/^Number\(|^parseInt\(|^parseFloat\(|\.toFixed\(/, 'number'],
  [/^(?:await\s+)?[\w.]+\s*(?:\+\s*[\w.'"])?$/, 'any'],
];

/**
 * Best-effort type of a value expression.
 *
 * Order matters. A ternary is checked first and its branches compared,
 * because `a ? b : null` is the common shape for "present or absent" —
 * reading the whole expression as a boolean (which contains `?`) got
 * `downloadId` wrong. Comparisons are only a boolean when the whole
 * expression is a comparison, not when one appears inside it.
 */
export function inferType(expression, modelTypes = {}) {
  const value = String(expression || '').trim();
  if (!value) return 'any';
  if (/^(true|false)$/.test(value)) return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  if (/^'[^']*'$|^"[^"]*"$/.test(value)) return 'string';
  if (/^null$|^undefined$/.test(value)) return 'null';

  // `cond ? a : b` — the type is the type of a, unless b is a value
  // of the same type, in which case they agree.
  const ternary = value.match(/^([\s\S]+?)\?([\s\S]*?):([\s\S]*)$/);
  if (ternary) {
    const [, , whenTrue, whenFalse] = ternary;
    const t = inferType(whenTrue, modelTypes);
    const f = inferType(whenFalse, modelTypes);
    if (f === 'null' || f === 'undefined') return t;
    if (t === 'null' || t === 'undefined') return f;
    if (t === f) return t;
    // One side unknown, the other `any`: report `any` rather than
    // claiming a type the other branch contradicts.
    return 'any';
  }

  if (/^Boolean\(|^!!/.test(value)) return 'boolean';
  // A whole-expression comparison is a boolean.
  if (/^[\w.$[\]]+\s*(?:===?|!==?|>=?|<=?)\s*[\w.$'"\]]+$/.test(value)) return 'boolean';
  if (/^!\s*[\w.$[\]]+$/.test(value)) return 'boolean';
  // `x.length`, counts.
  if (/\.length$|\.count$|\.total$|Count$/.test(value)) return 'number';
  // A bare model instance.
  if (/^(?:Model\.)?(findById|findOne)\(/.test(value)) return 'object';

  for (const [pattern, type] of TYPE_RULES) {
    if (pattern.test(value)) return type;
  }
  // An object literal value.
  if (/^\{/.test(value)) return 'object';
  // `someArray.map(...)` where the array was built earlier as a query.
  const mapped = value.match(/^([\w$]+)\.map\(/);
  if (mapped && modelTypes[mapped[1]]) return modelTypes[mapped[1]];
  const bareName = value.replace(/^\.\.\./, '').trim();
  if (modelTypes[bareName]) return modelTypes[bareName];
  const bare = value.replace(/^\$\{|\}$/g, '').trim();
  if (modelTypes[bare]) return modelTypes[bare];
  // Named identifiers ending in Url/At/Id/Name are usually strings, but
  // guessing here is what made the report wrong before. Say `any`.
  return 'any';
}

// ─── Local call resolution ────────────────────────────────────────

/**
 * Every function in a file, by name, with its body text.
 * Used to follow a handler into the local helpers it calls — the
 * website backend reaches Razorpay through `const gateway = razorpay()`
 * defined at module level, so scanning only the handler body misses it.
 */
export function localFunctions(source) {
  const code = stripNoise(source);
  const out = new Map();
  for (const m of code.matchAll(/(?:function\s+([\w$]+)\s*\(|(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:function\s*)?\()/g)) {
    const name = m[1] || m[2];
    if (!name) continue;
    // Find the body brace after the parameter list.
    let i = m.index + m[0].length;
    let depth = 1;
    for (; i < code.length; i += 1) {
      if (code[i] === '(') depth += 1;
      else if (code[i] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const bodyStart = code.indexOf('{', i);
    if (bodyStart < 0) continue;
    const bodyEnd = matchBrace(code, bodyStart);
    if (bodyEnd < 0) continue;
    out.set(name, code.slice(bodyStart, bodyEnd + 1));
  }
  return out;
}

/**
 * The handler body plus the bodies of every local function it calls,
 * followed two levels deep. This is what makes tool attribution
 * correct for code that wraps a provider in its own factory.
 */
export function withLocalCalls(handlerBody, source, depth = 2) {
  const fns = localFunctions(source);
  const code = stripNoise(handlerBody);
  const seen = new Set();
  let frontier = new Set();

  for (const m of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
    if (fns.has(m[1])) frontier.add(m[1]);
  }

  const bodies = [handlerBody];
  for (let d = 0; d < depth; d += 1) {
    const next = new Set();
    for (const name of frontier) {
      if (seen.has(name)) continue;
      seen.add(name);
      const fnBody = fns.get(name);
      if (!fnBody) continue;
      bodies.push(fnBody);
      for (const m of fnBody.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
        if (fns.has(m[1]) && !seen.has(m[1])) next.add(m[1]);
      }
    }
    frontier = next;
    if (!frontier.size) break;
  }
  return bodies.join('\n');
}

// ─── Request field specs ──────────────────────────────────────────

/** Every `if (!x) throw …` guard, as { field, code, message }. */
function requiredGuards(code) {
  const guards = [];
  const patterns = [
    /if\s*\(\s*!\s*(?:req\.body\.)?([\w$.]+)\s*\)\s*(?:throw\s+)?(?:new\s+HttpError\([^)]*\)|badRequest\(([^)]*)\)|return\s+\w+\(res,[^)]*\))/g,
    /if\s*\(\s*(?:req\.body\.)?([\w$.]+)\s*===?\s*(?:undefined|null|'')\s*\)\s*(?:throw\s+)?(?:badRequest\(([^)]*)\)|return)/g,
    /if\s*\(\s*!\s*(?:req\.body\.)?([\w$.]+)\s*(?:&&|\|\|)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(code))) {
      const field = m[1].replace(/^req\.(body|query)\./, '').split('.')[0];
      if (!/^[A-Za-z_$][\w$]*$/.test(field)) continue;
      const args = m[2] || '';
      const message = (args.match(/'([^']+)'|"([^"]+)"/) || [])[1] || (args.match(/'([^']+)'|"([^"]+)"/) || [])[2] || null;
      const codeMatch = args.match(/,\s*'([A-Z_0-9]+)'/);
      guards.push({ field, message, code: codeMatch ? codeMatch[1] : null });
    }
  }
  return guards;
}

/** The type a field is coerced to, and any literal default. */
function coercionFor(code, field) {
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    // String(x || 'fallback')
    [new RegExp(`String\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}\\s*\\|\\|\\s*'([^']*)'\\s*\\)`), 'string', 1],
    [new RegExp(`String\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}\\s*\\|\\|\\s*"([^"]*)"\\s*\\)`), 'string', 1],
    [new RegExp(`String\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}[^)]*\\)`), 'string', 0],
    [new RegExp(`Number\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}[^)]*\\)`), 'number', 0],
    [new RegExp(`parseInt\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}[^)]*\\)`), 'number', 0],
    [new RegExp(`parseFloat\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}[^)]*\\)`), 'number', 0],
    [new RegExp(`Boolean\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}`), 'boolean', 0],
    [new RegExp(`Array\\.isArray\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}`), 'array', 0],
    [new RegExp(`${esc}\\s*(?:!==?|===?)\\s*(?:true|false)`), 'boolean', 0],
    [new RegExp(`new\\s+Date\\(\\s*(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}`), 'date', 0],
    [new RegExp(`typeof\\s+(?:(?:req\\.)?(?:body|payload|data|input|patch)\\.)?${esc}\\s*===?\\s*'(string|number|boolean)'`), 'typeof', 1],
  ];
  for (const [re, type, group] of patterns) {
    const m = code.match(re);
    if (!m) continue;
    const actual = type === 'typeof' ? m[group] : type;
    return { type: actual, fallback: group ? m[group] : null };
  }
  return { type: 'any', fallback: null };
}

/** Defaults written as `x || 20` / `x ?? 20`. */
function defaultFor(code, field) {
  const esc = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = code.match(
    new RegExp(`(?:req\\.(?:body|query)\\.)?${esc}\\s*(?:\\|\\||\\?\\?)\\s*('([^']*)'|"([^"]*)"|(\\d+(?:\\.\\d+)?)|(true|false))`),
  );
  if (!m) return null;
  if (m[2] !== undefined) return `'${m[2]}'`;
  if (m[3] !== undefined) return `"${m[3]}"`;
  if (m[4] !== undefined) return m[4];
  return m[5];
}

const FIELD_CAP = 24;

/** Build the request spec for a handler body. */
export function requestSpec(body, path) {
  const code = stripNoise(body);

  // Names bound to the payload, so `body.email` and `email` both count.
  const bindings = new Map(); // alias → root ('body' | 'query')
  for (const m of code.matchAll(/(?:const|let|var)\s+(\w+)\s*=\s*req\.(body|query|params)\b(?![\w.[])/g)) {
    bindings.set(m[1], m[2]);
  }
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]+)\}\s*=\s*req\.(body|query)\b/g)) {
    for (const part of m[1].split(',')) {
      const name = part.split(':').pop().split('=')[0].trim();
      if (/^\w+$/.test(name)) bindings.set(name, m[2]);
    }
  }

  const bodyFields = new Map();
  const queryFields = new Map();

  const record = (root, field) => {
    if (!/^[A-Za-z_$][\w$]*$/.test(field)) return;
    const target = root === 'query' ? queryFields : bodyFields;
    if (target.has(field)) return;
    const { type, fallback } = coercionFor(code, field);
    const def = fallback ?? defaultFor(code, field);
    target.set(field, { field, type, default: def ?? null });
  };

  // Direct reads: req.body.x / req.query.x
  for (const m of code.matchAll(/req\.(body|query)((?:\??\.[\w$]+)+)/g)) {
    const pathParts = m[2].replace(/\?\./g, '.').replace(/^\./, '').split('.');
    if (!pathParts[0]) continue;
    record(m[1], pathParts[0]);
  }
  // Reads through an alias: body.x / query.x
  for (const [alias, root] of bindings) {
    if (root === 'params') continue;
    const re = new RegExp(`\\b${alias}\\s*\\??\\.([\\w$]+)`, 'g');
    let m;
    while ((m = re.exec(code))) record(root, m[1]);
  }

  // Guards are matched against the RAW body: stripNoise blanks string
  // literals to spaces (so braces inside them cannot confuse the
  // parser), which would also destroy the message and error code we
  // want to show the reader.
  const guards = requiredGuards(body);
  const requiredFor = (field) => guards.find((g) => g.field === field) || null;

  const finish = (map) =>
    [...map.values()]
      .slice(0, FIELD_CAP)
      .map((entry) => {
        const guard = requiredFor(entry.field);
        return {
          field: entry.field,
          type: entry.type,
          required: Boolean(guard),
          default: entry.default,
          note: guard?.message || null,
        };
      })
      .sort((a, b) => Number(b.required) - Number(a.required) || a.field.localeCompare(b.field));

  const params = [...path.matchAll(/:(\w+)/g)].map((m) => ({
    field: m[1],
    note: `Path parameter from ${path}.`,
  }));

  return { body: finish(bodyFields), query: finish(queryFields), params };
}

// ─── Local helper expansion ───────────────────────────────────────

/**
 * Handlers often answer through a local helper: `res.json(stateEnvelope(
 * state, { changed: false }))`. The interesting fields are split between
 * the helper's own literal and the caller's argument, so a reader that
 * only looks at the call site sees one key and misses the envelope.
 *
 * This finds the helper in the same file and returns the union of its
 * literal keys and the caller's.
 */
export function expandHelperCalls(body, fileSource) {
  const extra = [];
  for (const m of body.matchAll(/\b([a-z][\w]*(?:Envelope|View|Response|Payload|Result|Body|Dto|DTO))\(/gi)) {
    const name = m[1];
    if (!fileSource) continue;
    const def = fileSource.match(new RegExp(`function\\s+${name}\\s*\\(([^)]*)\\)\\s*\\{`));
    if (!def) continue;
    // Anchor on the end of the match: the parameters may themselves
    // contain a brace (`extra = {}`), and searching from the start of
    // the match lands on that one instead of the body.
    const defStart = def.index + def[0].length - 1;
    const defEnd = matchBrace(fileSource, defStart);
    if (defEnd < 0) continue;
    const helperBody = fileSource.slice(defStart, defEnd);
    // The helper's own return literal.
    const returned = [...helperBody.matchAll(/return\s*\{/g)];
    for (const r of returned) {
      const braceAt = helperBody.indexOf('{', r.index);
      const close = matchBrace(helperBody, braceAt);
      if (close < 0) continue;
      for (const entry of objectEntries(helperBody.slice(braceAt, close + 1))) {
        extra.push({ ...entry, fromHelper: name });
      }
    }
    // A spread of the caller's argument (`...extra`) means the caller's
    // object contributes too — it is already picked up by the normal
    // path, so nothing to do here beyond noting it.
  }
  return extra;
}

// ─── Fields read inside another module ────────────────────────────

/**
 * Handlers often pass the whole body to a service:
 *
 *     const patch = eventPatch(req.body, { organization });
 *
 * The fields belong to `services/eventService.js`, not to the route
 * file, so scanning the handler alone reports an empty request body for
 * a route that requires `name`. This follows that one hop.
 */
export function moduleFieldMap(backendRoot) {
  const map = new Map();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        walk(full);
        continue;
      }
      if (!name.endsWith('.js')) continue;
      const rel = full.slice(backendRoot.length + 1).replace(/\\/g, '/');
      map.set(rel, fieldsReadInModule(readFileSync(full, 'utf8')));
    }
  };
  walk(join(backendRoot, 'services'));
  walk(join(backendRoot, 'utils'));
  return map;
}

/** Body fields a module reads directly out of its `body` parameter. */
export function fieldsReadInModule(source) {
  const code = stripNoise(source);

  // The name the module gives the payload: `eventPatch(body = {}, …)`.
  const names = new Set();
  for (const m of source.matchAll(/function\s+[\w$]+\s*\(([^)]*)\)/g)) {
    for (const param of m[1].split(',')) {
      const name = param.split('=')[0].trim().replace(/[{}[\]]/g, '').trim();
      if (/^(body|payload|data|input|patch)$/.test(name)) names.add(name);
    }
  }
  for (const m of source.matchAll(/\(([^)]*)\)\s*=>/g)) {
    for (const param of m[1].split(',')) {
      const name = param.split('=')[0].trim().replace(/[{}[\]]/g, '').trim();
      if (/^(body|payload|data|input|patch)$/.test(name)) names.add(name);
    }
  }
  if (!names.size) return new Map();

  const fields = new Map();
  for (const name of names) {
    const re = new RegExp(`\\b${name}\\s*\\??\\.([A-Za-z_$][\\w$]*)`, 'g');
    let m;
    while ((m = re.exec(code))) {
      const field = m[1];
      if (['length', 'toString', 'trim', 'map', 'filter', 'includes', 'push'].includes(field)) continue;
      if (fields.has(field)) continue;
      fields.set(field, {
        field,
        // Reuse the coercion rules the direct path uses: the module
        // writes `String(body.name)`, `Array.isArray(body.tags)` and so
        // on, and those phrases are just as convincing here.
        type: coercionFor(code, field).type,
        required: false,
        default: defaultFor(source, field),
        note: null,
      });
    }
  }

  // A field the module refuses to proceed without, or refuses when
  // malformed — either way the message tells the reader what it wants.
  for (const [field, entry] of fields) {
    const guard = new RegExp(
      `if\\s*\\(\\s*!\\s*${field}\\b[^)]*\\)\\s*[^{]*?\\{[^}]*?'([^']+)'`,
    ).exec(source);
    if (guard) entry.note = guard[1];
  }

  return fields;
}

/** The assignment that gives a field its type, e.g. `String(body.name)`. */
function fieldExpression(code, param, field) {
  const m = new RegExp(`(?:const|let|var)?\\s*[\\w$]*\\s*=?\\s*([^;\\n]{0,60}?\\b${param}\\.${field}\\b[^;\\n]{0,20})`).exec(code);
  return m ? m[1] : `${param}.${field}`;
}

/**
 * Fields contributed by the service modules this handler hands the body
 * to. Only used when the handler itself reads no body fields — a route
 * that does its own parsing is already described correctly.
 */
export function serviceBodyFields(handlerBody, fileSource, moduleFields) {
  const code = stripNoise(handlerBody);
  const found = [];

  const imports = new Map(); // local name → module path
  // The RAW file: stripNoise blanks string literals, and the module
  // path is a string literal.
  for (const m of fileSource.matchAll(
    /import\s+([\w{},*\s]+?)\s+from\s+'\.\.[\w@/.-]*?([\w.-]+)'/g,
  )) {
    const target = `/${m[2].replace(/\.js$/, '')}`;
    const clause = m[1];
    const def = clause.match(/^\s*([A-Za-z_$][\w$]*)\s*(?:,|$)/);
    if (def && !clause.trim().startsWith('{')) imports.set(def[1], target);
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.split(' as ').pop().trim();
        if (name) imports.set(name, target);
      }
    }
  }

  // Calls that hand the whole payload to an imported function, either
  // positionally or inside an options object.
  const handed = new Set();
  for (const m of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(\s*(?:req\.)?body\b/g)) handed.add(m[1]);
  for (const m of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(\s*\{[^}]{0,80}?\bbody\b/g)) handed.add(m[1]);

  for (const name of handed) {
    const target = imports.get(name);
    if (!target) continue;
    const tail = target;
    for (const [rel, fields] of moduleFields) {
      // Imports are written relative to the route file, so match on the
      // module's own path rather than the relative prefix.
      if (!rel.endsWith(`${tail}.js`)) continue;
      for (const entry of fields.values()) {
        if (!found.some((existing) => existing.field === entry.field)) found.push({ ...entry });
      }
    }
  }
  return found;
}

// ─── Response spec ────────────────────────────────────────────────

/**
 * Every response the handler can produce: the success payload's
 * top-level fields with inferred types, plus the error responses.
 */
export function responseSpec(body, { fileSource = null, modelTypes = {} } = {}) {
  const payloads = [];

  const collect = (objText, status) => {
    const entries = objectEntries(objText);
    if (!entries.length) return;
    const fields = entries.map((entry) => {
      if (entry.spread) {
        return { field: '…', type: 'unknown', note: 'Additional keys spread from another object.' };
      }
      const type = inferType(entry.value, modelTypes);
      return {
        field: entry.key,
        type,
        note: null,
      };
    });
    // An error envelope is not the route's success contract — it is
    // already recorded in `errors`. `{ error, code }` reaching the
    // reader as "the response" is worse than saying nothing.
    const errorOnly = entries.every((entry) => ['error', 'code', 'message', 'success'].includes(entry.key));
    const hasError = entries.some((entry) => entry.key === 'error');
    if ((errorOnly || hasError) && status >= 400) return;

    // The same object can be returned from two branches; report it once.
    // Same status and same keys is the same answer reached two ways;
    // a genuinely different branch (free vs paid checkout) keeps its
    // own entry.
    const signature = `${status}|${fields.map((field) => field.field).join(',')}`;
    if (payloads.some((payload) => payload.signature === signature)) return;
    payloads.push({ status, fields, signature });
  };

  // Three shapes to handle here:
  //   res.json({ … })
  //   res.status(201).json({ … })
  //   res.json(stateEnvelope(ACTIVE, { … }))   ← the envelope carries
  //                                              the fields, the call
  //                                              site is the argument
  //   ok(res, { … })                            ← website backend
  const callSites = [
    // `res.json(` and `res.status(201).json(` are the same call with a
    // different status word in front of it — one pattern, one prefix.
    ...body.matchAll(/res\s*\.\s*(?:status\(\s*(\d{3})\s*\)\s*\.\s*)?json\(/g),
    ...body.matchAll(/\bok\(\s*res\s*,\s*/g),
  ];

  for (const m of callSites) {
    const status = m[1] ? Number(m[1]) : 200;
    const afterParen = m.index + m[0].length;
    const rest = body.slice(afterParen);

    if (rest.trimStart().startsWith('{')) {
      const braceAt = body.indexOf('{', afterParen);
      const close = matchBrace(body, braceAt);
      if (close >= 0) collect(body.slice(braceAt, close + 1), status);
      continue;
    }

    // A helper call: take the object argument, which is what the
    // caller contributes, and let expandHelperCalls add the rest.
    const argBrace = rest.indexOf('{');
    if (argBrace < 0) continue;
    if (rest.slice(0, argBrace).includes(');')) continue; // different call
    const braceAt = afterParen + argBrace;
    const close = matchBrace(body, braceAt);
    if (close >= 0) collect(body.slice(braceAt, close + 1), status);
  }

  // Fields contributed by a local envelope helper.
  const helperEntries = expandHelperCalls(body, fileSource);
  if (helperEntries.length && payloads.length) {
    for (const payload of payloads) {
      for (const entry of helperEntries) {
        if (entry.spread || payload.fields.some((f) => f.field === entry.key)) continue;
        payload.fields.push({ field: entry.key, type: inferType(entry.value), note: `From ${entry.fromHelper}.` });
      }
    }
  }

  // Branches that differ by a couple of flags (idempotent re-submits,
  // an `extra` bag) describe one contract, not three. Collapse those
  // into the union so the reader sees one body. Branches that differ
  // substantially — a free activation versus a paid order — stay apart,
  // because merging them would invent a body that never exists.
  const merged = [];
  for (const payload of payloads) {
    const twin = merged.find((candidate) => {
      if (candidate.status !== payload.status) return false;
      const a = new Set(candidate.fields.map((field) => field.field));
      const b = new Set(payload.fields.map((field) => field.field));
      const diff = [...a].filter((key) => !b.has(key)).length + [...b].filter((key) => !a.has(key)).length;
      return diff <= 4;
    });
    if (!twin) {
      merged.push(payload);
      continue;
    }
    for (const field of payload.fields) {
      if (!twin.fields.some((existing) => existing.field === field.field)) twin.fields.push(field);
    }
  }
  payloads.length = 0;
  payloads.push(...merged);

  // Success first: `responses[0]` is what the reader sees as "the
  // response body", so it must never be an error branch.
  payloads.sort((a, b) => Number(b.status < 400) - Number(a.status < 400) || a.status - b.status);
  for (const payload of payloads) delete payload.signature;

  const statuses = [...new Set(payloads.map((p) => p.status))].sort();
  const errors = [];
  for (const m of body.matchAll(/(?:throw\s+)?(?:badRequest|unauthorized|forbidden|notFound|conflict)\(\s*'([^']*)'(?:\s*,\s*'([A-Z_0-9]+)')?/g)) {
    errors.push({ message: m[1], code: m[2] || null });
  }
  for (const m of body.matchAll(/res\.status\((\d{3})\)\.json\(\s*\{\s*(?:error|message):/g)) {
    errors.push({ status: Number(m[1]), message: null, code: null });
  }

  return { payloads, statuses, errors };
}

// ─── External tools ───────────────────────────────────────────────

/**
 * The registry of outside services the code talks to. `kind` is what
 * the reader needs to know: is this where photos live, where money
 * moves, or what generates the artwork.
 */
export const TOOLS = {
  cloudinary: { name: 'Cloudinary', kind: 'media', note: 'Image upload, transformation and signed delivery.' },
  s3: { name: 'AWS S3', kind: 'media', note: 'Object storage for generated assets.' },
  razorpay: { name: 'Razorpay', kind: 'payments', note: 'Order creation and signature verification.' },
  cashfree: { name: 'Cashfree', kind: 'payments', note: 'Alternative gateway, chosen per event.' },
  sendgrid: { name: 'SendGrid', kind: 'email', note: 'Transactional email.' },
  twilio: { name: 'Twilio', kind: 'messaging', note: 'WhatsApp/SMS delivery.' },
  groq: { name: 'Groq', kind: 'ai', note: 'openai/gpt-oss-120b — prompt classification and template planning.' },
  together: { name: 'Together AI', kind: 'ai', note: 'black-forest-labs/FLUX.2-pro — image generation.' },
  xai: { name: 'xAI', kind: 'ai', note: 'grok-imagine-image-2.0 — image generation.' },
  mongo: { name: 'MongoDB Atlas', kind: 'data', note: 'Operational persistence.' },
  sharp: { name: 'sharp', kind: 'local', note: 'In-process image resizing and background removal — no network call.' },
};

/** Marker → tool key. Ordered: the first match wins. */
const MARKERS = [
  [/from\s+'cloudinary'|cloudinary\.uploader|uploadToCloudinary|uploadToS3|signedPhotoUrl|signedUrlFor|photoUrlService/, 'cloudinary'],
  [/from\s+'[^']*utils\/s3\.js'|uploadToS3|aws-sdk/, 's3'],
  [/from\s+'razorpay'|new\s+Razorpay|Razorpay\(/, 'razorpay'],
  // A bare `Cashfree` also matches field names like
  // `hasCashfreeSecretKey`, which is configuration, not a call. Anchor
  // on the package or the client constructor.
  [/from\s+'cashfree-pg'|new\s+Cashfree|cashfree-pg/, 'cashfree'],
  [/from\s+'@sendgrid\/mail'|sgMail/, 'sendgrid'],
  [/from\s+'twilio'|twilio\(/, 'twilio'],
  [/api\.groq\.com|GROQ_API_KEY/, 'groq'],
  [/api\.together\.xyz/, 'together'],
  [/api\.x\.ai/, 'xai'],
  [/from\s+'sharp'|sharp\(/, 'sharp'],
  [/from\s+'mongoose'|\.find\(|\.findOne\(/, 'mongo'],
];

/** Which tools a single file references, ignoring comments. */
export function toolsInSource(source) {
  const code = stripNoise(source);
  const found = new Set();
  for (const [re, key] of MARKERS) {
    if (re.test(code)) found.add(key);
  }
  return found;
}

/**
 * Map every service module to the tools it reaches. Services are
 * imported by route files, so a route's tools are its own markers plus
 * those of every service it imports.
 */
export function serviceToolMap(servicesDir) {
  const map = new Map();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!name.endsWith('.js')) continue;
      const rel = full.slice(servicesDir.length + 1);
      map.set(rel, toolsInSource(readFileSync(full, 'utf8')));
    }
  };
  walk(servicesDir);
  return map;
}

/**
 * Tools a single HANDLER reaches.
 *
 * Attributing a file's tools to every route in it is wrong: `crm/org.js`
 * imports the payment service for its checkout routes and the photo
 * service for its gallery routes, so a file-level answer claimed
 * Razorpay for all 55 handlers. Services count only when the handler
 * actually calls one of their exports, and provider markers count only
 * when they appear in the handler's own body.
 */
export function toolsForHandler(handlerBody, fileSource, serviceTools, serviceExports) {
  // Includes the local helpers this handler calls — a provider is often
  // reached through a module-level factory rather than inline.
  const expanded = withLocalCalls(handlerBody, fileSource);
  const found = toolsInSource(expanded);
  const code = stripNoise(expanded);

  // Which service modules this file imports, and under what names.
  const imported = [];
  // The RAW file: stripNoise blanks string literals, and an import path
  // is a string literal — matching on the stripped text silently lost
  // every service path.
  for (const m of fileSource.matchAll(
    // Service modules, AND the media utils: a route that imports
    // `utils/cloudinary.js` is talking to Cloudinary just as surely as
    // one that imports the photo service.
    /import\s+([\w{},*\s]+?)\s+from\s+'([^']*(?:services|utils)\/([^']+))'/g,
  )) {
    const clause = m[1];
    const rel = m[3];
    const localNames = [];
    // default import: `import X from …`
    const def = clause.match(/^\s*([A-Za-z_$][\w$]*)\s*(?:,|$)/);
    if (def && !clause.trim().startsWith('{')) localNames.push(def[1]);
    // named imports: `import { a, b as c } from …`
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.split(' as ').pop().trim();
        if (name) localNames.push(name);
      }
    }
    imported.push({ rel, localNames });
  }

  for (const { rel, localNames } of imported) {
    const exportsOfService = serviceExports.get(rel) || [];
    // The import clause can carry a brace, an asterisk or a comma left
    // over from the regex; only real identifiers can be called.
    const callable = [...localNames, ...exportsOfService].filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
    const callsSomething = callable.some((name) => new RegExp(`\\b${name}\\s*\\(`).test(code));
    if (!callsSomething) continue;
    for (const key of serviceTools.get(rel) || []) found.add(key);
  }
  return [...found];
}

/** Exported names in one module. */
export function exportsInFile(full) {
  const src = stripNoise(readFileSync(full, 'utf8'));
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?function\s+([\w$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s+(?:const|let)\s+([\w$]+)\s*=/g)) names.add(m[1]);
  // `export { a, b }` re-exports
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const name = part.split(' as ').pop().trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

/** Exported function names per service module. */
// Media utility modules, mapped to the provider they front. These live
// in utils/ rather than services/ but deserve the same attribution.
const UTIL_TOOLS = new Map([
  ['cloudinary.js', new Set(['cloudinary'])],
  ['s3.js', new Set(['s3'])],
]);

export function serviceToolMapWithUtils(backendRoot) {
  const map = serviceToolMap(join(backendRoot, 'services'));
  for (const [key, tools] of UTIL_TOOLS) map.set(key, tools);
  return map;
}

export function serviceExportMap(servicesDir) {
  const map = new Map();
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!name.endsWith('.js')) continue;
      const rel = full.slice(servicesDir.length + 1);
      map.set(rel, exportsInFile(full));
    }
  };
  walk(servicesDir);
  return map;
}
