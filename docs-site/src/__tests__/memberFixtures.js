// ─────────────────────────────────────────────────────────────────
//  Fixtures for the member renderers, shaped exactly like the payload
//  /api/docs/private returns. Kept small on purpose — the point is the
//  shape, not the volume. The real payload is generated from source.
// ─────────────────────────────────────────────────────────────────

export function backroomsPage() {
  return {
    id: 'backend-backrooms',
    title: 'Backend Backrooms',
    icon: '⌘',
    view: 'backrooms',
    sectionTitles: {
      flow: 'How a request travels',
      modules: 'Middleware, services and utilities',
      routes: 'Every API, end to end',
    },
    overview: 'Clients call the Express API.',
    flow: ['Client', 'Middleware', 'Route', 'Service', 'Response'],
    securityNote: 'A UI guard is not authorisation.',
    modules: [
      {
        kind: 'middleware',
        name: 'authenticate',
        purpose: 'Verifies the session.',
        sender: 'CRM',
        receiver: 'req.user',
      },
    ],
    routes: [
      {
        backend: 'main',
        group: 'Identity',
        method: 'POST',
        path: '/api/auth/login',
        purpose: 'Checks credentials and sets the session cookie.',
        permission: null,
        guards: ['session'],
        derived: false,
        request: {
          body: [
            { field: 'email', type: 'string', required: true, default: null, note: 'email is required.' },
            { field: 'password', type: 'string', required: true, default: null, note: null },
          ],
          query: [],
          params: [],
        },
        response: {
          status: 200,
          fields: [{ field: 'token', type: 'string', note: null }],
          payloads: [
            {
              status: 200,
              fields: [
                { field: 'token', type: 'string', note: null },
                { field: 'payload', type: 'object', note: null },
              ],
            },
          ],
          statuses: [200],
          errors: [{ message: 'Email and password are required.', code: 'VALIDATION', status: 400 }],
        },
        models: ['User', 'Organization'],
        tools: [
          { name: 'MongoDB Atlas', kind: 'data', note: 'Operational persistence.' },
        ],
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
        response: {
          status: 200,
          fields: [
            { field: 'plans', type: 'array', note: null },
            { field: 'addons', type: 'array', note: null },
            { field: 'currency', type: 'string', note: null },
          ],
          payloads: [
            {
              status: 200,
              fields: [
                { field: 'plans', type: 'array', note: null },
                { field: 'addons', type: 'array', note: null },
                { field: 'currency', type: 'string', note: null },
              ],
            },
          ],
          statuses: [200],
          errors: [],
        },
        models: ['SubscriptionPlan'],
        tools: [],
      },
    ],
  };
}

export function schemaPage() {
  return {
    id: 'db-schema',
    title: 'DB Schema',
    view: 'graph',
    description: 'Every model.',
    models: [
      {
        name: 'Event',
        collection: 'events',
        summary: 'An event a booth serves.',
        indexedFields: 2,
        refs: ['Organization'],
        fields: [
          {
            field: 'name',
            type: 'String',
            required: true,
            unique: false,
            indexed: false,
            ref: null,
            enum: null,
            default: null,
            min: null,
            max: null,
          },
          {
            field: 'startDate',
            type: 'Date',
            required: true,
            unique: false,
            indexed: false,
            ref: null,
            enum: null,
            default: null,
            min: null,
            max: null,
          },
          {
            field: 'status',
            type: 'String',
            required: false,
            unique: false,
            indexed: false,
            ref: null,
            enum: ['upcoming', 'live', 'finished'],
            default: "'upcoming'",
            min: null,
            max: null,
          },
          {
            field: 'organizationId',
            type: 'ObjectId',
            required: false,
            unique: false,
            indexed: true,
            ref: 'Organization',
            enum: null,
            default: null,
            min: null,
            max: null,
          },
        ],
      },
      {
        name: 'AuditLog',
        collection: 'auditlogs',
        summary: 'Who did what.',
        indexedFields: 1,
        refs: [],
        fields: [
          {
            field: 'action',
            type: 'String',
            required: false,
            unique: false,
            indexed: true,
            ref: null,
            enum: null,
            default: null,
            min: null,
            max: null,
          },
          {
            field: 'actorName',
            type: 'String',
            required: false,
            unique: false,
            indexed: false,
            ref: null,
            enum: null,
            default: null,
            min: null,
            max: null,
          },
          {
            field: 'severity',
            type: 'String',
            required: false,
            unique: false,
            indexed: false,
            ref: null,
            enum: ['info', 'warn', 'danger'],
            default: null,
            min: null,
            max: null,
          },
        ],
      },
    ],
  };
}

export function crmGuidePage() {
  return {
    id: 'platform-crm',
    title: 'Platform CRM',
    icon: '▤',
    view: 'crm-guide',
    description: 'Every screen in the CRM.',
    securityNote: 'Hiding a menu item is not authorisation.',
    roles: [
      { role: 'OWNER', label: 'Owner', scope: 'platform', pages: 12 },
      { role: 'SUPPORT_MANAGER', label: 'Support Manager', scope: 'platform', pages: 4 },
      { role: 'ORG_ADMIN', label: 'Organization Admin', scope: 'organisation', pages: 8 },
      { role: 'ORG_MANAGER', label: 'Organization Manager', scope: 'organisation', pages: 6 },
    ],
    screens: [
      {
        id: 'org-events',
        section: 'Organization',
        label: 'Events & Devices',
        path: '/org/events',
        permission: 'events.devices.manage',
        roles: ['ORG_ADMIN', 'ORG_MANAGER'],
        readOnlyFor: [],
        what: 'The working page. Create an event and pair the booth that will serve it.',
        use: [
          'Create the event first, then assign a device to it.',
          'Use the passkey to sign the booth in at the venue.',
        ],
        cant: 'Creating is blocked for a suspended organisation.',
        api: ['/api/org/events'],
      },
      {
        id: 'org-coupons',
        section: 'Organization',
        label: 'Coupons',
        path: '/org/coupons',
        permission: 'coupons.manage',
        roles: ['ORG_ADMIN'],
        readOnlyFor: [],
        what: 'Discount codes the client hands out.',
        use: ['Set an expiry.'],
        cant: 'It does not change the plan.',
        api: ['/api/org/coupons'],
      },
      {
        id: 'platform-team',
        section: 'Platform',
        label: 'Team & Roles',
        path: '/platform/team',
        permission: 'platform.users.manage',
        roles: ['OWNER', 'SUPPORT_MANAGER'],
        readOnlyFor: ['SUPPORT_MANAGER'],
        what: 'Who has a platform login.',
        use: ['Give the narrowest role.'],
        cant: 'Support Managers see it read-only.',
        api: ['/api/platform/team'],
      },
      {
        id: 'platform-audit',
        section: 'Platform',
        label: 'Audit & Logs',
        path: '/platform/audit',
        permission: 'platform.audit.view',
        roles: ['OWNER'],
        readOnlyFor: [],
        what: 'The record of who did what.',
        use: ['Filter by actor.'],
        cant: 'There is no edit path.',
        api: ['/api/platform/audit'],
      },
    ],
  };
}

export function auditPage(overrides = {}) {
  return {
    id: 'audit-log',
    title: 'Audit log',
    view: 'audit',
    description: 'The most recent audited actions.',
    securityNote: 'Severity is triage, not a control.',
    entries: [
      {
        at: '2026-11-11T09:12:00.000Z',
        actorName: 'Vineet',
        actorRole: 'OWNER',
        action: 'platform.docs.viewed',
        entity: 'documentation',
        summary: 'Opened the platform field guide',
        severity: 'info',
        scope: 'platform',
      },
      {
        at: '2026-11-11T08:40:00.000Z',
        actorName: 'system',
        actorRole: null,
        action: 'platform.organization.suspended',
        entity: 'organization',
        summary: 'Suspended an organisation for non-payment',
        severity: 'danger',
        scope: 'platform',
      },
    ],
    ...overrides,
  };
}
