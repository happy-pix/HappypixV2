import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createOrder, verifyPayment, loadRazorpay, inr, CRM_URL } from '../lib/api.js'
import { Icon } from './ui.jsx'

// ─── Buy / renew a plan ──────────────────────────────────────
// One form for both journeys:
//   • new email  → account is registered when payment confirms
//   • known email → password must match the existing CRM account,
//     then the purchase renews/upgrades that organization
// Payment runs through Razorpay (the platform's existing gateway).

const emptyForm = { organizationName: '', ownerName: '', phone: '', email: '', password: '' }

export default function Checkout({ plans, selectedKey, onSelect, demo }) {
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const plan = useMemo(
    () => plans.find((p) => p.key === selectedKey) || plans.find((p) => p.price > 0) || plans[0],
    [plans, selectedKey],
  )

  useEffect(() => { setError(''); setSuccess(null) }, [selectedKey])

  if (!plan) return null
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const contactSales = plan.price == null
  const isFree = plan.effectivePrice === 0

  const finishDemo = (orderData) => {
    // Only used when the website backend is unreachable (preview/demo):
    // clearly labelled as a simulation once, in the success panel.
    setSuccess({
      demo: true,
      isExistingAccount: false,
      invoiceNo: 'DEMO — connect website-backend to go live',
      plan: { name: plan.name, endDate: null },
      organization: { name: form.organizationName },
      message: orderData?.message || 'This was a demo checkout. Connect the HappyPix website backend + Razorpay keys and this exact flow takes real payments.',
    })
    setBusy('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (contactSales) return
    setBusy('order')
    try {
      const order = await createOrder({ planKey: plan.key, ...form })

      if (order.free || demo) {
        if (demo && !order.free) return finishDemo(order)
        setSuccess({
          ...order,
          plan: { name: plan.name, endDate: order.plan?.endDate || null },
          organization: order.organization || { name: form.organizationName },
        })
        setBusy('')
        return
      }

      setBusy('payment')
      const Razorpay = await loadRazorpay()
      const checkout = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'HappyPix',
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: '#EA097F' },
        modal: { ondismiss: () => setBusy('') },
        handler: async (response) => {
          setBusy('verify')
          try {
            const result = await verifyPayment(response)
            setSuccess({ ...result, plan: { name: plan.name, endDate: result.plan?.endDate || null } })
          } catch (err) {
            setError(err.message)
          } finally {
            setBusy('')
          }
        },
      })
      checkout.on('payment.failed', () => {
        setError('The payment did not go through. No plan was changed — you can try again.')
        setBusy('')
      })
      checkout.open()
    } catch (err) {
      if (demo) return finishDemo(null)
      setError(err.message)
      setBusy('')
    }
  }

  return (
    <div id="checkout" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 26, alignItems: 'start' }} className="checkout-grid">
      {/* ── form ── */}
      <div style={{ background: 'var(--white)', border: '1.5px solid var(--line)', borderRadius: 26, padding: 'clamp(24px, 4vw, 40px)' }}>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="chip chip-live"><Icon name="check" size={13} /> {success.demo ? 'Demo complete' : 'Plan active'}</span>
              <h3 style={{ fontSize: '2rem', margin: '16px 0 10px' }}>
                {success.isExistingAccount ? <>Welcome back — <em>renewed!</em></> : <>You’re in, <em>{(success.organization?.name || 'friend').split(' ')[0]}!</em></>}
              </h3>
              <p style={{ color: 'var(--ink-soft)' }}>{success.message}</p>
              <div style={{ margin: '22px 0', padding: '16px 18px', borderRadius: 16, background: 'var(--paper)', border: '1px dashed var(--line)', display: 'grid', gap: 7, fontSize: '.96rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Plan</span><b>{success.plan?.name}</b></div>
                {success.invoiceNo ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Invoice</span><b>{success.invoiceNo}</b></div> : null}
                {success.plan?.endDate ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Active until</span><b>{new Date(success.plan.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b></div> : null}
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-pink" href={CRM_URL} target="_blank" rel="noreferrer">Open your CRM <Icon name="arrow" size={17} /></a>
                <button className="btn btn-ghost" onClick={() => { setSuccess(null); setForm(emptyForm) }}>Buy another plan</button>
              </div>
              <p style={{ marginTop: 14, fontSize: '.86rem', color: 'var(--muted)' }}>Sign in with <b>{form.email}</b> and the password you just used.</p>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -14 }} onSubmit={submit}>
              <h3 style={{ fontSize: '1.7rem' }}>Your details</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '.96rem', margin: '8px 0 22px' }}>
                Already a HappyPix customer? Use your CRM email + password and this purchase renews your existing organization — no duplicate account, no lost days.
              </p>

              <div style={{ display: 'grid', gap: 16 }}>
                <div className="field">
                  <label htmlFor="co-plan">Choose your plan</label>
                  <select id="co-plan" value={plan.key} onChange={(e) => onSelect(e.target.value)}>
                    {plans.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name} — {p.price == null ? 'Contact sales' : p.effectivePrice === 0 ? 'Free' : `${inr(p.effectivePrice)} / ${p.durationLabel}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-2col">
                  <div className="field">
                    <label htmlFor="co-org">Organization / business name *</label>
                    <input id="co-org" required value={form.organizationName} onChange={set('organizationName')} placeholder="Sunset Weddings" />
                  </div>
                  <div className="field">
                    <label htmlFor="co-owner">Your name *</label>
                    <input id="co-owner" required value={form.ownerName} onChange={set('ownerName')} placeholder="Priya Sharma" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-2col">
                  <div className="field">
                    <label htmlFor="co-phone">Phone number</label>
                    <input id="co-phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" inputMode="tel" />
                  </div>
                  <div className="field">
                    <label htmlFor="co-email">Email *</label>
                    <input id="co-email" required type="email" value={form.email} onChange={set('email')} placeholder="you@studio.com" />
                    <span className="hint">New email → we register you. Existing email → we verify your password below.</span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="co-pass">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input id="co-pass" required type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters, with a number" style={{ paddingRight: 92 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.8rem', padding: '7px 12px', borderRadius: 999, cursor: 'pointer' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <span className="hint">For existing accounts this must match your CRM password — that’s how we know it’s really you.</span>
                </div>
              </div>

              {error ? <div className="form-error" style={{ marginTop: 18 }}>{error}</div> : null}

              <button className="btn btn-pink" type="submit" disabled={busy || contactSales} style={{ width: '100%', marginTop: 22 }}>
                {busy === 'order' && 'Preparing your order…'}
                {busy === 'payment' && 'Opening secure payment…'}
                {busy === 'verify' && 'Confirming your payment…'}
                {!busy && (contactSales ? 'Talk to sales for this plan' : isFree ? `Start free — ${plan.name}` : `Pay ${inr(plan.effectivePrice)} securely`)}
              </button>
              {!contactSales ? (
                <p style={{ textAlign: 'center', fontSize: '.85rem', color: 'var(--muted)', marginTop: 13 }}>
                  🔒 Payments by Razorpay · UPI, cards, netbanking & wallets · GST invoice emailed
                </p>
              ) : (
                <p style={{ textAlign: 'center', fontSize: '.9rem', color: 'var(--muted)', marginTop: 13 }}>
                  Enterprise plans are set up by our team — <a href="/contact" style={{ color: 'var(--pink-deep)', fontWeight: 700 }}>tell us what you need</a>.
                </p>
              )}
              {demo ? <p style={{ textAlign: 'center', fontSize: '.82rem', marginTop: 10 }}><span className="chip chip-soon">Demo catalogue — connect website-backend for live plans & payments</span></p> : null}
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* ── order summary ── */}
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 26, padding: 'clamp(24px, 4vw, 36px)', position: 'sticky', top: 102 }}>
        <span className="kicker" style={{ color: 'var(--amber)' }}>Order summary</span>
        <h3 style={{ fontSize: '1.9rem', margin: '14px 0 4px' }}>{plan.name}</h3>
        <p style={{ color: 'rgba(255,247,234,.7)', fontSize: '.95rem' }}>{plan.description}</p>

        <div style={{ margin: '24px 0', padding: '18px 0', borderTop: '1px solid var(--line-dark)', borderBottom: '1px solid var(--line-dark)', display: 'grid', gap: 10, fontSize: '.97rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Duration</span><b>{plan.durationLabel}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Booths included</span><b>{plan.devices}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Parallel events</span><b>{plan.events}</b></div>
          {plan.discount?.active ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>List price</span><span className="plan-was" style={{ color: 'rgba(255,247,234,.55)' }}>{inr(plan.originalPrice)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
                <span>{plan.discount.discountLabel || 'Discount'} (−{plan.discountPercent}%)</span><b>− {inr(plan.discountAmount)}</b>
              </div>
            </>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,247,234,.65)' }}>Total today</span>
          <span className="plan-price" style={{ color: '#fff' }}>{plan.price == null ? 'Custom' : inr(plan.effectivePrice)}</span>
        </div>
        {plan.discount?.discountEndsAt && plan.discount.active ? (
          <p style={{ fontSize: '.85rem', color: 'var(--amber)', marginTop: 8, display: 'flex', gap: 7, alignItems: 'center' }}>
            <Icon name="clock" size={14} /> Offer ends {new Date(plan.discount.discountEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        ) : null}

        <ul style={{ listStyle: 'none', marginTop: 24, display: 'grid', gap: 11, fontSize: '.94rem', color: 'rgba(255,247,234,.85)' }}>
          {['Booth app + CRM included', 'Unlimited guest QR downloads', 'Gallery, coupons & revenue tools', 'Cancel anytime — plans simply lapse'].map((line) => (
            <li key={line} style={{ display: 'flex', gap: 10 }}><span style={{ color: 'var(--green)' }}><Icon name="check" size={16} /></span>{line}</li>
          ))}
        </ul>
      </div>

      <style>{`
        @media (max-width: 920px) { .checkout-grid { grid-template-columns: 1fr !important; } .form-2col { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
