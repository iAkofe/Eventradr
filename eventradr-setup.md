# Eventradr — Next.js Frontend Setup & Backend Integration

> **Instructions for an AI coding agent**  
> **Goal:** Set up or adapt the Eventradr frontend correctly, connect it to the staging backend through the required localhost development proxy, and validate the cookie-based OTP authentication flow without making up API contracts.  
> **Stack:** Next.js App Router, TypeScript, Tailwind CSS, ESLint, npm. **Do not use Vite.**

## 0. Agent operating rules — read before making changes

You are the senior frontend engineer executing this task in the user's codebase. **Perform the work**, not merely describe how to do it. Follow the steps in order, check each acceptance criterion, and report the actual result of every check.

1. Inspect the working directory and `git status` before changing anything. If a compatible Next.js project exists, **adapt it**; do not scaffold over it, delete existing work, or overwrite team configuration without examining it. If there is no project, create one.
2. Use the existing package manager/lockfile in an established repository. For a new repository, use **npm**.
3. Keep changes focused and reversible. Do not delete files, rewrite unrelated features, deploy, push, or commit without the user's explicit request.
4. Do **not** fabricate Eventradr endpoints, request-body keys, response shapes, test accounts, OTP values, roles, designs, or success results. You may implement a reusable integration foundation immediately; implement schema-dependent screens only after inspecting real API documentation.
5. Do not log, print, persist in browser-accessible storage, or commit `access_token`, `refresh_token`, OTPs, passwords, session cookies, or test credentials. Keep `.env.local` ignored by Git.
6. Where a source cannot be opened, document the limitation and proceed with verified setup work. Mark dependent tasks **BLOCKED**, with the exact missing information; do not pretend they passed.
7. This is a **browser-cookie authentication** integration. Do not invent a JWT-in-localStorage solution, add an unnecessary auth SDK, or substitute custom Next.js API Route Handlers for the requested rewrite proxy.
8. **Re-verify the API contract every time you touch it.** Before writing or changing any API call, request/response type, or error handling, reopen the *current* sources in §1 — the Swagger/OpenAPI document and the Postman collection — and confirm the exact paths, payloads, statuses and error codes. These documents change without notice, so treat any cached summary (this file, `handover.md`, `AGENTS.md`, or your own memory) as **potentially stale**. When the two sources disagree, flag the discrepancy and settle it with a live staging probe; do not silently pick one.

## 1. Documentation: source of truth and known facts

Read these sources **before** implementing API-specific forms or TypeScript models:

| Source | URL or file | Use |
|---|---|---|
| Eventradr Swagger/OpenAPI UI | https://staging-api.eventradr.app/api/docs/ | Inspect endpoint paths, methods, auth, request bodies, response/error schemas. Export/read the OpenAPI definition if available. |
| Eventradr Postman documentation | https://documenter.getpostman.com/view/7735144/2sBYHRWhfo | Cross-check saved request examples, required headers, OTP flow, and example responses. |
| Backend staging proxy guide | `staging-dev-proxy.md` (provided by backend developer; essential facts reproduced below) | **Authoritative source for localhost proxy and cookie behavior.** |
| Next.js rewrites | https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites | Confirm supported configuration and rewrite precedence. |
| Next.js installation | https://nextjs.org/docs/app/getting-started/installation | Confirm current setup options and Node.js requirements. |

### Confirmed facts from the backend developer's Markdown file

- Staging API origin: `https://staging-api.eventradr.app`.
- Auth uses two **HttpOnly cookies** named `access_token` and `refresh_token`, with `SameSite=Lax`.
- Frontend local origin: `http://localhost:3000`.
- Direct browser calls from localhost to staging are cross-site; the `SameSite=Lax` cookies will not accompany the relevant cross-site fetch requests. A sign-in can appear successful while later requests return `401`.
- **Required local solution:** rewrite/proxy requests from the browser's `/api/*` paths on localhost to the same `/api/*` paths on the staging origin. The backend needs no frontend-specific code change for this.
- Exact backend-confirmed test endpoints:
  - `POST /api/v1/auth/otp`
  - `POST /api/v1/auth/otp/verify`
  - `GET /api/v1/me`
- Always use browser request credentials: `credentials: 'include'` for fetch or `withCredentials: true` for axios.
- Preserve `/api` and `/api/v1/auth` paths. The `refresh_token` cookie is scoped to `/api/v1/auth` and should **not** be expected on a request to `/api/v1/me`.
- On staging, backend variable `COOKIE_DOMAIN` must remain **unset** for localhost-proxied cookies to be accepted. This is a backend configuration requirement; do not change it in frontend code.
- Staging cookies are `Secure`. Chrome and Firefox generally allow Secure cookies on `http://localhost`; Safari may drop them. Prefer Chrome/Firefox for local checks or use HTTPS localhost if necessary.
- Localhost does not have to be added to staging `CORS_ORIGIN` for browser requests that go **through the rewrite proxy**.
- The backend's documented success check is: OTP request → OTP verification → observe both cookies under localhost → `GET /api/v1/me` returns `200`.

### Not confirmed by the Markdown file — discover, never assume

- Exact OTP payload fields, user identifier (email/phone/etc.), OTP length, challenge IDs, and verification response JSON.
- Whether public registration/login alternatives, logout, refresh endpoints, profile update endpoints, or event-management endpoints exist.
- Eventradr's full feature set, user roles, UI/UX specification, and production frontend domain.
- Exact production API origin, production cross-origin policy, cookie/CSRF behavior, and deployment arrangements.

**Action:** Build an endpoint inventory containing `{feature, method, path, request schema, response schema, authentication, errors, documentation source}`. If Swagger and Postman disagree, flag the discrepancy for the backend developer. Do not silently select one.

## 2. Inspect or initialize the project

### Existing repository

- Inspect `package.json`, lockfile, `src/` layout, `next.config.*`, existing `.env*` samples, lint setup, and any `AGENTS.md`/repo conventions.
- Record Node and npm versions: `node -v`, `npm -v`.
- Ensure this is a Next.js **App Router + TypeScript** project. Preserve existing functioning pages and dependencies.
- Check whether `app/api/` or `pages/api/` contains paths conflicting with `/api/*`. **Do not delete them automatically**; report the conflict and safely refactor only if clearly authorized and within scope.

### New repository only

Run:

```bash
node -v
npm -v
npx create-next-app@latest eventradr-frontend
cd eventradr-frontend
```

Choose/customize options:

- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Import alias: keep `@/*`
- React Compiler, Cache Components, and other optional flags: use conservative defaults or the team's preference; do not enable experimental behavior just for setup.
- Include generated `AGENTS.md` if the current CLI offers it; preserve this project-specific instruction document as higher-priority task context.

Use a compatible current Node.js version. Check the actual installed Next.js requirements before proceeding (Next.js documentation specifies at least Node.js 20.9 for the referenced installation guide).

```bash
npm run dev
```

Verify the app starts at `http://localhost:3000` before proceeding. Stop conflicting dev servers so Next.js does not silently switch to port 3001.

**Checkpoint A:** Next.js starts on port 3000; TypeScript, Tailwind, App Router, and ESLint are available.

## 3. Set up local environment variables and safe samples

Create or update `.env.local` in the **project root**:

```dotenv
# Server-side destination used by the Next.js development rewrite.
API_PROXY_TARGET=https://staging-api.eventradr.app

# Empty in local development: browser sends relative /api/... requests to localhost.
NEXT_PUBLIC_API_BASE_URL=
```

Create a committable `.env.example` with the same **non-secret** variable names and safe examples:

```dotenv
API_PROXY_TARGET=https://staging-api.eventradr.app
NEXT_PUBLIC_API_BASE_URL=
```

Verify `.env.local` is excluded by `.gitignore`. `API_PROXY_TARGET` is a server-side configuration variable; do **not** prefix it `NEXT_PUBLIC_`.

For a future deployed application, the backend guide suggests a full API origin (illustrative example: `https://api.eventradr.app`) for `NEXT_PUBLIC_API_BASE_URL`. **Do not claim this is the confirmed production endpoint.** Confirm the real value with the backend team. Public Next.js environment variables are inlined into the client build; set the correct value **before** building each deployment artifact.

Restart the Next.js dev server after changing `next.config.ts` or environment variables.

**Checkpoint B:** Local env variables exist, `.env.local` is ignored, and no secrets are committed.

## 4. Implement the localhost rewrite proxy (CRITICAL)

Use the existing `next.config.ts` if present; merge with other settings without losing them. The backend's rewrite rule is:

```ts
{
  source: "/api/:path*",
  destination: `${API_ORIGIN}/api/:path*`,
}
```

Recommended **development-only** version to avoid unintentionally forwarding production traffic to staging:

```ts
// next.config.ts
import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.API_PROXY_TARGET ??
  "https://staging-api.eventradr.app";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

This production guard is a **recommended safety adaptation** of the backend developer's original rewrite, which was not environment-gated. If the team requires a proxy in a non-development environment, get that environment's approved destination and explicitly configure it; do **not** silently proxy deployed traffic to staging.

Mandatory rules:

1. Requests issued by **browser JavaScript** during local development must use relative URLs, e.g. `fetch('/api/v1/me', { credentials: 'include' })`.
2. Do **not** issue client requests directly to `https://staging-api.eventradr.app/...` in local development.
3. Do not remove `/api` or change `/api/v1/auth` to another prefix; the refresh cookie Path depends on it.
4. Do **not** create `src/app/api/.../route.ts`, `app/api/.../route.ts`, or `pages/api/...` handlers for backend paths. Such local routes can take precedence and prevent forwarding by the configured rewrite.
5. Do **not** replace this rewrite solution with a generic custom BFF/proxy unless the team explicitly changes the architecture.
6. The rewrite is for browser-to-localhost API requests. A **Server Component or server-side fetch** does not automatically inherit browser cookies; do not reuse the browser-only helper in server code. If SSR-authenticated data is later needed, design explicit, safe cookie forwarding with the backend team.

Flow to achieve:

```text
Browser
  GET http://localhost:3000/api/v1/me
      |
      v
Next.js development rewrite
  GET https://staging-api.eventradr.app/api/v1/me
      |
      v
Backend checks access_token cookie -> returns response
```

**Checkpoint C:** The browser's network requests target `localhost:3000/api/...`; the Next.js server forwards them to the same `/api/...` route on staging.

## 5. Create a minimal, reusable browser-side API client

Add `src/lib/api/client.ts` (or integrate with an existing API client). Use native `fetch` unless the repository already standardizes on another library.

```ts
// src/lib/api/client.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function apiFetch<T>(
  path: `/api/${string}`,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // JSON.stringify(...) produces a string body. Other body types
  // (e.g. FormData or Blob) must keep their appropriate content type.
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: options.cache ?? "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data: unknown =
    response.status === 204
      ? null
      : contentType.includes("application/json")
        ? await response.json()
        : await response.text();

  if (!response.ok) {
    throw new ApiError(
      `API request failed (${response.status})`,
      response.status,
      data
    );
  }

  return data as T;
}
```

Important implementation notes:

- This helper is for **browser-executed requests**. Use it from Client Components or browser-facing service modules, not directly inside Server Components.
- The generic `T` is a type supplied by callers **after** reading the real API response schema; it does not validate data at runtime. If the project needs runtime validation, add it deliberately based on the actual schema.
- Send JSON bodies with `JSON.stringify(...)`; for uploads use `FormData` without a manually set multipart `Content-Type`.
- Do not globally redirect on any `401` without considering an initial unauthenticated `/me` request or a backend-documented refresh flow.
- Never extract credentials from the returned payload unless the API documentation explicitly requires it; this backend's guide specifies HttpOnly cookies.

**Checkpoint D:** Client requests use `credentials: 'include'`, a centralized base URL, appropriate error handling, and no access-token storage in the browser.

## 6. Verify backend reachability before building authentication screens

1. Start Next.js with `npm run dev` on port **3000**.
2. In browser DevTools → **Network**, request `GET /api/v1/me` via the app or a temporary browser-only diagnostic component. Observe the **request URL**: it must be `http://localhost:3000/api/v1/me`.
3. Before login, `401 Unauthorized` can be **expected**, and usually proves you reached a protected endpoint; it is **not** evidence that authentication is broken.
4. Verify the request is actually forwarded and not handled by a local route or returned as an HTML Next.js 404/error page.
5. Distinguish these issues: wrong path, staging downtime, TLS/network error, 404 from backend, 401 due to no session, and missing environment variables.
6. Remove any temporary diagnostic UI once proper auth checks exist, or keep it accessible only in development without printing sensitive data.

If the documentation websites cannot be accessed, do not infer endpoint schemas from URL names. The three paths stated in §1 are the only known endpoint paths from the handoff.

**Checkpoint E:** At least one backend-proxied response is observed and its true HTTP status is recorded. Do not claim an authenticated 200 response yet.

## 7. Implement the *real* OTP authentication flow — after reading schemas

The authoritative handoff specifies this sequence:

1. `POST /api/v1/auth/otp` — OTP request.
2. `POST /api/v1/auth/otp/verify` — OTP verification.
3. Browser stores backend-issued `access_token` and `refresh_token` as HttpOnly cookies through the localhost proxy.
4. `GET /api/v1/me` — current authenticated user; backend expects `200` after a valid login.

**Before coding the forms:** inspect Swagger/Postman to determine exact fields, validation rules, response statuses, rate-limit behavior, required headers, error structures, whether the OTP request has a challenge ID, and how the user identifier is represented. **Do not presume `{email}`, `{otp}`, `{token}`, or any particular JSON wrapper.**

Create service modules (e.g. `src/lib/api/auth.ts`) using the actual documented types:

```ts
import { apiFetch } from "@/lib/api/client";

// Replace these placeholders with the exact OpenAPI/Postman schemas.
// Do not use this stub to send real requests until shapes are confirmed.
type RequestOtpBody = Record<string, unknown>;
type VerifyOtpBody = Record<string, unknown>;

export function requestOtp(body: RequestOtpBody) {
  return apiFetch<unknown>("/api/v1/auth/otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function verifyOtp(body: VerifyOtpBody) {
  return apiFetch<unknown>("/api/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getCurrentUser() {
  return apiFetch<unknown>("/api/v1/me");
}
```

Use the stub as a **planning template**, not a finished integration. Replace `Record<string, unknown>` and `unknown` with accurate DTOs before enabling live OTP forms.

Once contracts are confirmed, implement the minimum corresponding screens/components:

- OTP identifier submission screen, with loading, server error, validation error, and success state.
- OTP code verification screen, using only documented fields; no OTP values in logs.
- Protected/authenticated page that calls `/api/v1/me` to resolve session state.
- Handling for unauthenticated `401`, expired sessions, and any refresh/logout behavior **only if documented**.
- Accessible labels, keyboard interactions, feedback messages, and mobile responsiveness.

Do not assume cookie presence means a valid session; the `/me` check is authoritative. Do not attempt to read HttpOnly cookies with `document.cookie`.

**Checkpoint F (requires authorized staging credentials):** Real OTP flow succeeds, both cookies appear for localhost in browser storage, and `/api/v1/me` returns `200` for the authenticated user. If test access or the request schemas are unavailable, label F **BLOCKED**, not passed.

## 8. Test cookies and troubleshoot precisely

In Chrome or Firefox:

1. Open `http://localhost:3000`.
2. Perform the documented OTP request and verification using **authorized test inputs**.
3. Open DevTools → **Application** → **Storage** → **Cookies** → `http://localhost:3000`.
4. Confirm cookies named `access_token` and `refresh_token` exist. **Do not copy or print their values.**
5. Inspect **Network** for subsequent `GET http://localhost:3000/api/v1/me`, which should return **200** after a valid session.
6. Confirm refresh cookie Path includes `/api/v1/auth`; do not expect it on `/api/v1/me`. Observe response `Set-Cookie` metadata carefully without exposing cookie contents.

Troubleshooting matrix:

| Symptom | Likely diagnosis | Next action |
|---|---|---|
| Sign-in succeeds, then `/me` returns 401 | Cookies missing, wrong path/domain, proxy bypassed, or invalid session | Verify browser request target, `Set-Cookie` attributes, accepted cookies, and backend logs with teammate |
| Browser requests staging directly | Public API base URL is wrong for dev or absolute URL was hardcoded | Use empty dev `NEXT_PUBLIC_API_BASE_URL` and `/api/v1/...` relative paths |
| Browser cookies missing on localhost | Backend `COOKIE_DOMAIN` set incorrectly, Secure/SameSite/Path issue, or browser rejection | Ask backend developer to verify staging configuration; try Chrome/Firefox or HTTPS localhost |
| `/api/v1/...` hits a local Next route | Route handler shadows rewrite | Remove/refactor the conflicting route with care |
| HTML 404 or unrelated response | Wrong URL or rewrite not active | Inspect request URL, Next.js config, startup logs, and path |
| `401` before OTP verification | Not yet authenticated | Expected; only flag persistent 401 **after** valid session |
| Works in Chrome, fails in Safari | Secure cookies on HTTP localhost may be dropped | Test with Chrome/Firefox or run Next.js with HTTPS local configuration |
| Browser CORS failure in deployed build | Frontend/backend may be cross-origin even when same-site | Confirm allowed production origins and credentialed CORS config with backend team |

Do not weaken cookie security or switch to `SameSite=None`/non-HttpOnly cookies just to make the local integration work.

## 9. Suggested project structure

Adapt to existing conventions; do not create unused files solely to match this tree:

```text
eventradr-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/              # only if documented auth screens are ready
│   │   └── (protected)/         # optional route group; not an API proxy
│   ├── components/
│   │   ├── shared/
│   │   └── ui/
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts
│   │       └── auth.ts          # only with contract-aware methods
│   ├── hooks/
│   └── types/
├── .env.example
├── .env.local                # ignored, local-only
├── next.config.ts
├── package.json
└── README.md
```

**Do not create `src/app/api/` for the staging endpoints.** No invented events dashboard/data model is necessary to complete the initial integration milestone.

## 10. Validation commands and required checks

Run from the project root. Use commands supported by the actual repository scripts:

```bash
npm run dev           # check local startup on port 3000
npx tsc --noEmit      # TypeScript check
npx eslint .          # lint check; or use repo's existing lint script
npm run build         # production compile check
```

For established repos, prefer `npm ci` when a valid `package-lock.json` exists; for new scaffold use its normal installation. Do not claim `npm run lint` exists unless `package.json` defines it. Run the application through a browser if you have browser access; a CLI `curl` response **cannot** prove that browser cookies persist.

Required acceptance checklist:

- [ ] Existing repository preserved or new Next.js App Router + TS + Tailwind project created.
- [ ] Node version and dependency installation confirmed.
- [ ] `.env.local` configured and ignored; `.env.example` committed/available without secrets.
- [ ] Dev-only Next rewrite proxies **all** `/api/:path*` to staging with the path intact.
- [ ] No conflicting `app/api` or `pages/api` handler shadows the proxy.
- [ ] Browser-side API helper uses relative dev URLs and `credentials: 'include'`.
- [ ] Browser requests visibly target localhost; staging response observed and status documented.
- [ ] Swagger/Postman schemas inspected, or missing access explicitly documented.
- [ ] OTP service/request/verify implementation uses **confirmed schemas only**, or is clearly marked blocked.
- [ ] After authorized authentication, browser has both HttpOnly cookies and `/api/v1/me` returns 200, or check is marked blocked.
- [ ] Loading, error, unauthenticated, and success states are implemented for any completed screens.
- [ ] Typecheck, lint, and production build pass—or exact failures are reported.
- [ ] README records how to start dev server, required env vars, proxy rationale, and actual remaining blockers.

## 11. Deployment caveats (do not deploy during this setup task)

- In local development: `NEXT_PUBLIC_API_BASE_URL` must be empty so browser API calls use `/api/...` and the localhost proxy.
- In a deployed build: use the **backend-approved actual** full API origin when required; set `NEXT_PUBLIC_API_BASE_URL` at build time. Do not assume the illustrative `https://api.eventradr.app` is live or correct.
- Backend guide expects deployed frontend and API to be *same-site*, but different subdomains can still be *cross-origin*: credentialed CORS, `Access-Control-Allow-Credentials`, explicit allowed origin, CSRF defenses if required, and cookie Domain/SameSite/Secure/Path must be validated with the backend team.
- This setup's rewrite is intentionally disabled outside `next dev`; configure another approved routing strategy explicitly if the team requires one for preview/staging deployments.
- Never allow a production frontend to quietly forward `/api/...` calls to the staging backend.

## 12. Required final report from the coding agent

When execution finishes, provide a concise engineering handoff containing:

1. **Files created/changed** and their purpose.
2. **Environment requirements**, excluding any secrets.
3. **Endpoint inventory**, separating documented facts from assumptions/unknowns.
4. **Commands run**, with actual pass/fail outputs or a clear summary.
5. **Proxy verification**: browser request URL, backend response status, and whether it was a logged-out or logged-in test.
6. **Auth verification**: whether cookies and `/api/v1/me` were confirmed with an authorized test account; if not, exactly why not.
7. **Outstanding questions for backend team** and the next smallest actionable task.

**Never say “fully integrated” or “authentication working” unless the real browser OTP → cookies → `/api/v1/me` test has passed.**

---

### One-sentence implementation priority

**First get Next.js running; second make the localhost `/api/*` rewrite work; third verify a backend response; fourth inspect exact OTP schemas; fifth complete and test cookie-based OTP authentication; only then implement other Eventradr features from documented requirements.**
