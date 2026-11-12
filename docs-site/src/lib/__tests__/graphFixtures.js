// ─────────────────────────────────────────────────────────────────
//  GENERATED — the shipped graph layouts, extracted from
//  backend/routes/documentationRoutes.js so the canvas tests assert
//  against the real coordinates rather than a copy that drifts.
//
//  node /tmp/mkfix.mjs  (regenerate)
// ─────────────────────────────────────────────────────────────────

export const ATLAS_NODES = [
  {
    name: 'architecture',
    nodes: [
      {
        id: 'website',
        x: 45,
        y: 42,
      },
      {
        id: 'website-api',
        x: 245,
        y: 42,
      },
      {
        id: 'crm',
        x: 45,
        y: 205,
      },
      {
        id: 'mobile',
        x: 45,
        y: 365,
      },
      {
        id: 'electron',
        x: 245,
        y: 365,
      },
      {
        id: 'gateway',
        x: 380,
        y: 205,
      },
      {
        id: 'auth',
        x: 445,
        y: 42,
      },
      {
        id: 'services',
        x: 590,
        y: 205,
      },
      {
        id: 'mongo',
        x: 800,
        y: 205,
      },
      {
        id: 'cloudinary',
        x: 800,
        y: 365,
      },
      {
        id: 'payments',
        x: 590,
        y: 365,
      },
      {
        id: 'messaging',
        x: 645,
        y: 42,
      },
    ],
    edges: [
      ['website', 'website-api'],
      ['website-api', 'mongo'],
      ['crm', 'gateway'],
      ['mobile', 'gateway'],
      ['electron', 'gateway'],
      ['gateway', 'auth'],
      ['gateway', 'services'],
      ['services', 'mongo'],
      ['services', 'cloudinary'],
      ['services', 'payments'],
      ['services', 'messaging'],
    ],
  },
  {
    name: 'db-schema',
    nodes: [
      {
        id: 'organization',
        x: 45,
        y: 42,
      },
      {
        id: 'user',
        x: 290,
        y: 42,
      },
      {
        id: 'subscription',
        x: 290,
        y: 180,
      },
      {
        id: 'event',
        x: 290,
        y: 330,
      },
      {
        id: 'device',
        x: 540,
        y: 180,
      },
      {
        id: 'photo',
        x: 790,
        y: 42,
      },
      {
        id: 'download',
        x: 790,
        y: 180,
      },
      {
        id: 'payment',
        x: 790,
        y: 330,
      },
      {
        id: 'audit',
        x: 540,
        y: 330,
      },
      {
        id: 'support',
        x: 540,
        y: 42,
      },
    ],
    edges: [
      ['organization', 'user'],
      ['organization', 'subscription'],
      ['organization', 'event'],
      ['organization', 'device'],
      ['event', 'device'],
      ['event', 'photo'],
      ['event', 'payment'],
      ['photo', 'download'],
      ['device', 'audit'],
      ['organization', 'support'],
    ],
  },
];
