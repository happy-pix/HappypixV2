// "Download this page" — the export has to carry the same facts the
// page shows, for every page type, and never invent hardware.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicPages } from '../../content/public.js';
import { BOOTH_STEPS } from '../../content/boothFlow.js';
import { CRM_STEPS } from '../../content/crmFlow.js';
import { CAMERA_BRANDS, PRINTER_BRANDS } from '../../content/hardware.js';
import { buildSetupGuide } from '../setupGuide.js';
import { downloadTextFile, pageToMarkdown, slugForDownload } from '../markdown.js';

function pageFor(view) {
  const page = publicPages.find((item) => item.view === view);
  if (!page) throw new Error(`no public page with view "${view}"`);
  return page;
}

const MEMBER_PAGE = {
  id: 'backrooms',
  title: 'Backend Backrooms',
  description: 'What the platform API does.',
  overview: 'Every module the backend ships.',
  modules: [
    {
      name: 'requirePerm',
      kind: 'middleware',
      purpose: 'Checks a role holds a permission.',
      sender: 'Route handler',
      receiver: 'Next handler',
    },
  ],
  routes: [{ group: 'docs', method: 'GET', path: '/api/docs/private', purpose: 'Member article tree' }],
  tiers: [
    {
      clients: '1–5',
      booths: 'up to 10',
      statusLabel: 'Where we are now',
      summary: 'One server does everything.',
      cloudCost: '$40/mo',
      opsCost: '0',
      onboarding: '$0',
      staff: '1',
      trigger: 'First paying org',
    },
  ],
  nodes: [{ label: 'api', type: 'service', detail: 'Express on Fly.io', fields: ['id', 'orgId'] }],
};

describe('pageToMarkdown', () => {
  it('titles the file and says where it came from', () => {
    const markdown = pageToMarkdown({ page: pageFor('brand') });
    expect(markdown.startsWith(`# ${pageFor('brand').title}`)).toBe(true);
    expect(markdown).toContain('From the HappyPix Field Guide');
  });

  it('exports the overview with the FAQ and the links', () => {
    const markdown = pageToMarkdown({ page: pageFor('brand') });
    expect(markdown).toContain('## What HappyPix is');
    expect(markdown).toContain('## Frequent questions');
    expect(markdown).toContain('## Links');
    expect(markdown).toContain('Plans —');
  });

  it('exports every booth screen, in order, with the quick fixes', () => {
    const markdown = pageToMarkdown({ page: pageFor('booth') });
    BOOTH_STEPS.forEach((step, index) => {
      expect(markdown).toContain(`## ${index + 1}. ${step.title}`);
    });
    expect(markdown).toContain('## Quick fixes');
  });

  it('exports every CRM page and both roles', () => {
    const markdown = pageToMarkdown({ page: pageFor('crm') });
    CRM_STEPS.forEach((step, index) => {
      expect(markdown).toContain(`## ${index + 1}. ${step.title}`);
    });
    expect(markdown).toContain('Organisation Admin');
    expect(markdown).toContain('Organisation Manager');
  });

  it('exports the visitor’s own setup when they have chosen one', () => {
    const guide = buildSetupGuide({
      hostId: 'windows',
      cameraId: 'nikon-d5600',
      printerId: 'dnp-rx1hs',
      kiosk: true,
    });
    expect(guide).not.toBeNull();

    const markdown = pageToMarkdown({ page: pageFor('setup'), setupGuide: guide });
    expect(markdown).toContain('## Your setup');
    for (const chip of guide.chips) {
      expect(markdown).toContain(`**${chip.label}:** ${chip.value}`);
    }
  });

  it('still exports the full compatibility table with no selection made', () => {
    const markdown = pageToMarkdown({ page: pageFor('setup') });
    expect(markdown).not.toContain('## Your setup');
    expect(markdown).toContain('## Camera and printer compatibility');

    for (const brand of [...CAMERA_BRANDS, ...PRINTER_BRANDS]) {
      for (const model of brand.models) {
        expect(markdown).toContain(`| ${brand.brand} | ${model.model} |`);
      }
    }
  });

  it('does not let a pipe character inside a note break the table', () => {
    const markdown = pageToMarkdown({ page: pageFor('setup') });
    const tableRows = markdown.split('\n').filter((line) => line.startsWith('| '));
    for (const row of tableRows) {
      // Header, separator and data rows all have the same column count.
      const columns = row.split('|').length;
      expect(columns).toBe(tableRows[0].split('|').length);
    }
  });

  it('exports a member page’s modules, routes, tiers and components', () => {
    const markdown = pageToMarkdown({ memberPage: MEMBER_PAGE });
    expect(markdown).toContain('## Middleware, services and utilities');
    expect(markdown).toContain('### requirePerm (middleware)');
    expect(markdown).toContain('**Sender:** Route handler');
    expect(markdown).toContain('`/api/docs/private`');
    expect(markdown).toContain('## Growth stages');
    expect(markdown).toContain('Cloud + vendors: $40/mo');
    expect(markdown).toContain('### api (service)');
  });

  it('collapses the blank runs the builders leave behind', () => {
    for (const view of ['brand', 'booth', 'crm', 'setup']) {
      const markdown = pageToMarkdown({ page: pageFor(view) });
      expect(markdown).not.toMatch(/\n{3,}/);
    }
  });
});

describe('slugForDownload', () => {
  it('makes a filename-safe slug, branded and with the extension', () => {
    expect(slugForDownload('Make it run')).toBe('happypix-make-it-run.md');
    expect(slugForDownload('Booth 101 — every screen')).toBe('happypix-booth-101-every-screen.md');
    expect(slugForDownload('  Odd   spacing  ')).toBe('happypix-odd-spacing.md');
  });

  it('never leaves a character a filesystem would object to', () => {
    for (const page of publicPages) {
      expect(slugForDownload(page.title)).toMatch(/^happypix-[a-z0-9-]+\.md$/);
    }
  });
});

describe('downloadTextFile', () => {
  // jsdom ships a createObjectURL that only throws, so the shape of the
  // property has to be set rather than deleted to stand in for a
  // browser that cannot offer a download.
  function withoutObjectUrls(run) {
    const original = Object.getOwnPropertyDescriptor(window.URL, 'createObjectURL');
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    try {
      run();
    } finally {
      Object.defineProperty(window.URL, 'createObjectURL', original);
    }
  }

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  it('falls back gracefully when the browser cannot offer a download', () => {
    withoutObjectUrls(() => {
      expect(downloadTextFile('page.md', '# Page')).toBe(false);
    });
  });

  it('saves a Markdown blob when the browser can, then releases it', () => {
    const created = [];
    const revoked = [];
    Object.defineProperty(window.URL, 'createObjectURL', {
      value: vi.fn(() => {
        created.push(1);
        return 'blob:mock';
      }),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      value: vi.fn((url) => revoked.push(url)),
      configurable: true,
      writable: true,
    });

    let clicked = null;
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreate(tag);
      if (tag === 'a') element.click = () => (clicked = element);
      return element;
    });

    expect(downloadTextFile('page.md', '# Page')).toBe(true);
    expect(created.length).toBe(1);
    expect(clicked?.download).toBe('page.md');
    expect(clicked?.href).toBe('blob:mock');
    // The anchor is out of the document again.
    expect(document.querySelector('a[download]')).toBeNull();

    // The object URL is held long enough for the click to land, then
    // released so the page does not leak a blob per download.
    expect(revoked).toEqual([]);
    vi.advanceTimersByTime(1000);
    expect(revoked).toEqual(['blob:mock']);
  });
});

describe('the member export carries the new platform pages', () => {
  const page = {
    title: 'Backend Backrooms',
    description: 'The API.',
    member: {
      title: 'Backend Backrooms',
      description: 'The API.',
      routes: [
        {
          backend: 'main',
          group: 'Identity',
          method: 'POST',
          path: '/api/auth/login',
          purpose: 'Signs in.',
          permission: 'platform.docs.view',
          guards: ['session'],
          request: {
            body: [{ field: 'email', type: 'string', required: true, default: null, note: null }],
            query: [],
            params: [],
          },
          response: {
            status: 200,
            fields: [{ field: 'token', type: 'string', note: null }],
            payloads: [{ status: 200, fields: [{ field: 'token', type: 'string', note: null }] }],
          },
          tools: [{ name: 'MongoDB Atlas', kind: 'data', note: 'Operational persistence.' }],
        },
        {
          backend: 'website',
          group: 'Website · public',
          method: 'GET',
          path: '/api/plans',
          purpose: 'Lists plans.',
          request: {
            body: [],
            query: [{ field: 'kind', type: 'string', required: false, default: 'all', note: null }],
            params: [],
          },
          response: {
            status: 200,
            fields: [{ field: 'plans', type: 'array', note: null }],
            payloads: [{ status: 200, fields: [{ field: 'plans', type: 'array', note: null }] }],
          },
          tools: [],
        },
      ],
      screens: [
        {
          label: 'Events & Devices',
          path: '/org/events',
          what: 'The working page.',
          roles: ['ORG_ADMIN'],
          readOnlyFor: [],
          permission: 'events.devices.manage',
          use: ['Create an event.'],
          cant: 'Nothing for a suspended org.',
          api: ['/api/org/events'],
        },
      ],
      entries: [
        {
          at: '2026-11-11T09:00:00.000Z',
          actorName: 'Vineet',
          action: 'platform.docs.viewed',
          entity: 'documentation',
          severity: 'info',
          summary: 'Opened the guide',
        },
      ],
      models: [
        {
          name: 'Event',
          collection: 'events',
          summary: 'An event.',
          indexedFields: 1,
          refs: ['Organization'],
          fields: [
            { field: 'status', type: 'String', required: false, unique: false, indexed: false, enum: ['live'], default: "'live'", min: null, max: null },
          ],
        },
      ],
    },
  };

  const out = pageToMarkdown({ page, memberPage: page.member });

  it('separates the two backends in the contract table', () => {
    expect(out).toContain('### Main API');
    expect(out).toContain('### Website API');
  });

  it('includes request and response fields per endpoint', () => {
    // A field carries its type and, with `!`, whether it is required.
    expect(out).toMatch(/\| Identity \| POST \| `\/api\/auth\/login` .* \| email: string! \| 200: token: string \|/);
    expect(out).toContain('kind: string');
    expect(out).toContain('plans: array');
  });

  it('never includes a source line number', () => {
    expect(out).not.toMatch(/\.js:\d+/);
  });

  it('names the external tools the endpoints call', () => {
    expect(out).toMatch(/\| MongoDB Atlas \|/);
  });

  it('writes out each CRM page with its access rule', () => {
    expect(out).toContain('## Platform CRM (1 pages)');
    expect(out).toContain('Events & Devices');
    expect(out).toContain('**Who can open it:** ORG_ADMIN');
  });

  it('writes out the audit trail', () => {
    expect(out).toContain('## Audit log (1 recent entries)');
    expect(out).toContain('platform.docs.viewed');
  });

  it('includes enum and default in the field rules', () => {
    expect(out).toContain('enum: live');
    expect(out).toContain("default: 'live'");
  });
});
