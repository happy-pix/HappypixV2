import { describe, it, expect } from 'vitest';
import { buildSearchIndex, searchIndex, snippet, highlight, tokenize } from '../search.js';
import { publicPages } from '../../content/public.js';
import { BOOTH_STEPS } from '../../content/boothFlow.js';
import { CRM_STEPS } from '../../content/crmFlow.js';
import { FAQ } from '../../content/brand.js';
import { HARDWARE_INDEX_ENTRIES } from '../../content/hardware.js';
import { buildSetupIndexEntries } from '../setupGuide.js';

const publicOnly = buildSearchIndex({
  publicPages,
  boothSteps: BOOTH_STEPS,
  crmSteps: CRM_STEPS,
  faq: FAQ,
  hardware: HARDWARE_INDEX_ENTRIES,
  setup: buildSetupIndexEntries(),
});

describe('the index covers every surface a client can read', () => {
  it('indexes pages, booth steps, CRM steps, FAQ and hardware', () => {
    const kinds = new Set(publicOnly.map((row) => row.kind));
    for (const kind of ['page', 'step', 'faq', 'camera', 'printer']) expect(kinds.has(kind)).toBe(true);
  });

  it('reaches every booth screen and every CRM screen', () => {
    for (const step of BOOTH_STEPS) {
      expect(
        searchIndex(publicOnly, step.title, { limit: 40 }).some((hit) => hit.sectionId === `step-${step.id}`),
      ).toBe(true);
    }
    for (const step of CRM_STEPS) {
      expect(
        searchIndex(publicOnly, step.title, { limit: 40 }).some((hit) => hit.sectionId === `step-${step.id}`),
      ).toBe(true);
    }
  });

  it('finds a camera model by name', () => {
    const hits = searchIndex(publicOnly, 'D5600');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].title).toContain('D5600');
    expect(hits[0].pageId).toBe('make-it-run');
  });

  it('finds a printer model by name', () => {
    const hits = searchIndex(publicOnly, 'DS-RX1HS');
    expect(hits[0].title).toContain('DS-RX1HS');
  });

  it('finds answers inside FAQ prose, not just titles', () => {
    const hits = searchIndex(publicOnly, 'driver');
    expect(hits.some((hit) => hit.kind === 'faq')).toBe(true);
  });

  it('finds kiosk mode inside the setup guide copy', () => {
    const hits = searchIndex(publicOnly, 'kiosk mode', { limit: 30 });
    expect(hits.length).toBeGreaterThan(0);
  });
});

describe('precision', () => {
  it('requires every term, so "nikon d5600" is not just "nikon"', () => {
    const broad = searchIndex(publicOnly, 'nikon', { limit: 40 });
    const narrow = searchIndex(publicOnly, 'nikon d5600', { limit: 40 });
    expect(narrow.length).toBeLessThan(broad.length);
    expect(narrow.every((hit) => hit.haystack.includes('d5600'))).toBe(true);
  });

  it('drops stopwords instead of matching everything', () => {
    expect(tokenize('how do I connect the camera')).not.toContain('how');
    expect(tokenize('how do I connect the camera')).toContain('connect');
  });

  it('returns nothing for an empty query', () => {
    expect(searchIndex(publicOnly, '')).toEqual([]);
    expect(searchIndex(publicOnly, 'the of and')).toEqual([]);
  });
});

describe('private content', () => {
  it('is absent from the index for a public visitor', () => {
    const text = publicOnly.map((row) => row.haystack).join(' ');
    for (const secret of ['hosting-scaling', 'backend backrooms', 'cloudinary', 'atlas']) {
      expect(text).not.toContain(secret);
    }
    expect(publicOnly.some((row) => row.kind === 'member')).toBe(false);
  });

  it('appears only once the caller passes authorised member pages', () => {
    const withMember = buildSearchIndex({
      publicPages,
      boothSteps: BOOTH_STEPS,
      crmSteps: CRM_STEPS,
      faq: FAQ,
      hardware: HARDWARE_INDEX_ENTRIES,
      memberPages: [
        {
          id: 'backend-backrooms',
          title: 'Backend Backrooms',
          description: 'API map',
          overview: 'Express services',
        },
      ],
    });
    expect(withMember.some((row) => row.kind === 'member')).toBe(true);
  });
});

describe('presentation helpers', () => {
  it('snippets around the match', () => {
    const text = 'A'.repeat(120) + ' D5600 ' + 'B'.repeat(120);
    const out = snippet(text, 'd5600');
    expect(out).toContain('D5600');
    expect(out.startsWith('…')).toBe(true);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThan(text.length);
  });

  it('marks the matched word for bolding', () => {
    const parts = highlight('Nikon D5600 over USB', 'd5600');
    expect(parts.some((part) => part.mark && part.text === 'D5600')).toBe(true);
  });
});
