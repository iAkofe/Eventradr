// Event service module for Eventradr (organizer side).
//
// Routes live under /api/v1/organizer/events and are guarded: the signed-in
// user must own an organizer profile. Contract source is the Postman "Event"
// folder — see src/lib/api/types.ts for why it, not the OpenAPI spec, is
// authoritative for events.

import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccess,
  CreateEventBody,
  Event,
  EventList,
  ListEventsParams,
  UpdateEventBody,
} from "@/lib/api/types";

/** POST /api/v1/organizer/events — start a new draft. An empty body is valid. */
export function createEvent(body: CreateEventBody = {}) {
  return apiFetch<ApiSuccess<Event>>("/api/v1/organizer/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /api/v1/organizer/events — the organizer's events, newest first. */
export function listEvents(params: ListEventsParams = {}) {
  const query = new URLSearchParams();
  if (params.tab) query.set("tab", params.tab);
  if (params.q) query.set("q", params.q);
  if (params.page !== undefined) query.set("page", String(params.page));

  const suffix = query.toString() ? `?${query}` : "";

  return apiFetch<ApiSuccess<EventList>>(`/api/v1/organizer/events${suffix}`);
}

/**
 * PATCH /api/v1/organizer/events/{id} — save draft changes.
 *
 * `expectedVersion` is required: send the `version` from the event you last
 * read. Send only the fields that changed; `coordinates: null` unsets the pin.
 */
export function updateEvent(id: string, body: UpdateEventBody) {
  return apiFetch<ApiSuccess<Event>>(`/api/v1/organizer/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** DELETE /api/v1/organizer/events/{id} — delete a draft. */
export function deleteEvent(id: string) {
  return apiFetch<ApiSuccess<null>>(`/api/v1/organizer/events/${id}`, {
    method: "DELETE",
  });
}
