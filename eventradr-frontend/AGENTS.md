<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

### Always verify the API against its live documentation

Before writing or changing **any** API call, request/response type, or error handling, re-read the
**current** documentation and confirm the contract. Treat every cached summary — including this file,
`handover.md` and `eventradr-setup.md` — as potentially stale.

- **OpenAPI / Swagger:** <https://staging-api.eventradr.app/api/docs/> — machine-readable at
  <https://staging-api.eventradr.app/api/docs/openapi.json>. Authoritative for **auth, profile,
  organizer and admin**.
- **Postman:** <https://documenter.getpostman.com/view/7735144/2sBYHRWhfo> — authoritative for
  **events**. Raw JSON:
  <https://documenter.gw.postman.com/api/collections/7735144/2sBYHRWhfo?segregateAuth=true>
  (note the **slash**, not a dash).

The two sources disagree in places (Postman is ahead of OpenAPI on events, and the OpenAPI spec
omits `/organizer/events` entirely). Neither is globally authoritative: when they conflict, flag the
discrepancy and settle it with a live staging probe. Never invent endpoints, payloads, roles or
success states, and never mark something "working" without a real request.

