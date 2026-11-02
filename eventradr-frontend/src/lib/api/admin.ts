// Admin service module for Eventradr.
// The admin surface is gated server-side: there is no role field on the user.
// Endpoints and payloads come from the staging OpenAPI document only.

import { apiFetch } from "@/lib/api/client";
import type { ApiSuccess, User } from "@/lib/api/types";

export interface AdminIdentity {
  user: User;
  /** ISO date-time — when the account was granted admin access. */
  grantedAt: string;
}

/** GET /api/v1/admin/me — the signed-in admin.
 *  A 403 FORBIDDEN means the account is not an admin; a 401 means no session.
 *  Never gate admin UI on anything the client can forge.
 */
export function getAdminIdentity() {
  return apiFetch<ApiSuccess<AdminIdentity>>("/api/v1/admin/me");
}
