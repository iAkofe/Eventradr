// DTOs for the Eventradr staging API.
//
// Auth / profile / organizer / admin shapes come from the OpenAPI document:
// https://staging-api.eventradr.app/api/docs/openapi.json (Eventradr API 0.1.0)
//
// Event shapes come from the Postman collection, which is ahead of the spec —
// the `/organizer/events` routes are live on staging but absent from the
// OpenAPI document:
// https://documenter.getpostman.com/view/7735144/2sBYHRWhfo
//
// These mirror the documented request/response schemas. Do not add fields that
// are not in a documented example.

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

// --- Events (organizer drafts) ---
//
// Contract source: Postman "Event" folder. Events are created as drafts and
// edited incrementally; `missing` lists the fields still blocking publish.
// Every write is guarded by optimistic concurrency (`version` / `expectedVersion`).

/** Only drafts exist today — no publish route is documented. */
export type EventStatus = "draft";

export type EventFormat = "in_person" | "online";

export interface EventCoordinates {
  longitude: number;
  latitude: number;
}

/** Area -> city -> state hierarchy returned on an event's `area` field. */
export interface EventArea {
  id: string;
  slug: string;
  name: string;
  city: {
    id: string;
    slug: string;
    name: string;
  };
  state: {
    id: string;
    slug: string;
    name: string;
  };
}

/**
 * Fields an event still needs before it can go live. `cover` and `admission`
 * are separate resources, not properties of the event itself.
 */
export type EventMissingField =
  | "title"
  | "category"
  | "description"
  | "cover"
  | "startsAt"
  | "endsAt"
  | "format"
  | "admission"
  | "coordinates";

export interface Event {
  id: string;
  status: EventStatus;
  /** Optimistic concurrency token; echo it as `expectedVersion` on update. */
  version: number;
  title: string | null;
  category: Category | null;
  description: string | null;
  /** ISO date-time */
  startsAt: string | null;
  /** ISO date-time */
  endsAt: string | null;
  /** IANA zone, e.g. "Africa/Lagos". Always present on a draft. */
  timeZone: string;
  format: EventFormat | null;
  venueName: string | null;
  streetAddress: string | null;
  area: EventArea | null;
  coordinates: EventCoordinates | null;
  arrivalInstructions: string | null;
  /** Set for `online` events; null otherwise. */
  joiningUrl: string | null;
  missing: EventMissingField[];
  /** ISO date-time */
  createdAt: string;
  /** ISO date-time */
  updatedAt: string;
}

// --- POST /api/v1/organizer/events ---
// Every field is optional: an empty body creates a blank draft. Offline events
// send venue/area/coordinates; online events send `joiningUrl` instead.
export interface CreateEventBody {
  title?: string;
  categoryId?: string;
  description?: string;
  /** ISO date-time */
  startsAt?: string;
  /** ISO date-time */
  endsAt?: string;
  /** IANA zone, e.g. "Africa/Lagos". Defaults server-side when omitted. */
  timeZone?: string;
  format?: EventFormat;
  venueName?: string;
  streetAddress?: string;
  areaId?: string;
  /** `null` clears a previously set pin. */
  coordinates?: EventCoordinates | null;
  arrivalInstructions?: string;
  joiningUrl?: string;
}

// --- PATCH /api/v1/organizer/events/{id} ---
// Only the fields sent change. Pass the `version` you last read as
// `expectedVersion`; a stale value is rejected. `coordinates: null` unsets it.
export interface UpdateEventBody extends CreateEventBody {
  expectedVersion: number;
}

// --- GET /api/v1/organizer/events ---
export interface ListEventsParams {
  /** Which bucket to list. Only "drafts" is documented. */
  tab?: string;
  /** Free-text search within the tab. */
  q?: string;
  /** 1-based page number. Defaults to 1. */
  page?: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export interface EventList {
  items: Event[];
  pagination: Pagination;
}
