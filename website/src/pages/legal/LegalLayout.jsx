// Shared shell for the three legal pages.
//
// These are static: no fetching, no state, no animation. A visitor who
// arrives here from a footer link — or an app-store reviewer checking the
// policy URL — should get the whole document in one scrollable page with
// a contents list they can jump through.

import { useEffect, useState } from 'react'
import { PageHero, Reveal } from '../../components/ui.jsx'
import LegalBody from './LegalBody.jsx'

export default function LegalLayout({ kicker, title, updated, summary, sections }) {
  const [active, setActive] = useState(sections[0]?.id || '')

  // The contents rail follows the reading position. IntersectionObserver
  // rather than scroll maths so it stays correct at any zoom level.
  useEffect(() => {
    const nodes = sections.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: 0 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      <PageHero kicker={kicker} title={title} sub={summary} />

      <section className="section" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="legal-shell">
            <aside className="legal-rail" aria-label="Contents">
              <div className="legal-rail-inner">
                <p className="legal-updated">Last updated {updated}</p>
                <nav>
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={active === section.id ? 'on' : ''}
                      onClick={() => setActive(section.id)}
                    >
                      {section.heading}
                    </a>
                  ))}
                </nav>
                <p className="legal-rail-note">
                  Questions about this policy? Write to{' '}
                  <a href="mailto:hello@happypix.com.au">hello@happypix.com.au</a>.
                </p>
              </div>
            </aside>

            <Reveal>
              <article className="legal-doc">
                <LegalBody sections={sections} />
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
