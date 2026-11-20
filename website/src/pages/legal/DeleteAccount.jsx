// Account deletion — the public page the CRM links to.
//
// Deliberately NOT linked from the footer, the nav or anywhere a guest
// would find it. The only inbound route is the button on the CRM's
// Organization Defaults page, because deletion destroys the whole tenant
// and should never be one stray click from the marketing site.
//
// Three things happen here, in this order:
//   1. Identify the account (email + password), which is what proves the
//      person asking is entitled to ask.
//   2. Arm the slide control. The server also requires confirm: "DELETE",
//      so the browser is not the only thing standing between a visitor
//      and a destroyed account.
//   3. Show the seven-day window and the one way to stop it: sign in.

import { useEffect, useState } from 'react'
import { PageHero, Reveal } from '../../components/ui.jsx'
import SlideToConfirm from '../../components/SlideToConfirm.jsx'
import { CRM_URL, fetchDeletionPolicy, requestAccountDeletion } from '../../lib/api.js'

const POLICY_FALLBACK =
  'Your account is scheduled for deletion. The 7-day window starts now, and sign in to the CRM at any time before it closes to stop the deletion.'

export default function DeleteAccount() {
  const [policy, setPolicy] = useState({ graceDays: 7, notice: POLICY_FALLBACK })
  const [form, setForm] = useState({ email: '', password: '' })
  const [armed, setArmed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // The wording and the grace period come from the server so the page and
  // the cron cannot disagree about how long "7 days" is.
  useEffect(() => {
    let alive = true
    fetchDeletionPolicy()
      .then((data) => alive && setPolicy(data))
      .catch(() => {})
    return () => { alive = false }
  }, [])

  const set = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
    // Changing the credentials after arming has to disarm: the confirmation
    // belongs to the account that was typed in.
    setArmed(false)
    setError('')
  }

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      const data = await requestAccountDeletion({ ...form, confirm: 'DELETE' })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
      setArmed(false)
    } finally {
      setBusy(false)
    }
  }

  const canArm = form.email.trim().length > 3 && form.password.length > 0 && !busy

  if (result) {
    const when = result.scheduledFor ? new Date(result.scheduledFor) : null
    return (
      <>
        <PageHero
          kicker="Account deletion"
          title={<>Deletion <span className="accent-it">scheduled</span>.</>}
          sub={result.message || POLICY_FALLBACK}
        />
        <section className="section" style={{ paddingTop: 40 }}>
          <div className="wrap" style={{ maxWidth: 780 }}>
            <div className="form-card">
              <h2 className="h-md" style={{ marginBottom: 10 }}>What happens now</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 18 }}>
                {result.organizationName ? <><b>{result.organizationName}</b> is</> : 'Your account is'} scheduled
                for permanent deletion
                {when ? <> on <b>{when.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</b></> : ''}.
                Until then, nothing has been removed.
              </p>
              <div className="alert alert-ok" style={{ marginBottom: 18 }}>
                <b>To stop it, sign in to the CRM.</b> Any sign-in by the organization owner before the deletion
                date cancels the scheduled deletion automatically and restores the account.
              </div>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 22 }}>
                After the {policy.graceDays || 7}-day window closes, every event, device, photo, gallery, template, coupon,
                ticket and team member belonging to the organization is deleted. Payment records and audit logs are
                kept as financial and compliance records. A complete record of what was removed is archived before
                anything is deleted.
              </p>
              <a className="btn btn-pink" href={CRM_URL}>Sign in to the CRM to stop deletion</a>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero
        kicker="Account deletion"
        title={<>Delete your <span className="accent-it">account</span>.</>}
        sub="Permanent, and it takes effect after seven days. During those seven days you can stop it by signing in to the CRM. Read what this removes before you continue."
      />

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <Reveal>
            <div className="form-card">
              <h2 className="h-md" style={{ marginBottom: 14 }}>Before you continue</h2>
              <ul className="delete-list">
                <li><b>Everything goes.</b> Events, devices, photos, galleries, templates, coupons, tickets, settings and every team member.</li>
                <li><b>It is scheduled, not immediate.</b> You have {policy.graceDays || 7} days. Signing in to the CRM cancels it automatically.</li>
                <li><b>It cannot be undone after that.</b> Download the events and media you want to keep first.</li>
                <li><b>Some records are kept.</b> Payment records and audit logs stay as financial and compliance records. A full archive of what was removed is stored before deletion.</li>
                <li><b>Your plan is not refunded.</b> See the Subscription &amp; Cancellation Policy.</li>
              </ul>

              {error && <div className="alert alert-err" role="alert">{error}</div>}

              <div className="form-grid" style={{ marginTop: 22 }}>
                <div className="field">
                  <label htmlFor="delete-email">Organization email</label>
                  <input
                    id="delete-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="you@yourbusiness.com.au"
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label htmlFor="delete-password">Password</label>
                  <input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Your CRM password"
                    disabled={busy}
                  />
                </div>
              </div>
              <p className="form-note">
                Only the organization owner can delete the account. If you are not the owner, ask your Organization
                Admin — this page will refuse the request.
              </p>

              <div className={`arm-step ${armed ? 'armed' : ''}`}>
                <span className="arm-label">{armed ? 'Confirmed — this will delete the account' : 'Not confirmed yet'}</span>
                {armed ? (
                  <button className="btn btn-danger" onClick={submit} disabled={busy}>
                    {busy ? 'Scheduling deletion…' : 'Delete my account permanently'}
                  </button>
                ) : (
                  <SlideToConfirm onConfirm={() => setArmed(true)} disabled={!canArm} />
                )}
              </div>

              {!canArm && !busy && (
                <p className="form-note">Enter the organization email and password to enable the slider.</p>
              )}

              <p className="form-note" style={{ marginTop: 20 }}>
                Changed your mind? Sign in to the CRM at any time and the scheduled deletion is cancelled
                automatically — no separate form needed.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
