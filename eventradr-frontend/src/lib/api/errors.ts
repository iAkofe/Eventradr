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

/** Turn a thrown API error into a message safe to show the user. */
export function describeApiError(error: unknown): string {
  const payload = getApiError(error);
  if (!payload) {
    return "Something went wrong. Check your connection and try again.";
  }

  switch (payload.code) {
    case "VALIDATION_ERROR":
      return payload.message || "Please check what you entered.";
    case "UNAUTHENTICATED":
      return "Your session expired. Please sign in again.";
    case "ORGANIZER_NAME_TAKEN":
      return "That organizer name is already in use. Try another one.";
    case "ORGANIZER_PROFILE_EXISTS":
      return "This account already has an organizer profile.";
    case "ORGANIZER_PROFILE_REQUIRED":
      return "Set up your organizer profile to continue.";
    case "IMAGE_INVALID":
      return "That image couldn't be used. Choose a PNG, JPG or WebP.";
    case "PAYLOAD_TOO_LARGE":
      return "That file is over the 5 MB limit. Choose a smaller one.";
    case "NOT_FOUND":
      return "We couldn't find that. It may have been removed.";
    default:
      return payload.message || "Something went wrong. Please try again.";
  }
}
