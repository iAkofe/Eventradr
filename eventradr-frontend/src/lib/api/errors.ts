// Helpers for the documented error envelope: { error: { code, message, details } }.

import { ApiError } from "@/lib/api/client";
import type { ApiErrorBody } from "@/lib/api/types";

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

/** Extract the backend error payload from a thrown ApiError, if present. */
export function getApiError(error: unknown): ApiErrorPayload | null {
  if (!(error instanceof ApiError)) {
    return null;
  }

  const body = error.details as ApiErrorBody | null;
  if (body && typeof body === "object" && "error" in body) {
    const { code, message, details } = body.error;
    if (typeof code === "string" && typeof message === "string") {
      return { code, message, details };
    }
  }

  return null;
}

/** Read an integer field from an error payload's `details` (e.g. retryAfterSeconds). */
export function readDetailNumber(
  details: unknown,
  key: string
): number | null {
  if (details && typeof details === "object" && key in details) {
    const value = (details as Record<string, unknown>)[key];
    if (typeof value === "number") {
      return value;
    }
  }
  return null;
}
