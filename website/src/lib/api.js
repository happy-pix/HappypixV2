// Talks to website-backend (its own service, same database as the CRM).
// Base: VITE_API_URL, or '' in dev where vite proxies /api → :5001.

import { DEMO_PLANS } from '../data/content.js'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
export const CRM_URL = import.meta.env.VITE_CRM_URL || 'https://happypixcrm.vercel.app'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  let data = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const error = new Error((data && data.error) || `Request failed (${res.status})`)
    error.status = res.status
    error.code = data && data.code
    throw error
  }
  return data
}

/** Live plans (with CRM discount campaigns). Falls back to demo data so
 *  the marketing page never renders empty when the API is offline. */
export async function fetchPlans() {
  try {
    const data = await request('/plans')
    if (data.plans && data.plans.length) return { plans: data.plans, demo: false }
    return { plans: DEMO_PLANS, demo: true }
  } catch {
    return { plans: DEMO_PLANS, demo: true }
  }
}

export function createOrder(body) {
  return request('/checkout/order', { method: 'POST', body: JSON.stringify(body) })
}

export function verifyPayment(body) {
  return request('/checkout/verify', { method: 'POST', body: JSON.stringify(body) })
}

export function fetchDownload(id) {
  return request(`/downloads/${encodeURIComponent(id)}`)
}

export function downloadFileUrl(id, kind) {
  return `${API_BASE}/api/downloads/${encodeURIComponent(id)}/file/${kind}`
}

export function sendLead(body) {
  return request('/leads', { method: 'POST', body: JSON.stringify(body) })
}

export function inr(n) {
  if (n == null || isNaN(n)) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

/** Loads Razorpay Checkout (same gateway the platform already uses). */
export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(window.Razorpay)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'))
    document.body.appendChild(script)
  })
}
