// Reading preferences: theme, contrast and text size.
//
// These are the controls a client is most likely to use in front of
// an audience — a dark room, a projector, a reader who needs larger
// type — so each one has to survive a reload and a private window.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CONTRASTS,
  TEXT_SIZES,
  THEMES,
  apply,
  cycleTextSize,
  getPrefs,
  setPref,
  subscribe,
  toggleContrast,
  toggleTheme,
} from '../prefs.js';

function rootAttrs() {
  return document.documentElement.dataset;
}

describe('reading preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    setPref('theme', 'light');
    setPref('contrast', 'normal');
    setPref('text', 'md');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts on the safe, accessible defaults', () => {
    const prefs = getPrefs();
    expect(THEMES).toEqual(['light', 'dark']);
    expect(CONTRASTS).toEqual(['normal', 'high']);
    expect(TEXT_SIZES.map((size) => size.id)).toEqual(['sm', 'md', 'lg']);
    expect(prefs).toEqual({ theme: 'light', contrast: 'normal', text: 'md' });
  });

  it('puts every preference on <html> as a data attribute', () => {
    setPref('theme', 'dark');
    setPref('contrast', 'high');
    setPref('text', 'lg');

    expect(rootAttrs().theme).toBe('dark');
    expect(rootAttrs().contrast).toBe('high');
    expect(rootAttrs().text).toBe('lg');
  });

  it('drives text size through one variable the stylesheet multiplies by', () => {
    setPref('text', 'sm');
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('0.92');

    setPref('text', 'md');
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1');

    setPref('text', 'lg');
    expect(document.documentElement.style.getPropertyValue('--text-scale')).toBe('1.14');
  });

  it('toggles theme and contrast, and cycles text size in order', () => {
    toggleTheme();
    expect(getPrefs().theme).toBe('dark');
    toggleTheme();
    expect(getPrefs().theme).toBe('light');

    toggleContrast();
    expect(getPrefs().contrast).toBe('high');
    toggleContrast();
    expect(getPrefs().contrast).toBe('normal');

    cycleTextSize();
    expect(getPrefs().text).toBe('lg');
    cycleTextSize();
    expect(getPrefs().text).toBe('sm');
    cycleTextSize();
    expect(getPrefs().text).toBe('md');
  });

  it('remembers the choices on this device', () => {
    setPref('theme', 'dark');
    setPref('text', 'lg');

    expect(localStorage.getItem('hp_docs_theme')).toBe('dark');
    expect(localStorage.getItem('hp_docs_text')).toBe('lg');
  });

  it('refuses values that are not offered, rather than writing junk to <html>', () => {
    setPref('theme', 'solarised');
    setPref('contrast', 'extreme');
    setPref('text', 'huge');
    setPref('nonsense', 'whatever');

    expect(getPrefs()).toEqual({ theme: 'light', contrast: 'normal', text: 'md' });
    expect(rootAttrs().theme).toBe('light');
    // The defaults written in beforeEach are still what is stored: the
    // junk never reached localStorage.
    expect(localStorage.getItem('hp_docs_theme')).toBe('light');
    expect(localStorage.getItem('hp_docs_text')).toBe('md');
    expect(localStorage.getItem('hp_docs_nonsense')).toBeNull();
  });

  it('tells subscribers so the open menu re-renders', () => {
    let calls = 0;
    const unsubscribe = subscribe(() => {
      calls += 1;
    });

    setPref('theme', 'dark');
    expect(calls).toBe(1);

    // Setting the value it already has is still a change request, and
    // the menu should stay in step with the document either way.
    setPref('theme', 'dark');
    expect(calls).toBe(2);

    unsubscribe();
    setPref('theme', 'light');
    expect(calls).toBe(2);
  });

  it('repairs a corrupted stored value instead of breaking the page', () => {
    localStorage.setItem('hp_docs_theme', 'banana');
    localStorage.setItem('hp_docs_text', 'enormous');
    apply();

    // apply() only reflects state; the module validated on load, so the
    // attributes stay on a known-good pair.
    expect(rootAttrs().theme).toBe('light');
    expect(rootAttrs().text).toBe('md');
  });

  it('keeps every text size above the default rather than below it for two of three', () => {
    const scales = TEXT_SIZES.map((size) => size.scale);
    expect(scales[1]).toBe(1);
    expect(scales[0]).toBeLessThan(1);
    expect(scales[2]).toBeGreaterThan(1);
  });
});
