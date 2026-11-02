// Auth service module for Eventradr.
// Session lifecycle only (OTP, refresh, logout) plus the public category list.
// Profile / account calls live in src/lib/api/profile.ts.

import { apiFetch } from "@/lib/api/client";
import type {
  ApiSuccess,
  Category,
  RequestOtpBody,
  RequestOtpData,
  VerifyOtpBody,
  VerifyOtpData,
} from "@/lib/api/types";

/** POST /api/v1/auth/otp — email a sign-in code. */
export function requestOtp(body: RequestOtpBody) {
  return apiFetch<ApiSuccess<RequestOtpData>>("/api/v1/auth/otp", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /api/v1/auth/otp/verify — exchange a code for a session (sets cookies). */
export function verifyOtp(body: VerifyOtpBody) {
  return apiFetch<ApiSuccess<VerifyOtpData>>("/api/v1/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** POST /api/v1/auth/refresh — rotate the session cookies.
 *  Documented usage: call once on a 401 UNAUTHENTICATED, then retry once.
 */
export function refreshSession() {
  return apiFetch<ApiSuccess<null>>("/api/v1/auth/refresh", {
    method: "POST",
  });
}

/** POST /api/v1/auth/logout — revoke the session; always succeeds. */
export function logout() {
  return apiFetch<ApiSuccess<null>>("/api/v1/auth/logout", {
    method: "POST",
  });
}

/** GET /api/v1/categories — active categories in display order. */
export function getCategories() {
  return apiFetch<ApiSuccess<Category[]>>("/api/v1/categories");
}
