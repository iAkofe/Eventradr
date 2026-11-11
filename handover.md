# Eventradr — Project Handover

Working handover for the Eventradr frontend. Update this file at every step: record what
was done under **Done**, and what remains under **To do**.

---

## 1. Current status

| Area | State |
|---|---|
| Landing page (`/`) | Built and verified against mockups. Custom design system, Lenis smooth scroll, scroll- and mouse-based micro-interactions. |
| Auth (OTP sign-in) | Implemented against the verified OpenAPI schemas. Not yet confirmed end-to-end with a real staging account. |
| API layer | Auth, categories, organizer, profile, admin **and events** services exist and type-check. |
| Events (organizer draft CRUD) | **Service layer done** — `createEvent`, `listEvents`, `updateEvent`, `deleteEvent` in `src/lib/api/events.ts`. No UI yet. |
| App shell + routing | **Built** — shared `AppShell` (brand, primary nav, sign-out, footer) wired through an `(attendee)` route group. Dashboard and profile render inside it; `/onboarding` is a standalone shell-free flow. |
| Attendee dashboard (`/dashboard`) | **Built and aligned to the design system** — welcome heading, entry cards to Profile and Discover, account summary. Previously generic zinc/black styling. |
| Profile settings (`/profile`) | **Built** — avatar upload/remove, display name, interests, email; all four profile endpoints wired. Design-system styling (Figma restyle pass pending). |
| Organizer surfaces | **Scaffolded** — `(organizer)` group reusing `AppShell`; `/organizer` (home, gated on a profile), `/organizer/setup` (create the profile), `/organizer/profile` (edit name/about + organizer avatar). Organizer name rules enforced client-side. Design-system styling (Figma restyle pass pending). |
| Admin surfaces | **Not started.** Designs located and exported as PNGs, but not yet readable by this model (see the Figma design map). |
| Onboarding flow | **Built** — `/onboarding`, two steps (display name → interests). Styled from the project design system, not from Figma (see §9, decision 4). Not yet confirmed end-to-end with a real account. |
| Design source (Figma) | Figma AI Bridge **connected and working**. PNG export done (7 frames). Structured design data **still rate-limited**. The current model **cannot read images** — see the Figma design map. |

---

## 2. Source-of-truth documents

| Source | Where | Notes |
|---|---|---|
| OpenAPI 3.1 spec | `https://staging-api.eventradr.app/api/docs/openapi.json` | Authoritative for **auth / profile / organizer / admin**. Eventradr API `0.1.0`. **Stale for events** — see the Postman row. |
| Swagger UI | `https://staging-api.eventradr.app/api/docs/` | Human-readable view of the same spec. |
| Postman docs | `https://documenter.getpostman.com/view/7735144/2sBYHRWhfo` | **Authoritative for events.** The "Event" folder documents `/organizer/events` CRUD, which the OpenAPI spec omits entirely. Raw JSON is retrievable from `https://documenter.gw.postman.com/api/collections/7735144/2sBYHRWhfo?segregateAuth=true` (note the **slash**, not a dash). |
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
  On success it routes on the documented `isNewUser` flag: `/onboarding` when true, `/dashboard` when false.
- `src/app/onboarding/page.tsx` — the first-run flow. Step 1 collects the display name
  (`PATCH /me { name }`, 1–80 chars, trims before sending); step 2 collects interests from
  `GET /categories` (`PUT /me/interests { categoryIds }`), with "Skip for now" that leaves the set empty
  (the documented `[]` = skip). Sessions reuse the documented 401 → refresh once → retry path. Category
  tiles are selectable with `aria-pressed`; progress is a labelled `progressbar`. Moved out of the old
  `(protected)` group so this focused flow keeps its own chrome (progress bar, no nav).

### Attendee shell + profile
- `src/lib/api/session.ts` — `loadSession()`, the one shared implementation of the documented
  401 → refresh once → retry path (and the 409 `REFRESH_TOKEN_ROTATED` "someone else refreshed first"
  case). Replaced four hand-rolled copies across dashboard, profile, onboarding and the organizer pages.
- `src/components/AppShell.tsx` — the shared chrome: brand, primary nav with an active-pill state, a
  sign-out utility at the far edge, and a footer. Takes a `variant` prop (`attendee` | `organizer`) that
  selects the nav set, so both areas reuse one shell rather than duplicating it. Deliberately
  **presentational** — it does not fetch `/me`, so it adds no extra round trip; each page still owns its
  own session.
- `src/app/(attendee)/layout.tsx` — wraps every route in the `(attendee)` group in `AppShell`.
- `src/app/(attendee)/dashboard/page.tsx` — session check via `loadSession`, welcome heading, entry cards
  to Profile, Discover and the organizer area (the last reading "Become an organizer" until
  `user.organizer` exists), and an account summary that now includes an Organizer row. Restyled from
  zinc/black to the design system. Sign-out now lives in the shell, so the page no longer duplicates it.
- `src/app/(attendee)/profile/page.tsx` — profile settings: avatar upload (client-side type + 5 MB size
  guard) and removal, display name (1–80 chars, dirty-tracked), interests (dirty-tracked), and the
  read-only email. All four profile endpoints wired, with a success toast and an inline error alert.
  Its hand-rolled header was removed — the shell supplies it.
- `src/lib/api/errors.ts` — added `describeApiError`, one shared mapper from the documented error
  envelope to user-facing copy, reused by onboarding and profile instead of a local copy in each.

### Organizer flow
- `src/app/(organizer)/layout.tsx` — wraps the organizer area in `AppShell variant="organizer"`. Every
  organizer is also an attendee, so reusing the shell avoids a second, near-identical chrome.
- `src/app/(organizer)/organizer/setup/page.tsx` — `POST /organizer/profile`. Gated on `user.organizer`:
  an existing profile short-circuits to an "already set up" state, and the documented
  `ORGANIZER_PROFILE_EXISTS` race switches to that state too. Name is normalised and validated before
  sending, with `aria-invalid` / `aria-describedby` and an inline problem message.
- `src/app/(organizer)/organizer/page.tsx` — organizer home. Gated on having a profile: no
  `user.organizer` (or the documented `ORGANIZER_PROFILE_REQUIRED` 403) routes the user to setup.
  Links to `/organizer/profile` and shows the profile summary with the avatar or initials.
- `src/app/(organizer)/organizer/profile/page.tsx` — edits name and `about`, plus organizer avatar
  upload/removal (client-side type + 5 MB guard). `PATCH /organizer/profile` sends only the dirty fields
  and uses `about: null` to clear, per the documented contract.
- `src/lib/api/organizer.ts` — added `normalizeOrganizerName` and `describeOrganizerNameProblem` plus
  `ORGANIZER_NAME_MAX`, encoding the documented 1–80 chars and allowed-character set
  (Latin letters/accents, digits, spaces, `& ' - . ,`), so both setup and profile validate identically.
- `src/lib/api/errors.ts` — organizer cases added to `describeApiError`: `ORGANIZER_NAME_TAKEN`,
  `ORGANIZER_PROFILE_EXISTS`, `ORGANIZER_PROFILE_REQUIRED`, `IMAGE_INVALID`, `PAYLOAD_TOO_LARGE`.

### Verification
- `npx tsc --noEmit` and `npm run lint` pass.
- Dev server serves `/`, `/dashboard`, `/profile`, `/onboarding`, `/organizer`, `/organizer/setup` and
  `/organizer/profile` with HTTP 200.
  These are client-rendered routes, so a 200 confirms they compile and mount — it does **not** confirm
  the OTP → cookies → `/me` round trip, nor the organizer POST/PATCH round trips.
- Note: moving routes leaves stale generated types in `.next/types/validator.ts` pointing at the old
  paths, which fails `tsc` until the dev server (or a build) regenerates them. Clear `.next` after a
  route move, then start the server before type-checking.
- Live staging probes (2026-11-05): `GET /api/v1/organizer/events` → **401 UNAUTHENTICATED** (route is
  deployed, just undocumented in the spec); `GET /api/v1/locations` → **404 route not found**
  (documented in Postman but not deployed).
- Live staging probes (2026-11-06): `GET /api/v1/admin/me` → **401 UNAUTHENTICATED**
  (`{"error":{"code":"UNAUTHENTICATED","message":"sign in to continue"}}`), so the admin route **is
  deployed** — it is an auth wall, not a missing route, which is the same signal `/organizer/profile`
  gives. `GET /api/v1/admin` also returns 401 (rather than 404), suggesting an auth guard on the whole
  `/admin` prefix. Control: `/api/v1/locations` and a deliberately bogus path both return 404. Only the
  401 is confirmed — the 403 "not an admin" branch and the success payload need a real admin account.

---

## 4. Endpoint inventory (verified against the OpenAPI spec and Postman)

Base: `/api/v1` unless noted. Every success response uses the envelope
`{ status: "success", message, data }`; every error uses `{ error: { code, message, details? } }`.

Auth, Categories, Profile, Organizer and Admin come from the OpenAPI spec. The Events table comes from
the Postman "Event" folder instead — the spec does not contain it.

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

Session mechanics, read off a real captured response (Postman, 2026-10-15):

| Cookie | Max-Age | Path | Attributes |
|---|---|---|---|
| `access_token` | 900s (15 min) | `/` | HttpOnly, SameSite=Lax |
| `refresh_token` | 2592000s (30 days) | `/api/v1/auth` | HttpOnly, SameSite=Lax |

The 15-minute access token is why the refresh-then-retry-on-401 path matters in practice, and why
`refresh_token` never reaches `/api/v1/me`. OTP rate limit observed: **30 per 15 minutes** per identifier
(`ratelimit: "30-in-15min"`).

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

### Events — organizer (authenticated)
| Method | Path | Body / query | Returns |
|---|---|---|---|
| POST | `/organizer/events` | any subset of the create fields (empty = blank draft) | `Event` (201, message `draft created`) |
| GET | `/organizer/events` | `?tab=&q=&page=` | `{ items: Event[], pagination }` (message `events`) |
| PATCH | `/organizer/events/{id}` | `{ expectedVersion, ...changedFields }` | `Event` (message `draft saved`) |
| DELETE | `/organizer/events/{id}` | — | `null` (message `draft deleted`) |

Create fields: `title`, `categoryId`, `description`, `startsAt`, `endsAt`, `timeZone` (IANA, e.g.
`Africa/Lagos`), `format` (`in_person` | `online`), `venueName`, `streetAddress`, `areaId`,
`coordinates: { longitude, latitude }`, `arrivalInstructions`, `joiningUrl`. Offline events send
venue/area/coordinates; online events send `joiningUrl` instead.

`Event` returns `id`, `status` (`draft`), `version`, the fields above (as objects — `category` and
`area` come back expanded), plus `missing: string[]` listing what still blocks publish. Values seen in
`missing`: `title`, `category`, `description`, `cover`, `startsAt`, `endsAt`, `format`, `admission`,
`coordinates`. (`cover` and `admission` are separate resources, not event properties.)

**Optimistic concurrency:** every PATCH must echo the `version` it last read as `expectedVersion`;
successful writes increment `version`. Send only changed fields; `coordinates: null` unsets the pin.

### Locations — documented in Postman, **not deployed**
| Method | Path | Status |
|---|---|---|
| GET | `/locations` | **404 `route not found`** on staging (2026-11-05) |

The Postman collection shows `/locations` returning a state → city → area hierarchy, and `areaId` on
create/update is expected to be one of those area IDs. The route is not live, so `in_person` events
cannot be given an `areaId` sourced from the API yet. Area IDs are environment-specific — never
hardcode the Postman example IDs.

### Admin — authenticated
| Method | Path | Returns |
|---|---|---|
| GET | `/admin/me` | `{ user, grantedAt }` |

`403 FORBIDDEN` means the account is not an admin. This looks like a **separate admin surface**.
Confirmed **deployed** on staging (2026-11-06): unauthenticated it returns 401 `UNAUTHENTICATED`, not 404.

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
Dashboard entry card → `/organizer/setup` → `POST /organizer/profile { name }` → organizer section
appears. Edit name/about and the organizer avatar at `/organizer/profile` (`PATCH /organizer/profile`,
`PUT`/`DELETE /uploads/organizer-avatar`). `/organizer` is the organizer home; it sends users to setup
when no profile exists.

---

## 7. Blockers and open questions

1. **Events ARE available — earlier note retracted.** A previous version of this file said no event
   endpoints existed and that all event UI was BLOCKED. That was **wrong**: it came from reading only
   the OpenAPI spec, which is stale. The Postman "Event" folder documents a full `/organizer/events`
   draft lifecycle, and live staging confirms the routes are deployed (`GET /organizer/events` → 401, not
   404). The service layer is now built. What is **still** blocked is `areaId` selection for `in_person`
   events, because `GET /locations` 404s on staging despite being documented (§4).
2. **Design source is connected but unreadable.** The Figma AI Bridge MCP is installed and working
   (requires `NODE_EXTRA_CA_CERTS` — see the Figma design map). However the Figma REST API
   `files/nodes` endpoint is rate-limited on the starter plan (~4.6 days), and the current model
   **cannot read images**, so the attendee/organizer/admin designs are still not readable. Inner-page
   layout cannot be matched to design until one of those is resolved (see §9).
3. **Postman is ahead of OpenAPI, not behind.** The OpenAPI spec omits `/organizer/events` entirely,
   and its Postman examples are the only event documentation. Separately, not everything in Postman is
   live: `GET /locations` returns 404. Conversely the old Postman `/auth/otp/verify` sample returns a
   `user` **without** `organizer`/`interests`, while the spec requires them. So: **per-endpoint
   verification against live staging is required** — neither document is globally authoritative.
4. **End-to-end OTP not yet confirmed** with a real staging account. `eventradr-setup.md` §7 makes this
   explicit: do not claim "authentication working" until the browser OTP → cookies → `/me` 200 test passes.
5. **Design-system inconsistency (narrowing).** The landing page, the app shell, `/onboarding`,
   `/dashboard`, `/profile` and the organizer screens all use the project palette (Cream, Ink, Mint,
   Lime, Purple, Coral) and Bricolage/Manrope. **Sign-in is the last page still on generic zinc/black
   Tailwind styling** and is the remaining alignment task.
6. **There is no `role` field.** Any "user type" switch in the UI must be derived from `user.organizer`
   and `/admin/me`, not from a stored role.

---

## 8. To do

Ordered, smallest-useful-first. Nothing here should be built against invented schemas.

- [ ] Confirm end-to-end OTP against staging with a real account (cookies + `/me` 200).
- [ ] Align sign-in with the landing-page design system (dashboard is now aligned — see blocker 5).
- [x] Extend `src/lib/api/types.ts` with `PublicOrganizer`, `Organizer`, `CreateOrganizerBody`,
      `UpdateOrganizerBody`.
- [x] Add `src/lib/api/organizer.ts`.
- [x] Extend `types.ts` with `UpdateProfileBody` and `SetInterestsBody`; add `src/lib/api/profile.ts`
      and `src/lib/api/admin.ts`.
- [x] Move `getCurrentUser` from `auth.ts` to `profile.ts` and update the dashboard import.
- [x] Extend `types.ts` with the event DTOs and add `src/lib/api/events.ts` (create / list / update / delete).
- [ ] **Obtain the attendee designs** (Figma is rate-limited — see the Figma design map).
- [x] Build onboarding (name + interests) — gated on `isNewUser`, and sign-in now routes on it.
      Styled from the design system; **expect a restyle pass** once Figma is readable.
- [ ] Restyle `/onboarding` against its Figma frame (`Attendee / Sign in and onboarding`, `4041:125498`).
- [x] Create the `(attendee)` route group and the shared `AppShell` (see §9, decision 5).
- [x] Create the `(organizer)` group, reusing `AppShell` via its `variant` prop. Still to decide: whether
      `(admin)` reuses `AppShell` or needs its own chrome.
- [ ] Restyle the shell, `/dashboard`, `/profile` and the organizer screens against their Figma frames
      once readable.
- [x] Build profile settings (name, avatar upload/remove, interests).
- [x] Build organizer setup + organizer profile management (`/organizer/setup`, `/organizer`,
      `/organizer/profile`). Design-system styling; **expect a restyle pass** once Figma is readable.
- [ ] Restyle the organizer screens against `Organizer / Sign in and organizer setup` (`571:11519`) and
      `Organizer / Edit public organizer profile` (`2653:388029`).
- [ ] Build organizer event management UI (draft list → create → edit) on top of `src/lib/api/events.ts`.
- [ ] Resolve `areaId` sourcing for `in_person` events — `GET /locations` is 404 on staging (§4).
- [ ] Build the admin entry point, gated on `/admin/me`.
- [ ] Replace mock landing-page event data once a **public** events endpoint exists. (The built
      `/organizer/events` routes are organizer-scoped and return drafts — they are not a public feed.)

---

## 9. Decisions made

1. **Design source** — **Figma AI Bridge MCP**, now installed and working. Requires
   `NODE_EXTRA_CA_CERTS` in the server's env block (see the Figma design map). The Figma REST API itself
   is rate-limited on the starter plan.
2. **Route/IA shape** — **separate route groups per user type** (e.g. `(attendee)`, `(organizer)`,
   `(admin)`), each with its own shell, rather than one role-aware dashboard.
3. **Sequence** — **attendee first**, then organizer, then admin. The attendee surface is the only one
   where the designs, the endpoints, and the role model are all complete. Organizer was considered first
   but deferred while the event endpoints were believed missing. That premise is now corrected —
   `/organizer/events` exists and the service layer is built — so organizer event management is
   unblocked at the API level, though its designs are still unreadable.
4. **Build on the design system now, restyle against Figma later** (2026-11-05). Because the Figma
   `files/nodes` limit is still counting down (`Retry after 100061 seconds`) and this model cannot read
   the exported PNGs, the attendee screens are being built from the project's own tokens and typography
   (Cream/Ink/Mint/Lime/Purple/Coral, Bricolage Grotesque headings, Manrope body) rather than from the
   Figma frames. This keeps the API wiring moving. **Every screen built this way is expected to need a
   fidelity pass** once the design data is readable — treat layout details as provisional.
5. **Concrete routing + shell shape** (2026-11-05). Implemented as:

   ```
   src/app/(auth)/sign-in/          → unauthenticated entry (no shell)
   src/app/(attendee)/layout        → AppShell (attendee nav)
   src/app/(attendee)/dashboard
   src/app/(attendee)/profile
   src/app/(organizer)/layout       → AppShell variant="organizer"
   src/app/(organizer)/organizer/
     ├─ page                       → organizer home (gated on a profile)
     ├─ setup/page                 → create the organizer profile
     └─ profile/page               → edit name/about + organizer avatar
   src/app/onboarding/              → standalone focused flow (no shell)
   ```

   Route groups do not affect URLs, so `/dashboard`, `/profile`, `/organizer`, `/organizer/setup` and
   `/organizer/profile` are plain paths. The organizer area deliberately **nests under `/organizer`**
   rather than living at the group root, so the URLs say which capability they belong to. The shell
   links only routes that exist today; "Discover" points at the landing page (`/`). `AppShell` is
   presentational, so each page owns its session and no extra `/me` request is made. One shell serves
   both areas via the `variant` prop, since an organizer is also an attendee.

## Still open

- **How to get the attendee frames** while Figma is rate-limited. Node IDs are known (see the Figma design
  map); the options are PNG export, or waiting for the limit to reset.
- **Interests re-editing — resolved.** It lives in profile settings (`/profile`), which covers what the
  `Change interests` frame (`1663:66496`) does.
- **Is the admin surface part of this app** or a separate deployment?
- **Organizer and admin shells — organizer resolved.** The organizer area reuses `AppShell` via its
  `variant` prop (an organizer is also an attendee), so there is one chrome, not two. Whether the admin
  area does the same, or needs its own chrome, is still undecided.
- **Shell identity.** `AppShell` is presentational today, so each page fetches `/me` itself. If the shell
  should show the signed-in user's avatar/name, an auth provider in the `(attendee)` layout would avoid a
  duplicate request per page.
- **Backend:** `GET /locations` is documented but 404s on staging. How should an `in_person` event's
  `areaId` be sourced meanwhile? Blocks complete offline event authoring.
- **Backend:** is there a **public** events feed for the landing page, or is `/organizer/events`
  (drafts, organizer-scoped) the only event surface?
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
- This Next.js version (`cacheComponents: true`) errors on unstable values such as `new Date()` read
  during render in a Client Component, and `react-hooks/set-state-in-effect` rules out the obvious
  "defer into an effect" workaround. Avoid wall-clock reads while rendering — the shell footer uses a
  static tagline instead of a year.
