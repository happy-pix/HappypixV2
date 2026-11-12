// ─────────────────────────────────────────────────────────────────
//  "On this page" — the right-hand contents rail, with scroll-spy.
//
//  Section labels are read from the rendered document rather than a
//  parallel list, so they stay correct for every page type — including
//  the member pages, whose structure comes from the backend.
//
//  Two things this has to get right, both of which it got wrong:
//
//  1. A page's section TITLES can change without its id changing. The
//     setup guide rebuilds three of its four sections from the cameras
//     and printers you pick ("Connect your Canon EOS R6 over Wi-Fi"
//     becomes "Connect your Nikon Z6 II by USB"), and the rail used to
//     re-read them only when pageId changed — so it kept showing the
//     first camera you ever chose.
//
//  2. Reading the document is a side effect on someone else's DOM. A
//     MutationObserver scoped to the article is what keeps the rail in
//     step; there is no prop that would tell this component when the
//     guide changed.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

/** The article the rail describes. Scoping to it keeps observer
 *  traffic away from the sidebar, the palette and the footer. */
const ARTICLE_SELECTOR = '.article-content';
const SECTION_SELECTOR = '.doc-section[id], .contact-panel[id]';

function sectionLabel(node, previous) {
  return (
    node.querySelector('h2')?.textContent?.trim() ||
    node.querySelector('h1')?.textContent?.trim() ||
    // A section that is briefly empty mid-update should keep its last
    // known label rather than fall back to a raw id.
    previous ||
    node.id
  );
}

function readSections(root) {
  const scope = root || (typeof document === 'undefined' ? null : document.querySelector(ARTICLE_SELECTOR));
  if (!scope) return [];
  return Array.from(scope.querySelectorAll(SECTION_SELECTOR)).map((node) => ({
    id: node.id,
    label: sectionLabel(node, node.dataset.tocLabel),
    // A section with no heading is still a scroll target, but it does
    // not belong in a contents list — it would read as a bare id.
    titled: Boolean(node.querySelector('h2, h1')),
  }));
}

/** Are two section lists the same for rendering purposes? */
function sameSections(a, b) {
  return (
    a.length === b.length &&
    a.every((section, index) => section.id === b[index].id && section.label === b[index].label)
  );
}

export default function OnThisPage({ pageId, onCopyLink, copiedId }) {
  const [sections, setSections] = useState([]);
  const [active, setActive] = useState(null);

  // ── Read the sections, and keep reading them ──────────────────
  useEffect(() => {
    let frame = null;

    const refresh = () => {
      const root = document.querySelector(ARTICLE_SELECTOR);
      const next = readSections(root);

      // Remember the label on the node, so a mid-update section that
      // momentarily has no heading does not lose its name.
      for (const section of next) {
        if (!section.titled) continue;
        const node = document.getElementById(section.id);
        if (node) node.dataset.tocLabel = section.label;
      }

      setSections((current) => (sameSections(current, next) ? current : next));
    };

    // The article renders in the same commit; wait a frame so the
    // sections exist before reading them.
    frame = requestAnimationFrame(refresh);

    const article = document.querySelector(ARTICLE_SELECTOR);
    let observer = null;
    if (article && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        // Coalesce a burst of mutations (a whole guide re-render) into
        // one read on the next frame.
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(refresh);
      });
      observer.observe(article, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['id'],
      });
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pageId]);

  // ── Scroll-spy ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || sections.length === 0) return undefined;

    const visible = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          visible.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        let best = null;
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: '-84px 0px -60% 0px', threshold: [0, 0.2, 0.5, 1] },
    );

    for (const section of sections) {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [sections]);

  // Only sections with a real heading are worth listing.
  const listed = sections.filter((section) => section.titled);
  if (listed.length === 0) return null;

  return (
    <nav className="toc" aria-label="On this page">
      <span className="toc-title">On this page</span>
      <ol>
        {listed.map((section) => (
          <li key={section.id} className={active === section.id ? 'on' : ''}>
            <a
              href={`#${section.id}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActive(section.id);
              }}
            >
              {section.label}
            </a>
            <button
              className="toc-copy"
              onClick={() => onCopyLink(section.id)}
              aria-label={`Copy link to ${section.label}`}
              title="Copy link to this section"
            >
              {copiedId === section.id ? '✓' : '#'}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
