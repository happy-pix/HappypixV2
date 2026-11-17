import express from 'express';
import { authenticate, requirePerm } from '../middleware/auth.js';
import { PERMS, ROLES, ROLE_MATRIX, isPlatformRole } from '../config/permissions.js';
import { writeAudit } from '../utils/auditLogger.js';
import { ATLAS_ROUTES, ATLAS_MODELS } from '../config/docsAtlas.generated.js';
import { ROLE_LABELS, crmScreens, recentAudit } from '../config/docsCrmGuide.js';

const router = express.Router();

// This module is intentionally served only after the main backend has verified
// a platform permission. Do not move these payloads into the public Vite app.
const pages = [
  {
    id: 'backend-backrooms',
    title: 'Backend Backrooms',
    icon: '⌘',
    view: 'backrooms',
    tags: ['Platform team', 'API map'],
    description:
      'A practical map of the Express API, authorization layers, services and request/response paths.',
    sectionTitles: {
      flow: 'How a request travels',
      modules: 'Middleware, services and utilities',
      routes: 'Every API, end to end',
      contracts: 'Reading a contract',
    },
    overview:
      'The React clients and booth apps call the Express API. Authentication middleware verifies the session; permission middleware checks the user’s role. Route handlers validate input, call services/utilities, and return JSON. MongoDB holds operational state; Cloudinary is the active image-storage and delivery adapter.',
    flow: ['Client', 'Middleware', 'Route', 'Service / Model', 'Response'],
    securityNote:
      'Endpoints and payload examples are a practical route map, not a substitute for checking the deployed API contract. Sensitive routes always rely on backend role checks; a UI-only route guard is not authorization.',
    modules: [
      {
        kind: 'middleware',
        name: 'authenticate',
        purpose:
          'Reads the httpOnly session cookie or Bearer token, verifies JWT/sessionVersion, checks active user/org, and attaches req.user + permissions.',
        sender: 'CRM / platform / protected client',
        receiver: 'Route handler through req.user',
      },
      {
        kind: 'middleware',
        name: 'requirePerm + requireWritableOrg',
        purpose:
          'Checks the central role-permission matrix; write guards also stop mutations for read-only/suspended organisations.',
        sender: 'Authenticated route',
        receiver: 'Permission decision + route continuation or 401/403',
      },
      {
        kind: 'middleware',
        name: 'authenticateDevice / optionalDeviceAuth',
        purpose:
          'Validates a booth/device credential for protected device flows; optional mode supports public/guest compatible routes.',
        sender: 'Android, iPad, Electron booth',
        receiver: 'Device-scoped route handlers',
      },
      {
        kind: 'service',
        name: 'planService',
        purpose:
          'Resolves plan catalogue, subscription state, entitlements, limits and expiry dates used by onboarding and CRM.',
        sender: 'Auth, platform, booth, website API',
        receiver: 'Subscription and organization models',
      },
      {
        kind: 'service',
        name: 'eventService + boothSnapshotService',
        purpose:
          'Calculates event/device status and assembles booth bootstrap/revision snapshots for connected clients.',
        sender: 'CRM and booth API routes',
        receiver: 'Event, Device, Organization and settings data',
      },
      {
        kind: 'service',
        name: 'guestDownloadService + photoUrlService',
        purpose:
          'Creates time-limited guest access and resolves photo URLs through the active media adapter.',
        sender: 'Booth completion / guest delivery',
        receiver: 'GuestDownload, Photo and Cloudinary-backed storage',
      },
      {
        kind: 'service',
        name: 'gallerySettingsService',
        purpose: 'Reads and saves platform gallery policy, with changes applied to organization defaults.',
        sender: 'Platform CRM route',
        receiver: 'Gallery settings and organization models',
      },
      {
        kind: 'utility',
        name: 'auditLogger + httpError',
        purpose:
          'Writes actor/action audit events and formats async route errors as consistent HTTP responses.',
        sender: 'Auth and CRM mutation handlers',
        receiver: 'AuditLog and Express error response',
      },
      {
        kind: 'utility',
        name: 'cloudinary / printHelper / schemaGuards',
        purpose:
          'Media upload and URL helpers, print payload helpers, and startup-time model/schema compatibility diagnostics.',
        sender: 'Session/media paths and backend startup',
        receiver: 'Cloudinary, local print payload consumers, Mongoose models',
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture',
    icon: '◈',
    view: 'graph',
    graphHeading: 'Follow a HappyPix request',
    graphHelp:
      'Select any node to see what it owns, what it talks to, and where the failure modes are. Pan by dragging, zoom with the wheel or the toolbar.',
    tags: ['Interactive map', 'System view'],
    description:
      'A platform-only map of the booth, CRM, main API, persistence and external services — and the decisions behind each seam.',
    nodes: [
      {
        id: 'website',
        label: 'Public website',
        type: 'client',
        icon: '◌',
        x: 45,
        y: 42,
        detail:
          'React + Vite customer site: plans, product information, contact intake and guest-facing downloads. Static, deployed to Vercel, and it talks to the website API — never to the main CRM API.',
        talks: ['Website API'],
        owns: ['Plans and pricing display', 'Contact and demo intake', 'Guest download landing'],
        fails:
          'If the website API is down, plans and checkout stop but the marketing pages still render — they are static assets.',
      },
      {
        id: 'website-api',
        label: 'Website API',
        type: 'service',
        icon: '↗',
        x: 245,
        y: 42,
        detail:
          'Separate Express app on its own Vercel project. It owns public plans, checkout and guest downloads, and writes to the same MongoDB collections as the main backend.',
        talks: ['Public website', 'MongoDB Atlas', 'Payment providers'],
        owns: ['Subscription checkout', 'Public plan catalogue', 'Guest download serving'],
        fails:
          'The most duplicated surface in the system: business rules that exist here also exist in the main API. Change one, check the other.',
      },
      {
        id: 'crm',
        label: 'CRM · org + platform',
        type: 'client',
        icon: '▤',
        x: 45,
        y: 205,
        detail:
          'React CRM with two audiences in one app: organisation workspaces and the platform console. The menu is filtered by the role matrix, and every one of those pages is backed by a route that re-checks the same permission.',
        talks: ['Express API'],
        owns: ['Event setup', 'Device pairing', 'Templates, gallery, revenue', 'Platform operations'],
        fails:
          'A hidden menu item is not security. If a page renders for the wrong role, the server is still refusing the data — check the permission, not the button.',
      },
      {
        id: 'mobile',
        label: 'Booth · Android + iPad',
        type: 'client',
        icon: '▣',
        x: 45,
        y: 365,
        detail:
          'React Native booth app. Pairs as a device, then runs the guest flow: capture, choose, pay, print, share. It holds a device credential, not a user login.',
        talks: ['Express API', 'Camera', 'Printer'],
        owns: ['Guest capture flow', 'Device heartbeat', 'Session completion'],
        fails:
          'Loses the network and it still takes photos and prints; it cannot upload, take payment or mint a download link until the connection returns.',
      },
      {
        id: 'electron',
        label: 'Booth · Electron',
        type: 'client',
        icon: '▣',
        x: 245,
        y: 365,
        detail:
          'Windows kiosk. Owns the deepest hardware paths: Nikon over USB through the bundled SDK, and printing through the Windows print queue. The other booths borrow that PC over the network when they need those paths.',
        talks: ['Express API', 'Camera over USB', 'OS print queue'],
        owns: ['USB tethering', 'Local print bridge', 'Kiosk session'],
        fails:
          'This is the single point of failure for a mixed fleet. If the Windows PC goes down, the tablets that depend on its bridge lose printing with it.',
      },
      {
        id: 'gateway',
        label: 'Express API',
        type: 'service',
        icon: '⌘',
        x: 380,
        y: 205,
        detail:
          'The main backend. CORS and security middleware, MongoDB connection, then the route namespaces: /api/auth, /api/org, /api/platform, /api/booth, /api/events, /api/devices, /api/settings, /api/payments, /api/support, /api/share, /api/downloads, /api/usage-access and /api/docs.',
        talks: ['CRM', 'Both booths', 'MongoDB Atlas', 'Product services'],
        owns: ['Authentication and permissions', 'Every org and platform route', 'Device authentication'],
        fails:
          'Deployed as serverless functions on Vercel, so there is no in-process state to rely on: no in-memory cache, no timer that survives between requests, no sticky session.',
      },
      {
        id: 'auth',
        label: 'Auth + permissions',
        type: 'service',
        icon: '◇',
        x: 445,
        y: 42,
        detail:
          'One middleware reads the httpOnly hp_admin_token cookie and falls back to a Bearer token, verifies the JWT and the user sessionVersion, then confirms the user and their organisation are active. requirePerm then checks the role matrix.',
        talks: ['Express API', 'MongoDB Atlas'],
        owns: ['Session lifecycle', 'The role matrix', 'Device credentials', 'Permission checks'],
        fails:
          'A session is invalidated by bumping sessionVersion — sign-out does that, so a copied token dies with it. Docs access is its own permission (platform.docs.view), deliberately narrower than the platform dashboard.',
      },
      {
        id: 'services',
        label: 'Product services',
        type: 'service',
        icon: '⚙',
        x: 590,
        y: 205,
        detail:
          'The behaviour behind the routes: planService for entitlements and limits, eventService and boothSnapshotService for what a booth is told, guestDownloadService and photoUrlService for delivery, gallerySettingsService for policy, and auditLogger for the trail.',
        talks: ['Express API', 'MongoDB Atlas', 'Cloudinary', 'Payment providers'],
        owns: ['Plan entitlements', 'Booth bootstrap payload', 'Guest delivery', 'Gallery policy'],
        fails:
          'Services are where rules are actually enforced, so a route that skips one is a route with a hole. Prefer fixing a service over patching a handler.',
      },
      {
        id: 'mongo',
        label: 'MongoDB Atlas',
        type: 'data',
        icon: '◉',
        x: 800,
        y: 205,
        detail:
          '25 models and 466 schema fields, all scoped to an organisation except the platform records. The one shared dependency between the two backends — which is why they must agree on field names.',
        talks: ['Express API', 'Website API'],
        owns: [
          'Organisations and users',
          'Events, devices, subscriptions',
          'Payments and photos',
          'Guest downloads and audit',
        ],
        fails:
          'The read limits of a shared tier show up as p95 latency long before anything errors. Watch CPU and working set, not just connection count.',
      },
      {
        id: 'cloudinary',
        label: 'Cloudinary',
        type: 'data',
        icon: '▧',
        x: 800,
        y: 365,
        detail:
          'The active image storage and delivery adapter. Photos are uploaded from the booth paths and served to guests as signed, time-limited URLs.',
        talks: ['Product services'],
        owns: ['Photo bytes', 'Image transformations', 'Signed delivery'],
        fails:
          'Bytes are the bill. Guests receive full-size originals unless the delivery path generates a web-sized variant first — that is the cheapest lever in the system.',
      },
      {
        id: 'payments',
        label: 'Payment providers',
        type: 'service',
        icon: '₹',
        x: 590,
        y: 365,
        detail:
          'Razorpay and Cashfree. Events can carry their own credentials and a gateway priority, so a single organisation can prefer one provider while falling back to the other.',
        talks: ['Product services', 'Payment models'],
        owns: ['Order creation', 'Signature verification', 'Settlement reports'],
        fails:
          'Provider secrets are encrypted at rest on the event and decrypted with the app key. Rotating that key without re-encrypting makes every stored secret unreadable.',
      },
      {
        id: 'messaging',
        label: 'Email / SMS / AI',
        type: 'service',
        icon: '✉',
        x: 645,
        y: 42,
        detail:
          'Optional outbound integrations: transactional email through SendGrid, SMS/WhatsApp, and the AI template generation path. Each is called only when its credentials are configured.',
        talks: ['Product services'],
        owns: ['Transactional email', 'Notifications', 'AI template generation'],
        fails:
          'Every one of these is a third-party latency you do not control. They belong behind a queue once a slow provider starts blocking a guest flow.',
      },
    ],
    seams: [
      {
        title: 'Two backends, one database',
        body: 'The website API and the main API are separate deployments sharing MongoDB. That is a real risk, not a detail: neither can assume the other validated a field. The atlas lists both so a change can be traced across the seam.',
      },
      {
        title: 'Two kinds of caller',
        body: 'A person holds a session cookie and a role. A booth holds a device credential and an assigned event. The middleware for each is different, and a route that accepts one must not silently accept the other.',
      },
      {
        title: 'Where photos actually live',
        body: 'MongoDB stores metadata and references. The bytes are in Cloudinary. That distinction is what makes the photo collection small and the delivery bill large.',
      },
      {
        title: 'What serverless costs you',
        body: 'No in-process timers, no warm cache, no shared mutex across instances. Expiry and cleanup are scheduled jobs; the in-flight session lock is per-instance, not global.',
      },
      {
        title: 'Hardware is the edge',
        body: 'Cameras and printers sit outside the platform. The Windows PC is the only path to a Nikon over USB, and its print bridge is what the other booths borrow — so it is a dependency, not a convenience.',
      },
      {
        title: 'Devices are the trust boundary',
        body: 'A paired booth can upload sessions and take payment for its assigned event. It cannot read another organisation’s data, and its credential is not a user session.',
      },
    ],
    edges: [
      ['website', 'website-api', 'public API'],
      ['website-api', 'mongo', 'shared data'],
      ['crm', 'gateway', 'CRM API'],
      ['mobile', 'gateway', 'device API'],
      ['electron', 'gateway', 'device API'],
      ['gateway', 'auth', 'guard'],
      ['gateway', 'services', 'routes'],
      ['services', 'mongo', 'read/write'],
      ['services', 'cloudinary', 'media'],
      ['services', 'payments', 'checkout'],
      ['services', 'messaging', 'notifications'],
    ],
  },
  {
    id: 'db-schema',
    title: 'DB Schema',
    icon: '◉',
    view: 'graph',
    graphHeading: 'Explore the data relationships',
    graphHelp:
      'All 25 models on one canvas. Select any of them for its fields, references and index coverage; the full field atlas for every model sits underneath.',
    tags: ['Interactive map', 'MongoDB'],
    description:
      'Every persisted model in the platform, how they reference each other, and the field-level detail for each one.',
    footnote:
      'Lines show the references declared in the schemas. Plenty of records also carry an organizationId that is not drawn, because it would turn the map into a hairball — the atlas below lists every field, including those.',
    // The canvas layout is hand-placed in world coordinates so the
    // graph reads as a diagram rather than a spring layout. Every
    // model appears; the atlas adds the fields.
    nodes: [
      {
        id: 'organization',
        label: 'Organization',
        type: 'data',
        icon: '🏢',
        x: 40,
        y: 200,
        fields: ['name', 'status', 'plan'],
        detail:
          'The tenant root. Almost every operational query is scoped by organizationId, which is why it sits in the middle of the map rather than at the top.',
      },
      {
        id: 'organizationdefaults',
        label: 'OrganizationDefaults',
        type: 'data',
        icon: '⚙',
        x: 40,
        y: 40,
        fields: ['logoUrl', 'branding'],
        detail:
          'One per organisation: branding, gallery policy and the defaults new events inherit. Separate from Organization so a tenant can change presentation without touching billing.',
      },
      {
        id: 'subscription',
        label: 'Subscription',
        type: 'data',
        icon: '▱',
        x: 40,
        y: 360,
        fields: ['plan', 'status', 'endDate'],
        detail:
          'The live subscription for an organisation: which plan, whether it is active, and when it ends. Entitlement checks read this, not the plan catalogue.',
      },
      {
        id: 'subscriptionplan',
        label: 'SubscriptionPlan',
        type: 'data',
        icon: '▤',
        x: 240,
        y: 470,
        fields: ['key', 'price', 'devices', 'events'],
        detail:
          'The catalogue a Subscription points at. Edited on the platform plans page, sold through website checkout, and read by the booth for limits.',
      },
      {
        id: 'user',
        label: 'User',
        type: 'data',
        icon: '◉',
        x: 240,
        y: 200,
        fields: ['email', 'role', 'organizationId'],
        detail:
          'A CRM identity. Platform roles carry no organizationId; organisation roles always do. sessionVersion is the sign-out lever.',
      },
      {
        id: 'roleconfig',
        label: 'RoleConfig',
        type: 'data',
        icon: '◇',
        x: 240,
        y: 40,
        fields: ['role', 'permissions'],
        detail:
          'Per-role overrides layered on the code-level matrix. Small, but it is why the docs guide resolves roles from the matrix rather than hard-coding them.',
      },
      {
        id: 'event',
        label: 'Event',
        type: 'data',
        icon: '✳',
        x: 440,
        y: 200,
        fields: ['name', 'startDate', 'status', 'layoutPrices'],
        detail:
          'The biggest schema in the system, and deliberately so: it carries pricing snapshots, branding, gateway credentials and booth behaviour for one night.',
      },
      {
        id: 'template',
        label: 'Template',
        type: 'data',
        icon: '❖',
        x: 440,
        y: 40,
        fields: ['name', 'category', 'layoutId'],
        detail:
          'A design guests can pick. Shared templates live in the platform library; custom ones belong to one organisation.',
      },
      {
        id: 'templatelayout',
        label: 'TemplateLayout',
        type: 'data',
        icon: '▦',
        x: 440,
        y: 340,
        fields: ['paper', 'slots'],
        detail:
          'Print geometry: how many photos per sheet and at what size. A template references one, and the printer prints one.',
      },
      {
        id: 'orgaitemplate',
        label: 'OrgAiTemplate',
        type: 'data',
        icon: '✦',
        x: 640,
        y: 40,
        fields: ['organizationId', 'prompt'],
        detail:
          'AI-generated designs scoped to a single organisation. Kept apart from Template so a generation experiment never enters the shared library by accident.',
      },
      {
        id: 'device',
        label: 'Device',
        type: 'data',
        icon: '▣',
        x: 640,
        y: 200,
        fields: ['deviceName', 'assignedEventId', 'lastSeenAt'],
        detail:
          'A paired booth. It holds a hashed device token and an assigned event; the booth reads its configuration from that pairing, not from a user session.',
      },
      {
        id: 'photo',
        label: 'Photo',
        type: 'data',
        icon: '▧',
        x: 840,
        y: 40,
        fields: ['sessionId', 'url', 'eventId'],
        detail:
          'Metadata and a reference. The bytes are in Cloudinary — which is why this collection stays small while the delivery bill does not.',
      },
      {
        id: 'photoshare',
        label: 'PhotoShare',
        type: 'data',
        icon: '↗',
        x: 840,
        y: 200,
        fields: ['token', 'expiresAt', 'photoUrls'],
        detail:
          'The shareable link a guest is handed. Time-limited by design, so photos are not reachable forever from a forwarded message.',
      },
      {
        id: 'guestdownload',
        label: 'GuestDownload',
        type: 'data',
        icon: '↓',
        x: 840,
        y: 340,
        fields: ['downloadId', 'payloadFingerprint', 'expiresAt'],
        detail:
          'The durable guest delivery record behind the QR code, including a fingerprint of what was submitted so a retried upload is idempotent rather than duplicated.',
      },
      {
        id: 'deliveryrecord',
        label: 'DeliveryRecord',
        type: 'data',
        icon: '⇩',
        x: 840,
        y: 470,
        fields: ['sessionId', 'status'],
        detail:
          'Transport-level delivery state — what was handed to the guest and whether it succeeded. Separate from the link itself so a failed delivery is visible.',
      },
      {
        id: 'payment',
        label: 'Payment',
        type: 'data',
        icon: '₹',
        x: 640,
        y: 340,
        fields: ['gateway', 'amount', 'status'],
        detail:
          'A provider transaction tied to an organisation and an event. Settlement is recorded here, which is what the revenue pages read.',
      },
      {
        id: 'withdrawal',
        label: 'Withdrawal',
        type: 'data',
        icon: '⇡',
        x: 640,
        y: 470,
        fields: ['amount', 'status'],
        detail:
          'An organisation moving its balance out. Distinct from a Payment: money is going to the client, not from a guest.',
      },
      {
        id: 'coupon',
        label: 'Coupon',
        type: 'data',
        icon: '🏷',
        x: 240,
        y: 340,
        fields: ['code', 'discountType', 'value'],
        detail:
          'A discount a client hands out. A percentage or a flat amount, with an expiry and a redemption count.',
      },
      {
        id: 'digitaltoken',
        label: 'DigitalToken',
        type: 'data',
        icon: '◈',
        x: 40,
        y: 470,
        fields: ['token', 'used'],
        detail:
          'A one-time credential for the digital delivery path, so an unlocked download cannot be replayed by someone reading over a shoulder.',
      },
      {
        id: 'supportticket',
        label: 'SupportTicket',
        type: 'data',
        icon: '?',
        x: 440,
        y: 470,
        fields: ['subject', 'status', 'adminNotes'],
        detail: 'A guest complaint, resolved by the client. Notes are internal to the organisation.',
      },
      {
        id: 'platformsupportrequest',
        label: 'PlatformSupportRequest',
        type: 'data',
        icon: '☎',
        x: 440,
        y: 600,
        fields: ['subject', 'priority', 'status'],
        detail:
          'An organisation asking HappyPix for help. A different queue from the guest tickets above, with a different audience.',
      },
      {
        id: 'ticket',
        label: 'Ticket',
        type: 'data',
        icon: '🎫',
        x: 240,
        y: 600,
        fields: ['subject', 'status'],
        detail:
          'The older ticket shape, still present and still mounted. Worth knowing about before you assume PlatformSupportRequest is the only queue.',
      },
      {
        id: 'setting',
        label: 'Setting',
        type: 'data',
        icon: '⚙',
        x: 640,
        y: 600,
        fields: ['galleryEnabled', 'requireGuestConsent'],
        detail:
          'Gallery and consent policy. Organisations inherit a platform floor and may tighten it; this is the record both read.',
      },
      {
        id: 'auditlog',
        label: 'AuditLog',
        type: 'data',
        icon: '≋',
        x: 880,
        y: 600,
        fields: ['actorId', 'action', 'entity', 'at'],
        detail:
          'Append-only: who did what, to which entity, when, with a severity. organisationId null means a platform-level action. There is no delete path.',
      },
      {
        id: 'websitelead',
        label: 'WebsiteLead',
        type: 'data',
        icon: '✉',
        x: 1040,
        y: 200,
        fields: ['name', 'email', 'type', 'status'],
        detail:
          'A public enquiry from the website. Written by the website backend, read by the platform CRM — the clearest example of the two backends sharing a collection.',
      },
    ],
    edges: [
      ['organizationdefaults', 'organization', 'belongs to'],
      ['organization', 'subscription', 'has'],
      ['subscription', 'subscriptionplan', 'on plan'],
      ['organization', 'user', 'has'],
      ['user', 'roleconfig', 'role'],
      ['organization', 'event', 'owns'],
      ['organization', 'template', 'owns'],
      ['template', 'templatelayout', 'printed as'],
      ['organization', 'orgaitemplate', 'generates'],
      ['event', 'device', 'served by'],
      ['event', 'photo', 'captures'],
      ['photo', 'photoshare', 'shared as'],
      ['photo', 'guestdownload', 'delivered by'],
      ['guestdownload', 'deliveryrecord', 'tracked by'],
      ['event', 'payment', 'checkout'],
      ['payment', 'withdrawal', 'settles'],
      ['organization', 'coupon', 'issues'],
      ['organization', 'digitaltoken', 'unlocks'],
      ['organization', 'supportticket', 'raises'],
      ['organization', 'platformsupportrequest', 'requests'],
      ['organization', 'ticket', 'raises'],
      ['setting', 'organization', 'applies to'],
      ['device', 'auditlog', 'activity'],
      ['organization', 'auditlog', 'audit'],
      ['websitelead', 'organization', 'may become'],
    ],
  },
  {
    id: 'hosting-scaling',
    title: 'Hosting and scaling',
    icon: '↗',
    view: 'calculator',
    tags: ['Planning', 'Cost ranges'],
    description:
      'Current hosting shape, practical scale signals, budget bands and staffing assumptions for the next stages.',
    sectionTitles: {
      services: 'What is running today',
      budgets: 'Growth budget planner',
      triggers: 'When to add capacity',
      operations: 'Staffing and operating cost',
    },
    planningIntro:
      'These are planning bands, not vendor quotes. They assume roughly 100 event sessions per booth/month and about 60 MB delivered per session. One-time onboarding assumes ₹3k–₹10k per organisation plus ₹1.5k–₹5k per booth for remote setup/training; travel and customer hardware are extra. Staffed-operations bands are broad India-market planning envelopes, not salary quotes. Cloudinary plan, retention, geography and AI/message usage can move the bill substantially. INR amounts exclude GST and payment processing fees.',
    staffingNote:
      'Plan engineering and customer operations separately. A practical early team is a platform owner/engineer, a product engineer, and named customer-support coverage; add on-call rotation before the team becomes dependent on one person. The headcount notes above are capacity-planning ranges—not a hiring plan or salary quote. Hardware procurement, installs and travel are per-client/per-booth costs and should be quoted separately.',
    operatingReminder:
      'Track cost per active booth and per event session. Review API p95, database CPU/working set, image delivery, failed uploads, payment errors and ticket volume monthly. Migrate because a measured limit is close, not because a larger provider sounds safer.',
    warning:
      'Verify each account’s actual invoice and retention settings before committing to a budget. Cloudinary is the active media adapter in the current codebase; legacy S3 price scenarios are not a bill forecast for the deployed account.',
    services: [
      {
        name: 'Public website + CRM',
        kind: 'Static apps',
        icon: '◌',
        detail:
          'React/Vite frontends served as static assets/CDN. Keep static client delivery at the edge as usage grows.',
      },
      {
        name: 'Main backend API',
        kind: 'Serverless API',
        icon: '⌘',
        detail:
          'Express API deployed as serverless functions on Vercel; it handles CRM, booth and guest API namespaces.',
      },
      {
        name: 'Website backend API',
        kind: 'Serverless API',
        icon: '↗',
        detail:
          'A separate Express/Vercel API serves public plan, checkout and guest download flows against the shared database; deployment and duplicated rules should be reviewed together.',
      },
      {
        name: 'Database',
        kind: 'Managed database',
        icon: '◉',
        detail:
          'MongoDB Atlas shared operational database. Exact tier, region, backups and invoice must be confirmed in the production account.',
      },
      {
        name: 'Photo storage',
        kind: 'Media provider',
        icon: '▧',
        detail:
          'Current backend code uses Cloudinary-backed upload and delivery utilities. Older S3 references are not current account costs.',
      },
      {
        name: 'Booth + print bridge',
        kind: 'Customer hardware',
        icon: '▣',
        detail:
          'Android/iPad and Electron booth devices run on customer premises. Electron print bridge talks to the local OS printer queue.',
      },
      {
        name: 'Vercel Cron',
        kind: 'Scheduled function',
        icon: '◷',
        detail:
          'Expiry/cleanup jobs run on a schedule. Confirm the deployed cron configuration and required secrets; do not rely on an in-process timer in a serverless function.',
      },
      {
        name: 'Payments + notifications',
        kind: 'Third party',
        icon: '₹',
        detail:
          'Provider fees, email/SMS/WhatsApp and optional AI costs are usage/contract dependent and excluded from infrastructure bands unless stated.',
      },
    ],
    tiers: [
      {
        id: '10-50',
        clients: '10',
        booths: '50',
        status: 'now',
        statusLabel: 'EARLY OPERATIONS',
        cost: '₹55k–₹1.95L',
        cloudCost: '₹15k–₹45k',
        opsCost: '₹40k–₹1.5L',
        onboarding: '₹1.05L–₹3.5L',
        summary:
          'Approximate monthly run rate including lean cloud/vendor allowance plus 0.5–1.5 FTE of engineering/support coverage.',
        staff: '0.5–1.5 FTE · named support owner',
        trigger: 'Instrument actual photo delivery, DB headroom and ticket load.',
      },
      {
        id: '100-500',
        clients: '100',
        booths: '500',
        status: 'growth',
        statusLabel: 'GROWTH',
        cost: '₹3L–₹10L',
        cloudCost: '₹50k–₹2L',
        opsCost: '₹2.5L–₹8L',
        onboarding: '₹10.5L–₹35L',
        summary:
          'Monthly cloud/vendor allowance ₹50k–₹2L plus 3–6 FTE across engineering, support and operations.',
        staff: '3–6 FTE · on-call rotation begins',
        trigger: 'p95 latency, sustained DB pressure, image egress and incident frequency.',
      },
      {
        id: '500-5000',
        clients: '500',
        booths: '5,000',
        status: 'scale',
        statusLabel: 'SCALE',
        cost: '₹15L–₹52L',
        cloudCost: '₹3L–₹12L',
        opsCost: '₹12L–₹40L',
        onboarding: '₹90L–₹3Cr',
        summary:
          'Monthly cloud/vendor allowance ₹3L–₹12L plus 12–25 FTE across product engineering, platform and customer operations.',
        staff: '12–25 FTE · dedicated platform/on-call',
        trigger: 'API duration/invocation limits, DB CPU/working set, storage/egress bill.',
      },
      {
        id: '5000-50000',
        clients: '5,000',
        booths: '50,000',
        status: 'large',
        statusLabel: 'LARGE NETWORK',
        cost: '₹85L–₹3.7Cr',
        cloudCost: '₹25L–₹1.2Cr',
        opsCost: '₹60L–₹2.5Cr',
        onboarding: '₹9Cr–₹30Cr',
        summary:
          'Monthly cloud/vendor allowance ₹25L–₹1.2Cr plus 50–100 FTE. A multi-region product and support operation is likely.',
        staff: '50–100 FTE · platform, SRE, support, security',
        trigger: 'Regional latency/data residency, tenant isolation and operational ownership.',
      },
    ],
    triggers: [
      {
        when: 'Now · before scale',
        title: 'Make the bill observable',
        action:
          'Tag provider spend by service; track storage, delivered bytes, API invocation count, Atlas CPU/working set, payment failures and active booths. Confirm Cloudinary and Atlas invoices/retention.',
      },
      {
        when: 'Redis · only when measured',
        title: 'Add Redis for shared hot reads',
        action:
          'Use it when repeated plan/config reads materially load MongoDB, cache hit rate is poor across serverless instances, or p95 read latency is outside the SLO. Begin with plan/gallery/config data and short TTLs; never use it as the only source of truth.',
      },
      {
        when: 'Database threshold',
        title: 'Scale Atlas vertically first',
        action:
          'Consider a tier increase when CPU remains >60% for 15 minutes, working set exceeds ~60% RAM, or indexed-query p95 stays >100 ms after query/index review. Validate actual Atlas metrics and price first.',
      },
      {
        when: 'Image delivery threshold',
        title: 'Reduce bytes before moving providers',
        action:
          'Generate web-sized previews while retaining original downloads; model CDN/object-store pricing from actual monthly delivered GB. Evaluate Cloudflare/R2 or equivalent when delivery fees dominate the bill (for example >20 TB/month or >25% of total spend), after a dual-read/migration plan.',
      },
      {
        when: 'API threshold',
        title: 'Move long or sustained work off functions',
        action:
          'Consider Cloud Run or another managed container when warm p95 exceeds ~800 ms, function invocations exceed ~5M/month, or jobs need >60 seconds. Keep the same Express contract where practical; run a traffic/ops pilot first.',
      },
      {
        when: 'Operations threshold',
        title: 'Add queues and staffed on-call',
        action:
          'Move notifications, image variants and other retryable slow work to a queue when provider latency blocks guest flows or p95 exceeds the experience target. Establish incident response, restores and rotation before adding regions.',
      },
    ],
  },
];

router.use((req, res, next) => {
  res.set('Cache-Control', 'private, no-store, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Vary', 'Authorization, Cookie');
  next();
});

// Owner and Platform Admin only. This payload carries the complete API
// surface, every schema and the cost model — deliberately narrower
// than the platform dashboard, which Support Managers also reach.
router.use(authenticate, requirePerm(PERMS.PLATFORM_DOCS_VIEW));

/**
 * Shape the generated route list for the viewer.
 *
 * Deliberately drops `file` and `line`: the docs are read by people
 * who need to know what an endpoint does, and a line number in a
 * generated file is noise that goes stale between deploys. Purpose,
 * who calls it, what it reads and what it returns is the useful part.
 */
function routeAtlas() {
  return ATLAS_ROUTES.filter((route) => route.mounted).map((route) => ({
    backend: route.backend,
    group: route.group,
    method: route.method,
    path: route.path,
    purpose: route.purpose,
    section: route.section || null,
    permission: route.permission,
    guards: [
      route.writableOrg ? 'writable org' : null,
      route.deviceAuth ? 'device auth' : null,
      route.auth ? 'session' : null,
    ].filter(Boolean),
    derived: route.derived === true,
    // A typed spec: field, type, required, default, note.
    request: {
      body: route.request?.body || [],
      query: route.request?.query || [],
      params: route.request?.params || [],
    },
    // The primary success payload, plus every status the handler can
    // return and the errors it raises.
    response: {
      status: route.responses?.[0]?.status || 200,
      fields: route.responses?.[0]?.fields || [],
      payloads: (route.responses || []).map((payload) => ({
        status: payload.status,
        fields: payload.fields,
      })),
      statuses: route.statuses || [],
      errors: route.errors || [],
    },
    models: route.models || [],
    // Outside services this handler actually reaches, resolved through
    // the helpers and services it calls.
    tools: (route.tools || []).map((tool) => ({
      name: tool.name,
      kind: tool.kind,
      note: tool.note,
    })),
  }));
}

/** Every model, with the field metadata mongoose actually holds. */
function schemaAtlas() {
  return ATLAS_MODELS.map((model) => ({
    name: model.name,
    collection: model.collection,
    summary: model.summary,
    refs: model.refs || [],
    indexedFields: model.indexedFields || 0,
    fields: (model.fields || []).map((field) => ({
      field: field.field,
      type: field.type,
      ref: field.ref || null,
      required: field.required === true,
      unique: field.unique === true,
      indexed: field.indexed === true,
      enum: field.enum || null,
      default: field.default ?? null,
      min: field.min ?? null,
      max: field.max ?? null,
    })),
  }));
}

router.get('/private', async (req, res) => {
  // Every read of the internals map is written to the audit trail, so
  // who opened it and when is answerable after the fact.
  writeAudit({
    req,
    action: 'platform.docs.viewed',
    entity: 'documentation',
    summary: `Opened the platform field guide (${ATLAS_ROUTES.filter((r) => r.mounted).length} routes, ${ATLAS_MODELS.length} models)`,
    severity: 'info',
  }).catch(() => {
    /* a failed audit write must never take the docs endpoint down */
  });

  const mounted = ATLAS_ROUTES.filter((route) => route.mounted);
  const models = schemaAtlas();

  // The audit read is best-effort: if the database is unreachable the
  // documentation itself must still load. An empty trail is honest
  // about that; a 500 on the page is not.
  const audit = await recentAudit(40).catch(() => []);

  const withData = pages.map((page) => {
    if (page.id === 'backend-backrooms') return { ...page, routes: routeAtlas() };
    if (page.id === 'db-schema') return { ...page, models };
    return page;
  });

  res.json({
    navigationTitle: 'Platform notes',
    generated: {
      routes: mounted.length,
      mainRoutes: mounted.filter((route) => route.backend === 'main').length,
      websiteRoutes: mounted.filter((route) => route.backend === 'website').length,
      unmounted: ATLAS_ROUTES.filter((route) => !route.mounted).length,
      models: ATLAS_MODELS.length,
      fields: ATLAS_MODELS.reduce((sum, model) => sum + model.fields.length, 0),
    },
    pages: [
      ...withData,
      {
        id: 'platform-crm',
        title: 'Platform CRM',
        icon: '▤',
        view: 'crm-guide',
        tags: ['Platform team', 'Page by page'],
        description:
          'Every screen in the CRM, what it is for, who can open it and how to work with it. The access column is resolved from the same role matrix the app uses to hide the menu item.',
        screens: crmScreens(),
        roles: Object.values(ROLES).map((role) => ({
          role,
          label: ROLE_LABELS[role] || role,
          scope: isPlatformRole(role) ? 'platform' : 'organisation',
          pages: crmScreens().filter((screen) => screen.roles.includes(role)).length,
        })),
        securityNote:
          'Hiding a menu item is not authorisation. Every one of these pages is backed by a route that checks the same permission server-side, and a role without it gets a 403 whether or not the menu was drawn.',
      },
      {
        id: 'audit-log',
        title: 'Audit log',
        icon: '≋',
        view: 'audit',
        tags: ['Platform team', 'Accountability'],
        description:
          'The most recent forty audited actions, newest first. Written server-side through utils/auditLogger.js — the client cannot forge an entry and there is no delete path.',
        entries: audit,
        securityNote:
          'Severity is informational triage, not a security control. Read the action and the entity, and follow the actor into their record when something looks wrong.',
      },
    ],
  });
});

export default router;

// Exported for tests/documentationAuth.test.js and docsPayload.test.js.
// These build the reader-facing shape; exercising the real functions is
// the only way to prove that `file`/`line` never reach the browser.
export { routeAtlas, schemaAtlas };
