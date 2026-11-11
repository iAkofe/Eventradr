// Pure formatting/mapping helpers for the organizer event surfaces.
//
// Events are stored and returned in UTC (e.g. "2026-11-07T17:30:00.000Z") but
// always carry an IANA `timeZone`. Every date is rendered in that zone so the
// organizer sees the wall-clock time they typed.

import type { EventMissingField } from "@/lib/api/types";

/** The only zone the deployed location tree supports. */
export const DEFAULT_TIME_ZONE = "Africa/Lagos";
const LAGOS_OFFSET = "+01:00";

/** "Africa/Lagos (UTC+1)" — the label the designs show under the date range. */
export function timeZoneLabel(timeZone: string): string {
  return timeZone === DEFAULT_TIME_ZONE ? "Africa/Lagos (UTC+1)" : timeZone;
}

/** Renders an instant as "Sun 18 Oct, 18:30" in the workspace zone. */
const MOMENT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: DEFAULT_TIME_ZONE,
});

/** Numeric parts, used to prefill the date/time inputs from a stored instant. */
const NUMERIC = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: DEFAULT_TIME_ZONE,
});

function partMap(formatter: Intl.DateTimeFormat, iso: string) {
  const map: Record<string, string> = {};
  for (const { type, value } of formatter.formatToParts(new Date(iso))) {
    map[type] = value;
  }
  return map;
}

/** "Sun 18 Oct, 18:30" */
export function formatMoment(iso: string): string {
  const p = partMap(MOMENT, iso);
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute}`;
}

/** "Sun 18 Oct, 18:30 → Mon 19 Oct, 01:00", or null while either end is unset. */
export function formatEventRange(
  startsAt: string | null,
  endsAt: string | null
): string | null {
  if (!startsAt || !endsAt) {
    return null;
  }
  return `${formatMoment(startsAt)} → ${formatMoment(endsAt)}`;
}

/** Split a stored instant into the `yyyy-mm-dd` / `HH:mm` pair the inputs use. */
export function splitIso(iso: string | null): { date: string; time: string } {
  if (!iso) {
    return { date: "", time: "" };
  }
  const p = partMap(NUMERIC, iso);
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/**
 * Combine a `yyyy-mm-dd` date and `HH:mm` time into the offset-qualified
 * ISO string the API documents (e.g. "2026-11-07T18:30:00+01:00").
 */
export function toIsoValue(date: string, time: string): string | null {
  if (!date || !time) {
    return null;
  }
  return `${date}T${time}:00${LAGOS_OFFSET}`;
}

/** True when two stored instants represent the same moment (the API returns UTC). */
export function sameInstant(a: string | null, b: string | null): boolean {
  if (!a || !b) {
    return a === b;
  }
  return new Date(a).getTime() === new Date(b).getTime();
}

const MISSING_LABELS: Record<EventMissingField, string> = {
  title: "a title",
  category: "a category",
  description: "a description",
  cover: "a cover image",
  startsAt: "a start date",
  endsAt: "an end date",
  format: "in-person or online",
  admission: "admission details",
  coordinates: "a map location",
};

/** "Add a title, a category and a cover image." — or null when nothing is missing. */
export function describeMissing(missing: EventMissingField[]): string | null {
  const labels = missing
    .map((field) => MISSING_LABELS[field] ?? field)
    .filter((label): label is string => Boolean(label));
  if (labels.length === 0) {
    return null;
  }
  if (labels.length === 1) {
    return `Add ${labels[0]}.`;
  }
  return `Add ${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}.`;
}

/** "Updated 18 Oct 2026" for the event list. */
const UPDATED = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DEFAULT_TIME_ZONE,
});

export function formatUpdatedAt(iso: string): string {
  return `Updated ${UPDATED.format(new Date(iso))}`;
}
