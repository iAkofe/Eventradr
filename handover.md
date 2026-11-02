# Eventradr — Project Handover

Working handover for the Eventradr frontend. Update this file at every step: record what
was done under **Done**, and what remains under **To do**.

---

## 1. Current status

| Area | State |
|---|---|
| Landing page (`/`) | Built and verified against mockups. Custom design system, Lenis smooth scroll, scroll- and mouse-based micro-interactions. |
| Auth (OTP sign-in) | Implemented against the verified OpenAPI schemas. Not yet confirmed end-to-end with a real staging account. |
| API layer | Auth, categories, organizer, profile and admin services exist and type-check. |
| Inner pages (profile, organizer, admin) | **Not started.** Designs located and exported as PNGs, but not yet readable by this model (see the Figma design map). |
| Onboarding flow | **Not started.** |
| Design source (Figma) | Figma AI Bridge **connected and working**. PNG export done (7 frames). Structured design data **still rate-limited**. The current model **cannot read images** — see the Figma design map. |

---

## 2. Source-of-truth documents

| Source | Where | Notes |
|---|---|---|
| OpenAPI 3.1 spec | `https://staging-api.eventradr.app/api/docs/openapi.json` | **Authoritative.** Eventradr API `0.1.0`. This is the spec the API layer is derived from. |
| Swagger UI | `https://staging-api.eventradr.app/api/docs/` | Human-readable view of the same spec. |
| Postman docs | `https://documenter.getpostman.com/view/7735144/2sBYHRWhfo` | Saved examples. Useful for cross-checking. See discrepancy note in §7. |
| Setup / backend guide | `eventradr-setup.md` | Next.js setup, dev proxy, cookie auth rules, operating rules. |
| Dev proxy guide | `staging-dev-proxy.md` | Why the `/api/*` rewrite is required and how cookies behave on localhost. |
| Agent rules | `eventradr-frontend/AGENTS.md` | This Next.js version has breaking changes — read `node_modules/next/dist/docs/` before writing Next-specific code. |
| Design (Figma) | `figma.com/design/R5QssY0Cm5dYIQgAr3JIVA` — file **"Eventradr (Copy)"** | Read via the Figma AI Bridge MCP. See the Figma design map below. |

> **Correction to a working assumption:** `eventradr-setup.md` and `staging-dev-proxy.md` are
> **setup and proxy documents**. They do **not** describe user types, inner-page structure, or
> dashboards. User types and page structure must come from the API spec (below) plus the design
> source. No document in the repo currently defines the inner-page information architecture.

---

## Figma design map — file "Eventradr (Copy)"

File key `R5QssY0Cm5dYIQgAr3JIVA`; last modified `2026-11-02T08:49:49Z`. Ten pages:

| # | Page | Node ID |
|---|---|---|
| 0 | Foundations | `113:838` |
| 1 | Component documentation | `113:839` |
| 2 | Components | `7:2` |
| 3 | Landing page | `3:2` |
| 4 | **Attendee** | `396:32` |
| 5 | Stuff | `2653:358908` |
| 6 | **Organizer** | `918:74978` |
| 7 | **Admin** | `918:74979` |
| 8 | Junk | `0:1` |
| 9 | Research & QA archive | `383:8623` |

The three user types each have their own page, which confirms the API-derived role model.

### Sign-in / login flows across user types

This is the flow referenced when handing over the design file:

| User type | Frame | Node ID | Size |
|---|---|---|---|
| Attendee | `Attendee / Sign in and onboarding` | `4041:125498` | 8568 x 18751 |
| Organizer | `Organizer / Sign in and organizer setup` | `571:11519` | 8080 x 18492 |
| Admin | `Admin / Sign in` | `571:11520` | 9680 x 8008 |

**Note on the originally supplied link.** The node in the shared URL (`node-id=571-11518`, i.e. `571:11518`)
**no longer resolves** — the Figma API returns `"571:11518": null`. Since `571:11519` is the Organizer
sign-in and `571:11520` is the Admin sign-in, the missing node was almost certainly the **Attendee**
sign-in, which has since been replaced by `4041:125498`. That is an inference from node numbering, not a
confirmed fact. Use the node IDs in the table above rather than the original link.

### Frames mapping to endpoints that actually exist

These are the only frames with real backend support today:

| Frame | Node ID |
|---|---|
| `Attendee / Sign in and onboarding` | `4041:125498` |
| `Attendee / Sign in to manage account` | `2653:372715` |
| `Attendee / Edit profile` | `1661:65256` |
| `Attendee / Change interests` | `1663:66496` |
| `Attendee / Manage preferences` | `1664:67734` |
| `Organizer / Sign in and organizer setup` | `571:11519` |
| `Organizer / Edit public organizer profile` | `2653:388029` |

### Scope gap: the designs run far ahead of the API

The Designer has drawn substantially more than the backend offers. Examples with **no** endpoint in the
OpenAPI spec:

- Attendee: guest checkout, signed-in checkout, bookings, refunds, walk-in plans, ticket sharing and
  download, notifications, reviews.
- Organizer: create and submit an event, manage events, revenue, payouts, payout bank details, QR and
  manual check-in, duplicate an event.
- Admin: inspect event records, review listings, finance, payouts, reported content, attendee accounts.

Treat all of the above as **out of scope until endpoints exist**. Do not build against invented schemas.

### Figma API access — two separate rate-limit buckets

| Endpoint | Used for | Status |
|---|---|---|
| `GET /v1/files/:key/nodes` | Structured design data (text, colours, type, layout) | **429 — rate-limited** |
| `GET /v1/images/:key` | PNG export | **Working** |

The 429 was:

```
Rate limit exceeded
Figma API rate limit hit (429). Retry after 399925 seconds.
Your starter plan has limited API access.
```

That is roughly 4.6 days. So **structured design data is blocked, but PNG export is not** — the limit is
enforced per endpoint category, which is worth remembering.

### Exported PNGs

Seven frames exported into the project root, named after their Figma frames (untracked, ~14 MB total):

| File | Node ID | Exported size |
|---|---|---|
| `Attendee · Sign in and onboarding.png` | `4041:125498` | 3915 x 8569 |
| `Attendee · Sign in to manage account.png` | `2653:372715` | 6952 x 4826 |
| `Attendee · Edit profile.png` | `1661:65256` | 4087 x 8209 |
| `Attendee · Change interests.png` | `1663:66496` | 5553 x 6041 |
| `Attendee · Manage preferences.png` | `1664:67734` | 4109 x 8165 |
| `Organizer · Sign in and organizer setup.png` | `571:11519` | 3829 x 8763 |
| `Admin · Sign in.png` | `571:11520` | 6368 x 5268 |

Figma caps exports at roughly 32 megapixels, so the largest frames were downscaled (the attendee
onboarding frame is 8568 x 18751 in Figma but 3915 x 8569 on export). Fine for reference; not
pixel-accurate for measuring.

**These PNGs are untracked.** So are the two landing-page mockups — design references have never been
committed to this repo. Do not run `git add .`, or ~14 MB of reference images enter history.

### Blocker: the current model cannot read images

`Read` on a PNG returns `Current model cannot read image. Please use a multimodal model`. The PNGs help a
human reviewer, but **not this agent**. Sharing an image in chat does not change this: the limit is the
model's modality, not how the file is delivered.

**SVG export was tested as a workaround and does not solve it.** SVG *is* text and therefore readable, but
Figma flattens all text to vector paths. A sample export of `Attendee / Change interests` produced:

```
svg bytes: 3895112
has <text> elements: 0
has <path> elements: 1104
```

So an SVG gives geometry and hex fills (e.g. `#FAFAFC`, `white`, `black` at 10% opacity) but **no copy and
no labels** — not enough to build a screen faithfully. Still useful as a secondary source for the palette.

Ways to actually proceed:

1. Switch to a multimodal model and work from the PNGs.
2. Wait for the `files/nodes` limit to reset and read the structured design data — it is JSON text, so it is
   readable, and it gives real font sizes, hex colours, text content and spacing. **Preferred.**
3. Paste Figma Dev Mode generated code (Copy as code) into the conversation — that is text and includes
   layer names and copy.
4. Have the screens described in writing.

### Configuration fix applied

Trae's MCP config (`~/Library/Application Support/Trae/User/mcp.json`) launched the server with only
`FIGMA_API_KEY` set. On this machine Node cannot verify TLS without the system CA bundle, so every request
failed with `fetch failed` / `unable to get local issuer certificate`. `curl` was unaffected, which masked
the cause. Added:

```json
"NODE_EXTRA_CA_CERTS": "/etc/ssl/cert.pem"
```

This matches the project's existing TLS convention. Diagnose this class of failure by comparing `curl`
against a Node `fetch` to the same host — they use different trust stores.

---

## 3. Done

### Landing page + motion system
- `src/app/page.tsx` — sticky header, hero with search + filter chips, "This week in Lagos" cards,
  map/list toggle, category tiles, footer. Event data is **still hardcoded mock data** (see §7).
- `src/components/SmoothScrollProvider.tsx` — Lenis smooth scroll, `MotionConfig reducedMotion="user"`,
  and a mouse-following cursor glow.
- `src/app/globals.css` — design tokens, typography (Bricolage Grotesque / Manrope), scrollbar,
  float keyframe, reduced-motion guard.

### Auth + API foundation
- `src/lib/api/client.ts` — `apiFetch` with `credentials: "include"`, relative `/api/...` paths,
  `ApiError` carrying status + parsed body.
- `src/lib/api/types.ts` — DTOs mirroring the OpenAPI schemas.
- `src/lib/api/auth.ts` — session lifecycle only: `requestOtp`, `verifyOtp`, `refreshSession`, `logout`,
  and the public `getCategories`.
- `src/lib/api/errors.ts` — helpers for the `{ error: { code, message, details? } }` envelope.
- `src/lib/api/types.ts` — organizer DTOs added: `PublicOrganizer`, `Organizer`, `CreateOrganizerBody`,
  `UpdateOrganizerBody`.
- `src/lib/api/organizer.ts` — `createOrganizerProfile`, `getOrganizerProfile`, `updateOrganizerProfile`,
  `getPublicOrganizer`, `uploadOrganizerAvatar`, `removeOrganizerAvatar`. Avatar upload sends `FormData`
  untouched so the browser sets the multipart boundary.
- `src/lib/api/types.ts` — attendee DTOs added: `UpdateProfileBody`, `SetInterestsBody`.
- `src/lib/api/profile.ts` — the attendee account surface: `getCurrentUser`, `updateProfile`,
  `setInterests`, `uploadAvatar`, `removeAvatar`.
- `src/lib/api/admin.ts` — `getAdminIdentity` (`GET /admin/me`), plus the `AdminIdentity` type. This is a
  gate, not a surface.
- **`getCurrentUser` was moved** from `auth.ts` to `profile.ts`, because `/me` is a profile resource, not
  an auth one. The dashboard import was updated to match. `auth.ts` remains the single owner of session
  lifecycle.
- `src/app/(auth)/sign-in/page.tsx` — two-step OTP flow with cooldown, resend, and error mapping.
- `src/app/(protected)/dashboard/page.tsx` — session check, documented refresh-then-retry on 401,
  sign-out.

### Verification
- `npx tsc --noEmit` and `npm run lint` pass.
- Dev server serves the landing page with HTTP 200.

---

## 4. Endpoint inventory (verified against the OpenAPI spec)

Base: `/api/v1` unless noted. Every success response uses the envelope
`{ status: "success", message, data }`; every error uses `{ error: { code, message, details? } }`.

### Auth — public
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/otp` | `{ email }` | `{ expiresInSeconds, resendAfterSeconds }` |
| POST | `/auth/otp/verify` | `{ email, code }` (`code` = `^\d{6}$`) | `{ user, isNewUser }`, sets cookies |
| POST | `/auth/refresh` | — | `null` |
| POST | `/auth/logout` | — | `null` |

Errors: `VALIDATION_ERROR` (400); `OTP_INVALID` with `details.attemptsRemaining`, `OTP_EXPIRED`,
`OTP_ATTEMPTS_EXCEEDED` (400); `OTP_COOLDOWN` / `OTP_LIMIT_REACHED` / `RATE_LIMITED` (429, with
`details.retryAfterSeconds`); `EMAIL_UNAVAILABLE` (503); `REFRESH_TOKEN_REUSED` (401);
`REFRESH_TOKEN_ROTATED` (409).

### Categories — public
| Method | Path | Returns |
|---|---|---|
| GET | `/categories` | `Category[]` = `{ id, slug, label }[]` |

### Profile — authenticated
| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/me` | — | `User` |
| PATCH | `/me` | `{ name? }` (1–80 chars; `null` refused) | `User` |
| PUT | `/me/interests` | `{ categoryIds: uuid[] }` (`[]` = skip) | `User` |
| PUT | `/uploads/avatar` | `multipart/form-data`, field `avatar`, ≤ 5 MB | `User` |
| DELETE | `/uploads/avatar` | — | `User` |

Avatar errors: `IMAGE_INVALID` (400), `PAYLOAD_TOO_LARGE` (413).
Interests error: `VALIDATION_ERROR` with `details[].code: unknown_category` (400).

### Organizer — authenticated
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/organizer/profile` | `{ name }` | `Organizer` (201) |
| GET | `/organizer/profile` | — | `Organizer` |
| PATCH | `/organizer/profile` | `{ name?, about? }` (`about: null` clears) | `Organizer` |
| PUT | `/uploads/organizer-avatar` | multipart, field `avatar` | `Organizer` |
| DELETE | `/uploads/organizer-avatar` | — | `Organizer` |
| GET | `/organizers/{id}` | — (public) | `PublicOrganizer` |

Errors: `ORGANIZER_PROFILE_EXISTS` (409), `ORGANIZER_NAME_TAKEN` (409),
`ORGANIZER_PROFILE_REQUIRED` (403), `NOT_FOUND` (404).

### Admin — authenticated
| Method | Path | Returns |
|---|---|---|
| GET | `/admin/me` | `{ user, grantedAt }` |

`403 FORBIDDEN` means the account is not an admin. This looks like a **separate admin surface**.

### Health — public
| Method | Path | Returns |
|---|---|---|
| GET | `/api/health` | `{ status, database, uptimeSeconds }` |

> Note the path: `/api/health`, **not** under `/api/v1`.

---

## 5. User types (derived from the spec — there is no `role` field)

The spec exposes **no explicit role field**. Roles are inferred:

| # | User type | How it is determined | Can access |
|---|---|---|---|
| 1 | **Guest** | No valid session (`/me` → 401) | Landing page, `GET /categories`, `GET /organizers/{id}` |
| 2 | **Attendee** | `/me` → 200 and `user.organizer === null` | Profile, interests, avatar, browse |
| 3 | **Organizer** | `/me` → 200 and `user.organizer !== null` | Everything an attendee can, **plus** organizer profile CRUD + organizer avatar |
| 4 | **Admin** | `GET /admin/me` → 200 (403 = not admin) | Admin surface |

Key implications:

- **Organizer is a capability, not an exclusive account type.** Every organizer is also an attendee;
  the UI should present "become an organizer" as an upgrade, with an organizer section appearing in
  the dashboard once `user.organizer` is set.
- **`isNewUser` drives onboarding.** `POST /auth/otp/verify` returns `isNewUser`; the client is told to
  show profile setup when it is `true`.
- **Admin is verified server-side**, via `/admin/me`. Do not gate admin UI on anything the client can forge.

---

## 6. Flows

### Sign-in / sign-up (one flow)
`POST /auth/otp` → `POST /auth/otp/verify` → cookies set → `isNewUser ? onboarding : dashboard`.

### First-run onboarding (new user)
1. Set display name — `PATCH /me { name }`.
2. Pick interests — `PUT /me/interests { categoryIds }` (categories from `GET /categories`; `[]` = Skip).
3. Send to dashboard.

### Existing user
`/me` → dashboard. On 401: `POST /auth/refresh` once, then retry; on 409 retry the original request.

### Become an organizer
`POST /organizer/profile { name }` → organizer section appears. Edit via `PATCH /organizer/profile`.

---

## 7. Blockers and open questions

1. **No event endpoints exist.** The spec has **no** `/events` routes. "Create an event", the event
   cards, and the map/list views have **no backend**. Landing-page event data is mock. Any
   event-management inner page is **BLOCKED** pending backend endpoints.
2. **Design source is not connected.** No Figma MCP server is configured here. Inner-page layout cannot
   be matched to design until a design source is provided (see §9).
3. **Postman vs OpenAPI discrepancy.** The Postman sample for `/auth/otp/verify` returns a `user`
   object **without** `organizer` or `interests`, while the OpenAPI `User` schema **requires** them.
   The Postman capture predates those fields. Treat the OpenAPI spec as authoritative and confirm with
   the backend team.
4. **End-to-end OTP not yet confirmed** with a real staging account. `eventradr-setup.md` §7 makes this
   explicit: do not claim "authentication working" until the browser OTP → cookies → `/me` 200 test passes.
5. **Design-system inconsistency.** The landing page uses the project palette (Cream, Ink, Mint, Lime,
   Purple, Coral) and Bricolage/Manrope. The sign-in and dashboard pages still use generic
   zinc/black Tailwind styling. Inner pages should follow the landing-page system; the two existing
   pages need aligning.
6. **There is no `role` field.** Any "user type" switch in the UI must be derived from `user.organizer`
   and `/admin/me`, not from a stored role.

---

## 8. To do

Ordered, smallest-useful-first. Nothing here should be built against invented schemas.

- [ ] Confirm end-to-end OTP against staging with a real account (cookies + `/me` 200).
- [ ] Align sign-in and dashboard with the landing-page design system.
- [x] Extend `src/lib/api/types.ts` with `PublicOrganizer`, `Organizer`, `CreateOrganizerBody`,
      `UpdateOrganizerBody`.
- [x] Add `src/lib/api/organizer.ts`.
- [x] Extend `types.ts` with `UpdateProfileBody` and `SetInterestsBody`; add `src/lib/api/profile.ts`
      and `src/lib/api/admin.ts`.
- [x] Move `getCurrentUser` from `auth.ts` to `profile.ts` and update the dashboard import.
- [ ] **Obtain the attendee designs** (Figma is rate-limited — see the Figma design map).
- [ ] Create the per-user-type route groups (see §9).
- [ ] Build onboarding (name + interests) — gated on `isNewUser`. **Next up once designs are readable.**
- [ ] Build profile settings (name, avatar upload/remove, interests).
- [ ] Build organizer onboarding + organizer profile management.
- [ ] Build the admin entry point, gated on `/admin/me`.
- [ ] Replace mock landing-page event data once `/events` exists.

---

## 9. Decisions made

1. **Design source** — **Figma AI Bridge MCP**, now installed and working. Requires
   `NODE_EXTRA_CA_CERTS` in the server's env block (see the Figma design map). The Figma REST API itself
   is rate-limited on the starter plan.
2. **Route/IA shape** — **separate route groups per user type** (e.g. `(attendee)`, `(organizer)`,
   `(admin)`), each with its own shell, rather than one role-aware dashboard.
3. **Sequence** — **attendee first**, then organizer, then admin. The attendee surface is the only one
   where the designs, the endpoints, and the role model are all complete. Organizer was considered first
   but deferred because there is no `/events` endpoint, so an organizer would land on an empty area.
   The organizer sign-in frame also flows directly into "Create and submit an event", which cannot be built.

## Still open

- **How to get the attendee frames** while Figma is rate-limited. Node IDs are known (see the Figma design
  map); the options are PNG export, or waiting for the limit to reset.
- **Is the admin surface part of this app** or a separate deployment?
- **Exact route-group names and the shared shell** for the chosen structure. Proposed:
  `(attendee)` for browse/profile, `(organizer)` for the organizer area, `(admin)` for the admin surface,
  all reusing a shared app shell component.
- **Backend:** are `/events` endpoints planned, and when? Blocks all event-management UI.
- **Backend:** confirm whether the OpenAPI `User` schema (`organizer`, `interests` required) or the older
  Postman sample is current.

---

## 10. Conventions and constraints (unchanged)

- Next.js App Router + TypeScript + Tailwind CSS 4. npm only. Node `v26.4.0`, npm `11.17.0`.
- All npm commands run from `eventradr-frontend/`.
- Dev server needs `NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem` for the staging TLS chain.
- Browser code calls **relative** `/api/...` URLs; the dev rewrite in `next.config.ts` proxies to staging.
  Never call staging directly from the browser, and never add `src/app/api/...` handlers for backend paths.
- Auth is HttpOnly cookies. Never read, log, or persist tokens or OTP codes.
- Do not fabricate endpoints, payloads, or success states. Mark anything unverified as **BLOCKED**.
