// ─────────────────────────────────────────────────────────────────
//  The compatibility list, brand by brand, with a level for every
//  model — Tested, Compatible or Coming soon.
//
//  One rule decides every level, and it is printed on the page so a
//  client can judge it rather than take it on trust.
// ─────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react';
import {
  CAMERA_BRANDS,
  PRINTER_BRANDS,
  CAMERA_PATHS,
  PRINTER_PATHS,
  LEVELS,
  LEVEL_ORDER,
} from '../content/hardware.js';
import { Badge, ChipGroup, LevelPill, Section } from './ui.jsx';

const KINDS = [
  { id: 'all', label: 'Everything' },
  { id: 'camera', label: 'Cameras' },
  { id: 'printer', label: 'Printers' },
];

function cameraHosts(brand) {
  const path = CAMERA_PATHS[brand.path];
  if (!path) return { android: false, ipad: false, windows: false };
  const hosts = { android: false, ipad: false, windows: false };
  for (const host of path.hosts) hosts[host] = true;
  if (path.tabletBridge) {
    hosts.android = true;
    hosts.ipad = true;
    hosts.windows = true;
  }
  return hosts;
}

function printerHosts(brand) {
  if (brand.path === 'os-queue') return { android: false, ipad: false, windows: true };
  if (brand.path === 'airprint') return { android: false, ipad: true, windows: false };
  // Bridge and IPP printers are reachable from every host; tablets go
  // through the Windows PC.
  return { android: true, ipad: true, windows: true };
}

function HostMarks({ hosts }) {
  return (
    <span className="host-marks" aria-label="Supported booth apps">
      {[
        ['android', 'Android'],
        ['ipad', 'iPad'],
        ['windows', 'Windows'],
      ].map(([id, label]) => (
        <span
          key={id}
          className={hosts[id] ? 'yes' : 'no'}
          title={`${label}: ${hosts[id] ? 'yes' : 'not on this path'}`}
        >
          {label.slice(0, 3)}
        </span>
      ))}
    </span>
  );
}

export default function CompatMatrix() {
  const [kind, setKind] = useState('all');
  const [level, setLevel] = useState('all');
  const [brandId, setBrandId] = useState('all');

  const groups = useMemo(() => {
    const source = [
      ...(kind === 'printer'
        ? []
        : CAMERA_BRANDS.map((brand) => ({ ...brand, type: 'camera', path: CAMERA_PATHS[brand.path] }))),
      ...(kind === 'camera'
        ? []
        : PRINTER_BRANDS.map((brand) => ({ ...brand, type: 'printer', path: PRINTER_PATHS[brand.path] }))),
    ];

    return source
      .filter((brand) => brandId === 'all' || `${brand.type}:${brand.id}` === brandId)
      .map((brand) => ({
        ...brand,
        models: brand.models.filter((model) => level === 'all' || model.level === level),
      }))
      .filter((brand) => brand.models.length > 0);
  }, [kind, level, brandId]);

  // A brand id is not unique on its own — Sony makes both cameras and
  // printers — so the chip carries its type too.
  const brandOptions = useMemo(() => {
    const source = [
      ...(kind === 'printer' ? [] : CAMERA_BRANDS.map((brand) => ({ ...brand, type: 'camera' }))),
      ...(kind === 'camera' ? [] : PRINTER_BRANDS.map((brand) => ({ ...brand, type: 'printer' }))),
    ];
    return [
      { id: 'all', label: 'All brands' },
      ...source.map((brand) => ({ id: `${brand.type}:${brand.id}`, label: brand.brand })),
    ];
  }, [kind]);

  const totals = useMemo(() => {
    const all = [
      ...CAMERA_BRANDS.flatMap((brand) => brand.models),
      ...PRINTER_BRANDS.flatMap((brand) => brand.models),
    ];
    return LEVEL_ORDER.map((key) => ({ key, count: all.filter((model) => model.level === key).length }));
  }, []);

  return (
    <Section
      id="compatibility"
      eyebrow="EVERY MODEL WE KNOW ABOUT"
      title="Camera and printer compatibility"
      aside={<Badge tone="green">{totals.reduce((sum, item) => sum + item.count, 0)} models listed</Badge>}
    >
      <p className="body-copy">
        The same list the marketing site shows, with one extra column: how far we have actually got with each
        model. Filter it down to the brand you are considering.
      </p>

      <div className="level-legend">
        {LEVEL_ORDER.map((key) => (
          <div className={`legend-card legend-${LEVELS[key].tone}`} key={key}>
            <LevelPill level={key} />
            <p>{LEVELS[key].blurb}</p>
            <small>{totals.find((item) => item.key === key)?.count} models</small>
          </div>
        ))}
      </div>

      <div className="compat-filters">
        <ChipGroup
          label="Show"
          idPrefix="compat-kind"
          value={kind}
          onChange={(value) => {
            setKind(value);
            setBrandId('all');
          }}
          options={KINDS}
        />
        <ChipGroup
          label="Status"
          idPrefix="compat-level"
          value={level}
          onChange={setLevel}
          options={[
            { id: 'all', label: 'Any status' },
            ...LEVEL_ORDER.map((key) => ({ id: key, label: LEVELS[key].label, level: key })),
          ]}
        />
        <ChipGroup
          label="Brand"
          idPrefix="compat-brand"
          value={brandId}
          onChange={setBrandId}
          options={brandOptions}
        />
      </div>

      {groups.length === 0 ? (
        <p className="body-copy">
          Nothing matches that combination. If the model you need is not listed at all, write to us — we would
          rather tell you now than after you have bought it.
        </p>
      ) : (
        <div className="compat-brands">
          {groups.map((brand) => (
            <article className="compat-brand" key={`${brand.type}-${brand.id}`}>
              <header>
                <h3>{brand.brand}</h3>
                <span className="compat-path">{brand.path?.name}</span>
                <p>{brand.tagline}</p>
              </header>
              <ul className="compat-rows">
                {brand.models.map((model) => (
                  <li key={model.id}>
                    <div className="compat-model">
                      <b>{model.model}</b>
                      <LevelPill level={model.level} />
                    </div>
                    {model.sizes && <span className="compat-sizes">{model.sizes}</span>}
                    <p className="compat-note">{model.note}</p>
                    {brand.type === 'camera' ? (
                      <HostMarks hosts={cameraHosts(brand)} />
                    ) : (
                      <HostMarks hosts={printerHosts(brand)} />
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <p className="fine-print">
        Model lists move as we add hardware. If your exact body or printer is not here, ask — the answer takes
        a day, and it is far cheaper than the wrong purchase.
      </p>
    </Section>
  );
}
