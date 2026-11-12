// ─────────────────────────────────────────────────────────────────
//  Full-text search over every public page, every walkthrough step,
//  every FAQ answer and every hardware model.
//
//  Pure functions, no React, no DOM — covered by
//  src/lib/__tests__/search.test.js.
// ─────────────────────────────────────────────────────────────────

const STOP = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'do',
  'does',
  'for',
  'from',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'its',
  'my',
  'of',
  'on',
  'or',
  'so',
  'that',
  'the',
  'to',
  'up',
  'we',
  'what',
  'when',
  'which',
  'will',
  'with',
  'you',
  'your',
]);

export function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9×·\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOP.has(word));
}

/** One searchable row. */
function entry({ pageId, sectionId = null, kind, title, context, body = '' }) {
  const haystack = `${title} ${title} ${context} ${body}`.toLowerCase();
  return { pageId, sectionId, kind, title, context, haystack };
}

/**
 * Build the index from the content modules.
 * `memberPages` is only passed once the backend has authorised the
 * visitor, so nothing private is ever in the index for a client.
 */
export function buildSearchIndex({
  publicPages = [],
  boothSteps = [],
  crmSteps = [],
  faq = [],
  hardware = [],
  setup = [],
  memberPages = [],
}) {
  const rows = [];

  for (const page of publicPages) {
    rows.push(
      entry({
        pageId: page.id,
        kind: 'page',
        title: page.title,
        context: page.group,
        body: page.description,
      }),
    );

    for (const section of page.sections || []) {
      rows.push(
        entry({
          pageId: page.id,
          sectionId: slug(section.title),
          kind: 'section',
          title: section.title,
          context: page.title,
          body: [
            section.text,
            ...(section.bullets || []),
            ...(section.cards || []).flatMap((card) => [card.title, card.text]),
          ]
            .filter(Boolean)
            .join(' '),
        }),
      );
    }
  }

  for (const step of boothSteps) {
    rows.push(
      entry({
        pageId: 'booth-101',
        sectionId: `step-${step.id}`,
        kind: 'step',
        title: step.title,
        context: `Booth screen · ${step.screen}`,
        body: [step.what, step.guests, step.you, step.tip].filter(Boolean).join(' '),
      }),
    );
  }

  for (const step of crmSteps) {
    rows.push(
      entry({
        pageId: 'crm-101',
        sectionId: `step-${step.id}`,
        kind: 'step',
        title: step.title,
        context: `CRM · ${step.nav || 'Sign in'}`,
        body: [step.what, step.you, step.tip].filter(Boolean).join(' '),
      }),
    );
  }

  for (const item of faq) {
    rows.push(
      entry({
        pageId: 'happypix-101',
        sectionId: 'faq',
        kind: 'faq',
        title: item.q,
        context: 'Frequent question',
        body: item.a,
      }),
    );
  }

  for (const item of hardware) {
    rows.push(
      entry({
        pageId: 'make-it-run',
        sectionId: 'compatibility',
        kind: item.kind,
        title: item.title,
        context: 'Hardware',
        body: item.text,
      }),
    );
  }

  for (const item of setup) {
    rows.push(
      entry({
        pageId: 'make-it-run',
        sectionId: item.id,
        kind: 'setup',
        title: item.title,
        context: 'Setup guide',
        body: item.text,
      }),
    );
  }

  for (const page of memberPages) {
    rows.push(
      entry({
        pageId: page.id,
        kind: 'member',
        title: page.title,
        context: page.description || 'Platform note',
        body: page.overview || page.planningIntro || '',
      }),
    );
  }

  return rows;
}

function score(row, terms) {
  let total = 0;
  for (const term of terms) {
    if (row.title.toLowerCase().includes(term)) total += 6;
    if (row.context.toLowerCase().includes(term)) total += 3;
    if (row.haystack.includes(term)) total += 1;
  }
  return total;
}

/** Ranked matches. `limit` keeps the palette readable. */
export function searchIndex(index, query, { limit = 12 } = {}) {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const hits = [];
  for (const row of index) {
    const matched = terms.filter((term) => row.haystack.includes(term));
    if (matched.length === 0) continue;
    // Every term must appear somewhere, so "nikon d5600" does not
    // return every row that merely mentions a camera.
    if (matched.length < terms.length) continue;
    hits.push({ row, score: score(row, terms) + matched.length });
  }

  hits.sort((a, b) => b.score - a.score || a.row.title.localeCompare(b.row.title));
  return hits.slice(0, limit).map(({ row, score: s }) => ({ ...row, score: s }));
}

/** Short excerpt with the first matching term wrapped for highlighting. */
export function snippet(text, query, radius = 70) {
  const source = String(text || '');
  const terms = tokenize(query);
  const lower = source.toLowerCase();
  let at = -1;
  let term = '';
  for (const candidate of terms) {
    const found = lower.indexOf(candidate);
    if (found !== -1 && (at === -1 || found < at)) {
      at = found;
      term = candidate;
    }
  }
  if (at === -1) return source.slice(0, radius * 2).trim();
  const start = Math.max(0, at - radius);
  const end = Math.min(source.length, at + term.length + radius);
  const before = start > 0 ? '…' : '';
  const after = end < source.length ? '…' : '';
  return `${before}${source.slice(start, end).trim()}${after}`;
}

/** Split text around matches so the palette can bold them. */
export function highlight(text, query) {
  const terms = [...new Set(tokenize(query))].sort((a, b) => b.length - a.length);
  if (terms.length === 0) return [{ text, mark: false }];
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'ig');
  return String(text)
    .split(pattern)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, mark: terms.some((term) => term === part.toLowerCase()) }));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
