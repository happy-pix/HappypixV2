// ─────────────────────────────────────────────────────────────────
//  Make it run — the setup builder.
//
//  Four questions, then only the guide that applies. Selecting a
//  different booth app re-validates the camera and printer, because
//  a wired Nikon is not a choice an iPad can honour.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react';
import {
  HOSTS,
  LEVELS,
  LEVEL_ORDER,
  CAMERA_BRANDS,
  PRINTER_BRANDS,
  camerasForHost,
  printersForHost,
  findCamera,
  findPrinter,
  cameraPath,
  printerPath,
} from '../content/hardware.js';
import { buildSetupGuide, CANON_PROBE_ADDRESSES } from '../lib/setupGuide.js';
import { Badge, Callout, ChipGroup, FactStrip, LevelPill, Section } from './ui.jsx';

const LINK_LABELS = {
  builtin: 'Built in — nothing to connect',
  wifi: 'Wi-Fi',
  'wired-pc': 'Wired into a Windows PC',
  'wired-tablet': 'Wired into the tablet',
};

const CHECKLIST = [
  'Booth device, camera and printer are all on steady power.',
  'Everything is on the same private network — not a guest network.',
  'Camera permission granted, and one real capture reviewed in the booth.',
  'One real test print, with the right size, colour and cut.',
  'Event and device pairing confirmed on the Waiting screen.',
  'Spare cables, adapter and a printed rig sheet are in the case.',
];

function firstModel(brands) {
  return brands[0]?.models[0]?.id || null;
}

export default function SetupBuilder({ onGuideChange }) {
  const [hostId, setHostId] = useState(HOSTS[0].id);

  const cameraBrands = useMemo(() => camerasForHost(hostId), [hostId]);
  const printerBrands = useMemo(() => printersForHost(hostId), [hostId]);

  const [cameraBrandId, setCameraBrandId] = useState(cameraBrands[0]?.id);
  const [cameraId, setCameraId] = useState(firstModel(cameraBrands));
  const [printerBrandId, setPrinterBrandId] = useState(printerBrands[0]?.id);
  const [printerId, setPrinterId] = useState(firstModel(printerBrands));
  const [kiosk, setKiosk] = useState(false);
  const [cameraLink, setCameraLink] = useState(null);
  const [checked, setChecked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hp_docs_checklist') || '[]');
    } catch {
      return [];
    }
  });

  // Keep the selection honest when the booth app changes underneath it.
  useEffect(() => {
    const brands = camerasForHost(hostId);
    const stillValid = brands.some((brand) => brand.models.some((model) => model.id === cameraId));
    if (!stillValid) {
      setCameraBrandId(brands[0]?.id);
      setCameraId(firstModel(brands));
    } else {
      const brand = brands.find((item) => item.models.some((model) => model.id === cameraId));
      setCameraBrandId(brand?.id);
    }
  }, [hostId, cameraId]);

  useEffect(() => {
    const brands = printersForHost(hostId);
    const stillValid = brands.some((brand) => brand.models.some((model) => model.id === printerId));
    if (!stillValid) {
      setPrinterBrandId(brands[0]?.id);
      setPrinterId(firstModel(brands));
    } else {
      const brand = brands.find((item) => item.models.some((model) => model.id === printerId));
      setPrinterBrandId(brand?.id);
    }
  }, [hostId, printerId]);

  const guide = useMemo(
    () => buildSetupGuide({ hostId, cameraId, printerId, kiosk, cameraLink }),
    [hostId, cameraId, printerId, kiosk, cameraLink],
  );

  // Tell the shell what is selected so "Download this page" exports
  // this visitor's own setup rather than a generic one.
  useEffect(() => {
    onGuideChange?.(guide);
  }, [guide, onGuideChange]);

  const activeCameraBrand = cameraBrands.find((brand) => brand.id === cameraBrandId) || cameraBrands[0];
  const activePrinterBrand = printerBrands.find((brand) => brand.id === printerBrandId) || printerBrands[0];
  const camera = findCamera(cameraId);
  const camPath = cameraPath(camera);
  const linkOptions = (guide?.availableLinks || []).map((link) => ({
    id: link,
    label: LINK_LABELS[link] || link,
  }));

  const toggleCheck = (label) => {
    const next = checked.includes(label) ? checked.filter((item) => item !== label) : [...checked, label];
    setChecked(next);
    try {
      localStorage.setItem('hp_docs_checklist', JSON.stringify(next));
    } catch {
      /* private mode — the checklist simply will not persist */
    }
  };

  if (!guide) return null;

  return (
    <>
      <Section
        id="builder"
        eyebrow="FOUR QUESTIONS"
        title="What are you setting up?"
        aside={<Badge tone="green">Live guide</Badge>}
      >
        <p className="body-copy">
          Answer these and the guide below rewrites itself for exactly your gear. Nothing you do not own will
          be mentioned.
        </p>

        <div className="builder">
          <ChipGroup
            label="Which booth app?"
            idPrefix="host"
            value={hostId}
            onChange={setHostId}
            options={HOSTS.map((host) => ({ id: host.id, label: host.label, hint: host.guestScreen }))}
          />

          <div className="builder-nested">
            <ChipGroup
              label="Camera brand"
              idPrefix="camera-brand"
              value={activeCameraBrand?.id}
              onChange={(brandId) => {
                const brand = cameraBrands.find((item) => item.id === brandId);
                setCameraBrandId(brandId);
                setCameraId(brand?.models[0]?.id || null);
                setCameraLink(null);
              }}
              options={cameraBrands.map((brand) => ({
                id: brand.id,
                label: brand.brand,
                hint: brand.tagline,
              }))}
            />
            <ChipGroup
              label={`${activeCameraBrand?.brand || 'Camera'} model`}
              idPrefix="camera-model"
              value={cameraId}
              onChange={(id) => {
                setCameraId(id);
                setCameraLink(null);
              }}
              options={(activeCameraBrand?.models || []).map((model) => ({
                id: model.id,
                label: model.model,
                level: model.level,
              }))}
            />
          </div>

          <div className="builder-nested">
            <ChipGroup
              label="Printer brand"
              idPrefix="printer-brand"
              value={activePrinterBrand?.id}
              onChange={(brandId) => {
                const brand = printerBrands.find((item) => item.id === brandId);
                setPrinterBrandId(brandId);
                setPrinterId(brand?.models[0]?.id || null);
              }}
              options={printerBrands.map((brand) => ({
                id: brand.id,
                label: brand.brand,
                hint: brand.tagline,
              }))}
            />
            <ChipGroup
              label={`${activePrinterBrand?.brand || 'Printer'} model`}
              idPrefix="printer-model"
              value={printerId}
              onChange={setPrinterId}
              options={(activePrinterBrand?.models || []).map((model) => ({
                id: model.id,
                label: model.model,
                level: model.level,
                hint: model.sizes,
              }))}
            />
          </div>

          <ChipGroup
            label="Guest screen"
            idPrefix="screen"
            value={kiosk ? 'separate' : 'device'}
            onChange={(value) => setKiosk(value === 'separate')}
            options={[
              { id: 'device', label: 'My device is the screen', hint: guide.host.guestScreen },
              { id: 'separate', label: 'A separate display', hint: 'For a bigger picture' },
            ]}
          />

          {linkOptions.length > 1 && (
            <ChipGroup
              label="How is the camera connected?"
              idPrefix="camera-link"
              value={guide.link}
              onChange={setCameraLink}
              options={linkOptions}
            />
          )}
        </div>
      </Section>

      <Section id="your-setup" eyebrow="YOUR SETUP" title="How your pieces talk to each other">
        <div className="setup-chips">
          {guide.chips.map((chip) => (
            <span className="setup-chip" key={chip.label}>
              <small>{chip.label}</small>
              <b>{chip.value}</b>
              {chip.level && <LevelPill level={chip.level} />}
            </span>
          ))}
        </div>

        <div
          className="setup-diagram"
          role="img"
          aria-label="Diagram of how the booth, camera, printer and display connect"
        >
          {guide.diagram.nodes.map((node) => (
            <span className={`diagram-node node-${node.kind}`} key={node.id}>
              <i aria-hidden="true" />
              {node.label}
            </span>
          ))}
          <ul className="diagram-links">
            {guide.diagram.links.map((link, index) => (
              <li key={`${link.from}-${link.to}-${index}`}>
                <b>{labelFor(guide.diagram.nodes, link.from)}</b>
                <span aria-hidden="true">→</span>
                <b>{labelFor(guide.diagram.nodes, link.to)}</b>
                <em>{link.label}</em>
              </li>
            ))}
          </ul>
        </div>

        {guide.warnings.length > 0 && (
          <div className="warning-stack">
            {guide.warnings.map((warning) => (
              <Callout key={warning} kind="warn">
                {warning}
              </Callout>
            ))}
          </div>
        )}
      </Section>

      {guide.sections.map((section, index) => (
        <Section
          key={section.id}
          id={`setup-${section.id}`}
          eyebrow={`STEP ${index + 1} · ${section.label.toUpperCase()}`}
          title={section.title}
        >
          <p className="body-copy">{section.lede}</p>
          <ol className="setup-steps">
            {section.steps.map((item, itemIndex) => (
              <li key={item.title}>
                <span className="setup-step-num">{String(itemIndex + 1).padStart(2, '0')}</span>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <FactStrip facts={section.facts} />
          {section.callouts?.map((callout) => (
            <Callout key={callout.text} kind={callout.kind}>
              {callout.text}
            </Callout>
          ))}
        </Section>
      ))}

      {camPath?.id === 'ccapi' && (
        <Section id="setup-address" eyebrow="WORTH KNOWING" title="The address your camera should have">
          <p className="body-copy">
            The booth looks for a Canon camera at these addresses, in this order. Reserving the first one on
            your router means there is never an address to type anywhere:
          </p>
          <ul className="address-list">
            {CANON_PROBE_ADDRESSES.map((address, index) => (
              <li key={address}>
                <code>{address}</code>
                <small>{index === 0 ? 'Reserve this one' : 'Also checked'}</small>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="checklist" eyebrow="BEFORE GUESTS ARRIVE" title="Event-day checklist">
        <div className="checklist">
          {CHECKLIST.map((item) => (
            <label key={item} className={checked.includes(item) ? 'on' : ''}>
              <input type="checkbox" checked={checked.includes(item)} onChange={() => toggleCheck(item)} />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <p className="fine-print">
          Your ticks stay on this device, so you can keep the page open on the day. {checked.length} of{' '}
          {CHECKLIST.length} done.
        </p>
      </Section>
    </>
  );
}

function labelFor(nodes, id) {
  return nodes.find((node) => node.id === id)?.label || id;
}

export const SETUP_LEVEL_ORDER = LEVEL_ORDER;
export const SETUP_LEVELS = LEVELS;
