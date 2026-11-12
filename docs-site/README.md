# HappyPix Field Guide (docs site)

The client-facing documentation site: **HappyPix 101**, **Booth 101**,
**CRM 101** and **Make it run**, plus a small sign-in door for the
platform team.

Built with React + Vite. No component library and no CSS framework —
the design system lives in `src/styles.css`.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
```

## Test

```bash
npm test           # vitest run — 47 tests
npm run test:watch
```

The tests are the guard rails for the parts that are easy to break
quietly: the setup-guide builder, the search index, and the rules
about what a client is allowed to see.

## Environment

| Var | Used for | Default |
|---|---|---|
| `VITE_API_URL` | Main backend — sign-in and the private member payload | `https://happypix-v2-backend.vercel.app` in prod, vite proxy in dev |
| `VITE_LEADS_API_URL` | Public website backend — contact form | `https://happypixurl.vercel.app` in prod, `/lead-api` in dev |
| `DOCS_API_TARGET` | Dev-only: where vite proxies `/api` | `http://127.0.0.1:5000` |
| `DOCS_LEADS_API_TARGET` | Dev-only: where vite proxies `/lead-api` | `http://127.0.0.1:5001` |

Both backends already allow this site's origins
(`https://docs.happypix.in`, `https://happypixdocs.vercel.app`) in
their CORS lists — `backend/server.js` and
`website-backend/src/server.js`.

In the dev server, sign-in and the contact form only work when the
matching backend is running locally.

## Structure

```
src/
  App.jsx                 shell: sidebar, breadcrumbs, routing, auth
  pages.jsx               the four public pages, assembled
  content/
    public.js             page registry (id, group, title, tags)
    brand.js              HappyPix 101: what/how/where-next, FAQ
    boothFlow.js          Booth 101: the 11 real booth screens
    crmFlow.js            CRM 101: the 13 real workspace screens
    hardware.js           every camera and printer, with a level
  lib/
    setupGuide.js         turns 4 answers into a tailored guide
    search.js             full-text index over everything public
    api.js                fetch helpers and service bases
  components/
    Walkthrough.jsx       the guided-tour shell (rail + mock + notes)
    BoothScreen.jsx       working mock of each booth screen
    CrmScreen.jsx         mock of the workspace, in a browser frame
    SetupBuilder.jsx      the selectors and the guide they produce
    CompatMatrix.jsx      the brand-by-brand compatibility list
    SearchPalette.jsx     ⌘K
    ContactForm.jsx       the lead form (HappyPix 101 only)
    SignInModal.jsx       platform sign-in
    MemberArticles.jsx    renderers for the private payload
    ui.jsx                Section, Callout, chips, levels, breadcrumbs
```

## Content rules

**Booth and CRM walkthroughs mirror the real apps.** Step order and
screen names come from `client-app/apps/booth/App.tsx` and
`crm/src/App.jsx`. If a screen is added or renamed there, update
`content/boothFlow.js` or `content/crmFlow.js` to match.

**Hardware levels follow one rule, applied to every row** — and the
rule is printed on the page:

- **Tested** — the booth talks to this model today through a path
  that is built and in use.
- **Compatible** — the model rides a path we support (CCAPI, IPP, the
  Windows print queue). Expect it to work; confirm once.
- **Coming soon** — being built. Do not buy for it yet.

Levels are derived from the providers in the booth apps, so check
there before changing one:

- `client-app/packages/camera-core/src/providers/`
- `client-app/packages/printer-core/src/providers/`
- `electron/src/electron/{printServer,camera/*}.ts`

The D5600 is `tested` because the Nikon Remote SDK for it is bundled
in `electron/resources/nikon`. The DNP DS620A / DS-RX1HS / QW410 are
`tested` because they are named in `DNPProvider.SUPPORTED_MODELS`.

**No development vocabulary on client pages.** No "stub", no
"repository", no "source of truth", no file paths. There is a test
for this — it fails the build if it comes back.

**Drivers are only mentioned where one is genuinely needed.** Camera
SDKs ship inside the app, so camera steps never say "install".
Printers on Windows print through the Windows queue, so that one step
does say it. Also tested.

## Platform-member content

Nothing confidential is in this bundle. The private pages are served
by the backend at `GET /api/docs/private`, behind
`requirePerm(PERMS.PLATFORM_DASHBOARD_VIEW)`, and are fetched only
after a successful sign-in.

The client keeps no list of platform roles. It signs in, then asks
for the private payload: a 200 means platform member, a 401/403 means
not. Adding a platform role server-side cannot lock anyone out here.

Two tests cover this — one in this repo (the search index contains no
private rows unless the caller is authorised) and one in
`backend/tests/documentationAuth.test.js` (the endpoint returns 401
with `no-store` and no content).

## Routing

Query-based (`?page=make-it-run`, `?page=booth-101&step=camera`) so a
static host needs no rewrite rules and any guide can be deep-linked
to a step.
