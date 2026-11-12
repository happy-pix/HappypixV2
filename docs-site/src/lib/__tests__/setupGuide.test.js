import { describe, it, expect } from 'vitest';
import { buildSetupGuide, CANON_PROBE_ADDRESSES } from '../setupGuide.js';
import {
  camerasForHost,
  printersForHost,
  findCamera,
  findPrinter,
  CAMERA_BRANDS,
  PRINTER_BRANDS,
  CAMERA_PATHS,
  PRINTER_PATHS,
} from '../../content/hardware.js';

const flat = (sections) =>
  sections
    .map((section) =>
      [section.title, section.lede, ...section.steps.map((s) => `${s.title} ${s.body}`)].join(' '),
    )
    .join(' ');

describe('buildSetupGuide — the exact scenario a client arrives with', () => {
  // "I downloaded the windows app on my laptop, I have a kiosk screen,
  //  a Nikon D series camera, and a Sony printer."
  const guide = buildSetupGuide({
    hostId: 'windows',
    cameraId: 'nikon-d-series',
    printerId: 'sony-up-dx100',
    kiosk: true,
  });

  it('is wired, not Wi-Fi, for a Nikon on Windows', () => {
    expect(guide.link).toBe('wired-pc');
    const camera = guide.sections.find((section) => section.id === 'camera');
    expect(camera.title).toContain('with a cable');
    expect(camera.facts.find(([label]) => label === 'Cable')[1]).toMatch(/USB/);
  });

  it('never tells a client to install a camera driver', () => {
    const camera = guide.sections.find((section) => section.id === 'camera');
    const text = [camera.title, camera.lede, ...camera.steps.map((s) => s.body)].join(' ').toLowerCase();
    expect(text).not.toContain('install');
    expect(text).toContain('no separate download');
    expect(camera.facts.find(([label]) => label === 'Install anything?')[1]).toMatch(/No/i);
  });

  it('says a Sony printer is not ready, instead of pretending', () => {
    expect(findPrinter('sony-up-dx100').level).toBe('soon');
    const printer = guide.sections.find((section) => section.id === 'printer');
    expect(printer.title).toMatch(/not ready yet/i);
    expect(guide.warnings.join(' ')).toMatch(/not on our supported list/i);
  });

  it('adds the guest screen section only when there is a separate display', () => {
    expect(guide.sections.some((section) => section.id === 'screen')).toBe(true);
    const screen = guide.sections.find((section) => section.id === 'screen');
    expect(flat([screen]).toLowerCase()).toContain('hdmi');
    expect(flat([screen]).toLowerCase()).toContain('kiosk mode');

    const noKiosk = buildSetupGuide({
      hostId: 'windows',
      cameraId: 'nikon-d-series',
      printerId: 'dnp-rx1hs',
      kiosk: false,
    });
    expect(noKiosk.sections.some((section) => section.id === 'screen')).toBe(false);
  });

  it('always ends with the network section', () => {
    expect(guide.sections[guide.sections.length - 1].id).toBe('network');
  });
});

describe('buildSetupGuide — Canon over Wi-Fi', () => {
  const guide = buildSetupGuide({
    hostId: 'android',
    cameraId: 'canon-r50',
    printerId: 'dnp-rx1hs',
    kiosk: false,
  });
  const camera = guide.sections.find((section) => section.id === 'camera');

  it('gives the address the booth actually probes for', () => {
    expect(CANON_PROBE_ADDRESSES).toContain('192.168.1.2');
    expect(flat([camera])).toContain('192.168.1.2');
  });

  it('uses port 8080, matching CanonCameraProvider', () => {
    expect(camera.facts.find(([label]) => label === 'Port')[1]).toContain('8080');
  });

  it('warns that a tablet printing to a DNP needs a Windows PC', () => {
    expect(guide.warnings.join(' ')).toMatch(/Windows PC/);
    expect(guide.diagram.nodes.some((node) => node.label === 'Windows PC')).toBe(true);
  });
});

describe('buildSetupGuide — the printer driver exception', () => {
  it('names the driver once, for the Windows print queue only', () => {
    const guide = buildSetupGuide({
      hostId: 'windows',
      cameraId: 'canon-r6-ii',
      printerId: 'dnp-ds620a',
      kiosk: false,
    });
    const printer = guide.sections.find((section) => section.id === 'printer');
    expect(flat([printer]).toLowerCase()).toContain('driver');
    expect(printer.facts.find(([label]) => label === 'Driver')[1]).toMatch(/Needed/);
  });

  it('does not mention a driver for a network IPP printer', () => {
    const guide = buildSetupGuide({
      hostId: 'ipad',
      cameraId: 'builtin-ipad',
      printerId: 'ipp-generic',
      kiosk: false,
    });
    const printer = guide.sections.find((section) => section.id === 'printer');
    expect(printer.facts.find(([label]) => label === 'Driver')[1]).toMatch(/Not needed/);
  });
});

describe('host filtering', () => {
  it('never offers the iPad a wired-only camera path as its own', () => {
    const ipadCameras = camerasForHost('ipad').flatMap((brand) => brand.models.map((model) => model.id));
    expect(ipadCameras).toContain('nikon-d5600'); // reachable, but through a PC
    const guide = buildSetupGuide({
      hostId: 'ipad',
      cameraId: 'nikon-d5600',
      printerId: 'dnp-rx1hs',
      kiosk: false,
    });
    expect(guide.warnings.join(' ')).toMatch(/Windows PC/);
  });

  it('offers the Windows-only printer routes only to Windows', () => {
    const windowsPrinters = printersForHost('windows').flatMap((brand) =>
      brand.models.map((model) => model.id),
    );
    const ipadPrinters = printersForHost('ipad').flatMap((brand) => brand.models.map((model) => model.id));
    expect(windowsPrinters).toContain('windows-generic');
    expect(ipadPrinters).not.toContain('windows-generic');
  });

  it('has a camera and a printer for every host', () => {
    for (const hostId of ['android', 'ipad', 'windows']) {
      expect(camerasForHost(hostId).length).toBeGreaterThan(0);
      expect(printersForHost(hostId).length).toBeGreaterThan(0);
      const guide = buildSetupGuide({
        hostId,
        cameraId: camerasForHost(hostId)[0].models[0].id,
        printerId: printersForHost(hostId)[0].models[0].id,
        kiosk: true,
      });
      expect(guide.sections.length).toBeGreaterThanOrEqual(3);
      expect(guide.diagram.nodes.length).toBeGreaterThan(0);
    }
  });
});

describe('catalogue integrity', () => {
  it('every brand points at a connection path that actually exists', () => {
    // Regression guard: a brand whose `path` does not match a
    // CAMERA_PATHS key is silently dropped from every host.
    for (const brand of CAMERA_BRANDS) {
      expect(CAMERA_PATHS[brand.path], `camera brand "${brand.id}" -> "${brand.path}"`).toBeTruthy();
    }
    for (const brand of PRINTER_BRANDS) {
      expect(PRINTER_PATHS[brand.path], `printer brand "${brand.id}" -> "${brand.path}"`).toBeTruthy();
    }
  });

  it('every host can reach at least one tested camera and printer', () => {
    for (const hostId of ['android', 'ipad', 'windows']) {
      const cams = camerasForHost(hostId).flatMap((b) => b.models);
      const prns = printersForHost(hostId).flatMap((b) => b.models);
      expect(
        cams.some((m) => m.level === 'tested'),
        hostId,
      ).toBe(true);
      expect(
        prns.some((m) => m.level === 'tested'),
        hostId,
      ).toBe(true);
    }
  });

  it('every model carries a level the legend explains', () => {
    for (const brand of [...camerasForHost('windows'), ...printersForHost('windows')]) {
      for (const model of brand.models) {
        expect(['tested', 'compatible', 'soon']).toContain(model.level);
      }
    }
  });

  it('the D5600 is a tested body, matching the bundled Nikon SDK', () => {
    expect(findCamera('nikon-d5600').level).toBe('tested');
  });

  it('the DNP models the bridge names are tested', () => {
    for (const id of ['dnp-rx1hs', 'dnp-ds620a', 'dnp-qw410']) {
      expect(findPrinter(id).level).toBe('tested');
    }
  });

  it('Sony is coming soon, not quietly missing', () => {
    expect(findCamera('sony-alpha').level).toBe('soon');
  });
});
