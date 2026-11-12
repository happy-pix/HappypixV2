// ─────────────────────────────────────────────────────────────────
//  HappyPix Field Guide — application shell.
//
//  Sidebar, breadcrumbs, routing and the sign-in flow. Page bodies
//  live in pages.jsx; private member articles in
//  components/MemberArticles.jsx.
//
//  Routing is query-based (?page=…&step=…) so a static host needs no
//  rewrite rules, and any guide can be linked to a specific step.
// ─────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from 'react';
import { publicPages, GROUP_ORDER } from './content/public.js';
import { BOOTH_STEPS } from './content/boothFlow.js';
import { CRM_STEPS } from './content/crmFlow.js';
import { FAQ } from './content/brand.js';
import { HARDWARE_INDEX_ENTRIES } from './content/hardware.js';
import { BRAND_LINKS } from './content/brand.js';
import { buildSearchIndex } from './lib/search.js';
import { buildSetupIndexEntries } from './lib/setupGuide.js';
import { api } from './lib/api.js';
import { Breadcrumbs, Icon } from './components/ui.jsx';
import SearchPalette from './components/SearchPalette.jsx';
import SignInModal from './components/SignInModal.jsx';
import MemberArticle from './components/MemberArticles.jsx';
import OnThisPage from './components/OnThisPage.jsx';
import Preferences from './components/Preferences.jsx';
import ShortcutsDialog from './components/ShortcutsDialog.jsx';
import { apply as applyPreferences, toggleTheme } from './lib/prefs.js';
import { pageToMarkdown, slugForDownload, downloadTextFile } from './lib/markdown.js';
import { BrandPage, BoothPage, CrmPage, SetupPage } from './pages.jsx';

const HELP = 'You are not signed in. These public guides can still help.';

function readRoute() {
  const params = new URLSearchParams(window.location.search);
  return { page: params.get('page') || 'happypix-101', step: params.get('step') || null };
}

function stepIdFromSection(sectionId) {
  return sectionId?.startsWith('step-') ? sectionId.slice(5) : null;
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const [memberDocs, setMemberDocs] = useState(null);
  const [memberUser, setMemberUser] = useState(null);
  // The session is an httpOnly cookie, so this page cannot read it to
  // know whether you are signed in — it has to ask. That happens once
  // on mount and again after a sign-in or sign-out.
  //
  // Asking must not hold up the page. A visitor reading a public guide
  // sees it immediately and the member nav appears a moment later if
  // the cookie turns out to be valid. Only a deep link straight to a
  // member page waits, because there is nothing public to show.
  const [sessionProbe, setSessionProbe] = useState(0);
  const [authStatus, setAuthStatus] = useState(() =>
    publicPages.some((item) => item.id === readRoute().page) ? 'public' : 'checking',
  );
  const [showSignIn, setShowSignIn] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  // Reading preferences, the contents rail and the export of the
  // page you are looking at.
  const [setupGuide, setSetupGuide] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    applyPreferences();
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const publicPage = publicPages.find((item) => item.id === route.page);
  const memberPage = memberDocs?.pages?.find((item) => item.id === route.page);
  const page = publicPage || memberPage;
  const privateFailure = !publicPage && authStatus !== 'authorized';

  // ── Navigation ──────────────────────────────────────────────────

  const go = useCallback(
    (pageId, sectionId = null, { replace = false } = {}) => {
      const isMemberPage = memberDocs?.pages?.some((item) => item.id === pageId);
      if (isMemberPage && authStatus !== 'authorized') {
        setUnauthorized(true);
        return;
      }

      const step = stepIdFromSection(sectionId);
      setRoute({ page: pageId, step });
      setMobileOpen(false);
      setPaletteOpen(false);
      setUnauthorized(false);

      const url = new URL(window.location.href);
      url.searchParams.set('page', pageId);
      if (step) url.searchParams.set('step', step);
      else url.searchParams.delete('step');
      window.history[replace ? 'replaceState' : 'pushState']({}, '', url);

      // Give the page a frame to mount before moving.
      requestAnimationFrame(() => {
        const target = sectionId ? document.getElementById(sectionId) : null;
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },
    [memberDocs, authStatus],
  );

  const askUs = useCallback(() => {
    if (route.page === 'happypix-101') {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    go('happypix-101', 'contact');
  }, [go, route.page]);

  useEffect(() => {
    const onPop = () => {
      const next = readRoute();
      setRoute(next);
      setUnauthorized(!publicPages.some((item) => item.id === next.page));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ── Keyboard: ⌘K / Ctrl+K / "/" opens the palette ───────────────

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      const typing = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setPaletteOpen((value) => !value);
        return;
      }
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !paletteOpen) {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }
      // "t" flips the theme, "?" opens the shortcut list. Both stay
      // out of the way while the palette or a dialog has the keyboard.
      if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && !event.defaultPrevented) {
        const busy = document.querySelector('.palette-backdrop, .modal-backdrop');
        if (event.key === 't' && !busy) {
          event.preventDefault();
          toggleTheme();
        } else if (event.key === '?' && !busy) {
          event.preventDefault();
          setShortcutsOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  // ── Restore a saved session ─────────────────────────────────────

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [session, docs] = await Promise.all([api('/api/auth/me'), api('/api/docs/private')]);
        if (!alive) return;
        if (!alive) return;
        // A payload with no pages is not a member session — treat it
        // as no session rather than rendering an empty member nav.
        if (!docs?.pages?.length) throw new Error('no member pages');
        setMemberUser(session.user);
        setMemberDocs(docs);
        setAuthStatus('authorized');
      } catch {
        if (!alive) return;
        setMemberDocs(null);
        setMemberUser(null);
        setAuthStatus('public');
        // Stay on the page that was asked for. If it is a member page
        // the shell now shows the "not signed in" screen, which is
        // what a visitor needs to see; if it is public, they simply
        // carry on reading it.
        if (!publicPages.some((item) => item.id === readRoute().page)) {
          setUnauthorized(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionProbe]);

  const handleSignInSuccess = async (user, docs) => {
    setMemberUser(user);
    setMemberDocs(docs);
    setAuthStatus('authorized');
    setShowSignIn(false);
    go(docs.pages?.[0]?.id || 'happypix-101', null, { replace: true });
  };

  const signOut = () => {
    setMemberDocs(null);
    setMemberUser(null);
    setAuthStatus('public');
    setUnauthorized(false);
    go('happypix-101', null, { replace: true });
    // The backend clears the cookie; nothing is stored here to clear.
    api('/api/auth/logout', { method: 'POST' })
      .catch(() => {})
      .finally(() => setSessionProbe((value) => value + 1));
  };

  // ── Copy a deep link to a section ───────────────────────────────

  const copyLink = useCallback(async (sectionId) => {
    const url = new URL(window.location.href);
    url.hash = `#${sectionId}`;
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedId(sectionId);
      setTimeout(() => setCopiedId((current) => (current === sectionId ? null : current)), 1600);
    } catch {
      setNotice('Your browser blocked clipboard access. Copy the address from the bar instead.');
    }
  }, []);

  // ── Download this page as Markdown ──────────────────────────────

  const download = useCallback(() => {
    const subject = memberPage || publicPage;
    if (!subject) return;
    const markdown = pageToMarkdown({
      page: publicPage || null,
      memberPage: memberPage || null,
      setupGuide: publicPage?.view === 'setup' ? setupGuide : null,
    });
    const filename = slugForDownload(subject.title);
    const saved = downloadTextFile(filename, markdown);
    setNotice(
      saved
        ? `Downloaded ${filename} — Markdown, opens in any editor.`
        : 'Downloads need a served page. Press ⌘P and choose "Save as PDF" instead.',
    );
  }, [memberPage, publicPage, setupGuide]);

  // ── Search index ────────────────────────────────────────────────

  const searchIndex = useMemo(
    () =>
      buildSearchIndex({
        publicPages,
        boothSteps: BOOTH_STEPS,
        crmSteps: CRM_STEPS,
        faq: FAQ,
        hardware: HARDWARE_INDEX_ENTRIES,
        setup: buildSetupIndexEntries(),
        memberPages: authStatus === 'authorized' ? memberDocs?.pages || [] : [],
      }),
    [authStatus, memberDocs],
  );

  // ── Breadcrumbs ─────────────────────────────────────────────────

  const trail = privateFailure
    ? [{ label: 'Documentation', pageId: 'happypix-101' }, { label: 'Help' }]
    : [
        { label: 'Documentation', pageId: 'happypix-101' },
        ...(page?.group ? [{ label: page.group }] : []),
        { label: page?.title || 'Welcome to HappyPix' },
      ];

  const navGroups = GROUP_ORDER.filter((group) => publicPages.some((item) => item.group === group));

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <img src="/logo-mark-on-dark.svg" alt="" />
          <div>
            <b>HappyPix</b>
            <span>DOCUMENTATION</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            ×
          </button>
        </div>

        <div className="sidebar-intro">
          <span>EVENTS, BOOTHS &amp; THE BITS BETWEEN</span>
          <p>Good things happen when everything clicks.</p>
        </div>

        <button className="nav-search" onClick={() => setPaletteOpen(true)}>
          <span aria-hidden="true">⌕</span>
          <em>Search the guide</em>
          <kbd>⌘K</kbd>
        </button>

        <nav className="side-nav" aria-label="Documentation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group}>
              <span className="nav-heading">{group}</span>
              {publicPages
                .filter((item) => item.group === group)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={`nav-item ${route.page === item.id ? 'active' : ''}`}
                  >
                    <Icon>{item.icon}</Icon>
                    {item.title}
                  </button>
                ))}
            </div>
          ))}

          {authStatus === 'authorized' && memberDocs && (
            <div className="nav-group member-nav">
              <span className="nav-heading">{memberDocs.navigationTitle}</span>
              {memberDocs.pages.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${route.page === item.id ? 'active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <Icon>{item.icon}</Icon>
                  {item.title}
                  <span className="lock-open" aria-hidden="true">
                    ✳
                  </span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-bottom">
          <a className="side-link" href={BRAND_LINKS.pricing} target="_blank" rel="noreferrer">
            <span aria-hidden="true">↗</span> Plans &amp; pricing
          </a>
          <a className="side-link" href={BRAND_LINKS.crm} target="_blank" rel="noreferrer">
            <span aria-hidden="true">↗</span> Open the CRM
          </a>
          <a className="side-link" href={BRAND_LINKS.software} target="_blank" rel="noreferrer">
            <span aria-hidden="true">↗</span> Get the booth app
          </a>

          <div className="signin-row">
            {authStatus === 'authorized' ? (
              <>
                <span className="avatar">{memberUser?.name?.charAt(0) || 'H'}</span>
                <span className="signed-name">
                  {memberUser?.name || 'Platform member'}
                  <small>Platform team</small>
                </span>
                <button className="signout" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <button className="signin-button" onClick={() => setShowSignIn(true)}>
                <span aria-hidden="true">↗</span> Sign in
              </button>
            )}
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
      )}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            ☰
          </button>
          <Breadcrumbs trail={trail} onNavigate={(pageId) => go(pageId)} />
          <div className="top-actions">
            <a href={BRAND_LINKS.pricing} target="_blank" rel="noreferrer">
              Find your plan <span aria-hidden="true">↗</span>
            </a>
            <span className="top-divider" aria-hidden="true" />
            <button onClick={askUs}>Ask us</button>
            <span className="top-divider" aria-hidden="true" />
            <Preferences onDownload={download} onShowShortcuts={() => setShortcutsOpen(true)} />
          </div>
        </header>

        <div className="page-wrap">
          {authStatus === 'checking' && (
            <div className="auth-check">
              <span className="spinner" /> Checking your member access…
            </div>
          )}

          {privateFailure && authStatus !== 'checking' && (
            <section className="unauthorized">
              <span className="unauth-mark" aria-hidden="true">
                ?
              </span>
              <span className="eyebrow">NEED A HAND?</span>
              <h1>{HELP}</h1>
              <p>
                The page you were looking for is for the HappyPix platform team. Everything a client needs is
                in the public guides on the left — and if it is not there, write to us and we will answer.
              </p>
              <div className="unauth-actions">
                <button className="button secondary" onClick={() => go('happypix-101')}>
                  Back to the public guides
                </button>
                <button className="button quiet" onClick={askUs}>
                  Write to the team
                </button>
              </div>
            </section>
          )}

          {!privateFailure && authStatus !== 'checking' && (
            <>
              <section className="page-hero">
                <div className="hero-kicker">
                  <span className="pulse-dot" aria-hidden="true" /> THE HAPPYPIX DOCUMENTATION
                  <span className="hero-line" aria-hidden="true" /> {page?.read || ''}
                </div>
                <div className="hero-grid">
                  <div>
                    <div className="hero-tags">
                      {(page?.tags || []).map((tag) => (
                        <span className="badge" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h1>
                      {page?.title || 'Welcome to HappyPix'}
                      <span className="hero-spark" aria-hidden="true">
                        ✳
                      </span>
                    </h1>
                    <p>{page?.description}</p>
                  </div>
                  <div className="hero-stamp">
                    <span>MADE FOR</span>
                    <b>
                      Good
                      <br />
                      events.
                    </b>
                    <i aria-hidden="true">✳</i>
                  </div>
                </div>
                <div className="hero-meta">
                  <span>SHORT READS. REAL HELP.</span>
                  <span>
                    LASTING MOMENTS, MADE SIMPLE <b aria-hidden="true">↗</b>
                  </span>
                </div>
              </section>

              <div className="reading-row">
                <article className="article-content">
                  {publicPage?.view === 'brand' && <BrandPage onNavigate={(id) => go(id)} />}
                  {publicPage?.view === 'booth' && <BoothPage initialStepId={route.step} />}
                  {publicPage?.view === 'crm' && <CrmPage initialStepId={route.step} />}
                  {publicPage?.view === 'setup' && <SetupPage onGuideChange={setSetupGuide} />}
                  {memberPage && <MemberArticle page={memberPage} />}
                </article>
                <OnThisPage className='onthispage' pageId={route.page} onCopyLink={copyLink} copiedId={copiedId} />
              </div>
            </>
          )}

          {unauthorized && !privateFailure && null}

          <footer className="page-footer">
            <span>© HappyPix · Made for the moments worth keeping.</span>
            <a href={BRAND_LINKS.website} target="_blank" rel="noreferrer">
              HappyPix.in ↗
            </a>
          </footer>
        </div>
      </main>

      <SearchPalette
        open={paletteOpen}
        index={searchIndex}
        onNavigate={(pageId, sectionId) => go(pageId, sectionId)}
        onClose={() => setPaletteOpen(false)}
      />

      {shortcutsOpen && <ShortcutsDialog onClose={() => setShortcutsOpen(false)} />}

      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice(null)} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSuccess={handleSignInSuccess}
          onUnauthorized={() => {
            setShowSignIn(false);
            setAuthStatus('public');
            go('happypix-101', null, { replace: true });
            setUnauthorized(false);
            askUs();
          }}
        />
      )}
    </div>
  );
}
