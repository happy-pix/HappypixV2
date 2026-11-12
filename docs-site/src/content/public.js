// ─────────────────────────────────────────────────────────────────
//  Public page registry.
//
//  Page bodies live in their own modules so this file stays a map:
//    brand.js      → HappyPix 101
//    boothFlow.js  → Booth 101
//    crmFlow.js    → CRM 101
//    hardware.js   → Make it run
// ─────────────────────────────────────────────────────────────────

export const publicPages = [
  {
    id: 'happypix-101',
    group: 'HappyPix 101',
    title: 'Welcome to HappyPix',
    icon: '✳',
    description:
      'What HappyPix is, how a booth runs, where to go next, and the questions people ask us most.',
    read: '4 min',
    tags: ['Start here', 'Overview', 'FAQ'],
    view: 'brand',
  },
  {
    id: 'booth-101',
    group: 'Booth 101',
    title: 'Inside the booth',
    icon: '▣',
    description:
      'A clickable walkthrough of the real guest flow — every screen, what it is for, and what you control from the CRM.',
    read: '7 min',
    tags: ['Guest flow', 'Walkthrough', 'Operator tips'],
    view: 'booth',
  },
  {
    id: 'crm-101',
    group: 'CRM 101',
    title: 'Your workspace',
    icon: '▤',
    description:
      'A guided tour of the organisation workspace: events, devices, templates, gallery, revenue and team roles.',
    read: '8 min',
    tags: ['Events', 'Devices', 'Team'],
    view: 'crm',
  },
  {
    id: 'make-it-run',
    group: 'Make it run',
    title: 'Build your booth',
    icon: '⌁',
    description:
      'Tell us what hardware you have and get a setup guide for exactly that — cables, camera settings, printer and screen.',
    read: '10 min',
    tags: ['Hardware', 'Cables', 'Wi-Fi', 'Compatibility'],
    view: 'setup',
  },
];

export const GROUP_ORDER = ['HappyPix 101', 'Booth 101', 'CRM 101', 'Make it run'];
