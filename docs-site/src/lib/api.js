// ─────────────────────────────────────────────────────────────────
//  HTTP helpers.
//
//  Two services, both already CORS-allowing this site's origins:
//    API_BASE       → the main backend (auth + the private docs payload)
//    LEADS_API_BASE → the public website backend (contact form)
// ─────────────────────────────────────────────────────────────────

import { SERVICES } from './links.js';

// Both bases come from the environment — see .env.example. In dev the
// Vite proxy answers /api and /lead-api, so the empty string is right.
export const API_BASE = SERVICES.api;
export const LEADS_API_BASE = SERVICES.leads;

/**
 * Sessions are cookie-based.
 *
 * The backend sets an httpOnly `hp_admin_token` cookie on sign-in and
 * reads it before any Authorization header, so this client never sees
 * or stores a token. That removes the copy that lived in
 * sessionStorage — readable by any script on the page, and surviving a
 * sign-out that only cleared the cookie.
 *
 * `credentials: 'include'` is what carries the cookie cross-origin;
 * the backend answers with SameSite=None and a CORS allowlist.
 */
export async function api(path, { base = API_BASE, ...options } = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(data.error || `Request failed (${response.status})`), {
      status: response.status,
      data,
    });
  }
  return data;
}
