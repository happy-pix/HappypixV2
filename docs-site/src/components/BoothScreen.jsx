// ─────────────────────────────────────────────────────────────────
//  A working mock of each booth screen, in landscape.
//
//  Drawn from the real booth design system — the tokens and layouts
//  in electron/src/ui/index.css and App.css, which the React Native
//  app mirrors. Light surface, ink #281637, pink #ee4c96, the 74px
//  header, the pink-gradient primary button, the pink-cornered QR
//  frame, the dark negative strip for shot selection.
//
//  The primary control on every screen is a real button that
//  advances the walkthrough, so the guide is clicked through the way
//  a guest clicks through the booth.
// ─────────────────────────────────────────────────────────────────

function Hotspot({ index, x, y, label }) {
  return (
    <span className="hotspot" style={{ left: `${x}%`, top: `${y}%` }}>
      <i>{index}</i>
      <em>{label}</em>
    </span>
  );
}

function QrFrame({ tone = 'pink' }) {
  return (
    <span className={`bq-qr bq-qr-${tone}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      <b>
        <u />
        <u />
        <u />
        <u />
      </b>
    </span>
  );
}

function Header({ pills = [] }) {
  return (
    <header className="bq-header">
      <span className="bq-brand">
        <b>HappyPix</b>
        <span>BOOTH</span>
      </span>
      <span className="bq-pills">
        {pills.map(([tone, text]) => (
          <span className={`bq-pill bq-pill-${tone}`} key={text}>
            {text}
          </span>
        ))}
      </span>
    </header>
  );
}

// The status row is part of the real header — each screen shows the
// hardware and event state that would actually be true at that point.
const PILLS = {
  waiting: [
    ['success', 'Camera'],
    ['success', 'Printer'],
    ['success', 'Paper 82%'],
  ],
  start: [
    ['pink', 'Sunset Weddings'],
    ['success', 'Online'],
  ],
  orientation: [['pink', 'Sunset Weddings']],
  templates: [
    ['pink', 'Sunset Weddings'],
    ['neutral', 'Portrait'],
  ],
  prints: [
    ['pink', 'Blush design'],
    ['neutral', 'Portrait'],
  ],
  payment: [
    ['neutral', '2 copies'],
    ['success', '1 extra'],
  ],
  camera: [
    ['success', 'Camera ready'],
    ['neutral', 'Shot 1 of 4'],
  ],
  photos: [['neutral', 'Choose 2 of 4']],
  customize: [['neutral', 'Warm filter']],
  success: [
    ['success', 'Printing'],
    ['success', 'Gallery ready'],
  ],
};

export default function BoothScreen({ mock, onAction, actionLabel }) {
  // The sign-in screen is shown before a session exists, so there is
  // no header to sit on.
  const chrome = mock.kind !== 'login';
  return (
    <div className={`device device-booth ${mock.kind === 'login' ? 'device-booth-signin' : ''}`}>
      <div className={`bscreen ${mock.dark ? 'bscreen-dark' : ''}`}>
        {chrome && <Header pills={mock.pills || PILLS[mock.kind] || [['success', 'Online']]} />}
        <div className="bscreen-body">{renderScreen(mock, onAction, actionLabel)}</div>
      </div>
      {mock.hotspots?.map((spot, index) => (
        <Hotspot key={spot.label} index={index + 1} {...spot} />
      ))}
    </div>
  );
}

function renderScreen(mock, onAction, actionLabel) {
  switch (mock.kind) {
    case 'login':
      return (
        <div className="bq-login">
          <div className="bq-login-copy">
            <span className="bq-brand big">
              <b>HappyPix</b>
            </span>
            <h3>Sign this booth in</h3>
            <p>One sign-in per booth. It stays signed in between events.</p>
          </div>
          <div className="bq-card">
            <label>
              Email
              <span className="bq-input">admin@organization.in</span>
            </label>
            <label>
              Password
              <span className="bq-input bq-mask">••••••••••</span>
            </label>
            <span className="bq-link">Windows USB camera host · configure</span>
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Sign in'}
            </button>
          </div>
        </div>
      );

    case 'waiting':
      return (
        <div className="bq-waiting">
          <div>
            <span className="bq-eyebrow">PRE-FLIGHT</span>
            <h3>Booth ready</h3>
            <p>Everything below is green. This is the screen to check before guests arrive.</p>
          </div>
          <ul className="bq-status">
            <li>
              <i className="ok" /> Camera <b>Live view active</b>
            </li>
            <li>
              <i className="ok" /> Printer <b>DNP DS-RX1HS</b>
            </li>
            <li>
              <i className="ok" /> Paper <b>82% · ribbon 64%</b>
            </li>
            <li>
              <i className="ok" /> Event <b>Sunset Weddings · Aanya &amp; Rohan</b>
            </li>
          </ul>
          <span className="bq-actions">
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Go to the welcome screen'}
            </button>
          </span>
        </div>
      );

    case 'start':
      return (
        <div className="bq-start">
          <div className="bq-start-copy">
            <span className="bq-eyebrow">Welcome to</span>
            <h3>{mock.headline}</h3>
            <p className="bq-meta">
              {mock.sub} <i aria-hidden="true" /> 4×6 prints <i aria-hidden="true" /> instant gallery
            </p>
            <blockquote>Two hearts, one beautiful beginning.</blockquote>
          </div>
          <div className="bq-start-art" aria-hidden="true">
            <span className="bq-polaroid one" />
            <span className="bq-polaroid two" />
            <span className="bq-polaroid three" />
            <span className="bq-heart">♥</span>
          </div>
          <button className="bq-touch" onClick={onAction}>
            <span aria-hidden="true">☞</span> {mock.cta || 'Touch anywhere to begin'}
          </button>
        </div>
      );

    case 'orientation':
      return (
        <div className="bq-centered">
          <div className="bq-title">
          <h3>Which shape do you want?</h3>
          <span className="bq-eyebrow">Step 1</span>
          </div>
          <div className="bq-orientation">
            <button className="bq-orient-card on" onClick={onAction}>
              <span className="bq-paper portrait">
                <i />
                <i />
                <small>HAPPYPIX</small>
              </span>
              <span>
                <b>Portrait</b>
                <small>The classic strip</small>
              </span>
              <span className="bq-check" aria-hidden="true">
                ✓
              </span>
            </button>
            <button className="bq-orient-card" onClick={onAction}>
              <span className="bq-paper landscape">
                <i />
                <i />
                <small>HAPPYPIX</small>
              </span>
              <span>
                <b>Landscape</b>
                <small>Two up, side by side</small>
              </span>
              <span className="bq-check" aria-hidden="true">
                ✓
              </span>
            </button>
          </div>
          <span className="bq-actions">
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Choose portrait'}
            </button>
          </span>
        </div>
      );

    case 'templates':
      return (
        <div className="bq-centered">
          <div className="bq-title">
            <h3>Pick a design</h3>
            <span className="bq-eyebrow">Step 2</span>
          </div>
          <div className="bq-templates">
            {['Blush', 'Midnight', 'Botanical', 'Studio'].map((name, index) => (
              <button key={name} className={`bq-tpl ${index === 0 ? 'on' : ''}`} onClick={onAction}>
                <span className="bq-tpl-art">
                  <i />
                  <i />
                  <small>HAPPYPIX</small>
                </span>
                <b>{name}</b>
              </button>
            ))}
          </div>
          <span className="bq-actions">
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Use this design'}
            </button>
          </span>
        </div>
      );

    case 'prints':
      return (
        <div className="bq-prints">
          <div>
            <span className="bq-eyebrow">Step 3</span>
            <h3>How many copies?</h3>
            <p>Two are included with your session. Extra copies print the same way.</p>
            <dl className="bq-summary">
              <div>
                <dt>Included</dt>
                <dd>2 copies</dd>
              </div>
              <div>
                <dt>Extra copy</dt>
                <dd>₹100</dd>
              </div>
            </dl>
          </div>
          <div className="bq-qty">
            {[1, 2, 3].map((n) => (
              <button key={n} className={`bq-qty-card ${n === 2 ? 'on' : ''}`} onClick={onAction}>
                <b>{n}</b>
                <small>{n === 1 ? 'copy' : 'copies'}</small>
              </button>
            ))}
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Continue'}
            </button>
          </div>
        </div>
      );

    case 'payment':
      return (
        <div className="bq-payment">
          <div className="bq-card">
            <span className="bq-eyebrow">Step 4 · extras</span>
            <h3>1 extra copy</h3>
            <dl className="bq-summary">
              <div>
                <dt>Extra copy</dt>
                <dd>₹100</dd>
              </div>
              <div className="bq-discount">
                <dt>Coupon WEDDING18</dt>
                <dd>− ₹18</dd>
              </div>
            </dl>
            <div className="bq-total">
              <span>To pay</span>
              <strong>₹82</strong>
            </div>
          </div>
          <div className="bq-card bq-card-center">
            <span className="bq-amount">₹82</span>
            <QrFrame />
            <p>Scan with any UPI app, or enter a coupon code</p>
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'I have paid'}
            </button>
          </div>
        </div>
      );

    case 'camera':
      return (
        <div className="bq-camera">
          <div className="bq-viewfinder">
            <span className="bq-face" aria-hidden="true" />
            <span className="bq-count" aria-hidden="true">
              3
            </span>
            <span className="bq-hud">Shot 1 of 4 · Smile</span>
          </div>
          <button className="bq-btn primary big" onClick={onAction}>
            {actionLabel || 'Take the shots'}
          </button>
        </div>
      );

    case 'photos':
      return (
        <div className="bq-photos">
          <div>
            <span className="bq-eyebrow">Step 6</span>
            <h3>Pick your best two</h3>
            <p>Tap the frames you want on the print.</p>
          </div>
          <div className="bq-negative">
            <span className="bq-rail">
              <em>HAPPYPIX · SESSION 0142</em>
              <em>4 FRAMES</em>
            </span>
            <div className="bq-track">
              {[1, 2, 3, 4].map((n) => (
                <button key={n} className={n <= 2 ? 'on' : ''} onClick={onAction}>
                  <span>0{n}</span>
                  {n <= 2 && <i aria-hidden="true">✓</i>}
                </button>
              ))}
            </div>
          </div>
          <span className="bq-actions">
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Use these photos'}
            </button>
          </span>
        </div>
      );

    case 'customize':
      return (
        <div className="bq-customize">
          <div className="bq-preview">
            <span className="bq-print-preview">
              <i />
              <i />
              <small>SUNSET WEDDINGS</small>
            </span>
            <small className="bq-preview-note">Your print, updating live</small>
          </div>
          <div>
            <span className="bq-eyebrow">Step 7</span>
            <h3>Finishing touches</h3>
            <div className="bq-filters">
              {['None', 'Warm', 'Cool', 'Mono'].map((name, index) => (
                <button
                  key={name}
                  className={`bq-filter ${index === 1 ? 'on' : ''} filter-${name.toLowerCase()}`}
                  onClick={onAction}
                >
                  <i />
                  <span>{name}</span>
                </button>
              ))}
            </div>
            <div className="bq-stickers">
              {['♥', '✦', '☺'].map((mark) => (
                <button key={mark} onClick={onAction}>
                  {mark}
                </button>
              ))}
            </div>
            <span className="bq-actions">
              <button className="bq-btn primary" onClick={onAction}>
                {actionLabel || 'Finish my print'}
              </button>
            </span>
          </div>
        </div>
      );

    case 'success':
      return (
        <div className="bq-success">
          <div>
            <span className="bq-mark" aria-hidden="true">
              ✓
            </span>
            <span className="bq-eyebrow">All done</span>
            <h3>Your prints are coming</h3>
            <p>Collect them from the slot below. Scan the code for every photo from tonight.</p>
            <span className="bq-ref">Job HP-0142 · 2 copies · 4×6</span>
          </div>
          <div className="bq-card bq-card-center">
            <h4>Take them with you</h4>
            <QrFrame tone="green" />
            <p>Live for 24 hours</p>
            <button className="bq-btn ghost" onClick={onAction}>
              {actionLabel || 'Back to welcome'}
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="bq-centered">
          <h3>{mock.title || 'Booth screen'}</h3>
          <span className="bq-actions">
            <button className="bq-btn primary" onClick={onAction}>
              {actionLabel || 'Next'}
            </button>
          </span>
        </div>
      );
  }
}
