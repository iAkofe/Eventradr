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

/**
 * Resolve a single event for the edit and "draft saved" screens.
 *
 * The collection documents no GET /organizer/events/{id}, so the event is read
 * out of the drafts list, walking pages while the list reports a next one.
 * Returns null when the id is not among the organizer's drafts.
 */
export async function findEvent(id: string): Promise<Event | null> {
  let page = 1;
  // Drafts are few and each request is page-bounded; the guard stops a bad
  // `hasNext` from looping forever.
  for (let guard = 0; guard < 50; guard += 1) {
    const response = await listEvents({ tab: "drafts", page });
    const match = response.data.items.find((item) => item.id === id);
    if (match) {
      return match;
    }
    if (!response.data.pagination.hasNext) {
      return null;
    }
    page += 1;
  }
  return null;
}
