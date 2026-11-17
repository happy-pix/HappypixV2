// ─────────────────────────────────────────────────────────────────
//  Reading preferences: theme, contrast and text size.
//
//  A tiny external store rather than context, so it can be read from
//  anywhere and tested without rendering. Values are applied as data
//  attributes on <html> and persisted per browser.
//
//  Covered by src/lib/__tests__/prefs.test.js.
// ─────────────────────────────────────────────────────────────────

export const THEMES = ['light', 'dark'];
export const CONTRASTS = ['normal', 'high'];
export const TEXT_SIZES = [
  { id: 'sm', label: 'A', title: 'Smaller text', scale: 0.92 },
  { id: 'md', label: 'A', title: 'Default text', scale: 1 },
  { id: 'lg', label: 'A', title: 'Larger text', scale: 1.14 },
];

const KEYS = {
  theme: 'hp_docs_theme',
  contrast: 'hp_docs_contrast',
  text: 'hp_docs_text',
};

function read(key, fallback) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode — preferences just will not persist */
  }
}

function preferredTheme() {
  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

let state = {
  theme: read(KEYS.theme, '') || preferredTheme(),
  contrast: read(KEYS.contrast, 'normal'),
  text: read(KEYS.text, 'md'),
};

if (!THEMES.includes(state.theme)) state = { ...state, theme: 'light' };
if (!CONTRASTS.includes(state.contrast)) state = { ...state, contrast: 'normal' };
if (!TEXT_SIZES.some((size) => size.id === state.text)) state = { ...state, text: 'md' };

const listeners = new Set();

function emit() {
  apply();
  for (const listener of listeners) listener();
}

/** Push the current preferences onto the document. */
export function apply() {
  const root = document.documentElement;
  root.setAttribute('data-theme', state.theme);
  root.setAttribute('data-contrast', state.contrast);
  root.setAttribute('data-text', state.text);
  root.style.setProperty(
    '--text-scale',
    String(TEXT_SIZES.find((size) => size.id === state.text)?.scale ?? 1),
  );
  root.style.colorScheme = state.theme;
}

export function getPrefs() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setPref(key, value) {
  if (!(key in KEYS)) return;
  if (key === 'theme' && !THEMES.includes(value)) return;
  if (key === 'contrast' && !CONTRASTS.includes(value)) return;
  if (key === 'text' && !TEXT_SIZES.some((size) => size.id === value)) return;

  state = { ...state, [key]: value };
  write(KEYS[key], value);
  emit();
}

export function toggleTheme() {
  setPref('theme', state.theme === 'dark' ? 'light' : 'dark');
}

export function toggleContrast() {
  setPref('contrast', state.contrast === 'high' ? 'normal' : 'high');
}

export function cycleTextSize() {
  const index = TEXT_SIZES.findIndex((size) => size.id === state.text);
  setPref('text', TEXT_SIZES[(index + 1) % TEXT_SIZES.length].id);
}
