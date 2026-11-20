# HappyPix — DNS and Mail

Two domains, two jobs:

- **`happypix.app`** — every application (website, CRM, API, demo, docs).
- **`happypix.com.au`** — mail only, hosted at SiteGround.

Keeping them apart is what makes webmail work. SiteGround serves its browser
mail client at `https://<domain>/webmail`, which needs the domain pointed at
*their* servers. If a Vercel project claims the apex, `/webmail` is served by
that project instead and the mail client is unreachable. There is no way to have
both on one hostname.

---

## Subdomains on Vercel

For each project: **Settings → Domains → Add**, then copy the exact record Vercel
shows. Values differ per project — current projects get a target like
`<hash>.vercel-dns-017.com`, not the generic `cname.vercel-dns.com`. Do not reuse
one project's value for another.

Apex and subdomain records are different:

| Name | Type | Notes |
|---|---|---|
| `@` | `A` | A CNAME cannot sit on the apex |
| `crm`, `api`, `webapi`, `docs`, `demo`, `www` | `CNAME` | Copy from Vercel |

Attach **both** the apex and `www` to the website project — a browser treats
them as separate origins, so cookies and sign-in break if only one resolves.

**Do not create a wildcard (`*`) record.** A wildcard answers for every
subdomain, including typos, and points them somewhere you did not choose. After
removing one, confirm it is gone: a nonsense subdomain must return NXDOMAIN.

---

## Mail on `happypix.com.au`

### Records

| Name | Type | Value |
|---|---|---|
| `@` | `A` | SiteGround server IP (Site Tools → Website → Server details) |
| `@` | `MX` | `10 mx10`, `20 mx20`, `30 mx30` `.antispam.mailspamprotection.com` |
| `@` | `TXT` | SPF — see below |
| `_dmarc` | `TXT` | `v=DMARC1; p=none; rua=mailto:dmarc@happypix.com.au` |

`mail.` is **not** a website. It is the name mail clients use for IMAP and SMTP.
Pointing a browser at it shows a connection error, always.

### SPF — edit the existing record, never add a second

```
v=spf1 mx include:happypix.com.au.spf.auto.dnssmarthost.net include:sendgrid.net ~all
```

Two SPF records on one domain is a permanent failure. If outgoing mail fails SPF,
it lands in spam or is rejected.

### DKIM

Domain-authenticate in SendGrid. **Pick a selector other than `sg`** — `sg` is
the obvious slug for a future sign-in or webmail path, and a CNAME sitting there
would silently redirect that traffic to SendGrid instead of failing cleanly.
`hp` or `s1` is fine.

Publish whichever record SendGrid gives you (`hp._domainkey`). Without DKIM,
platform mail fails authentication even with SPF correct.

### DMARC

Leave at `p=none` until SPF and DKIM both pass, then move to `p=quarantine`.
Tightening early makes your own transactional mail vanish.

### Webmail

`https://happypix.com.au/webmail` — works once the apex points at SiteGround and
an SSL is issued for the domain. If it loads without a padlock, the certificate
is the missing half, not DNS.

Fallback that needs no DNS at all: `https://webmail.siteground.com`, signing in
with the full address and mailbox password.

### Mailboxes

Create in Site Tools → Email → Accounts:

- `hello@` — public contact, used in the footer and all policy pages
- `support@` — CRM support link (`VITE_SUPPORT_EMAIL`)
- `noreply@` — sending address (`EMAIL_FROM_ADDRESS`)
- `info@`, `help@` — as needed

### IMAP/SMTP for mail clients

| Setting | Value |
|---|---|
| IMAP | `mail.happypix.com.au`, port `993`, SSL/TLS |
| SMTP | `mail.happypix.com.au`, port `465`, SSL/TLS |
| Username | the full address |
| Password | the mailbox password from Site Tools |

If the client warns about the certificate name, use the exact
`secureNNN.sgcpanel.com` hostname shown in Site Tools.

---

## Migration checklist

Moving from Vercel aliases to `happypix.app`:

1. Add each `*.happypix.app` hostname in the matching Vercel project.
2. Create the CNAMEs at the DNS host.
3. Update every env var in `docs/DEPLOYMENT.md`, including `ALLOWED_ORIGINS`.
4. Redeploy all four front ends — `VITE_*` values are baked in at build time.
5. Point `happypix.com.au` at SiteGround, and **remove it from any Vercel
   project** so webmail and mail survive.
6. Confirm: every subdomain resolves, a nonsense subdomain does not, a password
   reset arrives, and `/webmail` shows a padlock.
