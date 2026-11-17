// ─────────────────────────────────────────────────────────────────
//  Platform CRM — the page-by-page guide.
//
//  Every entry here is a real page in crm/src/pages, keyed to the same
//  permission that hides its menu item. Roles are resolved from
//  ROLE_MATRIX at read time rather than typed out per page, so this
//  guide cannot claim a page is reachable when the app disagrees.
//
//  If a page is added to the CRM sidebar and not to this file, the
//  docs are the thing that goes stale — so the route test asserts the
//  two lists match.
// ─────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PERMS, ROLES, ROLE_MATRIX, ROLE_LABELS, isPlatformRole } from './permissions.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');

export { ROLE_LABELS };

// ─── The CRM pages ────────────────────────────────────────────────

/**
 * `perm` is the permission the app checks to show the menu item.
 * `roles` is derived from ROLE_MATRIX — never written by hand.
 */
export const CRM_SCREENS = [
  // ── Platform ──
  {
    id: 'platform-dashboard',
    section: 'Platform',
    label: 'Dashboard',
    path: '/platform/dashboard',
    perm: 'PLATFORM_DASHBOARD_VIEW',
    what: 'The first screen after a platform sign-in. It answers "is anything broken right now?" — organisations, live booths, recent events and the health of the fleet, all scoped across every tenant.',
    use: [
      'Scan the top strip for booths that are offline when they should be live.',
      'Watch for organisations that have gone quiet, or events starting today.',
      'Use it to decide where to look next, not to do work on a specific account.',
    ],
    cant: 'It aggregates. It does not let you edit an organisation, a plan or a boothed event from here — follow the card into the page that owns that record.',
    api: ['/api/platform/dashboard'],
  },
  {
    id: 'platform-revenue',
    section: 'Platform',
    label: 'Revenue',
    path: '/platform/revenue',
    perm: 'PLATFORM_REVENUE_VIEW',
    what: 'Money across the whole platform: subscriptions, booth payments and withdrawals, with the period you choose. This is the business view, not one organisation’s books.',
    use: [
      'Pick a date window and read the totals against the previous one.',
      'Filter down to a single organisation when a client queries a number.',
      'Export or reconcile against the payment provider for the same window.',
    ],
    cant: 'It reports. Changing a payment’s status is done at the provider and reflected here; withdrawals are their own action, not an edit.',
    api: ['/api/platform/revenue'],
  },
  {
    id: 'platform-orgs',
    section: 'Platform',
    label: 'Organizations',
    path: '/platform/organizations',
    perm: 'PLATFORM_ORGS_VIEW',
    what: 'The tenant list — every customer account with its plan, status and owners. This is where you find an account and then act on it.',
    use: [
      'Search by name, owner or email rather than scrolling.',
      'Open an organisation to see its plan, devices and event history.',
      'Suspend an account from here when billing or abuse requires it.',
    ],
    cant: 'Suspending is a separate permission (PLATFORM_ORG_SUSPEND) — Support Managers can look at an account but the suspend control is not theirs to press.',
    api: ['/api/platform/organizations', '/api/platform/organizations/:id'],
  },
  {
    id: 'platform-support',
    section: 'Platform',
    label: 'Organization Support',
    path: '/platform/support',
    perm: 'PLATFORM_SUPPORT_VIEW',
    what: 'Requests raised by organisations to HappyPix. The inbound queue for everything a client cannot fix themselves.',
    use: [
      'Work the queue oldest-first; priority is set by the organisation, so read the message before trusting it.',
      'Reply, then move the request to its next status rather than leaving it open.',
      'Attach what you found — the next person should not have to re-ask.',
    ],
    cant: 'It is organisation-to-HappyPix. Guest complaints are a different queue, and they arrive through Guest Support inside the client’s own workspace.',
    api: ['/api/platform/support'],
  },
  {
    id: 'platform-leads',
    section: 'Platform',
    label: 'Website Leads',
    path: '/platform/leads',
    perm: 'PLATFORM_LEADS_MANAGE',
    what: 'Enquiries from the public website — the contact form on happypix.in, including demo and hardware questions. They land here as records with a type and a status.',
    use: [
      'Triage by type: a demo request and a support question are different work.',
      'Set a status as you go (new → contacted → closed) and record what was said.',
      'Keep notes on the lead, not in your inbox, so the follow-up survives you.',
    ],
    cant: 'A lead is not an organisation. Creating the account is a separate, deliberate step — a lead never becomes a customer on its own.',
    api: ['/api/platform/leads'],
  },
  {
    id: 'platform-plans',
    section: 'Platform',
    label: 'Subscription Plans',
    path: '/platform/plans',
    perm: 'SUBSCRIPTION_PLANS_MANAGE',
    what: 'The plan catalogue: names, prices, booth and event limits, and add-ons. What the public pricing page sells and what checkout creates.',
    use: [
      'Edit a price or limit and the change reaches checkout and the CRM together.',
      'Add an add-on as its own row and it appears as a purchasable extra.',
      'Retire a plan by deactivating it — existing subscriptions keep their terms.',
    ],
    cant: 'Editing a plan does not rewrite the subscriptions already sold on it. Those carry their own recorded price and limits.',
    api: ['/api/platform/plans'],
  },
  {
    id: 'platform-templates',
    section: 'Platform',
    label: 'Template Library',
    path: '/platform/templates',
    perm: 'GLOBAL_TEMPLATES_MANAGE',
    what: 'The designs every organisation can use — the template catalogue behind the booth’s "choose a shape" screen, plus the AI-generated ones.',
    use: [
      'Publish a design once and every tenant sees it in the booth.',
      'Deactivate a design to pull it from the booth without deleting its history.',
      'Use categories to keep a growing library navigable.',
    ],
    cant: 'This is the shared library. A client’s own artwork lives in their workspace under Custom Templates and is not yours to edit.',
    api: ['/api/platform/templates'],
  },
  {
    id: 'platform-template-layouts',
    section: 'Platform',
    label: 'Template Layouts',
    path: '/platform/template-layouts',
    perm: 'PLATFORM_TEMPLATE_LAYOUTS_MANAGE',
    what: 'The print layouts — how many photos per sheet, in what arrangement, at what size. The geometry behind every template.',
    use: [
      'Add a layout for a paper size your printers actually stock.',
      'Check a new layout against the real printer before publishing it.',
      'Edit with care: layouts are referenced by templates that are already selling.',
    ],
    cant: 'A layout is structure, not artwork. The design and the photograph come from the template and the camera.',
    api: ['/api/platform/template-layouts'],
  },
  {
    id: 'platform-team',
    section: 'Platform',
    label: 'Team & Roles',
    path: '/platform/team',
    perm: 'PLATFORM_USERS_MANAGE',
    what: 'Who has a platform login, what role they hold, and whether the account is active.',
    use: [
      'Give someone the narrowest role that lets them do their job.',
      'Deactivate rather than delete when someone leaves — the audit trail keeps pointing at them.',
      'Review this list occasionally; stale platform logins are the usual finding.',
    ],
    cant: 'Support Managers see this page read-only. Changing a role is an Owner or Platform Admin action.',
    api: ['/api/platform/team'],
  },
  {
    id: 'platform-gallery-settings',
    section: 'Platform',
    label: 'Gallery Settings',
    path: '/platform/gallery-settings',
    perm: 'PLATFORM_GALLERY_SETTINGS',
    what: 'Platform-wide gallery policy: whether guests can browse their photos, and whether guest consent is required before a photo is published.',
    use: [
      'Set the default once here; new organisations inherit it.',
      'Turn consent on where the venue or the law requires it.',
      'Change it deliberately — it alters what every booth does for every client.',
    ],
    cant: 'An organisation can tighten its own defaults. This page sets the floor, not a per-client override.',
    api: ['/api/platform/gallery-settings'],
  },
  {
    id: 'platform-audit',
    section: 'Platform',
    label: 'Audit & Logs',
    path: '/platform/audit',
    perm: 'PLATFORM_AUDIT_VIEW',
    what: 'The record of who did what: sign-ins, permission changes, suspensions, deletions and every read of this field guide. Written by the server, not the client.',
    use: [
      'Filter by actor when you are investigating one person, by entity when investigating one record.',
      'Read the severity column first — warn and danger are the ones that matter.',
      'Treat it as append-only. There is no edit or delete path, by design.',
    ],
    cant: 'It records actions and their summary, not request payloads. Do not expect to see the exact form values someone submitted.',
    api: ['/api/platform/audit'],
  },

  // ── Organisation ──
  {
    id: 'org-dashboard',
    section: 'Organization',
    label: 'Dashboard',
    path: '/org/dashboard',
    perm: 'ORG_DASHBOARD_VIEW',
    what: 'The client’s own home screen: their booths, their next event, and whether the gear is where it should be.',
    use: [
      'Start here before an event to confirm the booth is online and assigned.',
      'Check what is live during an event rather than walking the venue.',
    ],
    cant: 'Everything on it is scoped to the signed-in organisation. There is no way to see another tenant from inside this page.',
    api: ['/api/org/dashboard'],
  },
  {
    id: 'org-templates',
    section: 'Organization',
    label: 'AI Templates',
    path: '/org/templates',
    perm: 'GLOBAL_TEMPLATES_USE',
    what: 'The shared design library, as the client sees it — browse, preview and switch designs on for their events.',
    use: [
      'Preview a design at print size before committing it to an event.',
      'Enable only what suits the event; a shorter list is easier for guests.',
    ],
    cant: 'These are HappyPix designs. Editing one changes it for every client, which is why this page does not offer an edit.',
    api: ['/api/org/templates'],
  },
  {
    id: 'org-custom-templates',
    section: 'Organization',
    label: 'Custom Templates',
    path: '/org/custom-templates',
    perm: 'GLOBAL_TEMPLATES_USE',
    what: 'The client’s own artwork. Upload a design and it behaves like any other template on their booths.',
    use: [
      'Upload artwork at the right aspect ratio — check the layout you intend to print on first.',
      'Name designs by event so the list stays usable after twenty uploads.',
    ],
    cant: 'Custom templates belong to one organisation. They do not appear in the shared library or on anyone else’s booth.',
    api: ['/api/org/custom-templates'],
  },
  {
    id: 'org-revenue',
    section: 'Organization',
    label: 'Revenue',
    path: '/org/revenue',
    perm: 'ORG_REVENUE_VIEW',
    what: 'The client’s own numbers: what the booths took, per event and per device, with withdrawals.',
    use: [
      'Read revenue per event to price the next one properly.',
      'Reconcile a settlement against the payment provider before raising a query.',
      'Request a withdrawal from here when the balance is what you expect.',
    ],
    cant: 'It only ever shows this organisation’s transactions. Platform revenue is a different page that clients cannot reach.',
    api: ['/api/org/revenue', '/api/org/wallet'],
  },
  {
    id: 'org-events',
    section: 'Organization',
    label: 'Events & Devices',
    path: '/org/events',
    perm: 'EVENTS_DEVICES_MANAGE',
    what: 'The working page. Create an event, set its date, designs and pricing, and pair the booth that will serve it.',
    use: [
      'Create the event first, then assign a device to it — the booth reads its event from that pairing.',
      'Use the passkey shown here to sign the booth in at the venue.',
      'Set print pricing and the payment options per event, not per organisation.',
    ],
    cant: 'Creating is blocked for a suspended organisation, and read-only roles can look but not save. The server enforces this, not just the button state.',
    api: ['/api/org/events', '/api/org/devices'],
  },
  {
    id: 'org-gallery',
    section: 'Organization',
    label: 'Gallery',
    path: '/org/gallery',
    perm: 'ORG_GALLERY_VIEW',
    what: 'Every photo from every event, filterable by event and device. Where a client reviews the night’s work.',
    use: [
      'Filter to one event before downloading — the gallery grows quickly.',
      'Check what guests actually saw, not what the booth was meant to take.',
    ],
    cant: 'Deleting here is permanent for the record. Guest download links expire on their own schedule regardless.',
    api: ['/api/org/gallery'],
  },
  {
    id: 'org-team',
    section: 'Organization',
    label: 'Team & Roles',
    path: '/org/team',
    perm: 'ORG_TEAM_VIEW',
    what: 'The client’s own staff logins and their roles — who can set events up, who can only read.',
    use: [
      'Give booth operators the narrower role; they do not need revenue.',
      'Deactivate on departure rather than sharing a login.',
    ],
    cant: 'Nobody here can grant a platform role. Organisation roles stop at Organization Admin.',
    api: ['/api/org/team'],
  },
  {
    id: 'org-platform-support',
    section: 'Organization',
    label: 'HappyPix Support',
    path: '/org/platform-support',
    perm: 'ORG_PLATFORM_SUPPORT',
    what: 'Where a client asks HappyPix for help. The outbound queue — it lands in the platform support page.',
    use: [
      'Include the event and the booth when raising a request; context shortens the fix.',
      'Keep the thread in one request rather than opening a new one per message.',
    ],
    cant: 'It reaches HappyPix, not the guest. Guest complaints are the other support page.',
    api: ['/api/org/platform-support'],
  },
  {
    id: 'org-support',
    section: 'Organization',
    label: 'Guest Support',
    path: '/org/support',
    perm: 'TICKETS_RESOLVE',
    what: 'Complaints from guests — a print that failed, a download that did not arrive. Raised by guests, resolved by the client.',
    use: [
      'Match the ticket to the session and the device before replying.',
      'Re-send a download link from here when a guest lost theirs.',
    ],
    cant: 'This queue is the client’s. HappyPix can see that it exists but does not resolve guest tickets for them.',
    api: ['/api/org/support'],
  },
  {
    id: 'org-defaults',
    section: 'Organization',
    label: 'Organization Defaults',
    path: '/org/defaults',
    perm: 'DEFAULTS_VIEW',
    what: 'The client’s standing choices: branding, logo, gallery policy and the defaults new events inherit.',
    use: [
      'Set branding once here so every new event starts branded.',
      'Tighten gallery consent here if a venue requires it, beyond the platform floor.',
    ],
    cant: 'Defaults are a starting point. They do not retroactively change events that already exist.',
    api: ['/api/org/defaults'],
  },
  {
    id: 'org-coupons',
    section: 'Organization',
    label: 'Coupons',
    path: '/org/coupons',
    perm: 'COUPONS_MANAGE',
    what: 'Discount codes the client hands out — a percentage or a flat amount off a booth session.',
    use: [
      'Set an expiry; a coupon with no end date is a permanent discount.',
      'Deactivate rather than delete so the redemption history stays readable.',
    ],
    cant: 'A coupon changes what a guest pays. It does not change the plan the client is on.',
    api: ['/api/org/coupons'],
  },
];

/** Resolve each screen's roles from the matrix the server enforces. */
export function crmScreens() {
  return CRM_SCREENS.map((screen) => {
    const perm = PERMS[screen.perm];
    const roles = perm ? ROLE_MATRIX[perm] || [] : [];
    return {
      ...screen,
      permission: perm || screen.perm,
      roles,
      // Team & Roles is deliberately readable by Support Managers even
      // though they cannot change anything there.
      readOnlyFor: screen.id === 'platform-team' ? [ROLES.SUPPORT_MANAGER] : [],
    };
  });
}

/** Screens visible to a given role, using only the matrix. */
export function screensForRole(role) {
  return crmScreens().filter((screen) => screen.roles.includes(role));
}

// ─── Audit trail ──────────────────────────────────────────────────

/**
 * Read the audit log for the docs view.
 *
 * The model is required lazily: importing it at module load makes this
 * config file depend on a live mongoose connection being set up,
 * which the drift tests do not have.
 */
export async function recentAudit(limit = 40) {
  const { default: AuditLog } = await import('../models/AuditLog.js');
  const rows = await AuditLog.find({}).sort({ at: -1 }).limit(limit).lean();
  return rows.map((row) => ({
    at: row.at,
    actorName: row.actorName || row.actorId || 'unknown',
    actorRole: row.actorRole || null,
    action: row.action,
    entity: row.entity,
    summary: row.summary,
    severity: row.severity || 'info',
    scope: row.organizationId ? 'organisation' : 'platform',
  }));
}
