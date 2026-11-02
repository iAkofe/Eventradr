// DTOs derived from the Eventradr staging OpenAPI document:
// https://staging-api.eventradr.app/api/docs/openapi.json (Eventradr API 0.1.0)
//
// These mirror the documented request/response schemas. Do not add fields that
// are not in the spec.

/** Success envelope shared by every documented endpoint. */
export interface ApiSuccess<T> {
  status: "success";
  message: string;
  data: T;
}

/** Error envelope: `{ error: { code, message, details? } }`. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface Avatar {
  /** 96x96 WebP */
  small: string;
  /** 400x400 WebP */
  large: string;
}

export interface Category {
  id: string;
  slug: string;
  label: string;
}

export interface OrganizerSummary {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: Avatar | null;
  /** null until the user creates an organizer profile. */
  organizer: OrganizerSummary | null;
  /** Categories the user picked, in display order; empty if skipped. */
  interests: Category[];
  /** ISO date-time */
  createdAt: string;
}

// --- POST /api/v1/auth/otp ---
export interface RequestOtpBody {
  email: string;
}

export interface RequestOtpData {
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

// --- POST /api/v1/auth/otp/verify ---
export interface VerifyOtpBody {
  email: string;
  /** Exactly 6 digits (OpenAPI pattern ^\d{6}$). */
  code: string;
}

export interface VerifyOtpData {
  user: User;
  isNewUser: boolean;
}

// --- PATCH /api/v1/me ---
// Only the fields sent change. A name can be changed but not removed: `null` is
// refused. Unknown fields are refused (`additionalProperties: false`).
export interface UpdateProfileBody {
  /** 1–80 characters. */
  name?: string;
}

// --- PUT /api/v1/me/interests ---
// Replaces the whole set, so the same request twice changes nothing.
// `[]` keeps none: that is Skip at onboarding. Duplicates are ignored.
export interface SetInterestsBody {
  /** The full set to keep; `[]` keeps none. Max 100 items. */
  categoryIds: string[];
}

// --- Organizer ---
// `Organizer` is `allOf: [PublicOrganizer, { createdAt }]` in the spec.
export interface PublicOrganizer {
  id: string;
  name: string;
  about: string | null;
  avatar: Avatar | null;
}

export interface Organizer extends PublicOrganizer {
  /** ISO date-time */
  createdAt: string;
}

// --- POST /api/v1/organizer/profile ---
export interface CreateOrganizerBody {
  /**
   * 1–80 characters after trimming and collapsing spaces. Latin letters
   * (accents allowed), digits, spaces and & ' - . , only. Must differ from
   * every other organizer name by more than case, accents, spacing or punctuation.
   */
  name: string;
}

// --- PATCH /api/v1/organizer/profile ---
// Only the fields sent change; `name` cannot be removed, `about: null` clears it.
export interface UpdateOrganizerBody {
  name?: string;
  about?: string | null;
}
