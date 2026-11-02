# Eventradr Frontend

Next.js (App Router) + TypeScript + Tailwind CSS frontend for Eventradr. This
milestone establishes the **cookie-based OTP authentication integration** against
the staging backend through a local development proxy.

- Framework: Next.js `16.4.2` (App Router, Turbopack), React `19`, TypeScript, Tailwind CSS 4
- Package manager: npm (see `package-lock.json`)
- API source of truth: the staging OpenAPI document
  (`https://staging-api.eventradr.app/api/docs/openapi.json`, "Eventradr API 0.1.0")

## Requirements

- Node.js (checked with `node -v` → `v26.4.0`; Next.js 16 requires ≥ 20.9) and npm (`11.17.0`).

## Environment variables

Copy the sample and adjust if needed:

```bash
cp .env.example .env.local
```

| Variable | Scope | Local dev value | Purpose |
|---|---|---|---|
| `API_PROXY_TARGET` | server-side only (never prefixed `NEXT_PUBLIC_`) | `https://staging-api.eventradr.app` | Destination used by the dev rewrite in `next.config.ts`. |
| `NEXT_PUBLIC_API_BASE_URL` | inlined into the browser build | *(empty)* | Empty in dev so the browser calls relative `/api/...` paths. Set to the backend-approved full origin for deployed builds. |

`.env.local` is git-ignored (pattern `.env*`); `.env.example` is committed via a
`!.env.example` exception. Never commit tokens, cookies, OTPs, or credentials.

## Running locally

```bash
npm install        # npm ci if you prefer a clean install
npm run dev        # http://localhost:3000
```

> **macOS TLS note (this machine):** Node's bundled CA store could not build the
> chain to the Let's Encrypt root that the OS trusts, so the dev rewrite returned
> `500` (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`). Pointing Node at the OS bundle
> fixes it without disabling verification:
>
> ```bash
> NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem npm run dev
> ```

Other scripts: `npm run build`, `npm run start`, `npm run lint`.
Checks used: `npx tsc --noEmit`, `npx eslint .`, `npm run build`.

## Why the localhost proxy exists

The session lives in two **HttpOnly** cookies (`access_token`, `refresh_token`,
`SameSite=Lax`). A browser on `http://localhost:3000` calling
`https://staging-api.eventradr.app` directly makes **cross-site** requests, and
`Lax` cookies are not sent on those — sign-in appears to work, then every request
is `401`.

The fix (backend requires no change) is a **development-only rewrite**: the
browser only ever talks to `localhost:3000`, so the cookies are first-party.

```text
browser ─► http://localhost:3000/api/v1/me ─► (next dev rewrite) ─► https://staging-api.eventradr.app/api/v1/me
```

Implemented in [`next.config.ts`](./next.config.ts) as `rewrites()` for
`/api/:path*`, kept **in sync with the path** (so `/api/v1/auth` is preserved —
the `refresh_token` cookie is scoped to path `/api/v1/auth`). It is guarded to
run **only** when `NODE_ENV === "development"` so production traffic is never
silently forwarded to staging.

Rules that keep this working:

- Browser code must use **relative** URLs (`fetch('/api/v1/me')`), never the staging URL.
- Always send credentials: `credentials: 'include'` (handled centrally in `src/lib/api/client.ts`).
- **Do not** create `app/api/...` / `pages/api/...` route handlers for backend
  paths — they are matched before the rewrite and would shadow the backend.
- Server Components do not inherit browser cookies; the client helper is for
  browser/client code only.

## Project structure

```text
src/
  app/
    layout.tsx
    page.tsx                       # minimal landing
    (auth)/sign-in/page.tsx        # OTP request + verify screens
    (protected)/dashboard/page.tsx # calls GET /api/v1/me, sign out
  lib/api/
    client.ts                      # fetch wrapper: credentials, errors, base URL
    auth.ts                        # documented auth/profile endpoints
    types.ts                       # DTOs from the OpenAPI spec
    errors.ts                      # error-envelope helpers
```

## API endpoints used (from the staging OpenAPI spec)

| Feature | Method & path | Request body | Success |
|---|---|---|---|
| Request OTP | `POST /api/v1/auth/otp` | `{ email }` | `200 { status, message, data:{ expiresInSeconds, resendAfterSeconds } }` |
| Verify OTP | `POST /api/v1/auth/otp/verify` | `{ email, code }` (`^\d{6}$`) | `200 { status, message, data:{ user, isNewUser } }` (sets both cookies) |
| Current user | `GET /api/v1/me` | — | `200 { status, message, data: User }`, else `401 UNAUTHENTICATED` |
| Refresh | `POST /api/v1/auth/refresh` | — | `200` (new cookie pair); `401`, `409 REFRESH_TOKEN_ROTATED` |
| Logout | `POST /api/v1/auth/logout` | — | `200` |
| Categories | `GET /api/v1/categories` | — | `200 { data: Category[] }` |

Errors use `{ error: { code, message, details? } }`. OTP errors:
`VALIDATION_ERROR`, `OTP_INVALID` (`details.attemptsRemaining`), `OTP_EXPIRED`,
`OTP_ATTEMPTS_EXCEEDED`, `OTP_COOLDOWN` / `OTP_LIMIT_REACHED` / `RATE_LIMITED`
(`details.retryAfterSeconds`), `EMAIL_UNAVAILABLE`.

## Known blockers / outstanding

- **OTP end-to-end (cookies → `/api/v1/me` 200) is unverified** — it needs an
  authorized staging test inbox to receive a real code. The flows are implemented
  against the confirmed schemas; only the live authenticated run remains.
- Apple Safari may drop `Secure` cookies on `http://localhost`; use Chrome/Firefox
  (or HTTPS localhost).
- Production `NEXT_PUBLIC_API_BASE_URL`, deployed CORS, and cookie attributes
  must be confirmed with the backend team (the illustrative `https://api.eventradr.app`
  is **not** confirmed live).
