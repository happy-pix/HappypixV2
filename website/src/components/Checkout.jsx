import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createOrder, verifyPayment, loadRazorpay, inr, CRM_URL, sendCheckoutOtp, verifyCheckoutOtp } from '../lib/api.js'
import { useCustomerAuth } from '../context/AuthContext.jsx'
import { Icon } from './ui.jsx'

const TYPO_DOMAINS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'icld.com': 'icloud.com',
}

function getEmailTypoSuggestion(email) {
  if (!email || !email.includes('@')) return null
  const parts = email.toLowerCase().split('@')
  if (parts.length !== 2) return null
  const [local, domain] = parts
  if (domain && TYPO_DOMAINS[domain]) {
    return `${local}@${TYPO_DOMAINS[domain]}`
  }
  return null
}

// ─── Buy / renew a plan ──────────────────────────────────────
// One form for both journeys:
//   • new email  → account is registered when payment confirms
//   • known email → password must match the existing CRM account,
//     then the purchase renews/upgrades that organization
// Payment runs through Razorpay (the platform's existing gateway).

const emptyForm = { organizationName: '', ownerName: '', phone: '', email: '', password: '' }

const BILLING_LABELS = {
  annual: '12 Months (Annual)',
  semiannual: '6 Months',
  quarterly: '3 Months',
  monthly: '1 Month (Monthly)',
}

export default function Checkout({ plans, addons = [], selectedKey, onSelect, billing = 'annual', onBillingChange, selectedAddons = [], onToggleAddon }) {
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const { user, organization, isAuthed } = useCustomerAuth()

  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isExistingAccount, setIsExistingAccount] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpBusy, setOtpBusy] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (isAuthed && user) {
      setForm((f) => ({
        ...f,
        ownerName: f.ownerName || user.name || '',
        email: user.email || f.email,
        phone: f.phone || user.phoneNumber || '',
        organizationName: f.organizationName || organization?.name || '',
      }))
      setIsExistingAccount(true)
      setIsEmailVerified(true)
    }
  }, [isAuthed, user, organization])

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  const typoSuggestion = useMemo(() => getEmailTypoSuggestion(form.email), [form.email])

  const handleEmailChange = (e) => {
    const val = e.target.value
    setForm((f) => ({ ...f, email: val }))
    setIsEmailVerified(false)
    setIsExistingAccount(false)
    setOtpSent(false)
    setOtpCode('')
    setOtpError('')
  }

  const handleSendOtp = async () => {
    const email = form.email.trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setOtpError('Please enter a valid email address first.')
      return
    }
    setOtpBusy(true)
    setOtpError('')
    try {
      const res = await sendCheckoutOtp(email)
      if (res.isExistingAccount) {
        setIsExistingAccount(true)
        setIsEmailVerified(true)
      } else {
        setOtpSent(true)
        setResendCountdown(60)
      }
    } catch (err) {
      setOtpError(err.message || 'Could not send verification code.')
    } finally {
      setOtpBusy(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || !/^\d{6}$/.test(otpCode.trim())) {
      setOtpError('Please enter the 6-digit verification code.')
      return
    }
    setOtpBusy(true)
    setOtpError('')
    try {
      await verifyCheckoutOtp({ email: form.email.trim().toLowerCase(), code: otpCode.trim() })
      setIsEmailVerified(true)
      setOtpSent(false)
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setOtpBusy(false)
    }
  }

  const plan = useMemo(
    () => plans.find((p) => p.key === selectedKey) || plans.find((p) => p.price > 0) || plans[0],
    [plans, selectedKey],
  )

  useEffect(() => { setError(''); setSuccess(null) }, [selectedKey])

  if (!plan) return null
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const contactSales = plan.price == null && plan.billing?.inr?.monthly == null
  // Period pricing (INR — the charged currency, excluding GST 18%).
  const inrMap = plan.billing?.inr || {}
  const resolvePlanPeriodInr = (p, period) => {
    const m = p.billing?.inr || {}
    if (p.key === 'trial') return 0
    if (period === 'annual' && m.annual != null) return m.annual
    if (period === 'semiannual' && m.semiannual != null) return m.semiannual
    if (period === 'quarterly' && m.quarterly != null) return m.quarterly
    return m.monthly ?? p.effectivePrice
  }
  const periodInr = resolvePlanPeriodInr(plan, billing)
  const addonInr = (addon) => (addon.billing?.inr?.monthly ?? addon.price ?? 249) || 0
  const chosenAddons = addons.filter((addon) => selectedAddons.includes(addon.key))
  const totalInr = (periodInr || 0) + chosenAddons.reduce((sum, addon) => sum + addonInr(addon), 0)
  const isFree = totalInr === 0

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (contactSales) return

    // For new accounts: ensure email has been verified via OTP
    if (!isEmailVerified && !isExistingAccount) {
      setError('Please verify your email address with the verification code sent to your email before completing your order.')
      setOtpError('Please click "Verify Email" to verify your address.')
      setTimeout(() => {
        document.getElementById('co-email')?.focus()
      }, 50)
      return
    }

    setBusy('order')
    try {
      const order = await createOrder({ planKey: plan.key, billingPeriod: billing, addonKeys: selectedAddons, ...form })

      if (order.free) {
        setSuccess({
          ...order,
          plan: { name: plan.name, endDate: order.plan?.endDate || null },
          organization: order.organization || { name: form.organizationName },
        })
        setBusy('')
        setTimeout(() => {
          document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 60)
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
            setTimeout(() => {
              document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 60)
          } catch (err) {
            setError(err.message)
            setTimeout(() => {
              document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }, 60)
          } finally {
            setBusy('')
          }
        },
      })
      checkout.on('payment.failed', () => {
        setError('The payment did not go through. No plan was changed — you can try again.')
        setBusy('')
        setTimeout(() => {
          document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 60)
      })
      checkout.open()
    } catch (err) {
      setError(err.message || 'Checkout is unavailable right now. Please try again in a moment.')
      setBusy('')
      setTimeout(() => {
        document.getElementById('checkout-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 60)
    }
  }

  return (
    <div id="checkout" style={{ display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 26, alignItems: 'start' }} className="checkout-grid">
      {/* ── form ── */}
      <div style={{ background: 'var(--white)', border: '1.5px solid var(--line)', borderRadius: 26, padding: 'clamp(24px, 4vw, 40px)' }}>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ display: 'inline-flex', padding: 14, borderRadius: '50%', background: '#ECFDF5', color: '#059669', marginBottom: 12 }}>
                <Icon name="check" size={32} />
              </div>
              <div>
                <span className="chip chip-live" style={{ display: 'inline-flex', margin: '0 auto 12px' }}><Icon name="check" size={13} /> {'Plan active & ready'}</span>
              </div>
              <h3 style={{ fontSize: '2.1rem', margin: '8px 0 10px', color: 'var(--ink)' }}>
                {success.isExistingAccount ? <>Welcome back — <em>renewed!</em></> : <>🎉 You’re in, <em>{(success.organization?.name || form.organizationName || 'friend')}!</em></>}
              </h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 20px' }}>
                {success.message || 'Your account is ready! Sign in to the HappyPix CRM to pair your booth and set up your first event.'}
              </p>

              <div style={{ margin: '22px auto', maxWidth: 480, padding: '20px 24px', borderRadius: 18, background: 'var(--paper, #F9FAFB)', border: '1.5px dashed var(--line, #E5E7EB)', display: 'grid', gap: 10, fontSize: '.98rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Organization</span><b>{success.organization?.name || form.organizationName}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Login Email</span><b style={{ color: 'var(--pink-deep, #EA097F)' }}>{form.email}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Plan</span><b style={{ textTransform: 'capitalize' }}>{success.plan?.name || plan.name}</b></div>
                {success.invoiceNo ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Invoice ID</span><b>{success.invoiceNo}</b></div> : null}
                {success.plan?.endDate ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Valid Until</span><b>{new Date(success.plan.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</b></div> : null}
              </div>

              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginTop: 24 }}>
                <a className="btn btn-pink" href={CRM_URL} target="_blank" rel="noreferrer" style={{ fontSize: '1.05rem', padding: '14px 28px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Open CRM Dashboard 🚀 <Icon name="arrow" size={18} />
                </a>
                <button className="btn btn-ghost" onClick={() => { setSuccess(null); setForm(emptyForm) }}>Back to website</button>
              </div>

              <div style={{ marginTop: 20, padding: '12px 16px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, maxWidth: 480, margin: '20px auto 0', color: '#0369A1', fontSize: '.9rem' }}>
                👉 Sign in at <b>{CRM_URL}</b> with your email <b>{form.email}</b> and the password you just set.
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -14 }} onSubmit={submit}>
              <h3 style={{ fontSize: '1.7rem' }}>Your details</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '.96rem', margin: '8px 0 22px' }}>
                Already a HappyPix customer? Use your CRM email + password and this purchase renews your existing organization — no duplicate account, no lost days.
              </p>

              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: onBillingChange ? '1fr 1fr' : '1fr', gap: 16 }} className="form-2col">
                  <div className="field">
                    <label htmlFor="co-plan">Choose your plan</label>
                    <select id="co-plan" value={plan.key} onChange={(e) => onSelect(e.target.value)}>
                      {plans.map((p) => {
                        const pInr = resolvePlanPeriodInr(p, billing)
                        return (
                          <option key={p.key} value={p.key}>
                            {p.name} — {p.price == null && p.billing?.inr?.monthly == null ? 'Contact sales' : p.key === 'trial' || pInr === 0 ? 'Free (14 days)' : `${inr(pInr)} (${BILLING_LABELS[billing] || billing} · excl. 18% GST)`}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  {onBillingChange ? (
                    <div className="field">
                      <label htmlFor="co-billing">Subscription duration</label>
                      <select id="co-billing" value={billing} onChange={(e) => onBillingChange(e.target.value)}>
                        <option value="annual">12 Months (Annual · Best value)</option>
                        <option value="semiannual">6 Months</option>
                        <option value="quarterly">3 Months</option>
                        <option value="monthly">1 Month (Monthly)</option>
                      </select>
                    </div>
                  ) : null}
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
                    <label htmlFor="co-phone">Phone number *</label>
                    <input id="co-phone" required value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" inputMode="tel" />
                  </div>
                  <div className="field">
                    <label htmlFor="co-email">Email *</label>
                    <input
                      id="co-email"
                      required
                      type="email"
                      value={form.email}
                      onChange={handleEmailChange}
                      placeholder="you@studio.com"
                      disabled={isEmailVerified && !isExistingAccount}
                    />

                    {typoSuggestion ? (
                      <div style={{ marginTop: 6, fontSize: '.84rem', color: '#B45309', background: '#FEF3C7', padding: '6px 10px', borderRadius: 8 }}>
                        ⚠️ Did you mean <b>{typoSuggestion}</b>?{' '}
                        <button
                          type="button"
                          onClick={() => { setForm((f) => ({ ...f, email: typoSuggestion })); setIsEmailVerified(false); }}
                          style={{ background: 'none', border: 'none', color: '#B45309', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          Apply fix
                        </button>
                      </div>
                    ) : null}

                    {isEmailVerified ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '6px 10px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 8, fontSize: '.84rem', color: '#047857' }}>
                        <span>✅ <b>Email verified</b> ({form.email})</span>
                        {!isExistingAccount ? (
                          <button
                            type="button"
                            onClick={() => { setIsEmailVerified(false); setOtpSent(false); }}
                            style={{ background: 'none', border: 'none', color: '#047857', fontSize: '.78rem', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            Change email
                          </button>
                        ) : null}
                      </div>
                    ) : isExistingAccount ? (
                      <div style={{ marginTop: 6, fontSize: '.84rem', color: '#0369A1', background: '#F0F9FF', padding: '6px 10px', borderRadius: 8 }}>
                        ℹ️ Existing HappyPix account detected. Enter your CRM password below to renew.
                      </div>
                    ) : (
                      <div style={{ marginTop: 8 }}>
                        {!otpSent ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                            <span className="hint" style={{ margin: 0 }}>New email → verify with OTP.</span>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpBusy || !form.email || !form.email.includes('@')}
                              style={{
                                background: 'var(--pink-soft, #FDF2F8)',
                                color: 'var(--pink-deep, #EA097F)',
                                border: '1px solid var(--pink-deep, #EA097F)',
                                fontWeight: 700,
                                fontSize: '.82rem',
                                padding: '5px 12px',
                                borderRadius: 8,
                                cursor: 'pointer',
                              }}
                            >
                              {otpBusy ? 'Sending…' : 'Verify Email (Send OTP)'}
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: '10px 12px', background: '#FDF2F8', border: '1.5px dashed var(--pink-deep, #EA097F)', borderRadius: 12, marginTop: 4 }}>
                            <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--pink-deep, #EA097F)', marginBottom: 8 }}>
                              Enter the 6-digit code sent to {form.email}:
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="123456"
                                style={{ letterSpacing: 4, fontWeight: 700, fontSize: '1.05rem', textAlign: 'center', maxWidth: 140, padding: '6px 10px' }}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpBusy || otpCode.length !== 6}
                                style={{
                                  background: 'var(--pink-deep, #EA097F)',
                                  color: '#fff',
                                  border: 0,
                                  fontWeight: 700,
                                  fontSize: '.85rem',
                                  padding: '8px 16px',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                }}
                              >
                                {otpBusy ? 'Verifying…' : 'Confirm Code'}
                              </button>
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={otpBusy || resendCountdown > 0}
                                style={{
                                  background: 'transparent',
                                  color: resendCountdown > 0 ? 'var(--muted)' : 'var(--pink-deep, #EA097F)',
                                  border: 0,
                                  fontSize: '.8rem',
                                  textDecoration: resendCountdown > 0 ? 'none' : 'underline',
                                  cursor: resendCountdown > 0 ? 'default' : 'pointer',
                                  padding: 0,
                                }}
                              >
                                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
                              </button>
                            </div>
                          </div>
                        )}
                        {otpError ? (
                          <div style={{ marginTop: 6, fontSize: '.82rem', color: '#DC2626' }}>⚠️ {otpError}</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                <div className="field">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label htmlFor="co-pass">Password *</label>
                    <a
                      href={`${CRM_URL}/#/forgot-password`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '.84rem', color: 'var(--pink-deep, #EA097F)', textDecoration: 'underline', fontWeight: 600 }}
                    >
                      Forgot Password? Reset here
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input id="co-pass" required type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="At least 8 characters, with a number" style={{ paddingRight: 92 }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.8rem', padding: '7px 12px', borderRadius: 999, cursor: 'pointer' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <span className="hint">For existing accounts this must match your CRM password — that’s how we know it’s really you.</span>
                </div>
              </div>

              {addons.length ? (
                <div className="field" style={{ marginTop: 18 }}>
                  <label>Make it yours — modular add-ons (₹249 each · excluding GST 18%)</label>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {addons.map((addon) => (
                      <label key={addon.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: 12, cursor: 'pointer', fontWeight: 500 }}>
                        <input type="checkbox" checked={selectedAddons.includes(addon.key)} onChange={() => onToggleAddon && onToggleAddon(addon.key)} style={{ marginTop: 3, width: 'auto' }} />
                        <span style={{ flex: 1 }}><b>{addon.name}</b><br /><small style={{ color: 'var(--muted)' }}>{addon.description}</small></span>
                        <b>{inr(addonInr(addon))}</b>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {error ? (
                <div id="checkout-error" style={{ marginTop: 20, padding: '16px 18px', background: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 16, color: '#991B1B', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⚠️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1.02rem', marginBottom: 4 }}>Order / Registration Incomplete</div>
                    <div style={{ fontSize: '.92rem', lineHeight: 1.5, color: '#7F1D1D' }}>{error}</div>
                    {error.toLowerCase().includes('trial') ? (
                      <div style={{ marginTop: 10 }}>
                        <button
                          type="button"
                          className="btn btn-ink"
                          style={{ fontSize: '.84rem', padding: '6px 14px' }}
                          onClick={() => {
                            onSelect && onSelect('basic');
                            setError('');
                          }}
                        >
                          Switch to Basic Plan (from ₹499/mo) →
                        </button>
                      </div>
                    ) : null}
                    <div style={{ marginTop: 8, fontSize: '.84rem', color: '#B91C1C', borderTop: '1px dashed #FCA5A5', paddingTop: 6 }}>
                      💡 Tip: {error.toLowerCase().includes('gateway') || error.toLowerCase().includes('razorpay')
                        ? 'Payment gateway error. Please verify that your payment gateway credentials are live and activated.'
                        : error.toLowerCase().includes('phone')
                        ? 'This phone number has already been registered or used for a free trial. Please enter a different phone number or sign in to renew.'
                        : 'If you already have a HappyPix account, enter your CRM password to renew. For a new account, enter an unused email and phone number.'}
                    </div>
                  </div>
                </div>
              ) : null}

              <button className="btn btn-pink" type="submit" disabled={busy || contactSales} style={{ width: '100%', marginTop: 22 }}>
                {busy === 'order' && 'Preparing your order…'}
                {busy === 'payment' && 'Opening secure payment…'}
                {busy === 'verify' && 'Confirming your payment…'}
                {!busy && (contactSales ? 'Talk to sales for this plan' : isFree ? `Start free — ${plan.name}` : `Pay ${inr(totalInr)} securely`)}
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
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Billing</span><b>{BILLING_LABELS[billing] || billing}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Devices included</span><b>{plan.devices}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Parallel events</span><b>{plan.events}</b></div>
          {plan.billing?.aiCredits ? <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>AI credits</span><b>{plan.billing.aiCredits} / period</b></div> : null}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'rgba(255,247,234,.65)' }}>Plan price (excl. 18% GST)</span><b>{contactSales ? 'Custom' : inr(periodInr)}</b></div>
          {!contactSales && plan.key !== 'trial' && inrMap ? (
            <div style={{ fontSize: '.82rem', color: 'rgba(255,247,234,.75)' }}>
              {billing === 'annual' && inrMap.annual != null ? `Annual: ${inr(inrMap.annualPerMonth ?? Math.round(inrMap.annual / 12))}/Month - ${plan.devices} Device = ${inr(inrMap.annual)}/year` : null}
              {billing === 'semiannual' && inrMap.semiannual != null ? `${inr(inrMap.semiannualPerMonth ?? Math.round(inrMap.semiannual / 6))}/Month - ${plan.devices} Device = ${inr(inrMap.semiannual)}/6 Months` : null}
              {billing === 'quarterly' && inrMap.quarterly != null ? `${inr(inrMap.quarterlyPerMonth ?? Math.round(inrMap.quarterly / 3))}/Month - ${plan.devices} Device = ${inr(inrMap.quarterly)}/3 Months` : null}
              {billing === 'monthly' && inrMap.monthly != null ? `Monthly: ${inr(inrMap.monthly)}/Month - ${plan.devices} Device = ${inr(inrMap.monthlyAnnualized ?? inrMap.monthly * 12)}/year` : null}
            </div>
          ) : null}
          {chosenAddons.map((addon) => (
            <div key={addon.key} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,247,234,.65)' }}>+ {addon.name}</span><b>{inr(addonInr(addon))}</b>
            </div>
          ))}
          {plan.discount?.active ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--green)' }}>
              <span>{plan.discount.discountLabel || 'Discount'} on plan</span><b>applied at payment</b>
            </div>
          ) : null}
          <p style={{ fontSize: '.8rem', color: 'rgba(255,247,234,.55)', margin: 0 }}>Prices shown are excluding GST 18%. Charged in ₹ via Razorpay.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,247,234,.65)' }}>Total today</span>
          <span className="plan-price" style={{ color: '#fff' }}>{plan.price == null ? 'Custom' : inr(totalInr)}</span>
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
