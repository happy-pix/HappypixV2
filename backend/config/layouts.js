// ============================================================
// Layout / print pricing model — the shared price vocabulary between
// CRM, the backend, the booth snapshot and the booth client.
//
// A price is always keyed "<familyId>:<slots>" (e.g. "46:2", "57:3").
// The fallback chain (issue #50) is:
//
//   1. Event-specific prices    (event.layoutPrices)
//   2. Organization defaults    (OrganizationDefaults.layoutPrices)
//   3. Platform suggested price (SUGGESTED_PRICES below)
//
// Keep these family ids in sync with `crm/src/lib/layouts.js`.
// ============================================================

// familyId → { name, sheets, slots, base, printSize }
export const LAYOUT_FAMILIES = [
  { id: '46-23',   name: 'Pocket Polaroid',       sheets: ['4x6'],  slots: [1], base: 20, printSize: '4 × 6' },
  { id: '46-26',   name: 'Classic Duo Strip',     sheets: ['4x6'],  slots: [3, 4], base: 30, printSize: '4 × 6' },
  { id: '68-38',   name: 'Custom Bookmark',       sheets: ['6x8'],  slots: [3, 4], base: 40, printSize: '6 × 8' },
  { id: '46',      name: 'Standard Postcard',     sheets: ['4x6'],  slots: [1, 3, 4], base: 30, printSize: '4 × 6' },
  { id: '810-410', name: 'Panoramic Mini',        sheets: ['8x10'], slots: [3, 4], base: 60, printSize: '8 × 10' },
  { id: '812-412', name: 'Panoramic Wide',        sheets: ['8x12'], slots: [4, 5], base: 70, printSize: '8 × 12' },
  { id: '57',      name: 'Portrait Keep-Safe',    sheets: ['5x7'],  slots: [1, 3], base: 50, printSize: '5 × 7' },
  { id: '57-257',  name: 'Bookmark Strip',        sheets: ['5x7'],  slots: [3, 4], base: 40, printSize: '5 × 7' },
  { id: '68',      name: 'Gala Display',          sheets: ['6x8'],  slots: [1, 3, 4], base: 60, printSize: '6 × 8' },
  { id: '68-26',   name: 'Triple Gala Strip',     sheets: ['6x8'],  slots: [3, 4], base: 50, printSize: '6 × 8' },
  { id: '68-46',   name: 'Double Postcard Cut',   sheets: ['6x8'],  slots: [1, 3, 4], base: 50, printSize: '6 × 8' },
  { id: '810',     name: 'Grand Guestbook Print', sheets: ['8x10'], slots: [1, 4, 6, 9], base: 80, printSize: '8 × 10' },
  { id: '810-210', name: 'Collector Strip',       sheets: ['8x10'], slots: [3, 4, 5], base: 40, printSize: '8 × 10' },
  { id: '810-258', name: 'Wide Strip Cut',        sheets: ['8x10'], slots: [3, 4], base: 35, printSize: '8 × 10' },
  { id: '812',     name: 'Poster Showcase',       sheets: ['8x12'], slots: [1, 6, 8], base: 90, printSize: '8 × 12' },
  { id: '812-68',  name: 'Quad Strip Reel',       sheets: ['8x12'], slots: [3, 4], base: 60, printSize: '8 × 12' },
];

const FAMILY_BY_ID = Object.fromEntries(LAYOUT_FAMILIES.map((f) => [f.id, f]));

export const priceKey = (familyId, slots) => `${familyId}:${slots}`;

/** Platform suggested price for an iteration (base + per-extra-slot bump). */
export function suggestedPrice(familyId, slots) {
  const family = FAMILY_BY_ID[familyId];
  if (!family) return 0;
  const extra = Math.max(0, Number(slots) - 1) * 10;
  return family.base + extra;
}

export function suggestedPriceMap() {
  const out = {};
  for (const family of LAYOUT_FAMILIES) {
    for (const slots of family.slots) out[priceKey(family.id, slots)] = suggestedPrice(family.id, slots);
  }
  return out;
}

/**
 * Layout id format used by CRM/templates: "<familyId>-v<slots>" (portrait)
 * or "<familyId>-h<slots>" (landscape). Returns null when unparseable.
 */
export function parseLayoutId(layoutId) {
  const raw = String(layoutId || '');
  const match = raw.match(/^(.+?)-([vh])(\d+)$/);
  if (!match) return null;
  const [, familyId, orientationCode, slotsText] = match;
  const family = FAMILY_BY_ID[familyId];
  if (!family) return null;
  const slots = Number(slotsText);
  if (!Number.isInteger(slots) || slots < 1) return null;
  return { familyId, slots, orientation: orientationCode === 'h' ? 'landscape' : 'portrait', family };
}

/** Canvas + slots for a layout id, using print-true aspect ratios (issue #95). */
export function layoutGeometry(layoutId) {
  const parsed = parseLayoutId(layoutId) || { familyId: '46', slots: 1, orientation: 'portrait', family: FAMILY_BY_ID['46'] };
  const { family, slots, orientation } = parsed;
  const [cutW, cutH] = (family.sheets[0] || '4x6').split('x').map(Number);
  const dpi = 300;
  const portrait = orientation === 'portrait';
  const width = portrait ? cutW * dpi : cutH * dpi;
  const height = portrait ? cutH * dpi : cutW * dpi;
  return { width, height, orientation, slots, printSize: family.printSize, familyId: family.id };
}

export function layoutMeta(layoutId) {
  const geometry = layoutGeometry(layoutId);
  const family = FAMILY_BY_ID[geometry.familyId];
  return {
    id: layoutId,
    familyId: geometry.familyId,
    name: family ? family.name : 'Layout',
    orientation: geometry.orientation,
    slots: geometry.slots,
    printSize: geometry.printSize,
    canvas: { width: geometry.width, height: geometry.height },
    priceKey: priceKey(geometry.familyId, geometry.slots),
  };
}

/** Validate a CRM-supplied { "familyId:slots": price } map. */
export function validateLayoutPrices(raw, base = {}) {
  if (raw == null) return { ...base };
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    throw Object.assign(new Error('layoutPrices must be an object of "familyId:slots" → price.'), { status: 400, code: 'BAD_LAYOUT_PRICES' });
  }
  const prices = { ...base };
  for (const [key, value] of Object.entries(raw)) {
    const [familyId, slotsText] = String(key).split(':');
    const family = FAMILY_BY_ID[familyId];
    const slots = Number(slotsText);
    if (!family || !family.slots.includes(slots)) {
      throw Object.assign(new Error(`Unknown layout iteration "${key}".`), { status: 400, code: 'BAD_LAYOUT_PRICES' });
    }
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0 || price > 100000) {
      throw Object.assign(new Error(`Price for "${key}" must be between 0 and 100000.`), { status: 400, code: 'BAD_LAYOUT_PRICES' });
    }
    prices[key] = Math.round(price);
  }
  return prices;
}

/**
 * The fallback chain (#45, #50): event prices → org defaults → platform.
 * Always returns the full suggested map, overlaid by org overrides, then
 * overlaid by event overrides, so the booth can price any layout.
 */
export function resolveLayoutPrices({ eventPrices = {}, orgPrices = {} } = {}) {
  const toPlain = (value) => {
    if (!value) return {};
    if (value instanceof Map) return Object.fromEntries(value);
    return { ...value };
  };
  return {
    ...suggestedPriceMap(),
    ...toPlain(orgPrices),
    ...toPlain(eventPrices),
  };
}
