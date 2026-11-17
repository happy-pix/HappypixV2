// ─────────────────────────────────────────────────────────────────
//  CRM walkthrough content.
//
//  Page names and routes are the real organisation workspace from
//  crm/src/App.jsx — Dashboard, Events & devices, Templates,
//  Custom templates, Defaults, Coupons, Gallery, Revenue, Team,
//  Support. Nothing here is invented.
//
//  Rendered by components/CrmScreen.jsx inside a browser frame, so
//  a client can be walked through the workspace before they have
//  ever signed in.
// ─────────────────────────────────────────────────────────────────

export const CRM_STEPS = [
  {
    id: 'signin',
    nav: null,
    title: 'Sign in to your workspace',
    what: 'Your workspace is where the business side of HappyPix lives. Booths run the event; this is where you prepare for it.',
    you: 'You sign in with the credentials HappyPix gives you when your subscription starts. Everyone on your team gets their own.',
    tip: 'Bookmark it. You will use it far more than you expect in the first month.',
    mock: { kind: 'signin' },
  },
  {
    id: 'dashboard',
    nav: 'Dashboard',
    title: 'Today, at a glance',
    what: 'The first thing you see. What is running, what is coming up, and whether your booths are online.',
    you: 'Upcoming events, booth status, prints and takings for the period. If a booth is offline, it says so here before the client calls you.',
    tip: 'Open this on the morning of an event. Thirty seconds tells you whether you are ready.',
    mock: {
      kind: 'dashboard',
      stats: [
        ['Events this month', '8'],
        ['Booths online', '3 of 3'],
        ['Prints', '1,284'],
        ['Takings', '₹1,86,400'],
      ],
    },
  },
  {
    id: 'events',
    nav: 'Events & devices',
    title: 'Create the event',
    what: 'Every booth session belongs to an event. The event holds the date, the branding, the pricing and which booth is serving it.',
    you: 'Name it, date it, and choose what the guest experience includes. This is the screen everything else hangs off.',
    tip: 'Create the event as soon as the booking is confirmed, even if the details are still rough. You can refine it right up to the day.',
    mock: {
      kind: 'events',
      rows: [
        ['Sunset Weddings · Aanya & Rohan', '12 Dec', 'Paired', 'Live in 4 days'],
        ['Pika Events · Product launch', '14 Dec', 'Paired', 'Live in 6 days'],
        ['Glow Booth Co. · Corporate', '21 Dec', 'Not paired', 'Needs a booth'],
      ],
    },
  },
  {
    id: 'event-settings',
    nav: 'Events & devices',
    title: 'Decide what guests get',
    what: 'Formats, designs, copies, finishing options, payments and digital downloads — all chosen here, per event.',
    you: 'Turn things on and off to match what you sold. A free corporate booth and a paid wedding booth are the same software with different switches.',
    tip: 'Copy the settings from a previous event rather than starting from nothing. Your second wedding should take two minutes.',
    mock: {
      kind: 'eventForm',
      fields: [
        ['Print formats', 'Portrait · Landscape'],
        ['Copies included', '2 per guest'],
        ['Paid extra copies', 'On · ₹100'],
        ['Guest photo download', 'On · 24 hours'],
        ['Finishing touches', 'On'],
      ],
    },
  },
  {
    id: 'devices',
    nav: 'Events & devices',
    title: 'Add a booth and pair it',
    what: 'A booth is a device. You register it here, then sign in on the device itself — that is the whole pairing.',
    you: 'Name each device something you will recognise at 11pm ("Booth 1 — silver case"), then sign into it at the venue and assign it to the event.',
    tip: 'Name your devices by the case they live in, not by the tablet model. You will be looking for a physical object, not a serial number.',
    mock: {
      kind: 'devices',
      rows: [
        ['Booth 1 · silver case', 'Android tablet', 'Online', 'Sunset Weddings'],
        ['Booth 2 · black case', 'iPad', 'Online', '—'],
        ['Kiosk PC · office', 'Windows', 'Offline', '—'],
      ],
    },
  },
  {
    id: 'templates',
    nav: 'Templates',
    title: 'The designs guests choose from',
    what: 'The frames your photos sit in. HappyPix ships a library; you pick which ones your events may use.',
    you: 'Browse the library, preview each design with your own branding, and choose the set your booths will offer.',
    tip: 'Pick a small set and reuse it. Consistent prints look like a brand; twenty designs look like a choice paralysis screen.',
    mock: { kind: 'templates' },
  },
  {
    id: 'custom-templates',
    nav: 'Custom templates',
    title: 'Put your own branding on the print',
    what: 'Your logo, your colours, your caption. The print is the only part of the night a guest takes home — make it yours.',
    you: 'Upload your artwork and build a design that carries it. Once saved, it behaves exactly like a library design.',
    tip: 'Send us your logo as a transparent PNG at a decent size. It is the difference between crisp and apologetic on a 6×8.',
    mock: { kind: 'custom' },
  },
  {
    id: 'defaults',
    nav: 'Defaults',
    title: 'Set it once, stop repeating it',
    what: 'Your standing preferences for new events — formats, copies, downloads, finishing. Everything you always choose the same way.',
    you: 'Set your defaults once. Every new event starts from them, so event setup becomes a review rather than a rebuild.',
    tip: 'Do this before your first event, not after your fifth.',
    mock: {
      kind: 'defaults',
      fields: [
        ['Default formats', 'Portrait'],
        ['Default copies', '2'],
        ['Guest download', 'On · 24 hours'],
        ['Default pricing', '₹200 per extra print'],
      ],
    },
  },
  {
    id: 'coupons',
    nav: 'Coupons',
    title: 'Discount codes guests can use',
    what: 'Codes for the paid copy flow. Useful for sponsors, for a host who wants the first round free, or for a quiet half hour.',
    you: 'Create a code, give it a discount, hand it out. The booth applies it at the payment screen.',
    tip: 'One code per sponsor. You will want to know later which one was actually used.',
    mock: {
      kind: 'coupons',
      rows: [
        ['WEDDING18', '18% off', '42 used'],
        ['SPONSOR-FREE', '100% off', '9 used'],
        ['HAPPYHOUR', '₹50 off', '17 used'],
      ],
    },
  },
  {
    id: 'gallery',
    nav: 'Gallery',
    title: 'Every photo, after the night',
    what: 'The full set from every session. For you to review, for a client to ask about, for a guest who lost their link.',
    you: 'Browse by event and date. This is the page that settles "can you send me the one from the table of eight".',
    tip: 'Check the gallery the morning after. If a booth had a bad hour, you will see it here before the client does.',
    mock: { kind: 'gallery' },
  },
  {
    id: 'revenue',
    nav: 'Revenue',
    title: 'What the night made',
    what: 'Prints sold, codes used, takings per event. The part that decides whether the booking was worth it.',
    you: 'Per-event and per-period figures. Compare a wedding against a corporate and you will start pricing differently.',
    tip: 'Look at revenue per booth hour, not per event. It is the number that tells you what to charge.',
    mock: {
      kind: 'revenue',
      rows: [
        ['Sunset Weddings · Aanya & Rohan', '412 prints', '₹74,200'],
        ['Pika Events · Product launch', '318 prints', '₹58,900'],
        ['Glow Booth Co. · Corporate', '296 prints', '₹53,300'],
      ],
    },
  },
  {
    id: 'team',
    nav: 'Team',
    title: 'Who can do what',
    what: 'Your people, and how much of the workspace each of them can reach.',
    you: 'Invite teammates and give each the role that matches the work. Organisation Admins look after the workspace; Organisation Managers run the day-to-day.',
    tip: 'Give the person who actually staffs the booth a Manager role. They need events and devices, not billing.',
    mock: {
      kind: 'team',
      rows: [
        ['Priya N.', 'Organisation Admin', 'Everything'],
        ['Arjun M.', 'Organisation Manager', 'Events, devices, gallery'],
        ['Neha S.', 'Organisation Manager', 'Events, devices'],
      ],
    },
  },
  {
    id: 'support',
    nav: 'Support',
    title: 'When you need a human',
    what: 'Raise a ticket from inside the workspace and the HappyPix team picks it up with your account context attached.',
    you: 'Describe the problem and, if you can, which event and which booth. That is usually enough for us to start.',
    tip: 'Screenshots beat descriptions. A photo of the screen with the phone is a perfectly good screenshot.',
    mock: { kind: 'support' },
  },
];

export const CRM_SIDEBAR = [
  'Dashboard',
  'Events & devices',
  'Templates',
  'Custom templates',
  'Defaults',
  'Coupons',
  'Gallery',
  'Revenue',
  'Team',
  'Support',
];

export const CRM_ROLE_NOTES = [
  {
    role: 'Organisation Admin',
    can: 'Everything in your workspace, including team, billing-facing settings and defaults.',
    give: 'The owner, and whoever covers for them.',
  },
  {
    role: 'Organisation Manager',
    can: 'Day-to-day running: events, devices, templates, gallery and support.',
    give: 'Anyone who staffs a booth or sets up an event.',
  },
];
