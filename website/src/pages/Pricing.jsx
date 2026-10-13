import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { PageHero, Reveal } from '../components/ui.jsx'
import PricingCards from '../components/PricingCards.jsx'
import Checkout from '../components/Checkout.jsx'
import { fetchPlans } from '../lib/api.js'
import { PLAN_MATRIX, FAQS } from '../data/content.js'

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [demo, setDemo] = useState(false)
  const [selected, setSelected] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [params] = useSearchParams()
  const location = useLocation()

  useEffect(() => {
    fetchPlans().then(({ plans, demo }) => {
      setPlans(plans)
      setDemo(demo)
      const wanted = params.get('plan')
      setSelected(
        (wanted && plans.some((p) => p.key === wanted) && wanted)
        || plans.find((p) => p.key === 'professional')?.key
        || plans[0]?.key
        || '',
      )
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (location.hash === '#checkout' && plans.length) {
      document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash, plans])

  const select = (key) => {
    setSelected(key)
    document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <PageHero
        kicker="Pricing & plans"
        title={<>Honest pricing, booth by <span className="accent-it">booth</span>.</>}
        sub="Start with a 14-day free trial — full product, one booth, no card. Upgrade when the bookings say so. Renewing from here extends your current plan from its expiry, so a paid day is never lost."
      />

      <section className="section" style={{ paddingTop: 64 }}>
        <div className="wrap">
          {plans.length ? (
            <PricingCards plans={plans} selectedKey={selected} onSelect={select} />
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--muted)', padding: 40 }}>Loading plans…</p>
          )}

          <Reveal style={{ marginTop: 72 }}>
            <div className="section-head" style={{ marginBottom: 30 }}>
              <span className="kicker c-pink">Buy or renew</span>
              <h2 className="h-lg">One form. New studio or <span className="accent-it">old friend</span>.</h2>
              <p className="lead">
                Enter your organization, phone, email and password. A <b>new email</b> registers your studio the moment
                payment confirms; an <b>existing email</b> asks for your CRM password — match it, and the plan lands on
                the organization you already run.
              </p>
            </div>
            {plans.length ? <Checkout plans={plans} selectedKey={selected} onSelect={setSelected} demo={demo} /> : null}
          </Reveal>

          <div className="grid-3" style={{ marginTop: 52 }}>
            {[
              ['No lost days', 'Renewals extend from your current expiry — never from “today”.'],
              ['GST invoice, instantly', 'Every payment produces an invoice number you can file the same minute.'],
              ['Lapse, don’t lock-in', 'No auto-card traps. If a plan lapses, your data stays yours.'],
            ].map(([title, text], i) => (
              <Reveal key={title} delay={i * 0.07}>
                <div className="card" style={{ height: '100%' }}><h3>{title}</h3><p>{text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="kicker c-blue">Compare plans</span>
            <h2 className="h-lg">What changes as you <span className="accent-it" style={{ color: 'var(--blue)' }}>grow</span></h2>
            <p className="lead">Every plan includes the booth app, CRM, guest QR downloads and unlimited sessions. Higher plans add booths, parallel events and the money-making extras.</p>
          </Reveal>
          <Reveal>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>Capability</th><th>Starter</th><th>Professional</th><th>Business</th></tr></thead>
                <tbody>
                  {PLAN_MATRIX.map(([label, a, b, c]) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className={a ? 'y' : 'n'}>{a ? '✓ Included' : '—'}</td>
                      <td className={b ? 'y hot' : 'n'}>{b ? '✓ Included' : '—'}</td>
                      <td className={c ? 'y' : 'n'}>{c ? '✓ Included' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <Reveal className="section-head">
            <span className="kicker c-purple">Questions</span>
            <h2 className="h-lg">Before you <span className="accent-it" style={{ color: 'var(--purple)' }}>ask</span></h2>
          </Reveal>
          <Reveal>
            <div>
              {FAQS.map((f, i) => (
                <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={f.q}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{f.q}</button>
                  {openFaq === i && <p className="faq-a">{f.a}</p>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
