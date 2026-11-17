// ─────────────────────────────────────────────────────────────────
//  Setup guide builder — pure function, no React.
//
//  Takes the client's four answers and returns exactly the guide
//  that applies to the gear in front of them. Nothing else renders.
//
//  This module is covered by src/lib/__tests__/setupGuide.test.js
//  so a content edit cannot silently break a setup path.
// ─────────────────────────────────────────────────────────────────

import {
  HOSTS,
  findCamera,
  findPrinter,
  findHost,
  cameraPath,
  printerPath,
  camerasForHost,
  printersForHost,
  LEVELS,
} from '../content/hardware.js';

// Addresses the booth app looks for a Canon CCAPI camera on, in order.
// Source: client-app/packages/camera-core/src/CameraManager.ts
export const CANON_PROBE_ADDRESSES = ['192.168.1.2', '192.168.0.2', '192.168.1.100', '10.0.2.2'];
export const BRIDGE_PORT = 9123;
export const CCAPI_PORT = 8080;
export const IPP_PORT = 631;

function step(title, body) {
  return { title, body };
}

// ── Camera ───────────────────────────────────────────────────────

function cameraSection(camera, path, host, link) {
  if (!camera || !path) return null;

  if (path.id === 'builtin') {
    return {
      id: 'camera',
      label: 'Camera',
      title: `Your camera: the ${host.label}`,
      lede: path.intro,
      steps: [
        step(
          'Open the booth app and allow camera access',
          'The first time you launch, the tablet asks for camera permission. Tap Allow. If you tapped the wrong thing, turn it back on in the tablet settings under Apps.',
        ),
        step(
          'Check the framing before guests arrive',
          'Stand where a guest would stand and look at the preview. Raise or tilt the booth until a face sits comfortably in the frame.',
        ),
        step(
          'Wipe the lens',
          'It sounds small. It is the single most common reason a booth looks soft on the day.',
        ),
      ],
      facts: [
        ['Cable', 'None'],
        ['Camera settings', 'None'],
        ['Network', 'Not needed for capture'],
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Good for learning the flow and for tight spaces. For prints guests keep, move up to a Canon or Nikon — the rest of this guide stays the same.',
        },
      ],
    };
  }

  if (path.id === 'ccapi' && link === 'wifi') {
    return {
      id: 'camera',
      label: 'Camera',
      title: `Connect your ${camera.brand} ${camera.model} over Wi-Fi`,
      lede: path.intro,
      steps: [
        step(
          'On the camera, turn Wi-Fi on and join your booth network',
          'Menu → communication or wireless settings → Wi-Fi → enable → connect to an access point. Choose the same network the booth is on. Not a guest network.',
        ),
        step(
          `Give the camera the address ${CANON_PROBE_ADDRESSES[0]}`,
          `On your router, reserve ${CANON_PROBE_ADDRESSES[0]} for the camera's MAC address. The booth app looks for a Canon camera at ${CANON_PROBE_ADDRESSES.join(', then ')} — in that order — so a camera on the first address is found with nothing typed anywhere.`,
        ),
        step(
          'Set the camera up for a long event',
          'Auto power off → Off or the longest option. Image quality → JPEG at the largest size. If the camera offers a remote-control or PC-connect Wi-Fi mode, choose that one.',
        ),
        step(
          'Start the booth app',
          'It finds the camera on its own and shows live view. There is no camera address to type in the app.',
        ),
        step(
          'Take one test shot and look at it',
          'Not on the camera screen — in the booth. That confirms the image is coming back into the session, which is the part that matters.',
        ),
      ],
      facts: [
        ['Cable', 'None — wireless'],
        ['Port', `${CCAPI_PORT} on the camera`],
        ['Install anything?', 'No. The Canon software is inside the booth app.'],
      ],
      callouts: [
        {
          kind: 'tip',
          text: `If the booth does not find the camera, check the address it was given. Anything other than ${CANON_PROBE_ADDRESSES.slice(0, 3).join(', ')} will not be discovered automatically today.`,
        },
        {
          kind: 'warn',
          text: 'Wi-Fi at venues is the usual culprit. A small travel router you carry with the booth beats trusting the venue network every time.',
        },
      ],
    };
  }

  if (path.id === 'nikon-usb') {
    const onTablet = host.id !== 'windows';
    return {
      id: 'camera',
      label: 'Camera',
      title: `Connect your ${camera.brand} ${camera.model} with a cable`,
      lede: path.intro,
      steps: [
        step(
          'Use the USB cable that came with the camera',
          'The computer end is a standard USB-A plug. The camera end is whatever your body uses — USB-C, Micro-USB or Mini-USB. Any good quality cable works; charge-only cables do not.',
        ),
        step(
          'Plug it into the Windows PC',
          'On a desktop, use a port on the back — they are on the motherboard and are steadier under load. Switch the camera on after the cable is in.',
        ),
        step(
          'Set the camera for tethered use',
          'USB mode → PC or normal (not mass storage). Auto power off → Off. Shoot JPEG at the largest size.',
        ),
        step(
          'Start the HappyPix Windows app',
          'It loads the Nikon support itself — there is no SDK to download and no driver disc. Live view appears in the booth when the camera is ready.',
        ),
        ...(onTablet
          ? [
              step(
                'Point the tablet at the PC',
                `On the booth login screen, open "Windows USB camera host", type the PC's address on your network and save. The tablet then borrows the camera through the PC on port ${BRIDGE_PORT}.`,
              ),
            ]
          : []),
      ],
      facts: [
        ['Cable', 'USB-A on the PC, camera end as fitted'],
        ['Port', onTablet ? `${BRIDGE_PORT} on the PC` : 'USB'],
        ['Install anything?', 'No. The Nikon Remote SDK is bundled inside the app.'],
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'Live view depends on the camera body. Take one test capture into the booth and look at it before you trust it at an event.',
        },
      ],
    };
  }

  if (path.id === 'ptp-android') {
    return {
      id: 'camera',
      label: 'Camera',
      title: `Connect your ${camera.brand} ${camera.model} by USB`,
      lede: path.intro,
      steps: [
        step(
          'Get a USB-OTG adapter and a data cable',
          'The adapter turns the tablet port into a USB host. The cable must carry data — a charge-only cable will sit there doing nothing.',
        ),
        step(
          'Camera on, then cable in',
          'Switch the camera on first, then connect. Set the camera USB mode to PC or normal, not mass storage.',
        ),
        step(
          'Accept the permission prompt on the tablet',
          'Android asks which app should open the USB device. Choose HappyPix, and tick "use by default" so it does not ask mid-event.',
        ),
        step(
          'Frame on the tablet, not the camera',
          'This path has no live view and cannot change camera settings, so set exposure and focus on the camera itself, then compose using the tablet preview.',
        ),
      ],
      facts: [
        ['Cable', 'USB-OTG adapter + data-capable USB cable'],
        ['Live view', 'Not on this path'],
        ['Install anything?', 'No.'],
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'A powered USB hub helps if the camera will not wake up — some tablets cannot supply enough current on their own.',
        },
      ],
    };
  }

  if (path.id === 'uvc') {
    return {
      id: 'camera',
      label: 'Camera',
      title: `Connect your ${camera.brand} ${camera.model}`,
      lede: path.intro,
      steps: [
        step('Plug it into the PC', 'Any USB port. Switch it on if it has its own power.'),
        step(
          'Allow camera access when Windows asks',
          'Windows Settings → Privacy → Camera → let desktop apps use your camera.',
        ),
        step(
          'Check the booth is using the right camera',
          'If the PC has a built-in webcam too, confirm the preview in the booth is showing the camera you meant.',
        ),
      ],
      facts: [
        ['Cable', 'USB'],
        ['Install anything?', 'No'],
        ['Live view', 'Yes'],
      ],
      callouts: [],
    };
  }

  return null;
}

// ── Printer ──────────────────────────────────────────────────────

function printerSection(printer, path, host) {
  if (!printer || !path) return null;

  if (printer.level === 'soon') {
    return {
      id: 'printer',
      label: 'Printer',
      title: `${printer.brand} ${printer.model} — not ready yet`,
      lede: `We are building support for this printer. Until then it will not print from the booth.`,
      steps: [
        step(
          'Write to us before you buy',
          'Tell us the exact model. If it speaks IPP it will probably work through the network route today, and we would rather tell you that now than after you have bought it.',
        ),
        step(
          'In the meantime, print through another route',
          'A DNP printer into the Windows PC, or any IPP network printer, both work today.',
        ),
      ],
      facts: [
        ['Status', LEVELS.soon.label],
        ['What works today', 'DNP via Windows, or IPP over the network'],
      ],
      callouts: [{ kind: 'warn', text: 'Do not buy this printer for a paid event yet.' }],
    };
  }

  if (path.id === 'bridge-usb' || path.id === 'os-queue') {
    const needsWindows = host.id !== 'windows';
    return {
      id: 'printer',
      label: 'Printer',
      title: `Set up your ${printer.brand} ${printer.model}`,
      lede: path.intro,
      steps: [
        step(
          'Connect the printer to the Windows PC',
          'USB cable from the printer into the PC. Switch the printer on and let Windows notice it.',
        ),
        step(
          'Add the printer in Windows once',
          'Windows Settings → Bluetooth & devices → Printers & scanners → Add device. This is the one place a driver is genuinely needed: HappyPix prints through the Windows print queue, so the printer has to appear there first.',
        ),
        step(
          'Load paper and ribbon',
          'Use the media size you intend to print. The booth reads paper remaining and ribbon level back from DNP printers, so you will see it before the guests do.',
        ),
        step(
          'Set the page size to match the media',
          `In the printer's Windows preferences, match the paper size to what is loaded${printer.sizes ? ` — your ${printer.model} takes ${printer.sizes}` : ''}. A size mismatch is the usual cause of a cropped or refused print.`,
        ),
        step(
          'Print a test strip from the booth',
          'Not from Windows. From the booth, so you are testing the whole path — app, bridge, queue, printer, media.',
        ),
        ...(needsWindows
          ? [
              step(
                'Keep the tablet and the PC on one network',
                `The booth on your ${host.label} sends prints to the PC over the network on port ${BRIDGE_PORT}. Same network, not a guest network, and allow the app through Windows Firewall on private networks.`,
              ),
            ]
          : []),
      ],
      facts: [
        ['Cable', 'The printer’s own USB cable into the PC'],
        ['Driver', 'Needed once, in Windows'],
        ['Port', needsWindows ? `${BRIDGE_PORT} on the PC` : 'Windows print queue'],
        [
          'Status back to you',
          printer.brandId === 'dnp' ? 'Paper, ribbon and lifetime prints' : 'Queue status',
        ],
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Pack one spare media set per booth. Running out mid-event is the only hardware failure guests actually notice.',
        },
      ],
    };
  }

  if (path.id === 'ipp') {
    return {
      id: 'printer',
      label: 'Printer',
      title: `Set up your ${printer.brand} ${printer.model} on the network`,
      lede: path.intro,
      steps: [
        step(
          'Put the printer on the booth network',
          'Ethernet is steadier than Wi-Fi for a printer. If it must be wireless, join the same network as the booth — not a guest one.',
        ),
        step(
          'Reserve its address on the router',
          'Give the printer a fixed IP by MAC address. A printer that changes address between events is a printer that stops printing at the next one.',
        ),
        step(
          `Make sure port ${IPP_PORT} is open on the printer`,
          'IPP runs over that port. If your network has client isolation turned on, the booth will not be able to reach the printer at all.',
        ),
        step(
          'Load the right media and match the page size',
          `Set the printer's paper size to what is loaded${printer.sizes ? ` — your ${printer.model} takes ${printer.sizes}` : ''}.`,
        ),
        step(
          'Print a test from the booth',
          'Confirm the size, colour and cut are right before guests arrive.',
        ),
      ],
      facts: [
        ['Cable', 'Ethernet or Wi-Fi'],
        ['Port', `${IPP_PORT}`],
        ['Driver', 'Not needed on the booth'],
      ],
      callouts: [
        {
          kind: 'warn',
          text: 'IPP does not scan the venue for printers. The address has to be right, and the network has to let devices talk to each other.',
        },
      ],
    };
  }

  if (path.id === 'airprint') {
    return {
      id: 'printer',
      label: 'Printer',
      title: `Set up your ${printer.brand} ${printer.model} with AirPrint`,
      lede: path.intro,
      steps: [
        step(
          'Join the printer to the same Wi-Fi as the iPad',
          'Both on the same network, both able to see each other. Guest networks usually block this.',
        ),
        step(
          'Print a test and watch what iOS does',
          'The iPad shows its own print sheet. If someone has to tap through it every time, AirPrint is not the right path for an unattended booth.',
        ),
        step(
          'For hands-off printing, use the Windows route',
          'Plug the printer into a Windows PC running HappyPix and the booth prints with nobody touching anything.',
        ),
      ],
      facts: [
        ['Cable', 'Wi-Fi'],
        ['Unattended?', 'No — iOS asks a person to confirm'],
      ],
      callouts: [
        { kind: 'tip', text: 'AirPrint is fine for a staffed booth where someone is standing there anyway.' },
      ],
    };
  }

  return null;
}

// ── Guest screen / kiosk ─────────────────────────────────────────

function kioskSection(host, kiosk) {
  if (!kiosk) return null;

  if (host.id === 'windows') {
    return {
      id: 'screen',
      label: 'Guest screen',
      title: 'Set up the guest screen',
      lede: 'A second display turns a laptop into a proper booth. It takes one cable and two settings.',
      steps: [
        step(
          'Connect the display before you open the app',
          'HDMI or DisplayPort from the PC to the screen. On a laptop with only USB-C, use a USB-C to HDMI adapter. Plug it in before launching so Windows settles the displays first.',
        ),
        step(
          'Choose how the two screens behave',
          'Windows Settings → System → Display → "Extend these displays". Drag the rectangles so they match how the screens are physically arranged — that is what decides which way the cursor leaves the edge.',
        ),
        step(
          'Set the guest screen to its native resolution',
          'Same page, select the guest display and use the recommended resolution. A screen running at the wrong resolution looks soft no matter how good the photos are.',
        ),
        step(
          'Let the app take over',
          'The packaged HappyPix app opens full screen in kiosk mode on its own — no window borders, no taskbar. Operator controls stay available inside the app.',
        ),
        step(
          'Hide the laptop screen if you can',
          'Close the lid with an external keyboard, or turn that display off, so nobody bumps it mid-event.',
        ),
      ],
      facts: [
        ['Cable', 'HDMI, DisplayPort, or USB-C adapter'],
        ['Display mode', 'Extend'],
        ['Kiosk mode', 'Automatic in the packaged app'],
      ],
      callouts: [
        {
          kind: 'tip',
          text: 'Test the whole thing at the venue height, not on a desk. Sight lines change everything.',
        },
      ],
    };
  }

  return {
    id: 'screen',
    label: 'Guest screen',
    title: 'Show the booth on a bigger screen',
    lede: host.kioskNote,
    steps: [
      step(
        'Mirror, do not extend',
        `On ${host.label} the booth is a single touch screen, so mirroring is what you want — the crowd sees what the guests see.`,
      ),
      step(
        'Connect the adapter or start AirPlay',
        'USB-C to HDMI into the display, or AirPlay to a compatible screen. Plug in before you open the app.',
      ),
      step(
        'Keep touch on the device',
        'Guests tap the tablet or iPad, not the TV. Mount the device where a guest can reach it comfortably.',
      ),
    ],
    facts: [
      ['Cable', 'USB-C to HDMI, or wireless'],
      ['Mode', 'Mirror'],
      ['Touch', 'Stays on the device'],
    ],
    callouts: [
      {
        kind: 'tip',
        text: 'Wireless mirroring adds a beat of lag. For a countdown guests are watching, a cable feels sharper.',
      },
    ],
  };
}

// ── Warnings the selection earns ─────────────────────────────────

function buildWarnings(host, camera, printer, camPath) {
  const warnings = [];
  if (!host || !camera || !printer) return warnings;

  if (camera.level === 'soon') {
    warnings.push(
      `${camera.brand} ${camera.model} support is still being built. Use another camera for now, or write to us — we would rather tell you before you buy.`,
    );
  }
  if (camera.level === 'compatible') {
    warnings.push(
      `${camera.brand} ${camera.model} rides a path we support but is not one of our reference bodies. Give it one full test session before a paid event.`,
    );
  }
  if (printer.level === 'soon') {
    warnings.push(
      `${printer.brand} ${printer.model} is not on our supported list yet. Write to us with the exact model before you buy — if it has a Windows driver it will often print through the Windows queue.`,
    );
  }
  if (printer.level === 'compatible') {
    warnings.push(
      `${printer.brand} ${printer.model} should work through this route. Print one test strip and check the size and cut match what you expect.`,
    );
  }
  if (camPath && camPath.tabletBridge && host.id !== 'windows') {
    warnings.push(
      `This camera connects by USB to a computer, so your ${host.label} booth also needs a Windows PC on the same network to hold the camera. The PC can be any ordinary laptop.`,
    );
  }
  if (printer.pathId === 'bridge-usb' && host.id !== 'windows') {
    warnings.push(
      `Printing to the ${printer.brand} ${printer.model} goes through a Windows PC. Your ${host.label} sends the print across the network to it, so both must be on the same network.`,
    );
  }
  if (
    host.id === 'ipad' &&
    camPath &&
    camPath.links.includes('wired-pc') === false &&
    camPath.id === 'ptp-android'
  ) {
    warnings.push('Wired camera capture is an Android-only path. On iPad, use Wi-Fi or a Windows PC.');
  }
  return warnings;
}

// ── The builder ──────────────────────────────────────────────────

export function buildSetupGuide({ hostId, cameraId, printerId, kiosk = false, cameraLink = null }) {
  const host = findHost(hostId);
  const camera = findCamera(cameraId);
  const printer = findPrinter(printerId);
  if (!host || !camera || !printer) return null;

  const camPath = cameraPath(camera);
  const prnPath = printerPath(printer);

  // Which physical link this camera can actually use on this host.
  const availableLinks = (camPath?.links || []).filter((link) => {
    if (link === 'wired-tablet') return host.id === 'android';
    if (link === 'wired-pc') return true; // a PC can always be involved
    return true;
  });
  const link =
    cameraLink && availableLinks.includes(cameraLink) ? cameraLink : availableLinks[0] || 'builtin';

  const sections = [
    cameraSection(camera, camPath, host, link),
    printerSection(printer, prnPath, host),
    kioskSection(host, kiosk),
    networkSection(host, camera, printer, camPath, prnPath),
  ].filter(Boolean);

  return {
    host,
    camera,
    printer,
    link,
    availableLinks,
    chips: [
      { label: 'Booth', value: host.label },
      { label: 'Camera', value: `${camera.brand} ${camera.model}`, level: camera.level },
      { label: 'Printer', value: `${printer.brand} ${printer.model}`, level: printer.level },
      { label: 'Guest screen', value: kiosk ? 'Separate display' : host.guestScreen },
    ],
    diagram: buildDiagram(host, camera, printer, camPath, prnPath, kiosk, link),
    sections,
    warnings: buildWarnings(host, camera, printer, camPath),
  };
}

function buildDiagram(host, camera, printer, camPath, prnPath, kiosk, link) {
  const nodes = [{ id: 'booth', label: host.label, kind: 'host' }];
  const links = [];

  const needsPc =
    (camPath && camPath.tabletBridge && host.id !== 'windows') ||
    (prnPath && prnPath.id === 'bridge-usb' && host.id !== 'windows') ||
    host.id === 'windows';

  if (needsPc && host.id !== 'windows') {
    nodes.push({ id: 'pc', label: 'Windows PC', kind: 'bridge' });
    links.push({ from: 'booth', to: 'pc', label: `Wi-Fi · port ${BRIDGE_PORT}` });
  }

  const pcNode = host.id === 'windows' ? 'booth' : needsPc ? 'pc' : null;

  if (camPath) {
    if (camPath.id === 'builtin') {
      links.push({ from: 'booth', to: 'booth', label: 'built in', skip: true });
    } else if (camPath.id === 'ccapi') {
      nodes.push({ id: 'cam', label: `${camera.brand} ${camera.model}`, kind: 'device' });
      links.push({ from: 'booth', to: 'cam', label: `Wi-Fi · port ${CCAPI_PORT}` });
    } else if (camPath.id === 'nikon-usb') {
      nodes.push({ id: 'cam', label: `${camera.brand} ${camera.model}`, kind: 'device' });
      links.push({
        from: pcNode || 'booth',
        to: 'cam',
        label: link === 'wired-tablet' ? 'USB' : 'USB cable',
      });
    } else if (camPath.id === 'ptp-android') {
      nodes.push({ id: 'cam', label: `${camera.brand} ${camera.model}`, kind: 'device' });
      links.push({ from: 'booth', to: 'cam', label: 'USB-OTG cable' });
    } else if (camPath.id === 'uvc') {
      nodes.push({ id: 'cam', label: `${camera.brand} ${camera.model}`, kind: 'device' });
      links.push({ from: 'booth', to: 'cam', label: 'USB cable' });
    }
  }

  if (prnPath) {
    nodes.push({ id: 'printer', label: `${printer.brand} ${printer.model}`, kind: 'device' });
    if (prnPath.id === 'bridge-usb' || prnPath.id === 'os-queue') {
      links.push({ from: pcNode || 'booth', to: 'printer', label: 'USB · Windows queue' });
    } else if (prnPath.id === 'ipp' || prnPath.id === 'airprint') {
      links.push({ from: 'booth', to: 'printer', label: `Network · port ${IPP_PORT}` });
    }
  }

  if (kiosk) {
    nodes.push({ id: 'screen', label: 'Guest display', kind: 'device' });
    links.push({ from: 'booth', to: 'screen', label: host.id === 'windows' ? 'HDMI' : 'Mirror' });
  }

  return { nodes, links: links.filter((l) => !l.skip) };
}

function networkSection(host, camera, printer, camPath, prnPath) {
  const ports = [];
  if (camPath?.id === 'ccapi') ports.push(`${CCAPI_PORT} — camera (Canon CCAPI)`);
  if (camPath?.tabletBridge || prnPath?.id === 'bridge-usb') ports.push(`${BRIDGE_PORT} — Windows PC bridge`);
  if (prnPath?.id === 'ipp' || prnPath?.id === 'airprint') ports.push(`${IPP_PORT} — printer (IPP)`);

  return {
    id: 'network',
    label: 'Network',
    title: 'Get the network right and everything else is easy',
    lede: 'Almost every "it stopped working at the venue" story is a network story. Ten minutes here saves an hour on the day.',
    steps: [
      step(
        'One private network for the whole booth',
        'Booth, camera, printer and PC all on the same router and subnet. Guest networks isolate devices from each other by design, which quietly breaks camera and printer discovery.',
      ),
      step(
        'Carry your own router',
        'A small travel router in the kit means the venue Wi-Fi is only used for internet, and your booth network is always the one you configured.',
      ),
      step(
        'Reserve addresses on the router',
        `Fix the address of anything the booth has to find${camPath?.id === 'ccapi' ? ` — the camera should be ${CANON_PROBE_ADDRESSES[0]}` : ''}. Devices that change address between events are devices that fail at the next one.`,
      ),
      step(
        'Internet is still needed',
        'Camera and printer traffic stays local, but event settings, payments, uploads and guest download links need a working internet connection.',
      ),
      step(
        'Write it all on the rig sheet',
        'Network name, password, reserved addresses, which cable goes where. The person packing up at midnight will thank the person who wrote it down.',
      ),
    ],
    facts: ports.length
      ? [['Ports to allow', ports.join(' · ')]]
      : [['Ports to allow', 'None — everything stays on the device']],
    callouts: [
      {
        kind: 'warn',
        text: 'If your router has "AP isolation" or "client isolation" switched on, turn it off for this network. With it on, devices cannot see each other and nothing will be discovered.',
      },
    ],
  };
}

// ── Search indexing ──────────────────────────────────────────────
//
// The setup guide is generated, so nothing about it would be
// searchable unless we materialise it. Enumerate every host ×
// camera × printer × screen combination once, then keep only the
// distinct sections — the same wiring advice appears across many
// combinations and only needs indexing once.

let cachedSetupEntries = null;

export function buildSetupIndexEntries() {
  if (cachedSetupEntries) return cachedSetupEntries;

  const seen = new Set();
  const entries = [];

  for (const host of HOSTS) {
    const cameras = camerasForHost(host.id).flatMap((brand) => brand.models);
    const printers = printersForHost(host.id).flatMap((brand) => brand.models);

    for (const camera of cameras) {
      for (const printer of printers) {
        for (const kiosk of [false, true]) {
          const guide = buildSetupGuide({
            hostId: host.id,
            cameraId: camera.id,
            printerId: printer.id,
            kiosk,
          });
          if (!guide) continue;

          for (const section of guide.sections) {
            const key = `${section.id}|${section.title}|${section.steps.map((s) => s.title).join('|')}`;
            if (seen.has(key)) continue;
            seen.add(key);
            entries.push({
              id: `setup-${section.id}`,
              title: section.title,
              text: `${section.lede} ${section.steps.map((s) => `${s.title} ${s.body}`).join(' ')}`,
            });
          }
        }
      }
    }
  }

  cachedSetupEntries = entries;
  return entries;
}
