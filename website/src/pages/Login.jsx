import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomerAuth } from '../context/AuthContext.jsx'
import { requestCustomerPasswordReset, confirmCustomerPasswordReset } from '../lib/api.js'
import { PageHero, Icon } from '../components/ui.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthed } = useCustomerAuth()

  const [mode, setMode] = useState('login') // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (isAuthed) {
    navigate('/profile')
    return null
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    } finally {
      setBusy(false)
    }
  }

  const handleSendResetCode = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setBusy(true)
    try {
      const res = await requestCustomerPasswordReset(email.trim().toLowerCase())
      setSuccess(res.message || 'Reset code sent to your email.')
      setMode('reset')
    } catch (err) {
      setError(err.message || 'Could not send reset code.')
    } finally {
      setBusy(false)
    }
  }

  const handleConfirmReset = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!resetCode.trim() || resetCode.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your email.')
      return
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must be at least 8 characters with at least one letter and one number.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const res = await confirmCustomerPasswordReset({
        email: email.trim().toLowerCase(),
        code: resetCode.trim(),
        newPassword,
      })
      setSuccess(res.message || 'Password reset successfully! You can now sign in.')
      setPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setResetCode('')
      setMode('login')
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHero
        kicker="Customer Portal"
        title="Sign in to your account"
        sub="View your active subscription, manage your details, and renew or upgrade your plan."
      />

      <section className="section" style={{ paddingTop: 20, paddingBottom: 100 }}>
        <div className="wrap" style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ background: 'var(--white)', border: '1.5px solid var(--line)', borderRadius: 24, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.form key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleLogin}>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px' }}>Sign in</h2>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '.95rem', margin: '0 0 24px' }}>
                    Use the same email &amp; password you created during checkout.
                  </p>

                  {error ? (
                    <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: '.9rem', marginBottom: 18 }}>
                      ⚠️ {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div style={{ padding: '12px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, color: '#047857', fontSize: '.9rem', marginBottom: 18 }}>
                      ✅ {success}
                    </div>
                  ) : null}

                  <div style={{ display: 'grid', gap: 16 }}>
                    <div className="field">
                      <label htmlFor="login-email">Email address</label>
                      <input id="login-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" />
                    </div>

                    <div className="field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <label htmlFor="login-pass">Password</label>
                        <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--pink-deep, #EA097F)', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                          Forgot password?
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input id="login-pass" required type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ paddingRight: 84 }} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 0, background: 'var(--pink-soft)', color: 'var(--pink-deep)', fontWeight: 700, fontSize: '.78rem', padding: '6px 10px', borderRadius: 999, cursor: 'pointer' }}>
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={busy} className="btn btn-pink" style={{ width: '100%', marginTop: 8, padding: '14px 20px', fontSize: '1.02rem', justifyContent: 'center' }}>
                      {busy ? 'Signing in…' : 'Sign In 🚀'}
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: 24, fontSize: '.92rem', color: 'var(--ink-soft)' }}>
                    Don't have an account yet? <Link to="/pricing#checkout" style={{ color: 'var(--pink-deep, #EA097F)', fontWeight: 600 }}>Get started with a plan</Link>
                  </div>
                </motion.form>
              ) : mode === 'forgot' ? (
                <motion.form key="forgot" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleSendResetCode}>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px' }}>Forgot password?</h2>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '.95rem', margin: '0 0 24px' }}>
                    Enter your registered email address and we'll send you a 6-digit verification code.
                  </p>

                  {error ? (
                    <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: '.9rem', marginBottom: 18 }}>
                      ⚠️ {error}
                    </div>
                  ) : null}

                  <div style={{ display: 'grid', gap: 16 }}>
                    <div className="field">
                      <label htmlFor="reset-email">Email address</label>
                      <input id="reset-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" />
                    </div>

                    <button type="submit" disabled={busy} className="btn btn-pink" style={{ width: '100%', marginTop: 8, padding: '14px 20px', fontSize: '1.02rem', justifyContent: 'center' }}>
                      {busy ? 'Sending OTP…' : 'Send 6-Digit Code'}
                    </button>

                    <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                      Back to Sign In
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleConfirmReset}>
                  <h2 style={{ fontSize: '1.8rem', margin: '0 0 8px' }}>Set new password</h2>
                  <p style={{ color: 'var(--ink-soft)', fontSize: '.95rem', margin: '0 0 24px' }}>
                    Enter the 6-digit code sent to <b>{email}</b> and choose a new password.
                  </p>

                  {error ? (
                    <div style={{ padding: '12px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: '.9rem', marginBottom: 18 }}>
                      ⚠️ {error}
                    </div>
                  ) : null}

                  {success ? (
                    <div style={{ padding: '12px 14px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 12, color: '#047857', fontSize: '.9rem', marginBottom: 18 }}>
                      {success}
                    </div>
                  ) : null}

                  <div style={{ display: 'grid', gap: 16 }}>
                    <div className="field">
                      <label htmlFor="reset-code">6-digit verification code *</label>
                      <input
                        id="reset-code"
                        required
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        style={{ letterSpacing: 4, textAlign: 'center', fontSize: '1.2rem', fontWeight: 700 }}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="new-pass">New password *</label>
                      <input id="new-pass" required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters, with a number" />
                    </div>

                    <div className="field">
                      <label htmlFor="conf-pass">Confirm new password *</label>
                      <input id="conf-pass" required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
                    </div>

                    <button type="submit" disabled={busy} className="btn btn-pink" style={{ width: '100%', marginTop: 8, padding: '14px 20px', fontSize: '1.02rem', justifyContent: 'center' }}>
                      {busy ? 'Updating password…' : 'Save New Password & Sign In'}
                    </button>

                    <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                      Cancel &amp; Back to Sign In
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  )
}

