// ─────────────────────────────────────────────────────────────────
//  Every outbound URL in one place, read from the environment.
//
//  The site is deployed to Vercel today and the real domains are not
//  bought yet, so nothing here is hardcoded. Set the VITE_* values in
//  .env (see .env.example); they are inlined at build time, which is
//  why changing a domain means a redeploy rather than a restart.
//
//  Anything unset falls back to a relative path where a relative path
//  makes sense, and to the current Vercel deployment otherwise.
// ─────────────────────────────────────────────────────────────────

const env = import.meta.env;

/** Trim a trailing slash so joined paths never double up. */
const clean = (value) => (value ? String(value).replace(/\/+$/, '') : '');

/** Read one VITE_ variable, with a fallback. */
function url(key, fallback) {
  return clean(env[key]) || fallback;
}

// The production domains that exist right now. They are the *fallback*
// only — a real deployment should set the variables.
const LIVE = {
  website: 'https://happypix.vercel.app',
  crm: 'https://happypixcrm.vercel.app',
  backend: 'https://happypix-v2-backend.vercel.app',
  leadsApi: 'https://happypixurl.vercel.app',
};

export const LINKS = {
  // Where this documentation lives. Used in exported markdown and in
  // copy-link, so a link pasted into Slack points at the real site.
  docs: url('VITE_DOCS_URL', typeof window === 'undefined' ? '' : window.location.origin),

  website: url('VITE_WEBSITE_URL', LIVE.website),
  pricing: url('VITE_PRICING_URL', `${url('VITE_WEBSITE_URL', LIVE.website)}/pricing#checkout`),
  contact: url('VITE_CONTACT_URL', `${url('VITE_WEBSITE_URL', LIVE.website)}/contact`),
  software: url('VITE_SOFTWARE_URL', `${url('VITE_WEBSITE_URL', LIVE.website)}/software`),
  crm: url('VITE_CRM_URL', LIVE.crm),
  downloadIos: url('VITE_IOS_URL', ''),
  downloadAndroid: url('VITE_ANDROID_URL', ''),
  downloadWindows: url('VITE_WINDOWS_URL', ''),
};

/** Cross-origin targets, kept separate so dev can proxy them. */
export const SERVICES = {
  api: url('VITE_API_URL', env.PROD ? LIVE.backend : ''),
  leads: url('VITE_LEADS_API_URL', env.PROD ? LIVE.leadsApi : '/lead-api'),
};

/** Is a configured download link actually set? */
export const hasDownload = (kind) => Boolean(LINKS[kind]);
