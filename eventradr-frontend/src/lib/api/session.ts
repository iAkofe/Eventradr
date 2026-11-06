// Shared session recovery for authenticated surfaces.
//
// Every authenticated page needs the same dance, so it lives here once rather
// than being copied per route.

import { ApiError } from "@/lib/api/client";
import { refreshSession } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/profile";
import type { User } from "@/lib/api/types";

/**
 * `GET /me` with the documented recovery path: on 401 UNAUTHENTICATED, refresh
 * the session once and retry. Re-throws the original error when the session
 * cannot be recovered (a persistent 401 means the caller should send the user
 * to sign-in).
 */
export async function loadSession(): Promise<User> {
  try {
    const response = await getCurrentUser();
    return response.data;
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401) {
      throw err;
    }

    try {
      await refreshSession();
    } catch (refreshErr) {
      // 409 REFRESH_TOKEN_ROTATED: another request refreshed first; retry anyway.
      if (!(refreshErr instanceof ApiError) || refreshErr.status !== 409) {
        throw refreshErr;
      }
    }

    const retry = await getCurrentUser();
    return retry.data;
  }
}
