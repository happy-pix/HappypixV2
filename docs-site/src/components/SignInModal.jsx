// ─────────────────────────────────────────────────────────────────
//  Platform sign-in.
//
//  The client no longer keeps its own list of platform roles. It
//  signs in, then simply asks the backend for the private payload:
//  a 200 means you are a platform member, a 401/403 means you are
//  not. One source of truth, and a new platform role can never be
//  locked out by a stale list in the bundle.
// ─────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function SignInModal({ onClose, onSuccess, onUnauthorized }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: '' });

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, error: '' });

    let signedIn = false;
    try {
      // The response sets the httpOnly session cookie. Nothing about
      // the session is kept on this side.
      const result = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(form) });
      signedIn = true;

      // The backend decides who gets in. No role list on this side, so
      // a new platform role can never be locked out by a stale bundle.
      const docs = await api('/api/docs/private');
      await onSuccess(result.user, docs);
    } catch (error) {
      const denied = error.status === 401 || error.status === 403;
      // Signed in but not allowed the internals map: drop the session
      // again rather than leaving a cookie that can reach nothing.
      if (denied && signedIn) api('/api/auth/logout', { method: 'POST' }).catch(() => {});
      if (denied) {
        onUnauthorized();
        return;
      }
      setState({ busy: false, error: error.message || 'Unable to sign in right now.' });
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      role="presentation"
    >
      <section className="signin-modal" role="dialog" aria-modal="true" aria-labelledby="signin-title">
        <button className="modal-close" onClick={onClose} aria-label="Close sign-in">
          ×
        </button>
        <div className="modal-mark" aria-hidden="true">
          ✳
        </div>
        <span className="eyebrow">HAPPYPIX PLATFORM</span>
        <h2 id="signin-title">Platform sign in</h2>
        <p>
          For HappyPix platform team members. Everyone else has everything they need in the public guides.
        </p>

        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="username"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          {state.error && (
            <p className="form-status error" role="alert">
              {state.error}
            </p>
          )}

          <button className="button primary full" disabled={state.busy}>
            {state.busy ? 'Checking access…' : 'Sign in'} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <small className="privacy-note">
          Use your HappyPix account credentials. Access is checked by the main service, not by this page.
          Your session lives in an httpOnly cookie — this page never holds a token.
        </small>
      </section>
    </div>
  );
}
