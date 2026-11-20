# HappyPix — Deployment

Everything runs on **Vercel**. Mail runs on **SiteGround**. The repo is a folder
of apps, not a monorepo — there is no root `package.json`, so every Vercel
project sets its own **Root Directory**.

## Projects

| Hostname | Root directory | What it is |
|---|---|---|
| `happypix.app` | `website` | Marketing site, checkout, guest downloads, legal pages |
| `crm.happypix.app` | `crm` | Operator console |
| `api.happypix.app` | `backend` | Main API: auth, events, booth, payments, account deletion |
| `webapi.happypix.app` | `website-backend` | Plans, checkout, leads, guest downloads |
| `demo.happypix.app` | `booth-demo` | Public booth walkthrough |
| `docs.happypix.app` | `docs-site` | Operator documentation |

The website needs **two** API origins: `VITE_API_URL` → `webapi` for plans and
checkout, `VITE_ACCOUNT_API_URL` → `api` for account deletion. That split is
deliberate — account deletion talks to the service that owns accounts.

`happypix.com.au` stays on SiteGround and runs **only** mail. Never attach it to
a Vercel project: `/webmail` is served by SiteGround at the apex, and the moment
Vercel claims that hostname, webmail is gone.

## Before you deploy: two things that look like bugs but are not

**The cron must be able to run.** Account deletion is promised as "seven days,
then it is gone". On Vercel a `setInterval` dies with the invocation that
created it, so the only scheduled work is the Vercel cron calling
`/api/cron/check-expirations`. That endpoint **fails closed**: no `CRON_SECRET`,
and it returns 401 while every deletion request sits unprocessed.

The schedule is **daily** (`0 0 * * *`) because Vercel's free plan rejects
anything more frequent at deploy time. A deadline at 09:00 therefore runs at the
next midnight. The policy says "after 7 days" for exactly this reason — do not
tighten the wording without changing the schedule.

**CORS is entirely environment-driven.** No domain is hardcoded in `server.js`
any more; `ALLOWED_ORIGINS` is the source of truth, plus a regex that allows
`*.vercel.app` deployment aliases. A missing origin does not present as a CORS
error — it presents as "sign-in does nothing" while `curl` works fine.

```
ALLOWED_ORIGINS=https://happypix.app,https://www.happypix.app,https://crm.happypix.app,https://webapi.happypix.app,https://demo.happypix.app,https://docs.happypix.app
```

Comma-separated, no spaces, no trailing slash. Later, set the same list for
`happypix.com.au` too if any app ever calls the API from that origin.

## Environment variables

Every `VITE_*` value is **baked in at build time**. Editing it in the dashboard
does nothing to an existing deployment — redeploy.

### `backend`

| Variable | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | 64 random hex chars |
| `CRON_SECRET` | random; the cron returns 401 without it |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from Cloudinary |
| `RAZORPAY_KEY_ID` / `_KEY_SECRET` | live keys |
| `SENDGRID_API_KEY` | without it, OTP mail is silently skipped |
| `EMAIL_FROM_ADDRESS` | `noreply@happypix.com.au` |
| `CLIENT_URL` | `https://crm.happypix.app` |
| `WEBSITE_URL` | `https://happypix.app` |
| `ALLOWED_ORIGINS` | see above |

`generateDocsAtlas` and the docs endpoints read these too — run
`node scripts/generateDocsAtlas.mjs` in `backend/` after adding a route file, or
`tests/docsAtlas.test.js` fails.

### `website`

```
VITE_API_URL=https://webapi.happypix.app
VITE_ACCOUNT_API_URL=https://api.happypix.app
VITE_CRM_URL=https://crm.happypix.app
```

### `crm`

```
VITE_API_URL=https://api.happypix.app
VITE_WEBSITE_URL=https://happypix.app
VITE_SUPPORT_EMAIL=support@happypix.com.au
```

`VITE_SUPPORT_EMAIL` defaults to `support@happypix.com`, a domain we do not
own. Set it explicitly.

### `website-backend`, `docs-site`, `booth-demo`

No API calls of their own; nothing required.

## MongoDB Atlas

Network Access → allow `0.0.0.0/0`. Vercel functions have no fixed egress IPs,
and a restricted allowlist shows up as a generic 500 on every request.

## SPA routing

Each front-end app carries a `vercel.json` rewriting unknown paths to
`index.html`. Without it, deep links 404 on refresh while in-app navigation
works — the "works until you press F5" bug.

## Verify after deploying

```bash
curl -s https://api.happypix.app/api/health
curl -s https://api.happypix.app/api/account/policy      # must return graceDays
curl -s https://webapi.happypix.app/api/plans            # must return a catalogue
```

Then, in a browser: sign in to the CRM → open **Organization Defaults → Danger
zone** (do not confirm) → check the tabs for `/privacy`, `/terms`,
`/subscription` → request a password reset and confirm the mail arrives → make
one ₹1 live payment → hard-refresh a deep route on each app.

Finally, confirm the sweep by hand:

```bash
curl -H "x-cron-secret: $CRON_SECRET" https://api.happypix.app/api/cron/check-expirations
```

The JSON must contain `deletions`. If it does not, you are on an old deployment.

## Notes

- **Preview deployments inherit production env vars.** A preview of `website`
  will call the production API. Consider Vercel Deployment Protection on
  non-production deployments, especially with a destructive page like
  `/account/delete` on the same origin.
- **`DeletedRecord` is the only copy of a deleted tenant.** Back it up with the
  rest of the database, or a deleted customer cannot be restored even by you.
- **The cron is load-bearing.** Vercel emails when a cron fails repeatedly;
  do not filter that email.
