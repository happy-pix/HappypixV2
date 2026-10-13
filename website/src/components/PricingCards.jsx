import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { inr } from '../lib/api.js'
import { PLAN_HIGHLIGHTS } from '../data/content.js'

export default function PricingCards({ plans, selectedKey, onSelect, linkToCheckout = false }) {
  return (
    <div className="plans">
      {plans.map((plan, i) => {
        const featured = plan.key === 'professional'
        const discount = plan.discount?.active
        return (
          <motion.article
            key={plan.key}
            className={`plan-card${featured ? ' hot' : ''}${selectedKey === plan.key ? ' selected' : ''}`}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
          >
            {featured && <span className="plan-tag">Most loved</span>}
            <div className="pname">{plan.name}</div>
            <p className="pfor">{plan.description}</p>

            <div className="price-row">
              {plan.price == null ? (
                <span className="price-now">Custom</span>
              ) : (
                <>
                  <span className="price-now">{inr(plan.effectivePrice)}</span>
                  {discount && <span className="price-was">{inr(plan.originalPrice)}</span>}
                  {discount && <span className="save-chip">Save {plan.discountPercent}%</span>}
                </>
              )}
            </div>
            <div className="disc-note">
              {plan.price == null
                ? 'Tailored quote'
                : plan.effectivePrice === 0
                  ? 'Free while it lasts'
                  : `for ${plan.durationLabel}${discount && plan.discount.discountLabel ? ` · ${plan.discount.discountLabel}` : ''}`}
            </div>

            <ul className="plan-feats">
              {(PLAN_HIGHLIGHTS[plan.key] || [`${plan.devices} booth(s) included`, `${plan.events} parallel event(s)`, 'Booth app + CRM access', 'QR digital copies']).map((line) => (
                <li key={line}><span>{line}</span></li>
              ))}
            </ul>

            {plan.price == null ? (
              <Link to="/contact" className="btn btn-ink">Talk to sales</Link>
            ) : linkToCheckout ? (
              <Link to={`/pricing?plan=${plan.key}#checkout`} className={featured ? 'btn btn-pink' : 'btn btn-ghost'}>
                {plan.effectivePrice === 0 ? 'Start free trial' : 'Buy / renew'}
              </Link>
            ) : (
              <button className={featured ? 'btn btn-pink' : 'btn btn-ghost'} onClick={() => onSelect && onSelect(plan.key)}>
                {selectedKey === plan.key ? 'Selected ✓' : plan.effectivePrice === 0 ? 'Start free trial' : 'Choose ' + plan.name}
              </button>
            )}
          </motion.article>
        )
      })}
    </div>
  )
}
