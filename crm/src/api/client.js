// API client — connects directly to the real HappyPix backend HTTP API (v2 contract).
// Features: Two-Token System (15-min Access Token + 30-day Refresh Token) with automatic background refresh interceptor.
import { ENV } from '../lib/env.js'
export { ENV } from '../lib/env.js'

const API_BASE = ENV.API_URL

const log = {
  debug: (...a) => { if (ENV.LOG_LEVEL === 'debug') console.debug('[api]', ...a) },
  error: (...a) => { if (ENV.LOG_LEVEL !== 'silent') console.error('[api]', ...a) },
}

const TOKEN_KEY = 'hp_v2_token'
const REFRESH_TOKEN_KEY = 'hp_v2_refresh_token'
const USER_KEY = 'hp_v2_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession(token, user, refreshToken) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export class ApiRequestError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    if (code) this.code = code
  }
}

let isRefreshing = false
let pendingQueue = []

function processQueue(error, newToken = null) {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(newToken)
  })
  pendingQueue = []
}

/** Background token refresh without user logout */
async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSession()
    throw new ApiRequestError(401, 'No refresh token available.', 'NO_REFRESH_TOKEN')
  }

  const res = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || (!data?.accessToken && !data?.token)) {
    clearSession()
    throw new ApiRequestError(
      res.status,
      data?.error || 'Session expired. Please sign in again.',
      data?.code || 'TOKEN_EXPIRED'
    )
  }

  const newToken = data.accessToken || data.token
  localStorage.setItem(TOKEN_KEY, newToken)
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken)
  }
  return newToken
}

export async function request(method, path, body, isRetry = false) {
  const cleanPath = path.replace(/^\//, '')
  const isAuthEndpoint = cleanPath.startsWith('auth/login') || cleanPath.startsWith('auth/refresh')
  const token = getToken()

  const res = await fetch(`${API_BASE}/api/${cleanPath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  // Interceptor: Catch 401 TOKEN_EXPIRED or expired token and refresh silently
  const isTokenExpired = res.status === 401 && (data?.code === 'TOKEN_EXPIRED' || !isAuthEndpoint)
  if (isTokenExpired && !isAuthEndpoint && !isRetry && getRefreshToken()) {
    log.debug('Access token expired (401), refreshing token in background...')

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(() => request(method, path, body, true))
    }

    isRefreshing = true
    try {
      const newToken = await refreshAccessToken()
      processQueue(null, newToken)
      return request(method, path, body, true)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      throw refreshErr
    } finally {
      isRefreshing = false
    }
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`
    const error = new ApiRequestError(res.status, msg, data && data.code)
    if (data && data.banned) error.banned = true
    if (data && data.readOnly) error.readOnly = true
    if (res.status === 401 || error.banned) {
      clearSession()
    }
    log.error(method, path, res.status, msg)
    throw error
  }

  log.debug(method, path, res.status)
  return data
}
