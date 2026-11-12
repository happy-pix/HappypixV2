// The booth and CRM mocks are fixed 16:9 frames with `overflow: hidden`.
// If anything inside them sizes itself against the browser window
// (vw/vh) instead of the frame, it grows while the frame does not, and
// the overflow is clipped — which is exactly what shipped and had to be
// reported by eye. There is no browser in CI here, so this guards the
// invariant in the stylesheet itself.
//
// The mock region runs from the device-frame comment to the end of the
// mock rules. Size containment is inline-size on the frame, so lengths
// must be in cqw (or absolute units), never vw/vh.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');

/** The portion of the stylesheet that styles the two mocks. */
function mockRegion() {
  const start = css.indexOf('Device frames — both locked to landscape');
  // The mocks end where the reading layout begins; everything after
  // that (toc, palette, reading row) is app chrome and legitimately
  // sizes against the window.
  const end = css.indexOf('The reading layout — article plus a contents rail');
  expect(start).toBeGreaterThan(0);
  expect(end).toBeGreaterThan(start);
  return css.slice(start, end);
}

describe('the booth and CRM mocks', () => {
  it('declare themselves as inline-size containers', () => {
    const region = mockRegion();
    expect(region).toMatch(/container-type:\s*inline-size/);
  });

  it('never size anything against the browser window', () => {
    const region = mockRegion();
    // Strip comments so the explanatory prose cannot trip the check.
    const withoutComments = region.replace(/\/\*[\s\S]*?\*\//g, '');
    const offenders = withoutComments
      .split('\n')
      .filter((line) => /\d(vw|vh)\b/.test(line))
      .map((line) => line.trim());
    expect(offenders).toEqual([]);
  });

  it('express the 16:9 frame height in width terms', () => {
    const region = mockRegion();
    // The frame is 16/9, so a vh-authored length becomes 0.5625 × cqw.
    // Nothing may depend on container *height* being resolvable.
    expect(region).not.toMatch(/1cqh/);
  });

  it('keep both frames locked to landscape', () => {
    const ratioOf = (selector) => {
      const match = css.match(new RegExp(`\\.${selector}\\s*\\{[^}]*aspect-ratio:\\s*(\\d+)\\s*/\\s*(\\d+)`));
      expect(match, `${selector} has no aspect-ratio`).toBeTruthy();
      return [Number(match[1]), Number(match[2])];
    };
    for (const selector of ['device-booth', 'device-crm']) {
      const [w, h] = ratioOf(selector);
      expect(w, `${selector} must be wider than tall`).toBeGreaterThan(h);
    }
  });

  it('never scroll the booth, and never scroll sideways anywhere', () => {
    // The booth is the screen guests touch: nothing may need scrolling
    // there, which is what the 16/10 frame buys. The CRM is a desktop
    // app and is allowed to scroll vertically inside its frame — but a
    // horizontal scrollbar is never acceptable in either.
    const booth = css.match(/\.device-booth\s*\{([^}]*)\}/)?.[1] || '';
    expect(booth).not.toMatch(/overflow(-y)?:\s*(auto|scroll)/);

    const region = mockRegion();
    expect(region).not.toMatch(/overflow-x:\s*(auto|scroll)/);
    const frame = css.match(/\.device\s*\{([^}]*)\}/)?.[1] || '';
    expect(frame).not.toMatch(/overflow:\s*(auto|scroll)/);
  });

  it('lets the CRM scroll without reserving a gutter', () => {
    // `scroll` draws a permanent scrollbar track even when the content
    // fits, which showed up as a stripe down the side of the CRM.
    const crm = css.match(/\.device-crm\s*\{([^}]*)\}/)?.[1] || '';
    expect(crm).not.toMatch(/overflow-y:\s*scroll\b/);
  });
});
