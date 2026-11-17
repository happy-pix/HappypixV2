// ─────────────────────────────────────────────────────────────────
//  Hardware catalogue — the single source of truth for the
//  compatibility matrix and the "Make it run" setup guides.
//
//  Every level below is decided by one rule, applied the same way
//  to every row:
//
//    tested      — the booth app talks to this model today through a
//                  path that is built and in use.
//    compatible  — the model rides a path we support (CCAPI, IPP,
//                  the Windows print queue). Expect it to work;
//                  confirm on your own unit before a paid event.
//    soon        — we are building it. Do not buy for it yet.
//
//  Paths named here match the providers in the booth apps:
//    client-app/packages/camera-core/src/providers/*
//    client-app/packages/printer-core/src/providers/*
//    electron/src/electron/{printServer,camera/*}.ts
// ─────────────────────────────────────────────────────────────────

export const LEVELS = {
  tested: {
    label: 'Tested',
    tone: 'green',
    blurb: 'Runs today. Set it up and go.',
  },
  compatible: {
    label: 'Compatible',
    tone: 'blue',
    blurb: 'Uses a path we support. Expect it to work — confirm on your own unit once.',
  },
  soon: {
    label: 'Coming soon',
    tone: 'amber',
    blurb: 'On our list and being built. Talk to us before you buy for it.',
  },
};

export const LEVEL_ORDER = ['tested', 'compatible', 'soon'];

// ── Booth hosts ──────────────────────────────────────────────────

export const HOSTS = [
  {
    id: 'android',
    label: 'Android tablet',
    short: 'Android',
    blurb: 'The booth app on a supported Android tablet. The tablet is the guest screen.',
    guestScreen: 'The tablet itself',
    printsThrough: 'A Windows PC on the same network, or a network printer',
    wiredCamera: 'USB-OTG capture only (no live view)',
    kioskNote:
      'The tablet is the guest screen, so most booths need nothing else. If you want a bigger picture for the crowd, mirror the tablet to a TV with a USB-C to HDMI adapter — touch still happens on the tablet.',
  },
  {
    id: 'ipad',
    label: 'iPad',
    short: 'iPad',
    blurb: 'The same booth app, built for iPad. The iPad is the guest screen.',
    guestScreen: 'The iPad itself',
    printsThrough: 'A Windows PC on the same network, or a network printer',
    wiredCamera: 'Not available — use Wi-Fi or a Windows PC',
    kioskNote:
      'The iPad is the guest screen. To show the booth on a larger display, use AirPlay or a USB-C to HDMI adapter; guests still tap the iPad.',
  },
  {
    id: 'windows',
    label: 'Windows app',
    short: 'Windows',
    blurb:
      'The full desktop booth. This is the host that speaks to a camera over USB and to a printer plugged into the PC.',
    guestScreen: 'Your laptop screen, or a second display in kiosk mode',
    printsThrough: 'The printer plugged into this PC',
    wiredCamera: 'Full control over USB, including live view',
    kioskNote:
      'Plug the guest display into the PC and the packaged app takes it over full screen by itself — no window borders, no taskbar.',
  },
];

// ── Camera connection paths ──────────────────────────────────────
//
//  `links` are the physical ways this path can be made. The setup
//  builder offers exactly these, and explains both when a client
//  asks "can I do it with wires instead?"

export const CAMERA_PATHS = {
  builtin: {
    id: 'builtin',
    name: 'Built-in camera',
    transport: 'None — it is already inside the device',
    links: ['builtin'],
    hosts: ['android', 'ipad'],
    port: null,
    intro:
      'The simplest possible booth. No cable, no camera settings, nothing to forget at the venue. Use it to learn the flow, then move to a real camera when you are ready.',
  },
  ccapi: {
    // key kept in sync with the `id` below; brands look paths up by id {
    id: 'ccapi',
    name: 'Canon CCAPI over Wi-Fi',
    transport: 'Wi-Fi — camera joins your network',
    links: ['wifi'],
    hosts: ['android', 'ipad', 'windows'],
    port: 8080,
    intro:
      'Canon cameras speak to HappyPix over your Wi-Fi using Canon CCAPI. The camera software is inside the booth app, so there is nothing to install on a computer. You get live view, remote shutter and the photo back in the session.',
  },
  'nikon-usb': {
    id: 'nikon-usb',
    name: 'Nikon over USB to a Windows PC',
    transport: 'USB cable into the Windows PC',
    links: ['wired-pc'],
    hosts: ['windows'],
    tabletBridge: true,
    port: 9123,
    intro:
      'The Nikon Remote SDK ships inside the Windows app — no separate download, no driver CD. Plug the camera into the PC with a USB cable and the app gets live view, shutter control and the image back.',
  },
  'ptp-android': {
    id: 'ptp-android',
    name: 'USB camera on Android (PTP)',
    transport: 'USB-OTG cable into the tablet',
    links: ['wired-tablet'],
    hosts: ['android'],
    port: null,
    intro:
      'A wired camera straight into the Android tablet. This path takes the photo and pulls the JPEG across. It does not show live view and cannot change camera settings, so frame your shot on the tablet preview.',
  },
  uvc: {
    id: 'uvc',
    name: 'USB webcam',
    transport: 'USB into the Windows PC',
    links: ['wired-pc'],
    hosts: ['windows'],
    port: null,
    intro:
      'Any standard USB webcam. Useful as a spare, for testing, or for booths where a compact camera is enough.',
  },
};

// ── Cameras, brand by brand ──────────────────────────────────────

export const CAMERA_BRANDS = [
  {
    id: 'canon',
    brand: 'Canon',
    path: 'ccapi',
    tagline: 'Wireless over CCAPI. Nothing to install.',
    models: [
      {
        id: 'canon-r5',
        model: 'EOS R5',
        level: 'tested',
        note: 'Mirrorless flagship. Live view and full image transfer.',
      },
      {
        id: 'canon-r6-ii',
        model: 'EOS R6 Mark II',
        level: 'tested',
        note: 'The event workhorse. Fast, reliable, great in low light.',
      },
      { id: 'canon-r7', model: 'EOS R7', level: 'tested', note: 'Crop-sensor mirrorless.' },
      { id: 'canon-r8', model: 'EOS R8', level: 'tested', note: 'Compact full-frame mirrorless.' },
      { id: 'canon-r10', model: 'EOS R10', level: 'tested', note: 'Light mirrorless, easy to rig.' },
      {
        id: 'canon-r50',
        model: 'EOS R50',
        level: 'tested',
        note: 'Entry mirrorless. A very common first booth camera.',
      },
      { id: 'canon-r100', model: 'EOS R100', level: 'tested', note: 'Entry mirrorless.' },
      {
        id: 'canon-90d',
        model: 'EOS 90D',
        level: 'tested',
        note: 'DSLR. Still a favourite on rental fleets.',
      },
      { id: 'canon-850d', model: 'EOS 850D / Rebel T8i', level: 'tested', note: 'DSLR.' },
      {
        id: 'canon-g7x-iii',
        model: 'PowerShot G7 X Mark III',
        level: 'tested',
        note: 'Pocket compact. Travels well.',
      },
      { id: 'canon-g5x-ii', model: 'PowerShot G5 X Mark II', level: 'tested', note: 'Pocket compact.' },
      {
        id: 'canon-rp',
        model: 'EOS RP / EOS R',
        level: 'compatible',
        note: 'First-generation R bodies. Same CCAPI path.',
      },
      {
        id: 'canon-m50-ii',
        model: 'EOS M50 Mark II',
        level: 'compatible',
        note: 'No CCAPI radio — connect it by USB to the Windows PC.',
      },
      { id: 'canon-250d', model: 'EOS 250D', level: 'compatible', note: 'Compact DSLR.' },
      {
        id: 'canon-2000d',
        model: 'EOS 2000D / 4000D',
        level: 'compatible',
        note: 'Entry DSLR. Connect by USB to the Windows PC.',
      },
    ],
  },
  {
    id: 'nikon',
    brand: 'Nikon',
    path: 'nikon-usb',
    tagline: 'USB into the Windows PC. SDK is inside the app.',
    models: [
      {
        id: 'nikon-d5600',
        model: 'D5600',
        level: 'tested',
        note: 'The body we build against. Live view, shutter and transfer over USB.',
      },
      {
        id: 'nikon-d-series',
        model: 'D3000 – D7000 series',
        level: 'compatible',
        note: 'Same USB path. Live view availability depends on the body.',
      },
      {
        id: 'nikon-z-series',
        model: 'Z series mirrorless',
        level: 'compatible',
        note: 'Same USB path. Confirm live view on your exact body.',
      },
    ],
  },
  {
    id: 'sony',
    brand: 'Sony',
    path: 'uvc',
    tagline: 'Tethering is being built. A webcam connection works today.',
    models: [
      {
        id: 'sony-alpha',
        model: 'Alpha a6000 – a7 series',
        level: 'soon',
        note: 'Direct tethering is on the way. Ask us before you buy for it.',
      },
    ],
  },
  {
    id: 'builtin',
    brand: 'Built-in',
    path: 'builtin',
    tagline: 'Already in the device. Zero wiring.',
    models: [
      {
        id: 'builtin-tablet',
        model: 'Android tablet camera',
        level: 'tested',
        note: 'Grant camera permission and go.',
      },
      { id: 'builtin-ipad', model: 'iPad camera', level: 'tested', note: 'Grant camera permission and go.' },
    ],
  },
  {
    id: 'webcam',
    brand: 'Webcam',
    path: 'uvc',
    tagline: 'Any standard USB webcam on the Windows app.',
    models: [
      {
        id: 'webcam-uvc',
        model: 'USB / UVC webcam',
        level: 'compatible',
        note: 'Plug into the PC, allow camera access, check the preview is the right camera.',
      },
    ],
  },
];

// ── Printer connection paths ─────────────────────────────────────

export const PRINTER_PATHS = {
  'bridge-usb': {
    id: 'bridge-usb',
    name: 'USB into the Windows PC',
    transport: 'USB cable into the PC running HappyPix',
    port: 9123,
    intro:
      'The printer plugs into the Windows PC with its own USB cable. HappyPix prints through Windows, and reads the printer back as well — paper remaining, ribbon level and lifetime prints show up in the booth.',
  },
  ipp: {
    id: 'ipp',
    name: 'Network printer (IPP)',
    transport: 'Ethernet or Wi-Fi to your network',
    port: 631,
    intro:
      'The printer sits on the same network as the booth and speaks IPP on port 631. No PC needed. Give the printer a fixed address on your router so it is always where the booth expects it.',
  },
  airprint: {
    id: 'airprint',
    name: 'AirPrint from the iPad',
    transport: 'Wi-Fi',
    port: 631,
    intro:
      'iPad printing goes through the iOS print sheet. It works, but iOS asks a person to confirm, so it is not a hands-off kiosk path. For an unattended booth, use the Windows route.',
  },
  'os-queue': {
    id: 'os-queue',
    name: 'Installed in Windows',
    transport: 'USB or network, added to Windows once',
    port: null,
    intro:
      'Add the printer to Windows once from Settings and HappyPix prints straight to it. This is the route for any dye-sub printer whose maker supplies a Windows driver.',
  },
};

// ── Printers, brand by brand ─────────────────────────────────────

export const PRINTER_BRANDS = [
  {
    id: 'dnp',
    brand: 'DNP',
    path: 'bridge-usb',
    tagline: 'Dye-sub photo printers. The booth reports paper and ribbon back to you.',
    models: [
      {
        id: 'dnp-rx1hs',
        model: 'DS-RX1HS',
        level: 'tested',
        sizes: '4×6, 2×6 strip, 5×7, 6×8',
        note: 'The rental-fleet favourite.',
      },
      {
        id: 'dnp-ds620a',
        model: 'DS620A',
        level: 'tested',
        sizes: '4×6, 5×7, 6×8',
        note: 'Fast, dry, smudge-free prints.',
      },
      {
        id: 'dnp-qw410',
        model: 'QW410',
        level: 'tested',
        sizes: '4×6',
        note: 'Ultra-compact. Good for pop-up and tablet-led booths.',
      },
      {
        id: 'dnp-ds820a',
        model: 'DS820A',
        level: 'compatible',
        sizes: 'up to 8×12',
        note: 'Larger pages for portrait-style booths.',
      },
      {
        id: 'dnp-ds40',
        model: 'DS40',
        level: 'compatible',
        sizes: '4×6, 5×7, 6×9',
        note: 'A proven classic still running fleets worldwide.',
      },
      {
        id: 'dnp-ds80',
        model: 'DS80',
        level: 'compatible',
        sizes: '8×10, 8×12',
        note: 'Large-format enlargements at the booth.',
      },
    ],
  },
  {
    id: 'sony',
    brand: 'Sony',
    path: 'os-queue',
    tagline: 'Not on our tested dye-sub list yet.',
    models: [
      {
        id: 'sony-up-dx100',
        model: 'UP-DX100 / UP-X100',
        level: 'soon',
        sizes: '4×6, 5×7',
        note: 'Not part of our tested list. If it has a Windows driver it will usually print through the Windows queue — write to us before you buy.',
      },
    ],
  },
  {
    id: 'citizen',
    brand: 'Citizen',
    path: 'ipp',
    tagline: 'Works over IPP or through the Windows PC today.',
    models: [
      {
        id: 'citizen-cx02',
        model: 'CX-02 / CX-02W',
        level: 'compatible',
        sizes: '4×6, 5×7, 6×8',
        note: 'Connect by IPP, or plug into the Windows PC.',
      },
    ],
  },
  {
    id: 'ipp-any',
    brand: 'Any network printer',
    path: 'ipp',
    tagline: 'If it speaks IPP, the booth can reach it.',
    models: [
      {
        id: 'ipp-generic',
        model: 'IPP-compatible photo printer',
        level: 'compatible',
        sizes: 'Depends on the printer',
        note: 'Port 631 on your booth network.',
      },
    ],
  },
  {
    id: 'windows-any',
    brand: 'Any Windows printer',
    path: 'os-queue',
    tagline: 'Added to Windows once, then the app prints to it.',
    models: [
      {
        id: 'windows-generic',
        model: 'Printer with a Windows driver',
        level: 'compatible',
        sizes: 'Depends on the printer',
        note: 'Add it in Windows Settings, then print a test strip.',
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────

const ALL_CAMERAS = CAMERA_BRANDS.flatMap((brand) =>
  brand.models.map((model) => ({ ...model, brand: brand.brand, brandId: brand.id, pathId: brand.path })),
);

const ALL_PRINTERS = PRINTER_BRANDS.flatMap((brand) =>
  brand.models.map((model) => ({ ...model, brand: brand.brand, brandId: brand.id, pathId: brand.path })),
);

export function findCamera(id) {
  return ALL_CAMERAS.find((camera) => camera.id === id) || null;
}

export function findPrinter(id) {
  return ALL_PRINTERS.find((printer) => printer.id === id) || null;
}

export function findHost(id) {
  return HOSTS.find((host) => host.id === id) || null;
}

export function cameraPath(camera) {
  return camera ? CAMERA_PATHS[camera.pathId] || null : null;
}

export function printerPath(printer) {
  return printer ? PRINTER_PATHS[printer.pathId] || null : null;
}

/** Cameras a given host can actually drive. */
export function camerasForHost(hostId) {
  return CAMERA_BRANDS.map((brand) => ({
    ...brand,
    models: brand.models.filter((model) => {
      const path = CAMERA_PATHS[brand.path];
      if (!path) return false;
      // A tablet can borrow a wired PC camera through the bridge.
      if (path.tabletBridge) return true;
      return path.hosts.includes(hostId);
    }),
  })).filter((brand) => brand.models.length > 0);
}

/** Printers a given host can actually reach. */
export function printersForHost(hostId) {
  return PRINTER_BRANDS.map((brand) => ({
    ...brand,
    models: brand.models.filter((model) => {
      if (brand.path === 'os-queue') return hostId === 'windows';
      if (brand.path === 'airprint') return hostId === 'ipad';
      return true;
    }),
  })).filter((brand) => brand.models.length > 0);
}

/** Every model, flattened — used to build the search index. */
export const HARDWARE_INDEX_ENTRIES = [
  ...ALL_CAMERAS.map((camera) => ({
    kind: 'camera',
    id: camera.id,
    title: `${camera.brand} ${camera.model}`,
    text: `${camera.brand} ${camera.model} camera. ${LEVELS[camera.level].label}. ${camera.note}`,
  })),
  ...ALL_PRINTERS.map((printer) => ({
    kind: 'printer',
    id: printer.id,
    title: `${printer.brand} ${printer.model}`,
    text: `${printer.brand} ${printer.model} printer. ${LEVELS[printer.level].label}. ${printer.note}`,
  })),
];
