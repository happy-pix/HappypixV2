// ─────────────────────────────────────────────────────────────────
//  HappyPix 101 — the front door.
//
//  What the product is, how a booth actually runs, where to go next
//  in this guide, and the questions that get asked most. The contact
//  form lives on this page and only this page.
// ─────────────────────────────────────────────────────────────────

import { LINKS } from '../lib/links.js';

// Kept as a name because the content modules reference it, but the
// values are environment-driven now. See src/lib/links.js.
export const BRAND_LINKS = {
  pricing: LINKS.pricing,
  crm: LINKS.crm,
  software: LINKS.software,
  website: LINKS.website,
  contact: LINKS.contact,
};

export const WHAT_IT_IS = {
  lede: 'HappyPix is photo-booth software for people who run events. Your guests get a print in their hand and the full set on their phone. You get a workspace that runs the whole operation.',
  paragraphs: [
    'We are software first. That means HappyPix works with the cameras and printers the industry already uses, so you are not locked into buying a box from us. Bring an iPad, an Android tablet or a Windows PC, add a camera you already own, and you have a booth.',
    'Everything a guest touches happens in the booth app. Everything you touch happens in the CRM — events, branding, pricing, devices, the gallery and the numbers at the end of the night.',
  ],
};

export const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Choose a plan',
    body: 'Plans set how many booths you can run and how many events you can hold. Change it later as the business grows.',
    link: { label: 'See plans', href: BRAND_LINKS.pricing },
  },
  {
    n: '02',
    title: 'Set up the event',
    body: 'In the CRM: name the event, choose the designs, set the pricing, and pair the booth that will serve it.',
    link: { label: 'Read CRM 101', page: 'crm-101' },
  },
  {
    n: '03',
    title: 'Run the booth',
    body: 'Guests walk up, choose a design, get photographed, and collect a print. Nobody has to explain anything to them.',
    link: { label: 'Walk the booth', page: 'booth-101' },
  },
  {
    n: '04',
    title: 'Take it away',
    body: 'Every guest scans a code for the digital set, and every photo lands in your gallery for you to review afterwards.',
    link: { label: 'Read CRM 101', page: 'crm-101' },
  },
];

export const GUIDE_MAP = [
  {
    page: 'booth-101',
    title: 'Booth 101',
    readThisIf: 'You want to know what guests see and what each screen is for.',
    body: 'A clickable walkthrough of the real booth flow, screen by screen — welcome to print to the QR code at the end.',
    for: 'Anyone staffing a booth',
  },
  {
    page: 'crm-101',
    title: 'CRM 101',
    readThisIf: 'You are setting events up, or you have just been given a login.',
    body: 'A guided tour of your workspace: events, devices, templates, gallery, revenue and team roles.',
    for: 'Organisers and team leads',
  },
  {
    page: 'make-it-run',
    title: 'Make it run',
    readThisIf: 'You have hardware in front of you and need it working.',
    body: 'Answer four questions about your gear and get a setup guide for exactly that combination — cables, camera settings, printer and screen.',
    for: 'Whoever builds the booth',
  },
];

export const FAQ = [
  {
    q: 'Do I have to buy hardware from HappyPix?',
    a: 'No. HappyPix is software. You bring a tablet or a PC, a camera and a photo printer — most people start with gear they already own. The Make it run guide tells you exactly what works before you spend anything.',
  },
  {
    q: 'Which devices can run the booth?',
    a: 'Android tablets, iPad and Windows. The Windows app is the fullest of the three: it is the one that drives a camera over USB and prints to a printer plugged into the same machine.',
  },
  {
    q: 'Do I need a separate computer?',
    a: 'Only for some setups. If your camera is a Nikon, or your printer plugs into a PC, then yes — that PC runs the Windows app and the rest of your booths talk to it over the network. If you are on Wi-Fi Canon and a network printer, you do not need one.',
  },
  {
    q: 'Can my camera connect with a cable instead of Wi-Fi?',
    a: 'Yes, on Windows. Plug the camera into the PC with its USB cable and the app takes over — live view, shutter and the image back. Android can take a wired camera too, but that path captures without live view. iPad needs Wi-Fi or a PC.',
  },
  {
    q: 'Do I need to install camera drivers or an SDK?',
    a: 'No. The Canon and Nikon support is inside the app already — there is nothing to download and no driver disc. The one exception is a printer on Windows: add it in Windows once, because the app prints through the Windows print queue.',
  },
  {
    q: 'Does the booth need internet?',
    a: 'Signing in does, and so do payments, uploads and guest download links. Taking photos and printing do not — those stay on the device and your local network. A venue with poor Wi-Fi still gets prints.',
  },
  {
    q: 'How do guests get their photos afterwards?',
    a: 'A code appears at the end of the session. They scan it and get the full set on their phone. The link is time-limited on purpose, so photos are not sitting around indefinitely.',
  },
  {
    q: 'How many booths can I run?',
    a: 'Your plan sets the booth and event limits. You can change plan as you grow, and every booth you add is managed from the same workspace.',
  },
  {
    q: 'Who can see my photos and my numbers?',
    a: "Your organisation's people, according to the role you give them, and HappyPix for support. Guest download links expire. Nothing from your workspace is shared with other organisations.",
  },
  {
    q: 'What happens if the printer runs out mid-event?',
    a: 'The booth tells you — on DNP printers it reports paper and ribbon levels before they run out. If a print does fail, the digital photos are kept and the booth offers a retry, so nobody loses their pictures.',
  },
  {
    q: 'Can I use my own logo and designs?',
    a: 'Yes. Upload your artwork under Custom templates and it behaves like any other design, on every booth you run.',
  },
  {
    q: 'What if I get stuck at a venue?',
    a: 'Raise a ticket from inside your workspace and we pick it up with your account context attached. The Make it run guide also has a network section, which is where most venue problems actually live.',
  },
];

export const CONTACT_TOPICS = [
  { id: 'contact', label: 'A general question' },
  { id: 'demo', label: 'I would like a demo' },
  { id: 'hardware', label: 'Hardware and compatibility' },
  { id: 'support', label: 'Something is not working' },
];
