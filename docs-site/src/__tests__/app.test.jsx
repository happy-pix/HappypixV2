import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

const nav = (query = '') => window.history.replaceState({}, '', `/${query}`);

/** Scope queries to the mock device, so a guest control is never confused with a shell control. */
const device = (selector = '.device') => within(document.querySelector(selector));

beforeEach(() => {
  nav('');
  window.sessionStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ message: 'Thank you.' }) })),
  );
});

describe('HappyPix 101 is the front door', () => {
  it('opens on the overview, with the FAQ and the only contact form', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /Welcome to HappyPix/i })).toBeTruthy();
    expect(screen.getByText(/Do I have to buy hardware from HappyPix\?/i)).toBeTruthy();
    expect(screen.getByRole('heading', { name: /If you have any further doubt/i })).toBeTruthy();
  });

  it('does not repeat the contact form on every page', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Inside the booth/ }));
    expect(screen.queryByRole('heading', { name: /If you have any further doubt/i })).toBeNull();
  });

  it('sends the topic as the lead type, so the CRM can filter it', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText(/Hardware and compatibility/i));
    await user.type(screen.getByLabelText(/^Your name/i), 'Priya');
    await user.type(screen.getByLabelText(/^Email address/i), 'priya@example.in');
    await user.type(screen.getByLabelText(/^Your question/i), 'Will a D5600 work on iPad?');
    await user.click(screen.getByRole('button', { name: /^Send it/i }));

    const call = fetch.mock.calls.at(-1);
    expect(call[0]).toMatch(/\/leads$/);
    expect(JSON.parse(call[1].body)).toMatchObject({
      name: 'Priya',
      email: 'priya@example.in',
      type: 'hardware',
    });
  });
});

describe('the booth walkthrough is clickable', () => {
  it('advances when the guest taps the control on the mock screen', async () => {
    const user = userEvent.setup();
    nav('?page=booth-101');
    render(<App />);

    expect(screen.getByRole('heading', { name: /Sign the booth in/i })).toBeTruthy();
    await user.click(device('.device-booth').getByRole('button', { name: /^Sign in$/ }));
    expect(screen.getByRole('heading', { name: /Everything is connected/i })).toBeTruthy();
    await user.click(device('.device-booth').getByRole('button', { name: /Go to the welcome screen/ }));
    expect(screen.getByRole('heading', { name: /The welcome screen/i })).toBeTruthy();
  });

  it('steps with the arrow keys', async () => {
    nav('?page=booth-101');
    render(<App />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('heading', { name: /Everything is connected/i })).toBeTruthy();
  });
});

describe('the CRM tour follows the real workspace', () => {
  it('shows the org pages a client actually has', async () => {
    const user = userEvent.setup();
    nav('?page=crm-101');
    render(<App />);
    // Present both in the mock workspace sidebar and in the tour rail.
    expect(screen.getAllByText('Events & devices').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /Next →/ }));
    expect(screen.getByRole('heading', { name: /Today, at a glance/i })).toBeTruthy();
  });
});

describe('Make it run answers for the gear in front of you', () => {
  it('offers the three compatibility levels and a filterable list', () => {
    nav('?page=make-it-run');
    render(<App />);
    for (const label of ['Tested', 'Compatible', 'Coming soon']) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(/Canon/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DS-RX1HS/).length).toBeGreaterThan(0);
  });

  it('rewrites the guide when the booth app changes', async () => {
    const user = userEvent.setup();
    nav('?page=make-it-run');
    render(<App />);

    await user.click(screen.getByRole('radio', { name: 'Which booth app?: Windows app' }));
    await user.click(screen.getByRole('radio', { name: 'Camera brand: Nikon' }));

    const guide = screen.getByRole('heading', { name: /Connect your Nikon/i });
    expect(guide.textContent).toMatch(/cable/i);
    // A wired Nikon on Windows must not tell the client to install an SDK.
    expect(document.body.textContent).not.toMatch(/install the nikon/i);
    expect(
      screen.getAllByText(/No\. The Nikon Remote SDK is bundled inside the app\./i).length,
    ).toBeGreaterThan(0);
  });

  it('warns honestly about a printer we do not support yet', async () => {
    const user = userEvent.setup();
    nav('?page=make-it-run');
    render(<App />);

    await user.click(screen.getByRole('radio', { name: 'Which booth app?: Windows app' }));
    await user.click(screen.getByRole('radio', { name: 'Printer brand: Sony' }));
    expect((await screen.findByText(/not on our supported list yet/i)).textContent).toBeTruthy();
  });
});

describe('⌘K search', () => {
  it('opens, finds a camera model, and jumps to the right page', async () => {
    const user = userEvent.setup();
    render(<App />);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const input = await screen.findByRole('textbox', { name: /Search the documentation/i });
    await user.type(input, 'DS620A');

    // Appears in both the result title and its snippet; scope to the list.
    const results = await screen.findByRole('dialog', { name: /Search the documentation/i });
    expect(within(results).getAllByText(/DS620A/).length).toBeGreaterThan(0);
    expect(within(results).getAllByText(/Setup guide|Printer|Camera/).length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: 'Enter' });

    expect(await screen.findByRole('heading', { name: /Build your booth/i })).toBeTruthy();
  });

  it('owns the arrow keys while open, so the walkthrough does not move underneath it', async () => {
    nav('?page=booth-101');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Sign the booth in/i })).toBeTruthy();

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await screen.findByRole('textbox', { name: /Search the documentation/i });

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Still on step one — the palette has the keyboard.
    expect(screen.getByRole('heading', { name: /Sign the booth in/i })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: /Everything is connected/i })).toBeNull();
  });

  it('closes on Escape', async () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    await screen.findByRole('textbox', { name: /Search the documentation/i });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('textbox', { name: /Search the documentation/i })).toBeNull();
  });
});

describe('nothing platform-facing leaks into the client view', () => {
  it('uses the corrected unauthorised copy', async () => {
    nav('?page=backend-backrooms');
    render(<App />);
    // A member deep link waits for the session probe, because there is
    // no public version of the page to show meanwhile.
    expect(await screen.findByRole('heading', { name: /You are not signed in/i })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/aint authorised/i);
  });

  it('keeps development vocabulary out of the client pages', () => {
    nav('?page=make-it-run');
    const { unmount } = render(<App />);
    const text = document.body.textContent.toLowerCase();
    for (const term of [
      'stub',
      'repository-certified',
      'source of truth',
      'provider path',
      'docs-site/public',
    ]) {
      expect(text, `expected no "${term}" on a client page`).not.toContain(term);
    }
    unmount();

    nav('?page=booth-101');
    render(<App />);
    const booth = document.body.textContent.toLowerCase();
    for (const term of ['stub', 'source of truth', 'docs-site/public']) {
      expect(booth, `expected no "${term}" on a client page`).not.toContain(term);
    }
  });

  it('links the CRM to the deployment clients actually sign in on', () => {
    render(<App />);
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
    expect(links.filter((href) => href.includes('happypixcrm.vercel.app')).length).toBeGreaterThan(0);
    expect(links.filter((href) => href.includes('crm.happypix.in'))).toEqual([]);
  });
});

describe('breadcrumbs', () => {
  it('shows three levels, and the middle one is not a dead label', () => {
    nav('?page=make-it-run');
    render(<App />);
    const crumbs = within(screen.getByRole('navigation', { name: /Breadcrumb/ }));
    expect(crumbs.getByText('Documentation')).toBeTruthy();
    expect(crumbs.getByText('Make it run')).toBeTruthy();
    expect(crumbs.getByText('Build your booth')).toBeTruthy();
  });
});

describe('the platform-member path still works', () => {
  const MEMBER_PAYLOAD = {
    navigationTitle: 'Platform notes',
    pages: [
      {
        id: 'backend-backrooms',
        title: 'Backend Backrooms',
        icon: '⌘',
        view: 'backrooms',
        description: 'Route map',
        sectionTitles: { flow: 'How a request travels', modules: 'Modules', routes: 'Route atlas' },
        overview: 'Express API overview.',
        flow: ['Client', 'Route'],
        securityNote: 'Check the deployed contract.',
        modules: [
          { kind: 'service', name: 'planService', purpose: 'Plans.', sender: 'CRM', receiver: 'Models' },
        ],
        // The contract shape the backend now serves: request fields and
        // response keys per endpoint, across both backends.
        routes: [
          {
            backend: 'main',
            group: 'Identity',
            method: 'POST',
            path: '/api/auth/login',
            purpose: 'Signs a member in.',
            permission: null,
            guards: ['session'],
            derived: false,
            request: { body: ['email', 'password'], query: [], params: [] },
            response: { keys: ['token'], selected: [] },
            models: ['User', 'Organization'],
          },
          {
            backend: 'website',
            group: 'Website · public',
            method: 'GET',
            path: '/api/plans',
            purpose: 'Lists the public plan catalogue.',
            permission: null,
            guards: [],
            derived: true,
            request: { body: [], query: [], params: [] },
            response: { keys: ['plans', 'addons', 'currency'], selected: [] },
            models: ['SubscriptionPlan'],
          },
        ],
      },
      {
        id: 'hosting-scaling',
        title: 'Hosting and scaling',
        icon: '↗',
        view: 'calculator',
        description: 'Cost bands',
        sectionTitles: {
          services: 'Running today',
          budgets: 'Budgets',
          triggers: 'Triggers',
          operations: 'Staffing',
        },
        planningIntro: 'Planning bands.',
        staffingNote: 'Plan separately.',
        operatingReminder: 'Track cost per booth.',
        warning: 'Verify invoices.',
        services: [{ name: 'API', kind: 'Serverless', icon: '⌘', detail: 'Express on Vercel.' }],
        tiers: [
          {
            id: '10-50',
            clients: '10',
            booths: '50',
            status: 'now',
            statusLabel: 'EARLY',
            cost: 'x',
            cloudCost: 'x',
            opsCost: 'x',
            onboarding: 'x',
            summary: 'Lean.',
            staff: '1 FTE',
            trigger: 'Instrument.',
          },
        ],
        triggers: [{ when: 'Now', title: 'Observe the bill', action: 'Tag spend.' }],
      },
    ],
  };

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (String(url).includes('/api/auth/me')) {
          return { ok: true, status: 200, json: async () => ({ user: { name: 'Vineet', role: 'OWNER' } }) };
        }
        if (String(url).includes('/api/docs/private')) {
          return { ok: true, status: 200, json: async () => MEMBER_PAYLOAD };
        }
        return { ok: true, status: 200, json: async () => ({}) };
      }),
    );
  });

  it('restores the session, shows the member nav and renders a private page', async () => {
    nav('?page=backend-backrooms');
    render(<App />);

    expect(await screen.findByText('Platform notes')).toBeTruthy();
    expect(await screen.findByRole('heading', { name: /How a request travels/i })).toBeTruthy();
    expect(screen.getByText(/Vineet/)).toBeTruthy();
    // The session rides on the httpOnly cookie, so the request carries
    // credentials and no Authorization header at all.
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/docs/private'),
      expect.objectContaining({ credentials: 'include' }),
    );
    const [, options] = fetch.mock.calls.find(([url]) => String(url).includes('/api/docs/private'));
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('never keeps a token of its own', async () => {
    nav('?page=backend-backrooms');
    render(<App />);
    await screen.findByText('Platform notes');

    // Nothing session-bearing is left readable by the page.
    expect(window.sessionStorage.length).toBe(0);
    expect(window.localStorage.getItem('hp_docs_session')).toBeNull();
  });

  it('renders the cost calculator view too', async () => {
    nav('?page=hosting-scaling');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Budgets/i })).toBeTruthy();
    expect(screen.getByText(/EARLY/)).toBeTruthy();
  });

  it('falls back to the public guides when the backend refuses the session', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (String(url).includes('/api/docs/private')) {
          return { ok: false, status: 403, json: async () => ({ error: 'Forbidden' }) };
        }
        return { ok: true, status: 200, json: async () => ({ user: { name: 'Guest', role: 'ORG_ADMIN' } }) };
      }),
    );
    nav('?page=hosting-scaling');
    render(<App />);

    expect(await screen.findByRole('heading', { name: /You are not signed in/i })).toBeTruthy();
    // A refused session leaves nothing behind, and does not redirect
    // the visitor away from the page they asked for.
    expect(window.sessionStorage.length).toBe(0);
    expect(new URLSearchParams(window.location.search).get('page')).toBe('hosting-scaling');
  });
});
