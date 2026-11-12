// WCAG contrast for every text token against every surface it is
// actually used on, in all four palettes.
//
// This exists because the site had 102 hardcoded text colours outside
// the two device mocks, and none of them responded to the theme: in
// dark mode `.section-heading h2` rendered at 1.28:1 — a section
// heading you cannot see. A token palette only helps if the tokens are
// honoured and measured, so both are checked here.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');

/** Custom properties from the block that starts at `marker`. */
function palette(marker) {
  const start = css.indexOf(marker);
  expect(start, `missing palette: ${marker}`).toBeGreaterThan(-1);
  const block = css.slice(start, css.indexOf('}', start));
  const vars = {};
  for (const m of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,8})/g)) vars[m[1]] = m[2];
  return vars;
}

function rgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Every palette is applied on top of the one before it — high-contrast
 * only overrides what it changes, and the dark block inherits anything
 * it leaves out. So merge rather than reading each block alone, or the
 * test would report tokens as "missing" when the cascade supplies them.
 */
const ROOT = palette(':root {');
const HIGH_LIGHT = palette("html[data-contrast='high'] {");
const DARK = palette("html[data-theme='dark'] {");
const HIGH_DARK = palette("html[data-theme='dark'][data-contrast='high'] {");

const PALETTES = {
  light: { ...ROOT },
  'light · high contrast': { ...ROOT, ...HIGH_LIGHT },
  dark: { ...ROOT, ...DARK },
  'dark · high contrast': { ...ROOT, ...DARK, ...HIGH_DARK },
};

// Text on the matching surface. Only pairs that actually occur — a
// cross product would fail on combinations no element ever produces.
const PAIRS = [
  ['ink', ['bg', 'surface', 'surface-2', 'surface-3', 'surface-sunken', 'tint', 'tint-2']],
  ['muted-deep', ['bg', 'surface', 'surface-2', 'surface-3', 'surface-sunken', 'tint', 'tint-2']],
  ['muted', ['bg', 'surface', 'surface-2', 'surface-3', 'surface-sunken', 'tint', 'tint-2']],
  ['ink-soft', ['bg', 'surface-2', 'surface-3', 'surface-sunken', 'tint', 'tint-2']],
  ['ink-faint', ['bg', 'surface', 'surface-2']],
  ['purple', ['bg', 'surface', 'tint', 'tint-2']],
  ['purple-dark', ['bg', 'surface', 'surface-2']],
  ['green-ink', ['green']],
  ['amber', ['amber-bg']],
  ['blue', ['blue-bg']],
  ['coral-ink', ['bg', 'surface', 'surface-2']],
  ['danger', ['surface', 'surface-2']],
  ['sidebar-ink', ['sidebar-bg']],
  ['sidebar-text', ['sidebar-bg']],
  ['sidebar-muted', ['sidebar-bg']],
  ['sidebar-faint', ['sidebar-bg']],
  ['sidebar-accent', ['sidebar-bg']],
  ['on-accent', ['accent-fill']],
  // Surfaces the reading layout paints. These were hardcoded to light
  // values, so in dark mode a lilac hero sat on a near-black page and
  // the muted copy on it fell to 2.6:1.
  ['ink', ['hero-bg', 'panel-bg', 'field-bg', 'chip-bg', 'callout-bg', 'callout-warn-bg']],
  ['muted-deep', ['hero-bg', 'panel-bg', 'field-bg', 'callout-bg', 'callout-warn-bg']],
  ['muted', ['hero-bg', 'panel-bg', 'field-bg']],
  ['coral-ink', ['hero-bg']],
  ['green-ink', ['tint-green', 'badge-green-bg']],
  ['blue', ['tint-blue']],
  ['amber', ['tint-amber', 'step-bg']],
  ['purple-dark', ['tint-purple']],
  ['danger', ['tint-danger']],
];

describe.each(Object.entries(PALETTES))('text contrast — %s', (name, vars) => {
  it('resolves every token the text relies on', () => {
    const missing = [];
    for (const [text, surfaces] of PAIRS) {
      if (!vars[text]) missing.push(text);
      for (const surface of surfaces) if (!vars[surface]) missing.push(surface);
    }
    expect([...new Set(missing)]).toEqual([]);
  });

  it('keeps every text/surface pair at AA for body text (4.5:1)', () => {
    const failures = [];
    for (const [text, surfaces] of PAIRS) {
      for (const surface of surfaces) {
        if (!vars[text] || !vars[surface]) continue;
        const r = ratio(vars[text], vars[surface]);
        if (r < 4.5) {
          failures.push(`${text} on ${surface}: ${r.toFixed(2)}:1 (${vars[text]} on ${vars[surface]})`);
        }
      }
    }
    expect(failures).toEqual([]);
  });
});

describe('the stylesheet itself', () => {
  it('paints the reading layout from tokens, not light-mode values', () => {
    // Every panel a reader sees is themed. A hardcoded #eae6fb on the
    // hero is invisible in a dark palette's company even though the
    // text on it still measures fine — the page just looks broken.
    const start = css.indexOf('Device frames — both locked to landscape');
    const end = css.indexOf('The reading layout — article plus a contents rail');
    const outside = css.slice(0, start) + css.slice(end);
    const allowed = new Set([
      // The device mocks keep their own design systems.
      // Dot and accent fills carry no text.
      '#ef9977',
      '#ef9a7b',
      '#9a8ae5',
      '#f4a486',
      '#9fc579',
      '#5f9c33',
      '#6555c1',
      '#5545ac',
      '#1c1a25a8',
      '#231f3380',
      '#fdfcff',
    ]);
    const offenders = [];
    for (const line of outside.split('\n')) {
      const m = /(?:^|\s)background(?:-color)?:\s*(#[0-9a-fA-F]{3,8})/.exec(line);
      if (m && !allowed.has(m[1].toLowerCase())) offenders.push(line.trim());
    }
    expect(offenders).toEqual([]);
  });

  it('has no hardcoded text colour outside the device mocks', () => {
    const start = css.indexOf('Device frames — both locked to landscape');
    const end = css.indexOf('The reading layout — article plus a contents rail');
    const outside = css.slice(0, start) + css.slice(end);
    const offenders = outside
      .split('\n')
      .filter((line) => /(?:^|\s)color:\s*#[0-9a-fA-F]{3,8}/.test(line))
      .map((line) => line.trim());
    // The mocks are faithful renderings of other apps' design systems
    // and deliberately keep their own colours; everything else must
    // follow the theme or it breaks in dark mode.
    expect(offenders).toEqual([]);
  });

  it('uses one token for text on a saturated accent', () => {
    // `#fff` on the purple button is fine in both themes only because
    // it is a token; a bare #fff would be a light-mode assumption.
    expect(css).toMatch(/--on-accent:\s*#ffffff/);
  });
});
