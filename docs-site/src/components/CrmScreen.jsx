// ─────────────────────────────────────────────────────────────────
//  A working mock of each CRM page, locked to landscape.
//
//  Drawn from the real CRM design system — the tokens and components
//  in crm/src/index.css: the dark #141020 sidebar with a pink active
//  nav item, the 60px topbar, the auto-fit stat grid, the 14px/640
//  card headings, pink-primary buttons and neutral chips.
//
//  The sidebar is the navigation. Clicking a page there moves the
//  guide to that page's step, the way clicking it moves you in the
//  real workspace — so the tour is walked the way the app is used.
// ─────────────────────────────────────────────────────────────────

import { CRM_SIDEBAR } from '../content/crmFlow.js';

const ICONS = {
  Dashboard: '▦',
  'Events & devices': '◷',
  Templates: '✎',
  'Custom templates': '▣',
  Defaults: '≡',
  Coupons: '%',
  Gallery: '▥',
  Revenue: '₹',
  Team: '☰',
  Support: '?',
};

function Hotspot({ index, x, y, label }) {
  return (
    <span className="hotspot" style={{ left: `${x}%`, top: `${y}%` }}>
      <i>{index}</i>
      <em>{label}</em>
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="cstat">
      <span className="cstat-label">{label}</span>
      <span className="cstat-value">{value}</span>
    </div>
  );
}

function Card({ title, sub, action, children }) {
  return (
    <div className="ccard">
      <div className="ccard-head">
        <div>
          <h4>{title}</h4>
          {sub && <small>{sub}</small>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Table({ rows, heads, action }) {
  return (
    <div className="ctable">
      <div className="ctable-head crow">
        {heads.map((head) => (
          <span key={head}>{head}</span>
        ))}
        {action && <span />}
      </div>
      {rows.map((cells) => {
        const [name, ...rest] = cells;
        const status = rest[rest.length - 1];
        const tone = /online|live|paid|active|paired|delivered|everything|events/i.test(String(status))
          ? 'ok'
          : /offline|not paired|needs|pending|paused/i.test(String(status))
            ? 'warn'
            : '';
        return (
          <div className={`crow ${tone}`} key={String(name) + String(cells[1])}>
            <span className="crow-main">{name}</span>
            {rest.map((cell) => (
              <span className="crow-cell" key={String(cell)}>
                {cell}
              </span>
            ))}
            {action && (
              <span className="crow-action">
                <button className="bq-btn ghost small" type="button">
                  Open
                </button>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Fields({ fields, actionLabel, onAction }) {
  return (
    <div className="cform">
      {fields.map(([label, value]) => (
        <label className="cfield" key={label}>
          <span className="cfield-label">{label}</span>
          <span className="cfield-value">{value}</span>
        </label>
      ))}
      {actionLabel && (
        <button className="bq-btn primary crm" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Sidebar({ active, onNav, locked }) {
  return (
    <aside className="cside">
      <span className="cbrand">
        <b>HappyPix</b>
        <small>CRM</small>
      </span>
      <nav className="cnav">
        <span className="cnav-section">Studio</span>
        {CRM_SIDEBAR.map((label) =>
          locked ? (
            <span className="cnav-item locked" key={label}>
              <span aria-hidden="true">{ICONS[label] || '•'}</span>
              {label}
            </span>
          ) : (
            <button
              type="button"
              className={`cnav-item ${active === label ? 'active' : ''}`}
              onClick={() => onNav(label)}
              aria-current={active === label ? 'page' : undefined}
              key={label}
            >
              <span aria-hidden="true">{ICONS[label] || '•'}</span>
              {label}
            </button>
          ),
        )}
      </nav>
      <span className="cside-foot">
        <b>Sunset Weddings</b>
        <small>Premium · renews 14 Mar</small>
      </span>
    </aside>
  );
}

function Shell({ active, onNav, locked, title, children }) {
  return (
    <div className="cshell">
      <Sidebar active={active} onNav={onNav} locked={locked} />
      <div className="cmain">
        <header className="ctop">
          <b className="cpage-title">{title}</b>
          <span className="ctop-right">
            <span className="cchip pink">Premium</span>
            <span className="cavatar" aria-hidden="true">
              SW
            </span>
          </span>
        </header>
        <div className="ccontent">{children}</div>
      </div>
    </div>
  );
}

export default function CrmScreen({ mock, step, onAction, actionLabel, jump }) {
  const onNav = (label) => jump?.nav(label);

  return (
    <div className={`device device-crm ${mock.kind === 'signin' ? 'device-crm-signin' : ''}`}>
      <div className="cscreen">
        <Shell
          active={step.nav}
          onNav={onNav}
          locked={mock.kind === 'signin'}
          title={mock.kind === 'signin' ? 'Sign in' : step.nav}
        >
          {renderPage(mock, step, onAction, actionLabel, onNav)}
        </Shell>
      </div>
      {mock.hotspots?.map((spot, index) => (
        <Hotspot key={spot.label} index={index + 1} {...spot} />
      ))}
    </div>
  );
}

function renderPage(mock, step, onAction, actionLabel, onNav) {
  const primary = actionLabel && (
    <button className="bq-btn primary crm small" type="button" onClick={onAction}>
      {actionLabel}
    </button>
  );

  switch (mock.kind) {
    case 'signin':
      return (
        <div className="clogin">
          <h3>Sign in to your workspace</h3>
          <label>
            Email
            <span className="bq-input">admin@organization.in</span>
          </label>
          <label>
            Password
            <span className="bq-input bq-mask">**********</span>
          </label>
          <button className="bq-btn primary crm" type="button" onClick={onAction}>
            {actionLabel || 'Sign in'}
          </button>
        </div>
      );

    case 'dashboard':
      return (
        <>
          <div className="cstats">
            {mock.stats.map(([label, value]) => (
              <Stat key={label} label={label} value={value} />
            ))}
          </div>
          <Card
            title="Booths"
            sub="Live status for every device on your account"
            action={
              <button className="bq-btn ghost small" type="button" onClick={() => onNav('Events & devices')}>
                Events &amp; devices
              </button>
            }
          >
            <Table
              heads={['Device', 'Platform', 'Status', 'Event']}
              rows={[
                ['Booth 1 · silver case', 'Android tablet', 'Online', 'Sunset Weddings'],
                ['Booth 2 · black case', 'iPad', 'Online', '—'],
                ['Kiosk PC · office', 'Windows', 'Offline', '—'],
              ]}
            />
          </Card>
        </>
      );

    case 'events':
      return (
        <Card title="Events" sub="Each event holds the branding, pricing and booth" action={primary}>
          <Table heads={['Event', 'Date', 'Booth', 'Status']} rows={mock.rows} action />
        </Card>
      );

    case 'devices':
      return (
        <>
          <Card title="Devices" sub="Register a booth here, then sign in on the device" action={primary}>
            <Table heads={['Device', 'Platform', 'Status', 'Assigned to']} rows={mock.rows} />
          </Card>
          <Card title="Assignment" sub="Pair Booth to Events">
            <Table
              heads={['Number', 'Booth', 'Operator', 'Event']}
              rows={[
                ['1', 'BBT 1st floor', 'Sohan Lal', 'The Iconic Glam'],
                ['2', 'Wedding booth', 'Vivek Raj', 'Priya weds Sahil'],
                ['3', 'Leela mall', '-', 'No event assigned'],
              ]}
            />
          </Card>
        </>
      );

    case 'eventForm':
    case 'defaults':
      return (
        <Card title={mock.kind === 'defaults' ? 'Default settings' : 'Event settings'} sub={step.what}>
          <Fields fields={mock.fields} actionLabel={actionLabel} onAction={onAction} />
        </Card>
      );

    case 'templates':
      return (
        <Card title="Design library" sub="Pick the set your booths may offer" action={primary}>
          <div className="ctpl-grid">
            {['Blush', 'Midnight', 'Botanical', 'Studio'].map((name, index) => (
              <button
                type="button"
                key={name}
                className={`ctpl ${index === 0 ? 'on' : ''}`}
                onClick={onAction}
              >
                <span className="ctpl-art">
                  <i />
                  <i />
                  <small>HAPPYPIX</small>
                </span>
                <b>{name}</b>
                {index === 0 && <span className="cchip pink">Live</span>}
              </button>
            ))}
          </div>
        </Card>
      );

    case 'custom':
      return (
        <>
          <Card title="Your designs" sub="Logo, colours and caption on the print" action={primary}>
            <div className="ctpl-grid">
              {[
                ['Sunset Weddings', 'Gold foil · portrait'],
                ['Pika Events', 'Navy · landscape'],
              ].map(([name, meta]) => (
                <span className="ctpl" key={name}>
                  <span className="ctpl-art branded">
                    <i />
                    <i />
                    <small>{name.split(' ')[0].toUpperCase()}</small>
                  </span>
                  <b>{name}</b>
                  <small>{meta}</small>
                </span>
              ))}
            </div>
          </Card>
          <Card title="Requests" sub="Built by our designers when you need one">
            <Table
              heads={['Client', 'Brief', 'Status', 'Due']}
              rows={[
                ['Nimbus Corporate', 'Studio look, navy palette', 'In review', '08 Dec'],
                ['Rosewood Hotels', 'Botanical variant', 'Delivered', '22 Nov'],
              ]}
            />
          </Card>
        </>
      );

    case 'coupons':
      return (
        <Card title="Coupons" sub="Applied at the booth payment screen" action={primary}>
          <Table heads={['Code', 'Discount', 'Used']} rows={mock.rows} />
        </Card>
      );

    case 'gallery':
      return (
        <>
          <div className="cstats">
            <Stat label="Galleries" value="24" />
            <Stat label="Photos delivered" value="3,208" />
            <Stat label="Views this month" value="1,402" />
          </div>
          <Card title="Galleries" sub="Browse by event and date" action={primary}>
            <div className="cgallery">
              {Array.from({ length: 5 }, (_, index) => (
                <span className={`cshot ${index % 5 === 0 ? 'wide' : ''}`} key={index} aria-hidden="true">
                  <i>{index % 2 === 0 ? '♥' : ''}</i>
                </span>
              ))}
            </div>
          </Card>
        </>
      );

    case 'revenue':
      return (
        <>
          <div className="cstats">
            <Stat label="This month" value="₹1,86,400" />
            <Stat label="Prints sold" value="1,284" />
            <Stat label="Coupons used" value="68" />
          </div>
          <Card title="Revenue by event" sub="Prints sold and takings" action={primary}>
            <Table heads={['Event', 'Prints', 'Takings']} rows={mock.rows} />
          </Card>
        </>
      );

    case 'team':
      return (
        <Card title="Team" sub="Roles decide how much of the workspace each person reaches" action={primary}>
          <Table heads={['Person', 'Role', 'Can reach']} rows={mock.rows} />
        </Card>
      );

    case 'support':
      return (
        <Card title="Support" sub="Your account context travels with the ticket" action={primary}>
          <Table
            heads={['Ticket', 'Opened', 'Priority', 'Status']}
            rows={[
              ['#8841 · Printer not printing', '12 min ago', 'High', 'Assigned'],
              ['#8830 · Canon not detected', '2 hrs ago', 'Medium', 'Closed'],
            ]}
          />
        </Card>
      );

    default:
      return (
        <Card title={step.nav || 'Workspace page'} sub={step.what}>
          <Table heads={['Item', 'Detail', 'Status']} rows={[['Nothing here yet', '—', '—']]} />
        </Card>
      );
  }
}
