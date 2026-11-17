import { LEVELS } from '../content/hardware.js';

export function Icon({ children, className = '' }) {
  return (
    <span className={`icon ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

/** Compatibility level pill — Tested / Compatible / Coming soon. */
export function LevelPill({ level }) {
  const info = LEVELS[level] || LEVELS.compatible;
  return (
    <span className={`level level-${info.tone}`} title={info.blurb}>
      <i aria-hidden="true" />
      {info.label}
    </span>
  );
}

export function Section({ title, id, eyebrow, children, aside }) {
  return (
    <section className="doc-section" id={id}>
      <div className="section-heading">
        <span className="section-dot" />
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function Callout({ children, kind = 'tip', title }) {
  return (
    <div className={`callout ${kind}`}>
      <span aria-hidden="true">{kind === 'warn' ? '!' : '✳'}</span>
      <div>
        {title && <b>{title}</b>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/** A chip-style single-select. Radio semantics, chip appearance. */
export function ChipGroup({ label, value, onChange, options, columns = 'auto', idPrefix }) {
  return (
    <fieldset className="chip-group" style={{ '--chip-columns': columns }}>
      <legend>{label}</legend>
      <div className="chip-row">
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <label
              key={option.id}
              className={`chip ${selected ? 'chip-on' : ''} ${option.disabled ? 'chip-disabled' : ''}`}
            >
              <input
                type="radio"
                name={idPrefix}
                aria-label={`${label}: ${option.label}`}
                value={option.id}
                checked={selected}
                disabled={option.disabled}
                onChange={() => onChange(option.id)}
              />
              <span className="chip-face">
                {option.level && (
                  <i className={`chip-dot tone-${LEVELS[option.level]?.tone || 'blue'}`} aria-hidden="true" />
                )}
                <b>{option.label}</b>
                {option.hint && <small>{option.hint}</small>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Small key/value fact strip. */
export function FactStrip({ facts }) {
  if (!facts?.length) return null;
  return (
    <dl className="fact-strip">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Accordion({ items, idPrefix }) {
  return (
    <div className="accordion">
      {items.map((item, index) => (
        <details key={item.q || item.title} id={item.id ? `${idPrefix}-${item.id}` : undefined}>
          <summary>
            <span className="accordion-q">{item.q || item.title}</span>
            <span className="accordion-mark" aria-hidden="true" />
          </summary>
          <div className="accordion-body">{item.body ? <p>{item.body}</p> : item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function Breadcrumbs({ trail, onNavigate }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {trail.map((crumb, index) => {
        const last = index === trail.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className={last ? 'crumb crumb-current' : 'crumb'}>
            {index > 0 && (
              <span className="crumb-sep" aria-hidden="true">
                /
              </span>
            )}
            {last || !crumb.pageId ? (
              <span>{crumb.label}</span>
            ) : (
              <button onClick={() => onNavigate(crumb.pageId)}>{crumb.label}</button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
