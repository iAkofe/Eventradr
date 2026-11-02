// Profile service module for Eventradr.
// Owns the attendee-facing account surface: /me, interests and the avatar.
// Endpoints and payloads come from the staging OpenAPI document only.

import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccess,
  SetInterestsBody,
  UpdateProfileBody,
  User,
} from "@/lib/api/types";

/** GET /api/v1/me — the signed-in user (authoritative session check). */
export function getCurrentUser() {
  return apiFetch<ApiSuccess<User>>("/api/v1/me");
}

/** PATCH /api/v1/me — update the profile. Only the fields sent change. */
export function updateProfile(body: UpdateProfileBody) {
  return apiFetch<ApiSuccess<User>>("/api/v1/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/** PUT /api/v1/me/interests — replace the whole interest set. `[]` keeps none (Skip). */
export function setInterests(body: SetInterestsBody) {
  return apiFetch<ApiSuccess<User>>("/api/v1/me/interests", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** PUT /api/v1/uploads/avatar — set the profile picture (multipart, ≤ 5 MB).
 *  FormData is passed through as-is so the browser sets the multipart boundary.
 */
export function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  return apiFetch<ApiSuccess<User>>("/api/v1/uploads/avatar", {
    method: "PUT",
    body: form,
  });
}

/** DELETE /api/v1/uploads/avatar — remove the profile picture. */
export function removeAvatar() {
  return apiFetch<ApiSuccess<User>>("/api/v1/uploads/avatar", {
    method: "DELETE",
  });
}
