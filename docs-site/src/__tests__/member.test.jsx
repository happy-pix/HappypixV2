// The platform-member renderers and the environment-driven links.
// These run against the payload shape the backend actually serves, so
// a change to either side shows up here rather than at sign-in.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemberArticle from '../components/MemberArticles.jsx';
import { crmGuidePage, schemaPage, backroomsPage, auditPage } from './memberFixtures.js';

describe('the API contract in Backrooms', () => {
  beforeEach(() => {
    // jsdom has no ResizeObserver; the canvas is not used here, but the
    // page pulls in the module graph that references it.
    global.ResizeObserver ||= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  it('lists every endpoint from both backends, with a count', () => {
    render(<MemberArticle page={backroomsPage()} />);
    expect(screen.getAllByText('/api/auth/login').length).toBeGreaterThan(0);
    expect(screen.getAllByText('/api/plans').length).toBeGreaterThan(0);
    expect(screen.getByText(/Showing 2 of 2 endpoints/)).toBeTruthy();
  });

  it('names the sender, the receiver and the access rule per endpoint', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getAllByRole('button', { name: /POST/ })[0]);

    expect(screen.getByText('A signed-in CRM user')).toBeTruthy();
    expect(screen.getByText('User, Organization')).toBeTruthy();
    expect(screen.getByText('email')).toBeTruthy();
    expect(screen.getByText('password')).toBeTruthy();
    expect(screen.getByText('token')).toBeTruthy();
  });

  it('gives every request field a type, and marks the required ones', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getAllByRole('button', { name: /POST/ })[0]);

    const email = screen.getByText('email').closest('li');
    expect(email.textContent).toMatch(/string/);
    expect(email.textContent).toMatch(/required/);
    expect(email.textContent).toMatch(/email is required/);

    // `string` is the type on both fields, so it must appear twice —
    // a bare name list would show none.
    expect(screen.getAllByText('string').length).toBeGreaterThanOrEqual(2);
  });

  it('names the external tool each endpoint calls', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getAllByRole('button', { name: /POST/ })[0]);

    const tools = screen.getByText('EXTERNAL TOOLS').parentElement;
    expect(within(tools).getByText('MongoDB Atlas')).toBeTruthy();
    expect(within(tools).getByText('data')).toBeTruthy();
  });

  it('shows the error a rejected request gets back', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getAllByRole('button', { name: /POST/ })[0]);
    expect(screen.getByText('VALIDATION')).toBeTruthy();
    expect(screen.getByText(/Email and password are required/)).toBeTruthy();
  });

  it('says plainly when an endpoint calls nothing outside the process', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getAllByRole('button', { name: /GET/ })[0]);
    expect(screen.getByText(/Nothing outside this process/)).toBeTruthy();
  });

  it('separates the website backend from the main API', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={backroomsPage()} />);
    await user.click(screen.getByRole('button', { name: /Website API \(1\)/ }));
    expect(screen.queryAllByText('/api/auth/login')).toEqual([]);
    expect(screen.getAllByText('/api/plans').length).toBeGreaterThan(0);
  });

  it('never shows a source file or line number', () => {
    const { container } = render(<MemberArticle page={backroomsPage()} />);
    const text = container.textContent;
    expect(text).not.toMatch(/routes\/[\w]+\.js:\d+/);
    expect(text).not.toMatch(/:4\d\d\b/);
  });
});

describe('the schema atlas', () => {
  it('reports every model and every field', () => {
    render(<MemberArticle page={schemaPage()} />);
    expect(screen.getByText(/2 models · 7 fields/)).toBeTruthy();
    expect(screen.getAllByText('Event').length).toBeGreaterThan(0);
  });

  it('shows type, rules and references for a field', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={schemaPage()} />);
    await user.click(screen.getAllByRole('button', { name: /Event/ })[0]);

    const table = screen.getByRole('table');
    expect(within(table).getByText('startDate')).toBeTruthy();
    expect(within(table).getByText('Date')).toBeTruthy();
    expect(within(table).getAllByText('required').length).toBeGreaterThan(0);
    expect(within(table).getByText('Organization')).toBeTruthy();
  });

  it('filters models by field name', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={schemaPage()} />);
    // Labelled by aria-label; the placeholder is not an accessible name.
    await user.type(screen.getByLabelText(/Filter models and fields/i), 'startDate');
    expect(screen.getAllByText('Event').length).toBeGreaterThan(0);
    // AuditLog has no startDate field, so it drops out of the list.
    expect(screen.queryByText('AuditLog')).toBeNull();
  });
});

describe('the platform CRM guide', () => {
  it('shows what each page is for, how to use it and who can open it', () => {
    render(<MemberArticle page={crmGuidePage()} />);
    expect(screen.getByText('Events & Devices')).toBeTruthy();
    expect(screen.getByText(/The working page/)).toBeTruthy();
    expect(screen.getByText(/Create the event first/)).toBeTruthy();
    expect(screen.getAllByText('Organization Admin').length).toBeGreaterThan(0);
    expect(screen.getByText(/coupons\.manage/)).toBeTruthy();
  });

  it('filters the page list down to one role', async () => {
    const user = userEvent.setup();
    render(<MemberArticle page={crmGuidePage()} />);
    await user.click(screen.getByRole('button', { name: 'Organization Manager' }));
    expect(screen.getByText('Events & Devices')).toBeTruthy();
    expect(screen.queryByText('Audit & Logs')).toBeNull();
  });

  it('marks a read-only page as read-only', () => {
    render(<MemberArticle page={crmGuidePage()} />);
    expect(screen.getByText(/Support Manager \(read-only\)/)).toBeTruthy();
  });
});

describe('the audit log', () => {
  it('renders recent entries with actor, action and severity', () => {
    render(<MemberArticle page={auditPage()} />);
    expect(screen.getByText('platform.docs.viewed')).toBeTruthy();
    expect(screen.getByText('Vineet')).toBeTruthy();
    expect(screen.getByText('danger')).toBeTruthy();
  });

  it('explains itself when the trail could not be read', () => {
    render(<MemberArticle page={auditPage({ entries: [] })} />);
    expect(screen.getByText(/No audit entries could be read/)).toBeTruthy();
  });
});

describe('links from the environment', () => {
  it('builds pricing and contact URLs from the website URL', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_WEBSITE_URL', 'https://example.test');
    const { LINKS } = await import('../lib/links.js');
    expect(LINKS.website).toBe('https://example.test');
    expect(LINKS.pricing).toBe('https://example.test/pricing#checkout');
    expect(LINKS.contact).toBe('https://example.test/contact');
  });

  it('prefers an explicit override and strips a trailing slash', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_CRM_URL', 'https://crm.example.test/');
    const { LINKS } = await import('../lib/links.js');
    expect(LINKS.crm).toBe('https://crm.example.test');
    vi.unstubAllEnvs();
  });

  it('leaves a download unset rather than inventing a store link', async () => {
    vi.resetModules();
    const { hasDownload } = await import('../lib/links.js');
    expect(hasDownload('downloadIos')).toBe(false);
  });
});
