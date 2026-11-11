# Eventradr — Project Handover

Working handover for the Eventradr frontend. Update this file at every step: record what
was done under **Done**, and what remains under **To do**.

---

## 1. Current status

| Area | State |
|---|---|
| Landing page (`/`) | Built and verified against mockups. Custom design system, Lenis smooth scroll, scroll- and mouse-based micro-interactions. |
| Auth (OTP sign-in) | **Rebuilt to the attendee sign-in design** — shared split-panel layout, 6-box OTP input, resend cooldown/toast handling, and design-matched invalid/expired/network states. The dev proxy is now verified working (`/api/v1/categories` → 200 through `localhost:3000`); a real-account OTP round trip is still outstanding. |
| API layer | Auth, categories, organizer, profile, admin **and events** services exist and type-check. |
| Events (organizer draft CRUD) | **Done** — service layer (`createEvent`, `listEvents`, `updateEvent`, `deleteEvent`, `findEvent` in `src/lib/api/events.ts`) **plus** the full `(organizer-workspace)` UI: `/organizer/events` (hub), `/organizer/events/new` (create), `/organizer/events/[id]` (edit), `/organizer/events/[id]/saved` ("Draft saved"). Unbacked sections (cover, admission, ticket tiers, payout, submit-for-review) render disabled. |
| App shell + routing | **Built** — shared `AppShell` (brand, primary nav, sign-out, footer) wired through an `(attendee)` route group. Dashboard and profile render inside it; `/onboarding` is now a standalone split-panel flow and `/onboarding/all-set` is the post-onboarding handoff screen. |
| Attendee dashboard (`/dashboard`) | **Built and aligned to the design system** — welcome heading, entry cards to Profile and Discover, account summary. Previously generic zinc/black styling. |
| Profile settings (`/profile`) | **Built** — avatar upload/remove, display name, interests, email; all four profile endpoints wired. Design-system styling (Figma restyle pass pending). |
| Organizer surfaces | **Sign-in + host-setup flow rebuilt to the supplied organizer design** — a shell-free `(organizer-flow)` route group with its own split-panel layout and the new `signal-mark` brand. `/organizer/sign-in` (OTP), `/organizer/setup` (create the profile, incl. save-failed / unconfirmed / checking states), `/organizer/setup/ready` (handoff). The `(organizer)` group still holds `/organizer` (home, gated on a profile) and `/organizer/profile` (edit name/about + organizer avatar) inside `AppShell`. Organizer name rules enforced client-side. Figma restyle pass pending on the `AppShell`-based screens. |
| Admin surfaces | **Not started.** Designs located and exported as PNGs, but not yet readable by this model (see the Figma design map). |
| Onboarding flow | **Rebuilt to the attendee onboarding design** — `/onboarding` is now interests-only, uses pill chips plus save/skip states, and routes to `/onboarding/all-set` for new users. Not yet confirmed end-to-end with a real account. |
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
| Design (local, attendee) | `eventradr-frontend/Attendee Sign In/` | User-supplied PNG frames. The implementation source for the attendee sign-in/onboarding rebuild (now complete). |
| Design (local, organizer) | `eventradr-frontend/Organizer SignIn/` | User-supplied PNG frames (15 desktop+mobile). The implementation source for the organizer sign-in/host-setup flow (§3). Read via the `/tmp` OCR + colour-sampler tooling. |
| Design (local, organizer events) | `eventradr-frontend/Organizer Events Flow/` | User-supplied PNG frames (69 desktop+mobile). The implementation source for the `(organizer-workspace)` events flow (§3). Read via the `/tmp` OCR + colour-sampler tooling. |

> **Standing rule — always re-verify the contract.** Before writing or changing any API call, request/
> response type, or error path, re-read the **current** OpenAPI document and Postman collection (links
> above) and confirm the exact paths, payloads, statuses and error codes. Both documents change without
> notice, so treat **everything in this file as potentially stale**. When the two sources disagree, flag
> the discrepancy and settle it with a live staging probe rather than silently choosing one.

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

The **same trap hits `next dev`**: start the dev server without the variable and the rewrite proxy fails every
upstream call, logging `Failed to proxy https://staging-api.eventradr.app/api/v1/... Error: unable to get local
issuer certificate` in `.next/dev/logs/next-development.log`. The browser receives a plain-text
`500 Internal Server Error` instead of JSON, so `getApiError` cannot parse it and the UI shows the generic
"Something went wrong. Check your connection and try again." — a misleading message for what is really a
server-side TLS misconfiguration. Always start with:

```sh
NODE_EXTRA_CA_CERTS=/etc/ssl/cert.pem npm run dev
```

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
- `src/app/(auth)/layout.tsx` — shared attendee auth shell: top-left brand, left-side event image
  (`public/event-image.png` copied from the user-supplied attendee flow folder), and the white bordered
  card used by `/sign-in`.
- `src/app/(auth)/sign-in/page.tsx` — rebuilt to the attendee design: email-first entry, 6 separate OTP
  boxes with paste support, resend cooldown reveal, bottom "Code sent" toast, and design-matched invalid,
  expired and network-copy states. On success it still routes on the documented `isNewUser` flag:
  `/onboarding` when true, `/dashboard` when false.
- `src/app/onboarding/layout.tsx` — matches the attendee auth shell for onboarding and the final success
  screen while keeping `/onboarding` outside the signed-in `AppShell`.
- `src/app/onboarding/page.tsx` — rebuilt to the attendee onboarding design as an **interests-only**
  step. Loads the current session plus `GET /categories`, renders pill chips with `aria-pressed`, shows
  either "Choose as many as you like." or the live `N interests selected` helper, and saves via
  `PUT /me/interests`. "Skip for now" now explicitly writes the documented empty set (`categoryIds: []`)
  before continuing.
- `src/app/onboarding/all-set/page.tsx` — the new post-onboarding handoff screen. New users now follow
  `verify -> /onboarding -> /onboarding/all-set -> /`.

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

### Organizer sign-in + host setup (rebuilt 2026-11-10 to `Organizer SignIn/`)
- Implemented from `eventradr-frontend/Organizer SignIn/` (15 desktop/mobile frames). Because this model
  cannot read images, every frame's copy, geometry and palette was recovered with the macOS Vision OCR /
  colour-sampler tooling in `/tmp`; the copy below is verified against the frames, not inferred.
- `src/app/(organizer-flow)/layout.tsx` — shell-free split-panel layout mirroring `(auth)/layout.tsx`,
  but using the **new brand mark** `public/signal-mark.png` (an 80×80 `#5B35F5` disc with a lime
  crescent, white leaf and coral dot — different from the attendee purple-square + white-ring lockup).
  Card is deliberately fluid (`34rem`/`39rem`) rather than pinned to the design's measured ~437 px, per
  the standing "responsive across every screen" ruling.
- `src/app/(organizer-flow)/organizer/sign-in/page.tsx` — the organizer OTP sign-in, structurally
  mirroring the attendee `(auth)/sign-in`. Copy: "Bring people together" / "Use the same Eventradr
  account to attend and organize events." → "Check your email" / "Enter the 6-digit code sent to
  ${email}." Routing: `isNewUser || !user.organizer` → `/organizer/setup`, otherwise `/organizer`. There
  is **one** account and **one** OTP flow; organizer is a capability, not an account type.
- `src/app/(organizer-flow)/organizer/setup/page.tsx` — `POST /organizer/profile`, six states:
  `loading → form → saving → saveError | unconfirmed | checking`. Error mapping: `ORGANIZER_PROFILE_EXISTS`
  → ready; `ORGANIZER_NAME_TAKEN` / `VALIDATION_ERROR` → back to form with an inline name error; 401 →
  sign-in; `status >= 500` → `unconfirmed` (the write may have landed, so it offers "Check saved
  profile", which calls `GET /organizer/profile` and resolves to ready on success or back to the form on
  the documented `ORGANIZER_PROFILE_REQUIRED`). Buttons are `type="button"` (not a `<form>`) so the
  primary action can be swapped for a disabled spinner button while in flight. "Start a draft instead"
  stays disabled on **this** screen because draft creation needs an organizer profile that does not
  exist yet at this point in the flow — the workspace offers it once setup is done.
- `src/app/(organizer-flow)/organizer/setup/ready/page.tsx` — the handoff screen ("Your organizer profile
  is ready" / "Manage events" → `/organizer/events`), mirroring `/onboarding/all-set`.
- Deleted the original `AppShell`-wrapped `(organizer)/organizer/setup/page.tsx`. Route groups do not add
  URL segments, so it and the new file both resolved to `/organizer/setup` — a build-breaking collision.
- Landing-page organizer CTAs now point at `/organizer/sign-in` (footer "Create an event", header
  "Create an event", the "How it works" section CTA). The header's plain "Sign in" still goes to the
  attendee `/sign-in`.

### Organizer area (shell)
- `src/app/(organizer)/layout.tsx` — wraps the organizer area in `AppShell variant="organizer"`. Every
  organizer is also an attendee, so reusing the shell avoids a second, near-identical chrome.
- `src/app/(organizer)/organizer/page.tsx` — organizer home. Gated on having a profile: no
  `user.organizer` (or the documented `ORGANIZER_PROFILE_REQUIRED` 403) routes the user to setup.
  Offers entry cards to **Your events** (`/organizer/events`) and **Public profile**
  (`/organizer/profile`), and shows the profile summary with the avatar or initials.
- `src/app/(organizer)/organizer/profile/page.tsx` — edits name and `about`, plus organizer avatar
  upload/removal (client-side type + 5 MB guard). `PATCH /organizer/profile` sends only the dirty fields
  and uses `about: null` to clear, per the documented contract.
- `src/lib/api/organizer.ts` — added `normalizeOrganizerName` and `describeOrganizerNameProblem` plus
  `ORGANIZER_NAME_MAX`, encoding the documented 1–80 chars and allowed-character set
  (Latin letters/accents, digits, spaces, `& ' - . ,`), so both setup and profile validate identically.
- `src/lib/api/errors.ts` — organizer cases added to `describeApiError`: `ORGANIZER_NAME_TAKEN`,
  `ORGANIZER_PROFILE_EXISTS`, `ORGANIZER_PROFILE_REQUIRED`, `IMAGE_INVALID`, `PAYLOAD_TOO_LARGE`.

### Organizer events workspace (built 2026-11-10 to `Organizer Events Flow/`)
- Implemented from `eventradr-frontend/Organizer Events Flow/` (69 desktop/mobile frames). Because this
  model cannot read images, each frame's copy, geometry and palette was recovered with the macOS Vision
  OCR / colour-sampler tooling in `/tmp`. Backed screens were built; unbacked ones render disabled.
- `src/app/(organizer-workspace)/layout.tsx` — a **third**, shell-free route group carrying the design's
  "Organizer workspace" top bar: `signal-mark.png` + `eventradr` wordmark (linking to `/organizer/events`),
  a divider, and an uppercase `Organizer workspace` label over `#FAFAFC`. Distinct from both `AppShell`
  (the sidebar chrome) and `(organizer-flow)` (the split-panel auth chrome).
- `src/app/(organizer-workspace)/organizer/events/page.tsx` — the **hub**: lists the organizer's drafts
  (`GET /organizer/events?tab=drafts&page=N`) with pagination ("Load more drafts"), a per-draft card
  (`Draft • Not public`, title or "Untitled draft", date range, place, category, updated-at, missing-field
  summary), `Continue editing` → `/organizer/events/{id}`, `Delete draft` (confirm dialog →
  `DELETE /organizer/events/{id}`), and `Create an event` → `/organizer/events/new`. Guards: 401 →
  `/organizer/sign-in`; `ORGANIZER_PROFILE_REQUIRED` or no `user.organizer` → a "set up your profile first"
  card → `/organizer/setup`; other failures → a "Try again" card.
- `src/app/(organizer-workspace)/organizer/events/new/page.tsx` — resolves the organizer name from the
  session, then renders `<EventForm mode="create" />`. No profile → `/organizer/setup`.
- `src/app/(organizer-workspace)/organizer/events/[id]/page.tsx` — edit screen. Resolves the draft with
  `findEvent(id)` (see below) and renders `<EventForm mode="edit" />`. Handles `missing` (unknown draft →
  "We couldn't find that draft") and `error` (→ "Try again") states.
- `src/app/(organizer-workspace)/organizer/events/[id]/saved/page.tsx` — the **"Draft saved"**
  confirmation (Organizer 9 / Organizer 2 layouts): "Your event is saved, but it isn't public.", the
  draft title, a progress line derived from `event.missing`, the `#EEE9F5` "Submit for review once the
  required details are complete." note, `Continue editing` (primary) and `Manage events` (→
  `/organizer/events`). The progress line only names fields the design shows and treats `cover` /
  `admission` as non-blocking, since neither has an API route yet.
- `src/lib/api/events.ts` — appended **`findEvent(id)`**. The collection documents **no**
  `GET /organizer/events/{id}`, so a single event is read out of the drafts list, walking pages while the
  list reports a next one (guarded against a bad `hasNext`). Returns `null` when the id is not among the
  organizer's drafts.
- Wired the previously-inactive entry points: `setup/ready` "Manage events" → `/organizer/events`; the
  organizer home gained a **"Your events"** `EntryCard` → `/organizer/events`; the `setup` "Start a draft
  instead" comment was corrected (it stays disabled because draft creation needs a profile that screen has
  not created yet).
- Unbacked sections (cover image upload, admission, ticket types/tiers, max tickets per order, refund
  policy, payout bank details, submit-for-review, under-review, approved/live, ticket validation,
  duplication, "View listing status") are rendered **disabled** behind `UnbackedNote` pills, not invented.

### Brand mark unified (2026-11-11)
- The wordmark everywhere now uses the **`signal-mark.png`** icon (the `#5B35F5` disc with lime crescent,
  white leaf and coral dot) that the organizer surfaces already used. Replaced the older inline
  purple-square + white-ring lockup in `AppShell.tsx` (attendee **and** organizer shells), the landing
  page header and footer (`src/app/page.tsx`), `(auth)/layout.tsx` and `onboarding/layout.tsx`. Rendered
  as `next/image` at 32 px. `(organizer-flow)` and `(organizer-workspace)` were already on the new mark.
- **Favicon** switched to the same mark: `src/app/icon.png` (a copy of `signal-mark.png`, 80×80), and the
  default `src/app/favicon.ico` was removed so it can't take precedence. Next.js now emits
  `<link rel="icon" href="/icon.png?…" sizes="80x80" type="image/png">`. (`favicon` must be `.ico` in
  this Next version, so the PNG goes through the `icon` file convention.)
- Verified: `npx tsc --noEmit`, `npm run lint` and `npm run build` all pass (18 routes).

### Verification
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.
- Browser smoke-checks on the dev server confirm the rebuilt attendee flow routes mount and render the
  expected primary copy:
  `/sign-in` ("Let's get you started!"), `/onboarding` (signed-out guard state), and
  `/onboarding/all-set` ("You're all set").
- These checks confirm the routes compile and render. They do **not** confirm the OTP -> cookies -> `/me`
  round trip, because that still needs a real staging account / code.
- Note: moving routes leaves stale generated types in `.next/types/validator.ts` pointing at the old
  paths, which fails `tsc` until the dev server (or a build) regenerates them. Clear `.next` after a
  route move, then start the server before type-checking.
- Live staging probes (2026-11-05): `GET /api/v1/organizer/events` → **401 UNAUTHENTICATED**;
  `GET /api/v1/locations` → **404 route not found** (documented in Postman but not deployed).
  **Correction (2026-11-10):** a `401` under `/organizer` is **not** evidence that a route exists — the
  `/organizer` prefix runs an auth guard *before* route matching, so any path under it returns 401 while
  unauthenticated. The `/organizer/events` route is real, but that is established by the Postman contract
  and by an authenticated round trip, **not** by the 401. Only `404 route not found` (seen on
  `/api/v1/locations`) distinguishes a missing route.
- Live staging probes (2026-11-06): `GET /api/v1/admin/me` → **401 UNAUTHENTICATED**
  (`{"error":{"code":"UNAUTHENTICATED","message":"sign in to continue"}}`), so the admin route **is
  deployed** — it is an auth wall, not a missing route, which is the same signal `/organizer/profile`
  gives. `GET /api/v1/admin` also returns 401 (rather than 404), suggesting an auth guard on the whole
  `/admin` prefix. Control: `/api/v1/locations` and a deliberately bogus path both return 404. Only the
  401 is confirmed — the 403 "not an admin" branch and the success payload need a real admin account.
- Verification (2026-11-10, organizer flow): after clearing `.next` (stale `validator.ts` from the route
  move), `npx tsc --noEmit`, `npm run lint` and `npm run build` all pass. The production route table
  lists 12 pages, including `/organizer/sign-in`, `/organizer/setup` and `/organizer/setup/ready`.
  Lint caught one real defect: a local function named `useAnotherAccount` was read as a React hook
  (`react-hooks/rules-of-hooks`) — renamed to `switchAccount`.
- Verification (2026-11-10, organizer events workspace): `npx tsc --noEmit`, `npm run lint` and
  `npm run build` all pass; the route table now lists **18** pages, including `○ /organizer/events`,
  `○ /organizer/events/new`, `◐ /organizer/events/[id]` and `◐ /organizer/events/[id]/saved`. All five
  workspace routes (`/organizer/events`, `/organizer/events/new`, `/organizer/events/[id]`,
  `/organizer/events/[id]/saved`, `/organizer`) return **200** on the dev server. Two lint/compile
  defects were caught and fixed: `react-hooks/set-state-in-effect` (a loader that called
  `setStatus("loading")` synchronously in its effect — split into a loader plus a separate `retry()`),
  and `CLIENT_HOOK_DYNAMIC` (`useParams()` in a Client Component needs a `<Suspense>` boundary under
  this project's Cache Components config). Live probes this session: `GET /api/v1/locations` → **404**;
  `GET /api/v1/categories` → **200** but with **live** IDs (`01a145d2-…`) that differ from the Postman
  documentation (`01a145c6-…`) — so categories must always be fetched live and never bundled;
  `GET /api/v1/organizer/events` → 401 (inconclusive, per the prefix-guard correction above).

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

### Public events feed — **does not exist**

Checked 2026-11-10. There is **no unauthenticated way to read events** from this backend:

| Candidate | Result |
|---|---|
| `GET /events` | **404 `route not found: GET /api/v1/events`** |
| `GET /public/events` | **404 `route not found`** |
| `GET /organizers/{id}/events` | **404 `route not found`** |
| `GET /organizers/{id}` | Route **exists**, but returns `PublicOrganizer` (`id`, `name`, `about`, `avatar`) only — no events |
| `GET /organizer/events` | Route **exists**, but `401` unauthenticated, organizer-scoped, and returns **drafts only** |

Every documented event carries `status: "draft"`, no publish route is documented, and `tab=drafts` is the
only documented `tab`. So the only event data reachable at all is the signed-in organizer's **own
unpublished drafts**. Nothing exists for an attendee or the landing page to read.

**Route-vs-resource:** the app's router returns `{"error":{"code":"NOT_FOUND","message":"route not found:
GET /api/v1/x"}}` for a missing route, but `"organizer not found"` for a missing resource. Use that
wording to distinguish "not deployed" from "not found" — this is what makes the table above conclusive.

### Locations — documented in Postman, **route not deployed**; UI uses a bundled fallback
| Method | Path | Status |
|---|---|---|
| GET | `/locations` | **404 `route not found`** on staging (re-checked 2026-11-10) |

The Postman collection shows `/locations` returning a state → city → area hierarchy, and `areaId` on
create/update is expected to be one of those area IDs. The documented **area IDs are live-staging IDs**
(proven by the documented create/update event examples returning those same `area.id` values), unlike the
category IDs, so the fallback is safe to ship.

`src/lib/api/locations.ts` therefore does: `fetchLocations()` calls `GET /locations`; on a `404` it falls
back to `LOCATION_FALLBACK`, a bundled verbatim snapshot of the documented Lagos → Lagos → 53 areas.
`listLocations()` is the single entry point the UI uses, and **switches to live data automatically** the
moment the route is deployed — no code change needed.

### Endpoints the designs call for but the backend does **not** expose
Recorded so they can be revisited. None of these has a route today; the UI renders them **disabled** or
omits them rather than inventing schemas.

| Design need | Backing route | Status |
|---|---|---|
| Event cover image upload | — | **No route** (`cover` appears only in `Event.missing`, as a separate resource) |
| Admission / ticket pricing | — | **No route** (`admission` appears only in `Event.missing`) |
| Ticket types / tiers | — | **No route** |
| Max tickets per order | — | **No route** |
| Refund policy | — | **No route** |
| Payout / bank details | — | **No route** |
| Submit event for review | — | **No route** (only `status: "draft"` exists; no publish transition) |
| Listing status / under-review (`Organizer 4`) | — | **No route** |
| Approved / live event state | — | **No route** |
| Ticket validation / check-in, duplicate event | — | **No route** |
| Single event read (`GET /organizer/events/{id}`) | — | **Not documented** — `findEvent` reads the drafts list instead |
| Public events feed (landing page) | — | **No route** (see below) |
| `GET /locations` | `/locations` | **404 on staging** — bundled fallback in use |

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
Landing-page "Create an event" CTA → `/organizer/sign-in` → `POST /auth/otp` → `POST /auth/otp/verify`
→ `isNewUser || !user.organizer` ? `/organizer/setup` : `/organizer`. Setup calls
`POST /organizer/profile { name }` and lands on `/organizer/setup/ready`. Edit name/about and the
organizer avatar at `/organizer/profile` (`PATCH /organizer/profile`, `PUT`/`DELETE
/uploads/organizer-avatar`). `/organizer` is the organizer home; it sends users to setup when no profile
exists. There is **one** account and **one** OTP flow — the organizer sign-in is the same endpoint as the
attendee one, just a different entry screen; an organizer is also an attendee.

---

## 7. Blockers and open questions

1. **Events ARE available — earlier note retracted.** A previous version of this file said no event
   endpoints existed and that all event UI was BLOCKED. That was **wrong**: it came from reading only
   the OpenAPI spec, which is stale. The Postman "Event" folder documents a full `/organizer/events`
   draft lifecycle. (The old claim that `GET /organizer/events` → 401 "confirms the route is deployed"
   was **also** wrong — the `/organizer` prefix auth guard runs before route matching, so that 401 is
   inconclusive; see the verification correction in §3.) The service layer **and** the full workspace UI
   are now built. The former `areaId` blocker is **resolved**: `listLocations()` falls back to a bundled
   snapshot of the documented areas while `GET /locations` 404s, and switches to live automatically
   (§4). What remains unbacked is everything in the "not exposed" table in §4 — cover, admission, ticket
   tiers, payout, and the publish/review lifecycle — none of which has a route.
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
5. **Design-system inconsistency (resolved for attendees).** The landing page, the app shell,
   `/sign-in`, `/onboarding`, `/onboarding/all-set`, `/dashboard` and `/profile` all use the project
   palette (Cream, Ink, Mint, Lime, Purple, Coral) and Bricolage/Manrope. Sign-in was the last page
   left on generic zinc/black styling; **the attendee sign-in rebuild removed that** (2026-11-10). The
   organizer screens are on the design system too, but await their Figma fidelity pass.
6. **There is no `role` field.** Any "user type" switch in the UI must be derived from `user.organizer`
   and `/admin/me`, not from a stored role.
7. **There is no public events feed.** Re-verified 2026-11-10: the Postman collection documents only
   organizer-scoped event routes (`/organizer/events`), and `/api/v1/public/events` returns
   `404 route not found`. The landing page therefore stays on mock data until a public feed is
   deployed — do not invent one.
8. **The API's rate limiter is global.** Any path returns `429 rate limited`, including paths that do
   not exist, so a `429` says **nothing** about whether a route is deployed. Probe with a bogus control
   path (e.g. `/api/v1/definitely-not-a-real-route-xyz`) in the same batch; only `404` vs a
   contract-shaped `401`/`400` is evidence. `/api/v1/locations` → `404` is therefore conclusive
   (re-checked 2026-11-10), whereas the `429`s seen for `/api/v1/events` and `/api/v1/admin/me` are not.

---

## 8. To do

Ordered, smallest-useful-first. Nothing here should be built against invented schemas.

**Sequencing (revised 2026-11-10): the organizer sign-in + host-setup flow comes first.** The earlier
attendee-first order was reversed by the user — finish setting up the organizer side before returning to
the remaining attendee screens, which will still be supplied in batches. Admin stays deferred.

### Attendee — current focus

- [x] Rebuild the attendee sign-in flow to match the supplied attendee design folder.
- [x] Recover the attendee sign-in/onboarding design from the user-supplied local flow folder
      (`eventradr-frontend/Attendee Sign In/`) and use it as the implementation source.
- [x] Rebuild onboarding as the attendee **interests-only** flow, gated on `isNewUser`.
- [x] Add the attendee "You're all set" screen and wire the new-user routing.
- [x] Create the `(attendee)` route group and the shared `AppShell` (see §9, decision 5).
- [x] Build profile settings (name, avatar upload/remove, interests).
- [ ] Confirm end-to-end OTP against staging with a real account (cookies + `/me` 200). The dev proxy
      is verified working; only the emailed-code round trip is outstanding, and it needs a mailbox.
- [ ] Implement the remaining attendee screens as the user supplies them, batch by batch.
- [ ] Fidelity pass on the attendee screens against their Figma frames once readable.
- [ ] Replace mock landing-page event data once a **public** events feed exists — **verified
      2026-11-10 that it does not** (§7, item 7). Do not invent this endpoint.

### API layer

- [x] Extend `src/lib/api/types.ts` with `UpdateProfileBody` and `SetInterestsBody`; add
      `src/lib/api/profile.ts` and `src/lib/api/admin.ts`.
- [x] Move `getCurrentUser` from `auth.ts` to `profile.ts` and update the dashboard import.
- [x] Extend `src/lib/api/types.ts` with `PublicOrganizer`, `Organizer`, `CreateOrganizerBody`,
      `UpdateOrganizerBody`.
- [x] Add `src/lib/api/organizer.ts`.
- [x] Extend `types.ts` with the event DTOs and add `src/lib/api/events.ts`
      (create / list / update / delete / find). The UI is now built on top of it (§3).
- [x] Add the location DTOs and `src/lib/api/locations.ts` with `listLocations()` and the bundled
      `LOCATION_FALLBACK` snapshot (§4).

### Organizer — current focus

- [x] Create the `(organizer)` group, reusing `AppShell` via its `variant` prop.
- [x] Build organizer setup + organizer profile management (`/organizer/setup`, `/organizer`,
      `/organizer/profile`). Design-system styling; **expect a restyle pass** once Figma is readable.
- [x] Create the shell-free `(organizer-flow)` group and rebuild the organizer sign-in (`/organizer/sign-in`),
      host setup (`/organizer/setup`) and handoff (`/organizer/setup/ready`) to the `Organizer SignIn/`
      design. Wire the landing-page organizer CTAs to `/organizer/sign-in`.
- [ ] Confirm end-to-end OTP against staging with a real organizer account (cookies + `/me` 200) and
      walk the sign-in → setup → ready path. Needs a mailbox.
- [ ] Restyle the organizer screens against `Organizer / Sign in and organizer setup` (`571:11519`) and
      `Organizer / Edit public organizer profile` (`2653:388029`).
- [ ] Restyle the shell, `/dashboard` and `/profile` against their Figma frames once readable.
- [x] Build organizer event management UI (draft list → create → edit) on top of `src/lib/api/events.ts`.
      Built as the shell-free `(organizer-workspace)` group: `/organizer/events` (hub), `/events/new`
      (create), `/events/[id]` (edit) and `/events/[id]/saved` ("Draft saved"), with delete-draft, the
      live "Before you submit" preview, and the unsaved-changes guard. The setup screen's "Start a draft
      instead" is still disabled on that screen only, because draft creation needs a profile that does
      not exist yet there.
- [x] Resolve `areaId` sourcing for `in_person` events — `listLocations()` uses the bundled fallback
      while `GET /locations` 404s and switches to live automatically (§4).
- [ ] Implement the unbacked design screens (cover image, admission, ticket tiers, payout, submit-for-
      review, under-review, approved/live) **once their routes exist** — see the §4 "not exposed" table.
      Do not build them against invented schemas.

### Admin — deferred

- [ ] Decide whether `(admin)` reuses `AppShell` or needs its own chrome.
- [ ] Build the admin entry point, gated on `/admin/me`.

---

## 9. Decisions made

1. **Design source** — **Figma AI Bridge MCP**, now installed and working. Requires
   `NODE_EXTRA_CA_CERTS` in the server's env block (see the Figma design map). The Figma REST API itself
   is rate-limited on the starter plan.
2. **Route/IA shape** — **separate route groups per user type** (e.g. `(attendee)`, `(organizer)`,
   `(admin)`), each with its own shell, rather than one role-aware dashboard.
3. **Sequence — revised 2026-11-10: organizer sign-in + host setup first.** The user reversed the
   earlier attendee-first order: finish the organizer set-up side, then return to the remaining attendee
   screens as they are supplied. Admin stays last. (Background: organizer was originally considered first
   but deferred while the event endpoints were believed missing; that premise is corrected —
   `/organizer/events` exists and the service layer is built.)
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
     └─ profile/page               → edit name/about + organizer avatar
   src/app/(organizer-flow)/layout  → shell-free split panel (organizer sign-in + host setup)
   src/app/(organizer-flow)/organizer/
     ├─ sign-in/page               → organizer OTP sign-in
     ├─ setup/page                 → create the organizer profile
     └─ setup/ready/page           → handoff ("Your organizer profile is ready")
   src/app/(organizer-workspace)/layout → shell-free "Organizer workspace" top bar
   src/app/(organizer-workspace)/organizer/events/
     ├─ page                       → events hub (drafts list, create, delete)
     ├─ new/page                   → create a draft
     └─ [id]/
        ├─ page                    → edit a draft
        └─ saved/page              → "Draft saved" confirmation
   src/app/onboarding/              → standalone focused flow (no shell)
   ```

   Route groups do not affect URLs, so `/dashboard`, `/profile`, `/organizer`, `/organizer/sign-in`,
   `/organizer/setup`, `/organizer/setup/ready`, `/organizer/profile`, `/organizer/events`,
   `/organizer/events/new`, `/organizer/events/{id}` and `/organizer/events/{id}/saved` are plain paths.
   The organizer area deliberately **nests under `/organizer`** rather than living at the group root, so
   the URLs say which capability they belong to. The shell links only routes that exist today; "Discover"
   points at the landing page (`/`). `AppShell` is presentational, so each page owns its session and no
   extra `/me` request is made. One shell serves both areas via the `variant` prop, since an organizer is
   also an attendee. **Because route groups do not add segments, no two groups may define the same final
   path** — `/organizer/setup` lives only in `(organizer-flow)`; a second definition under `(organizer)`
   will fail the build.
6. **Organizer events live in their own shell-free workspace, `(organizer-workspace)`** (2026-11-10).
   The `Organizer Events Flow/` design carries a distinct top bar ("Organizer workspace"), not the
   `AppShell` sidebar, so a third route group was added rather than stretching `AppShell`. `/organizer`
   (home) and `/organizer/profile` stay in the sidebar `(organizer)` shell as before.
7. **No single-event GET — read the draft out of the list** (2026-11-10). The collection documents no
   `GET /organizer/events/{id}`, so `findEvent(id)` walks `GET /organizer/events?tab=drafts&page=N`
   until it finds the id (returning `null` if absent). This avoids inventing a route; if a real
   single-event endpoint appears, swap `findEvent` for it.
8. **`areaId` via a bundled fallback, categories always live** (2026-11-10). `GET /locations` 404s, so
   the UI falls back to a bundled snapshot of the documented areas and switches to live automatically
   when the route lands. Categories are the opposite: the live IDs already differ from the documented
   ones, so `GET /categories` is **always** called live and never bundled.
9. **Unbacked design sections render disabled, not mocked** (2026-11-10). Every screen section with no
   backing route (cover, admission, ticket tiers, payout, submit-for-review, under-review) is rendered
   behind a disabled `UnbackedNote` pill so the UI matches the design without inventing behaviour.
   The list is in the §4 "not exposed" table for later revisiting.

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
- **Backend:** `GET /locations` is documented but 404s on staging. **Resolved for now** — the UI uses a
  bundled snapshot of the documented areas (`listLocations()`) and switches to live automatically once
  the route is deployed (§4).
- **Backend:** is there a **public** events feed for the landing page, or is `/organizer/events`
  (drafts, organizer-scoped) the only event surface?
- **Backend:** confirm whether the OpenAPI `User` schema (`organizer`, `interests` required) or the older
  Postman sample is current.
- **Backend:** the documented category IDs are **stale** (live differ) — confirm the design's category
  examples are not relied on anywhere. The UI fetches categories live, so this is informational only.

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
