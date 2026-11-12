// The documentation affordances a client meets on every page:
// the contents rail, the reading menu, the export, and the two
// mocks that now stand in for the real apps.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';
import { CRM_SIDEBAR } from '../content/crmFlow.js';
import { getPrefs, setPref } from '../lib/prefs.js';

const nav = (query = '') => window.history.replaceState({}, '', `/${query}`);
const root = () => document.documentElement;

// Captured once, before any spy exists: a spy that calls a bound copy
// of itself is how these tests blew the stack.
const realCreateElement = document.createElement.bind(document);

/** Stand in for a browser download, recording the filename it asked for. */
function stubDownload() {
  const saved = [];
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: vi.fn(() => 'blob:mock'),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: vi.fn(),
    configurable: true,
    writable: true,
  });
  vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    const element = realCreateElement(tag);
    if (tag === 'a') element.click = () => saved.push(element.download);
    return element;
  });
  return saved;
}

/**
 * The contents rail reads the document inside requestAnimationFrame,
 * which jsdom backs with a timer rather than a frame. A microtask is
 * not enough; this is.
 */
async function flushFrames() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

/**
 * jsdom does not implement aspect-ratio, so the computed style says
 * "auto" no matter what. The stylesheet is the thing that decides
 * this, so that is what gets checked. Vitest runs from the package
 * root, and import.meta.url is an http URL under jsdom.
 */
function cssRuleFor(selector) {
  const css = readFileSync(join(process.cwd(), 'src', 'styles.css'), 'utf8');
  const block = css.match(new RegExp(`\\.${selector}\\s*\\{[^}]*\\}`));
  return block ? block[0] : '';
}

/** Stand in for a browser that cannot offer a download at all. */
function withoutObjectUrls() {
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  nav('');
  window.sessionStorage.clear();
  localStorage.clear();
  setPref('theme', 'light');
  setPref('contrast', 'normal');
  setPref('text', 'md');
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ message: 'Thank you.' }) })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('reading preferences', () => {
  it('applies the defaults to <html> on first paint', () => {
    render(<App />);
    expect(root().dataset.theme).toBe('light');
    expect(root().dataset.contrast).toBe('normal');
    expect(root().dataset.text).toBe('md');
  });

  it('offers theme, contrast and three text sizes in one menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    const panel = screen.getByRole('dialog', { name: /Reading preferences/i });

    expect(within(panel).getByRole('button', { name: /^Light$/ })).toBeTruthy();
    expect(within(panel).getByRole('button', { name: /^Dark$/ })).toBeTruthy();
    expect(within(panel).getByRole('button', { name: 'High' })).toBeTruthy();
    expect(within(panel).getAllByRole('button', { name: 'A' })).toHaveLength(3);
  });

  it('switches to dark and puts it on <html>', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^Dark$/ }));

    expect(root().dataset.theme).toBe('dark');
    expect(getPrefs().theme).toBe('dark');
  });

  it('raises contrast for a bright room', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'High' }));

    expect(root().dataset.contrast).toBe('high');
  });

  it('changes text size through the one variable the stylesheet scales by', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    const sizes = within(screen.getByRole('dialog')).getAllByRole('button', { name: 'A' });

    await user.click(sizes[2]);
    expect(root().dataset.text).toBe('lg');
    expect(root().style.getPropertyValue('--text-scale')).toBe('1.14');

    await user.click(sizes[0]);
    expect(root().dataset.text).toBe('sm');
    expect(root().style.getPropertyValue('--text-scale')).toBe('0.92');
  });

  it('flips the theme with the t key, and says so in the shortcut list', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('t');
    expect(root().dataset.theme).toBe('dark');

    await user.keyboard('?');
    expect(screen.getByRole('heading', { name: /Keyboard shortcuts/i })).toBeTruthy();
    expect(screen.getByText(/Search every page, screen, camera and printer/i)).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { name: /Keyboard shortcuts/i })).toBeNull();
  });

  it('closes the menu when you click away', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    expect(screen.getByRole('dialog')).toBeTruthy();

    await user.click(screen.getByRole('heading', { level: 1 }));
    expect(screen.queryByRole('dialog', { name: /Reading preferences/i })).toBeNull();
  });
});

describe('download this page', () => {
  it('exports the page you are on, and says what it saved', async () => {
    const user = userEvent.setup();
    const saved = stubDownload();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Download this page/i }));

    expect(saved).toEqual(['happypix-welcome-to-happypix.md']);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(/Downloaded happypix-welcome-to-happypix\.md/i)).toBeTruthy();
  });

  it('exports the guide you are actually reading, not the front page', async () => {
    const user = userEvent.setup();
    const saved = stubDownload();

    nav('?page=booth-101');
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Download this page/i }));

    // The booth guide is titled "Inside the booth"; the export is named
    // after the page, not after its URL.
    expect(saved[0]).toBe('happypix-inside-the-booth.md');
  });

  it('tells you what to do instead when the browser will not download', async () => {
    const user = userEvent.setup();
    withoutObjectUrls();

    render(<App />);
    await user.click(screen.getByRole('button', { name: /Reading preferences/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Download this page/i }));

    expect(screen.getByText(/Save as PDF/i)).toBeTruthy();
  });
});

describe('on this page', () => {
  it('lists the sections of the page you are on', async () => {
    render(<App />);
    await flushFrames();

    const toc = document.querySelector('.toc');
    expect(toc).toBeTruthy();
    const links = toc.querySelectorAll('a[href^="#"]');
    expect(links.length).toBeGreaterThan(2);
    // Every entry points at a section that is really on the page.
    for (const link of links) {
      const id = link.getAttribute('href').slice(1);
      expect(document.getElementById(id)).toBeTruthy();
    }
  });

  it('copies a link to one section, and confirms it', async () => {
    const user = userEvent.setup();
    const written = [];
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn((text) => written.push(text)) },
      configurable: true,
      writable: true,
    });

    render(<App />);
    await flushFrames();

    const buttons = document.querySelectorAll('.toc-copy');
    expect(buttons.length).toBeGreaterThan(0);
    await user.click(buttons[0]);

    expect(written.length).toBe(1);
    expect(written[0]).toMatch(/#(what-happypix-is|how-it-works|[a-z-]+)/);
  });

  it('says so plainly when the clipboard is blocked', async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.reject(new Error('denied'))) },
      configurable: true,
      writable: true,
    });

    render(<App />);
    await flushFrames();

    await user.click(document.querySelectorAll('.toc-copy')[0]);
    await flushFrames();
    expect(screen.getByText(/blocked clipboard access/i)).toBeTruthy();
  });
});

describe('the mocks look like the apps they stand for', () => {
  it('shows the booth in landscape, with the header status row', () => {
    nav('?page=booth-101&step=waiting');
    render(<App />);

    const frame = document.querySelector('.device-booth');
    expect(frame).toBeTruthy();
    // Landscape, never a phone in portrait. jsdom cannot compute
    // aspect-ratio, so the rule itself is the assertion.
    // Landscape, not a specific ratio: the booth frame was widened to
    // 16/10 to give the screens vertical room. What matters is that it
    // stays wider than it is tall.
    expect(cssRuleFor('device-booth')).toMatch(/aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/);
    const [, bw, bh] = cssRuleFor('device-booth').match(/aspect-ratio:\s*(\d+)\s*\/\s*(\d+)/);
    expect(Number(bw)).toBeGreaterThan(Number(bh));
    expect(document.querySelector('.bq-header')).toBeTruthy();
    expect(document.querySelectorAll('.bq-pill').length).toBeGreaterThan(0);
    expect(document.querySelector('.bq-status')).toBeTruthy();
  });

  it('draws the sign-in screen on its own, before a session exists', () => {
    nav('?page=booth-101&step=login');
    render(<App />);

    expect(document.querySelector('.device-booth-signin')).toBeTruthy();
    expect(document.querySelector('.bq-login')).toBeTruthy();
  });

  it('advances the tour when the guest taps the control on the screen', async () => {
    const user = userEvent.setup();
    nav('?page=booth-101&step=start');
    render(<App />);

    expect(document.querySelector('.bq-start')).toBeTruthy();
    // The whole welcome surface is one touch target in the real app;
    // here it is the pink pill that says what to do.
    const touch = document.querySelector('.device-booth .bq-touch');
    expect(touch.textContent).toMatch(/Tap to start/);
    await user.click(touch);

    expect(document.querySelector('.bq-orientation')).toBeTruthy();
  });

  it('shows the CRM with its real dark sidebar and topbar', () => {
    nav('?page=crm-101&step=dashboard');
    render(<App />);

    const frame = document.querySelector('.device-crm');
    expect(frame).toBeTruthy();
    expect(cssRuleFor('device-crm')).toContain('aspect-ratio: 16 / 9');
    expect(document.querySelector('.cside')).toBeTruthy();
    expect(document.querySelector('.ctop')).toBeTruthy();
    expect(document.querySelector('.cstats')).toBeTruthy();
  });

  it('lists every workspace page in the mock sidebar', () => {
    nav('?page=crm-101&step=dashboard');
    render(<App />);

    const items = Array.from(document.querySelectorAll('.cnav-item')).map((node) => node.textContent.trim());
    for (const label of CRM_SIDEBAR) {
      expect(items.some((text) => text.endsWith(label))).toBe(true);
    }
  });

  it('moves the guide when you click the mock’s own sidebar', async () => {
    const user = userEvent.setup();
    nav('?page=crm-101&step=dashboard');
    render(<App />);

    expect(document.querySelector('.cstat-value')).toBeTruthy();
    const revenue = Array.from(document.querySelectorAll('.cnav-item')).find((node) =>
      node.textContent.trim().endsWith('Revenue'),
    );
    await user.click(revenue);

    // The step moved to Revenue, and the sidebar follows it.
    expect(screen.getByRole('heading', { name: /What the night made/i })).toBeTruthy();
    expect(document.querySelector('.cnav-item.active').textContent.trim().endsWith('Revenue')).toBe(true);
  });

  it('renders the sign-in page with the sidebar locked, not clickable', async () => {
    const user = userEvent.setup();
    nav('?page=crm-101&step=signin');
    render(<App />);

    const locked = document.querySelectorAll('.cnav-item.locked');
    expect(locked.length).toBeGreaterThan(0);
    await user.click(locked[0]);
    // Still on the sign-in step.
    expect(document.getElementById('walk-title-signin')).toBeTruthy();
    expect(document.querySelector('.clogin')).toBeTruthy();
  });
});
