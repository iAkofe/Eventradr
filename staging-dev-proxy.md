# Staging sign-in from localhost: dev-server proxy

## The problem

The session lives in two httpOnly cookies (`access_token`, `refresh_token`) set with `SameSite=Lax`. A client app
running on `http://localhost:3000` that calls `https://staging-api.eventradr.app` directly is making cross-site
requests, and the browser won't send `Lax` cookies on those. Sign-in "succeeds", then every request is `401`.

## The fix

The client's dev server forwards `/api/*` to staging. The browser only ever talks to `localhost:3000`, so the
cookies are first-party to localhost and are sent normally. Nothing changes on the backend.

```text
browser ──► http://localhost:3000/api/v1/me ──(dev server proxy)──► https://staging-api.eventradr.app/api/v1/me
```

### Next.js (`next.config.js` / `next.config.ts`)

```js
const API_ORIGIN = process.env.API_PROXY_TARGET ?? 'https://staging-api.eventradr.app';

module.exports = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_ORIGIN}/api/:path*` }];
  },
};
```

Don't create Next route handlers under `app/api/` or `pages/api/`: those are matched before the rewrite and
would shadow backend routes.

### Vite (`vite.config.ts`)

```ts
export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'https://staging-api.eventradr.app', changeOrigin: true },
    },
  },
});
```

### Client code

- In local dev, call **relative** URLs: `fetch('/api/v1/me')`, not the staging URL. Calling staging directly
  bypasses the proxy and brings the problem back.
- Deployed builds call the API's full URL (e.g. `https://api.eventradr.app`), which is same-site with the
  deployed web app. Keep the base URL in an env var: empty in dev, the full origin in deployed builds.
- Always send credentials (`credentials: 'include'` / axios `withCredentials: true`). It's a no-op through the
  proxy and required once deployed.
- Keep the `/api` prefix when proxying: the refresh cookie is scoped to path `/api/v1/auth`, so the browser only
  sends it to `localhost:3000/api/v1/auth/...`.

## Backend requirements for this to work

- **`COOKIE_DOMAIN` stays unset on staging.** A cookie set with `Domain=eventradr.app` is rejected by a browser on
  `localhost`.
- Staging cookies are `Secure` (staging runs with `NODE_ENV=production`). Chrome and Firefox accept `Secure`
  cookies on `http://localhost`. Safari may drop them: if sign-in doesn't stick in Safari, use Chrome/Firefox
  for local work, or run the dev server over HTTPS (`next dev --experimental-https`, or
  `@vitejs/plugin-basic-ssl` for Vite).
- `CORS_ORIGIN` doesn't need `localhost` for this: through the proxy, the browser never makes a cross-origin
  request.

## Checking it works

1. `POST /api/v1/auth/otp` then `POST /api/v1/auth/otp/verify` from the app on localhost.
2. DevTools → Application → Cookies → `http://localhost:3000`: `access_token` and `refresh_token` are present.
3. `GET /api/v1/me` returns `200`.
