# HappyPix — Maintenance

The durable rules: what is load-bearing, what breaks quietly, and what to check
before touching a shared file.

## The hourly sweep

`backend/services/CronService.js` runs three jobs: expirations, local upload
cleanup, and the account-deletion purge. Both callers — the `setInterval` on a
long-lived server and the Vercel cron endpoint — go through
`runScheduledJobs()` so they cannot drift apart.

This matters because the endpoint previously ran two of the three and silently
skipped deletion. `tests/cronSweep.test.js` fails the build if a job is dropped
from the sweep again.

Each job is individually guarded: one failure is logged and the rest continue.
A failed job is retried next pass because its inputs are unchanged.

## Account deletion

The state machine is three fields on `Organization`, plus a status:

1. A request sets `deletionScheduledFor` seven days out and flips status to
   `paused`. Sessions are revoked; nothing is destroyed.
2. Signing in to the CRM as ORG_ADMIN during the window sets
   `deletionCancelledAt` and restores `active`. This is the only stop path, and
   it is automatic — the operator is told "sign in to stop deletion".
3. When the date passes with no cancellation, the tenant is archived into
   `DeletedRecord` as one JSON document and then deleted.

Payments and audit logs are **retained** deliberately, as financial and
compliance records.

`deletionStatus` resolves the organization through `User` first, then by billing
email. Keep those two lookups consistent — they previously disagreed.

**`DeletedRecord` is schema-free (`Mixed`) on purpose.** An archive written
today must still be readable if a model gains or loses fields next year. Do not
"tidy" it into a typed schema.

## Adding a route

New route files must be registered in `MOUNTS` in
`backend/scripts/generateDocsAtlas.mjs`, then regenerate:

```bash
cd backend && node scripts/generateDocsAtlas.mjs
```

`tests/docsAtlas.test.js` fails otherwise — that is the intent.

## Adding a model

Every model carrying `organizationId` must be either **deleted** by the purge or
**retained with a written reason** in `accountDeletionService.js`. A test fails
if a model is neither. This is what stops a new collection quietly outliving the
tenant it belongs to.

## Environment

`VITE_*` values are baked in at build time; changing one requires a redeploy.
CORS reads `ALLOWED_ORIGINS` — no origins are hardcoded in `server.js`. See
`docs/DEPLOYMENT.md` for the full list.

The cron endpoint **fails closed**: with no `CRON_SECRET`, `/api/cron/*` returns
401 and no deletion ever runs.

## Verification worth running before a release

```bash
cd backend  && node --test "tests/*.test.js"
cd website  && npx vitest run
cd docs-site && npx vitest run
```

`backend/scripts/verifyAccountDeletion.mjs` is an end-to-end purge check for
staging. It refuses to run with `NODE_ENV=production`. Run it whenever the
deletion service changes — it seeds a tenant with one of everything, purges,
and asserts what survived and what did not.

## Things that break quietly

| Symptom | Cause |
|---|---|
| Deletions never run | `CRON_SECRET` unset, or old deployment without the purge job |
| Password reset never arrives | No `SENDGRID_API_KEY`, DKIM missing, or SPF excludes SendGrid |
| Sign-in "does nothing" | Origin missing from `ALLOWED_ORIGINS`; `curl` still works |
| Deep link 404s on refresh | Missing `vercel.json` SPA rewrite |
| Data survives a deletion | New model with `organizationId` not registered in the purge |
| Docs test fails after a new route | Route file not in `MOUNTS`; regenerate the atlas |
