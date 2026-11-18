import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomerAuth } from '../context/AuthContext.jsx'
import { requestCustomerPasswordReset, confirmCustomerPasswordReset, CRM_URL, inr } from '../lib/api.js'
import { PageHero, Icon } from '../components/ui.jsx'

export default function Profile() {
  const navigate = useNavigate()
  const { user, organization, subscription, isAuthed, loading, logout, updateProfile } = useCustomerAuth()

  // Tabs: 'subscription' | 'details' | 'security'
  const [activeTab, setActiveTab] = useState('subscription')

  // Personal details state
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    dob: '',
    organizationName: '',
  })
  const [profileBusy, setProfileBusy] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')

  // OTP Password Reset state (purely OTP-based, zero "current password" requirement)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otpBusy, setOtpBusy] = useState(false)
  const [otpMsg, setOtpMsg] = useState('')
  const [otpErr, setOtpErr] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    let timer
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCountdown])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob || '',
        organizationName: organization?.name || '',
      })
    }
  }, [user, organization])

  if (loading) {
    return (
      <section className="section" style={{ paddingTop: 180, textAlign: 'center', minHeight: '60vh' }}>
        <p className="lead">Loading your profile…</p>
      </section>
    )
  }

  if (!isAuthed) {
    navigate('/login')
    return null
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileErr('')
    setProfileBusy(true)
    try {
      await updateProfile(formData)
      setProfileMsg('✅ Profile details updated successfully!')
      setTimeout(() => setProfileMsg(''), 4000)
    } catch (err) {
      setProfileErr(err.message || 'Failed to update profile.')
    } finally {
      setProfileBusy(false)
    }
  }

  // Request 6-digit OTP code to user's registered email
  const handleRequestOtp = async () => {
    setOtpMsg('')
    setOtpErr('')
    setOtpBusy(true)
    try {
      const res = await requestCustomerPasswordReset(user.email)
      setOtpSent(true)
      setResendCountdown(60)
      setOtpMsg(res.message || `A 6-digit verification code has been sent to ${user.email}`)
    } catch (err) {
      setOtpErr(err.message || 'Could not send verification code.')
    } finally {
      setOtpBusy(false)
    }
  }

  // Confirm OTP and set new password
  const handleConfirmResetPassword = async (e) => {
    e.preventDefault()
    setOtpMsg('')
    setOtpErr('')

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpErr('Please enter the 6-digit verification code sent to your email.')
      return
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setOtpErr('Password must be at least 8 characters with at least one letter and one number.')
      return
    }
    if (newPassword !== confirmPassword) {
      setOtpErr('New passwords do not match.')
      return
    }

    setOtpBusy(true)
    try {
      const res = await confirmCustomerPasswordReset({
        email: user.email,
        code: otpCode.trim(),
        newPassword,
      })
      setOtpMsg(res.message || '✅ Your new password has been set successfully!')
      setOtpSent(false)
      setOtpCode('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setOtpErr(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setOtpBusy(false)
    }
  }

  const planName = organization?.plan || subscription?.plan || 'trial'
  const isExpired = organization?.planExpiresAt && new Date(organization.planExpiresAt) < new Date()
  const daysRemaining = organization?.planExpiresAt
    ? Math.max(0, Math.ceil((new Date(organization.planExpiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <>
      <PageHero
        kicker="Customer Account"
        title={`Welcome, ${user.name}`}
        sub="Manage your personal details, review your subscription, and renew or upgrade anytime."
      />

      <section className="section" style={{ paddingTop: 20, paddingBottom: 110 }}>
        <div className="wrap" style={{ maxWidth: 940, margin: '0 auto' }}>

          {/* Unified Profile Header Card */}
          <div
            style={{
              background: 'var(--ink, #171228)',
              color: '#fff',
              borderRadius: 24,
              padding: 'clamp(24px, 4vw, 36px)',
              marginBottom: 24,
              boxShadow: '0 12px 36px rgba(23, 18, 40, 0.12)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top gradient accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #EA097F, #3871C1, #85C536)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #EA097F 0%, #C4076A 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    boxShadow: '0 6px 16px rgba(234, 9, 127, 0.35)',
                    flexShrink: 0,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.65rem', margin: 0, color: '#fff', fontWeight: 700 }}>{user.name}</h2>
                    <span
                      style={{
                        background: isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(133, 197, 54, 0.2)',
                        color: isExpired ? '#FCA5A5' : '#A7F3D0',
                        border: `1px solid ${isExpired ? '#EF4444' : '#10B981'}`,
                        borderRadius: 999,
                        padding: '3px 12px',
                        fontSize: '.78rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                      }}
                    >
                      {isExpired ? '⏳ Plan Expired' : `✦ ${planName} Plan`}
                    </span>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '.92rem', marginTop: 4, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>{user.email} <span style={{ color: '#34D399', fontSize: '.82rem', fontWeight: 600 }}>✓ Verified</span></span>
                    {organization?.name ? <span>• {organization.name}</span> : null}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <a href={CRM_URL} target="_blank" rel="noreferrer" className="btn btn-pink" style={{ padding: '9px 18px', fontSize: '.88rem' }}>
                  Open CRM 🚀
                </a>
                <button type="button" onClick={logout} className="btn btn-outline-light" style={{ padding: '9px 16px', fontSize: '.88rem' }}>
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* Expired Plan Alert Banner (if expired) */}
          {isExpired ? (
            <div
              style={{
                marginBottom: 24,
                padding: '16px 22px',
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: '1.8rem' }}>⏳</span>
                <div>
                  <div style={{ fontWeight: 700, color: '#991B1B', fontSize: '1.02rem' }}>Subscription has expired</div>
                  <div style={{ color: '#7F1D1D', fontSize: '.9rem' }}>
                    Your account and past event data are safe! Renew your subscription to unfreeze your booth and launch new events.
                  </div>
                </div>
              </div>
              <Link to="/pricing#checkout" className="btn btn-pink" style={{ padding: '10px 20px', fontSize: '.92rem' }}>
                ⚡ Renew Plan Now
              </Link>
            </div>
          ) : null}

          {/* Modern Unified Card with Clean Segmented Tabs */}
          <div
            style={{
              background: 'var(--white, #fff)',
              border: '1.5px solid var(--line, #e9e0cd)',
              borderRadius: 24,
              boxShadow: '0 6px 24px rgba(0,0,0,0.03)',
              overflow: 'hidden',
            }}
          >
            {/* Tab Navigation Bar */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1.5px solid var(--line, #e9e0cd)',
                background: '#FAF8F5',
                padding: '8px 12px 0',
                gap: 6,
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'subscription', label: 'Subscription & Billing', icon: 'wallet' },
                { id: 'details', label: 'Personal & Business Details', icon: 'sliders' },
                { id: 'security', label: 'Reset Password (OTP)', icon: 'shield' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setProfileMsg('')
                    setProfileErr('')
                    setOtpMsg('')
                    setOtpErr('')
                  }}
                  style={{
                    background: activeTab === tab.id ? '#fff' : 'transparent',
                    color: activeTab === tab.id ? 'var(--pink-deep, #EA097F)' : 'var(--muted, #6f6784)',
                    border: '1.5px solid',
                    borderColor: activeTab === tab.id ? 'var(--line, #e9e0cd) var(--line, #e9e0cd) #fff var(--line, #e9e0cd)' : 'transparent',
                    borderRadius: '12px 12px 0 0',
                    padding: '12px 20px',
                    fontWeight: 700,
                    fontSize: '.94rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: -1.5,
                    whiteSpace: 'nowrap',
                    transition: 'all .15s ease',
                  }}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: Subscription & Billing */}
            {activeTab === 'subscription' ? (
              <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Subscription Overview</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: '.92rem', margin: '4px 0 0' }}>
                      Details of your current tier, billing cycle, and connected booth quota.
                    </p>
                  </div>
                  <span className={`chip ${isExpired ? 'chip-expired' : 'chip-live'}`} style={{ textTransform: 'capitalize', fontSize: '.9rem', padding: '6px 14px' }}>
                    {isExpired ? 'Status: Expired' : 'Status: Active'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                  <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '.84rem', fontWeight: 600, textTransform: 'uppercase' }}>Plan</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pink-deep, #EA097F)', marginTop: 4, textTransform: 'capitalize' }}>
                      {planName}
                    </div>
                  </div>

                  <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '.84rem', fontWeight: 600, textTransform: 'uppercase' }}>Valid Until</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 4 }}>
                      {organization?.planExpiresAt
                        ? new Date(organization.planExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    {daysRemaining !== null ? (
                      <div style={{ fontSize: '.8rem', color: isExpired ? '#DC2626' : '#059669', fontWeight: 600, marginTop: 2 }}>
                        {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '.84rem', fontWeight: 600, textTransform: 'uppercase' }}>Allowed Devices</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4 }}>
                      {organization?.allowedDevices || 1} <span style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--muted)' }}>booth(s)</span>
                    </div>
                  </div>

                  <div style={{ background: '#FAF8F5', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 20px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '.84rem', fontWeight: 600, textTransform: 'uppercase' }}>Last Invoice</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
                      {subscription?.invoiceNo || 'N/A'}
                    </div>
                    {subscription?.amount ? (
                      <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>
                        Paid {inr(subscription.amount)}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Direct Renewal Call to Action */}
                <div
                  style={{
                    padding: 24,
                    background: 'linear-gradient(135deg, #FDF2F8 0%, #FFF7ED 100%)',
                    border: '1.5px dashed var(--pink-deep, #EA097F)',
                    borderRadius: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--ink)' }}>
                      {isExpired ? 'Ready to reactivate your plan?' : 'Looking to renew or add more devices?'}
                    </h4>
                    <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: '.92rem' }}>
                      Your credentials and billing details will automatically pre-fill on checkout.
                    </p>
                  </div>
                  <Link
                    to="/pricing#checkout"
                    className="btn btn-pink"
                    style={{ padding: '12px 24px', fontSize: '1rem', boxShadow: '0 4px 14px rgba(234, 9, 127, 0.3)' }}
                  >
                    ⚡ Renew / Upgrade Subscription
                  </Link>
                </div>
              </div>
            ) : null}

            {/* TAB 2: Personal & Business Details */}
            {activeTab === 'details' ? (
              <div style={{ padding: 'clamp(24px, 4vw, 36px)' }}>
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Personal &amp; Business Information</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '.92rem', margin: '4px 0 0' }}>
                    Update your primary account details. These are used for receipts, invoices, and CRM communications.
                  </p>
                </div>

                {profileMsg ? (
                  <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, color: '#047857', fontSize: '.9rem', marginBottom: 20 }}>
                    {profileMsg}
                  </div>
                ) : null}

                {profileErr ? (
                  <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: '.9rem', marginBottom: 20 }}>
                    ⚠️ {profileErr}
                  </div>
                ) : null}

                <form onSubmit={handleProfileSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 24 }}>
                    <div className="field">
                      <label htmlFor="prof-name">Full Name *</label>
                      <input
                        id="prof-name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Priya Sharma"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="prof-email">Email Address</label>
                      <input
                        id="prof-email"
                        disabled
                        value={user.email}
                        style={{ background: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }}
                      />
                      <span className="hint" style={{ color: '#059669', fontWeight: 600 }}>✓ Verified primary login email</span>
                    </div>

                    <div className="field">
                      <label htmlFor="prof-phone">Phone Number</label>
                      <input
                        id="prof-phone"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData((f) => ({ ...f, phoneNumber: e.target.value }))}
                        placeholder="+91 98765 43210"
                        inputMode="tel"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="prof-dob">Date of Birth</label>
                      <input
                        id="prof-dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData((f) => ({ ...f, dob: e.target.value }))}
                      />
                    </div>

                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="prof-org">Organization / Studio Business Name</label>
                      <input
                        id="prof-org"
                        value={formData.organizationName}
                        onChange={(e) => setFormData((f) => ({ ...f, organizationName: e.target.value }))}
                        placeholder="e.g. Sunset Moments Studio"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={profileBusy}
                      className="btn btn-pink"
                      style={{ padding: '12px 28px', fontSize: '.98rem' }}
                    >
                      {profileBusy ? 'Saving changes…' : 'Save Details'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* TAB 3: Reset Password (100% OTP-Based) */}
            {activeTab === 'security' ? (
              <div style={{ padding: 'clamp(24px, 4vw, 36px)', maxWidth: 620 }}>
                <div style={{ marginBottom: 22 }}>
                  <h3 style={{ margin: 0, fontSize: '1.35rem' }}>Reset Password with Email OTP</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '.92rem', margin: '4px 0 0' }}>
                    No current password needed! Verify ownership via a 6-digit OTP sent to your registered email, then set your new password.
                  </p>
                </div>

                {otpMsg ? (
                  <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, color: '#047857', fontSize: '.9rem', marginBottom: 20 }}>
                    {otpMsg}
                  </div>
                ) : null}

                {otpErr ? (
                  <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: '.9rem', marginBottom: 20 }}>
                    ⚠️ {otpErr}
                  </div>
                ) : null}

                {!otpSent ? (
                  <div style={{ background: '#FAF8F5', border: '1.5px solid var(--line)', borderRadius: 18, padding: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '.88rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>
                        Registered Email Address
                      </label>
                      <input
                        disabled
                        value={user.email}
                        style={{ background: '#fff', color: '#111827', fontWeight: 600, border: '1.5px solid var(--line)', width: '100%', padding: '12px 14px', borderRadius: 12, cursor: 'not-allowed' }}
                      />
                      <span className="hint" style={{ marginTop: 6 }}>
                        Clicking the button below sends a secure 6-digit one-time code to this address.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={otpBusy}
                      className="btn btn-pink"
                      style={{ padding: '12px 24px', fontSize: '.98rem' }}
                    >
                      {otpBusy ? 'Sending Code…' : 'Send 6-Digit Verification Code'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleConfirmResetPassword} style={{ background: '#FDF2F8', border: '1.5px dashed var(--pink-deep, #EA097F)', borderRadius: 18, padding: 24 }}>
                    <div style={{ fontSize: '.92rem', fontWeight: 600, color: 'var(--pink-deep, #EA097F)', marginBottom: 18 }}>
                      Enter the 6-digit code sent to <b>{user.email}</b>:
                    </div>

                    <div style={{ display: 'grid', gap: 16 }}>
                      <div className="field">
                        <label htmlFor="sec-code">6-Digit Verification Code *</label>
                        <input
                          id="sec-code"
                          required
                          type="text"
                          maxLength={6}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          style={{ letterSpacing: 6, fontSize: '1.3rem', fontWeight: 800, textAlign: 'center', maxWidth: 200, padding: '10px 14px' }}
                        />
                      </div>

                      <div className="field">
                        <label htmlFor="sec-new-pass">New Password *</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            id="sec-new-pass"
                            required
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters with letter & number"
                            style={{ paddingRight: 84 }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.78rem', padding: '6px 10px', borderRadius: 999, cursor: 'pointer' }}
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>

                      <div className="field">
                        <label htmlFor="sec-conf-pass">Confirm New Password *</label>
                        <input
                          id="sec-conf-pass"
                          required
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                        />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                        <button
                          type="submit"
                          disabled={otpBusy || otpCode.length !== 6}
                          className="btn btn-pink"
                          style={{ padding: '12px 24px', fontSize: '.98rem' }}
                        >
                          {otpBusy ? 'Verifying…' : 'Verify Code & Set New Password'}
                        </button>

                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={otpBusy || resendCountdown > 0}
                            style={{
                              background: 'transparent',
                              border: 0,
                              color: resendCountdown > 0 ? 'var(--muted)' : 'var(--pink-deep, #EA097F)',
                              fontWeight: 600,
                              fontSize: '.85rem',
                              cursor: resendCountdown > 0 ? 'default' : 'pointer',
                              textDecoration: resendCountdown > 0 ? 'none' : 'underline',
                              padding: 0,
                            }}
                          >
                            {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend code'}
                          </button>

                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtpCode(''); setNewPassword(''); setConfirmPassword(''); setOtpErr(''); }}
                            className="btn btn-ghost"
                            style={{ padding: '6px 14px', fontSize: '.84rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            ) : null}

          </div>
        </div>
      </section>
    </>
  )
}
