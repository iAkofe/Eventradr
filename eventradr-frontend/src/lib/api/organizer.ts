// Organizer service module for Eventradr.
// Endpoints and payloads come from the staging OpenAPI document only.

import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccess,
  CreateOrganizerBody,
  Organizer,
  PublicOrganizer,
  UpdateOrganizerBody,
} from "@/lib/api/types";

/** POST /api/v1/organizer/profile — create the account's organizer profile (one per account). */
export function createOrganizerProfile(body: CreateOrganizerBody) {
  return apiFetch<ApiSuccess<Organizer>>("/api/v1/organizer/profile", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// --- Documented rules for CreateOrganizerBody.name ---------------------------
// Kept next to the DTO they constrain so setup and profile editing agree.

/** 1–80 characters after trimming and collapsing spaces. */
export const ORGANIZER_NAME_MAX = 80;

/** Latin letters (accents allowed), digits, spaces and & ' - . , only. */
const ORGANIZER_NAME_ALLOWED = /^[\p{Script=Latin}\p{Nd} &'\-.,]+$/u;

/** Trim and collapse runs of spaces, matching the API's own normalisation. */
export function normalizeOrganizerName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/** A problem to show the user, or null when the name is acceptable. */
export function describeOrganizerNameProblem(normalized: string): string | null {
  if (normalized.length === 0) {
    return "Enter an organizer name.";
  }
  if (normalized.length > ORGANIZER_NAME_MAX) {
    return `Keep it to ${ORGANIZER_NAME_MAX} characters or fewer.`;
  }
  if (!ORGANIZER_NAME_ALLOWED.test(normalized)) {
    return "Use letters, numbers, spaces and & ' - . , only.";
  }
  return null;
}

/** GET /api/v1/organizer/profile — the signed-in user's organizer profile.
 *  Answers 403 ORGANIZER_PROFILE_REQUIRED when none exists yet.
 */
export function getOrganizerProfile() {
  return apiFetch<ApiSuccess<Organizer>>("/api/v1/organizer/profile");
}

/** PATCH /api/v1/organizer/profile — update name and/or about. `about: null` clears it. */
export function updateOrganizerProfile(body: UpdateOrganizerBody) {
  return apiFetch<ApiSuccess<Organizer>>("/api/v1/organizer/profile", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** GET /api/v1/organizers/{id} — an organizer's public profile (no auth needed). */
export function getPublicOrganizer(id: string) {
  return apiFetch<ApiSuccess<PublicOrganizer>>(`/api/v1/organizers/${id}`);
}

/** PUT /api/v1/uploads/organizer-avatar — set the organizer picture (multipart, ≤ 5 MB).
 *  FormData is passed through as-is so the browser sets the multipart boundary.
 */
export function uploadOrganizerAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  return apiFetch<ApiSuccess<Organizer>>("/api/v1/uploads/organizer-avatar", {
    method: "PUT",
    body: form,
  });
}

/** DELETE /api/v1/uploads/organizer-avatar — remove the organizer picture. */
export function removeOrganizerAvatar() {
  return apiFetch<ApiSuccess<Organizer>>("/api/v1/uploads/organizer-avatar", {
    method: "DELETE",
  });
}
