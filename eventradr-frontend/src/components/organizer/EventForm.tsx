"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faImage,
  faLock,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { getApiError } from "@/lib/api/errors";
import { getCategories } from "@/lib/api/auth";
import { createEvent, updateEvent } from "@/lib/api/events";
import { listLocations } from "@/lib/api/locations";
import {
  DEFAULT_TIME_ZONE,
  describeMissing,
  formatEventRange,
  sameInstant,
  splitIso,
  timeZoneLabel,
  toIsoValue,
} from "@/lib/events-format";
import type {
  Category,
  CreateEventBody,
  Event,
  EventFormat,
  LocationState,
  UpdateEventBody,
} from "@/lib/api/types";

const CARD = "rounded-[28px] border border-[#DAD3E1] bg-white p-7 sm:p-8";
const LABEL = "text-sm font-semibold text-[#1D1725]";
const HINT = "text-sm font-medium text-[#726E77]";
const INPUT =
  "mt-2 h-[52px] w-full rounded-[16px] border border-[#DAD3E1] bg-white px-4 text-base font-medium text-[#1D1725] outline-none transition placeholder:text-[#AAA8AD] focus:border-[#5B35F5]";
const TEXTAREA =
  "mt-2 w-full rounded-[16px] border border-[#DAD3E1] bg-white px-4 py-3 text-base font-medium leading-[1.6] text-[#1D1725] outline-none transition placeholder:text-[#AAA8AD] focus:border-[#5B35F5]";
const SELECT = `${INPUT} appearance-none pr-10`;
const PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#5B35F5] px-7 text-sm font-semibold text-white transition hover:bg-[#4B28E1] disabled:cursor-not-allowed disabled:bg-[#C9C2CF]";
const OUTLINE =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#DDD9E0] bg-white px-7 text-sm font-semibold text-[#1D1725] transition hover:bg-[#FAFAFC] disabled:cursor-not-allowed disabled:opacity-50";
const DISABLED_GROUP =
  "rounded-[20px] border border-dashed border-[#DAD3E1] bg-[#FAFAFC] p-4";
const RADIO =
  "flex h-[52px] cursor-pointer items-center gap-3 rounded-[16px] border border-[#DAD3E1] bg-white px-4 text-sm font-semibold text-[#1D1725] transition has-checked:border-[#5B35F5]";

/** Quick-pick areas the Location section surfaces as chips. */
const AREA_CHIPS = ["bariga", "lagos-island", "surulere"];

const ADMISSION = ["Free", "Paid"];
const TICKET_TYPES = [
  { name: "General Admission", price: "" },
  { name: "Early bird", price: "" },
];

interface FormValues {
  title: string;
  categoryId: string;
  description: string;
  format: EventFormat;
  startsOn: string;
  startsTime: string;
  endsOn: string;
  endsTime: string;
  venueName: string;
  streetAddress: string;
  areaId: string;
  arrivalInstructions: string;
  joiningUrl: string;
}

function valuesFromEvent(event: Event | null): FormValues {
  const start = splitIso(event?.startsAt ?? null);
  const end = splitIso(event?.endsAt ?? null);
  return {
    title: event?.title ?? "",
    categoryId: event?.category?.id ?? "",
    description: event?.description ?? "",
    format: event?.format ?? "in_person",
    startsOn: start.date,
    startsTime: start.time,
    endsOn: end.date,
    endsTime: end.time,
    venueName: event?.venueName ?? "",
    streetAddress: event?.streetAddress ?? "",
    areaId: event?.area?.id ?? "",
    arrivalInstructions: event?.arrivalInstructions ?? "",
    joiningUrl: event?.joiningUrl ?? "",
  };
}

/** New drafts only send the fields the organizer actually filled in. */
function toCreateBody(values: FormValues): CreateEventBody {
  const body: CreateEventBody = { timeZone: DEFAULT_TIME_ZONE };
  if (values.title.trim()) body.title = values.title.trim();
  if (values.categoryId) body.categoryId = values.categoryId;
  if (values.description.trim()) body.description = values.description.trim();
  const startsAt = toIsoValue(values.startsOn, values.startsTime);
  if (startsAt) body.startsAt = startsAt;
  const endsAt = toIsoValue(values.endsOn, values.endsTime);
  if (endsAt) body.endsAt = endsAt;
  body.format = values.format;
  if (values.format === "in_person") {
    if (values.venueName.trim()) body.venueName = values.venueName.trim();
    if (values.streetAddress.trim()) body.streetAddress = values.streetAddress.trim();
    if (values.areaId) body.areaId = values.areaId;
    if (values.arrivalInstructions.trim()) {
      body.arrivalInstructions = values.arrivalInstructions.trim();
    }
  } else if (values.joiningUrl.trim()) {
    body.joiningUrl = values.joiningUrl.trim();
  }
  return body;
}

/**
 * Only the fields that changed since the last read are sent, with the version
 * we read them at. The API returns UTC instants, so dates compare by instant.
 */
function toUpdateBody(values: FormValues, event: Event): UpdateEventBody {
  const body: UpdateEventBody = { expectedVersion: event.version };

  const title = values.title.trim();
  if (title && title !== (event.title ?? "")) body.title = title;

  if (values.categoryId && values.categoryId !== (event.category?.id ?? "")) {
    body.categoryId = values.categoryId;
  }

  const description = values.description.trim();
  if (description && description !== (event.description ?? "")) {
    body.description = description;
  }

  const startsAt = toIsoValue(values.startsOn, values.startsTime);
  if (startsAt && !sameInstant(startsAt, event.startsAt)) body.startsAt = startsAt;

  const endsAt = toIsoValue(values.endsOn, values.endsTime);
  if (endsAt && !sameInstant(endsAt, event.endsAt)) body.endsAt = endsAt;

  if (values.format !== event.format) body.format = values.format;

  if (values.format === "in_person") {
    const venueName = values.venueName.trim();
    if (venueName && venueName !== (event.venueName ?? "")) body.venueName = venueName;
    const streetAddress = values.streetAddress.trim();
    if (streetAddress && streetAddress !== (event.streetAddress ?? "")) {
      body.streetAddress = streetAddress;
    }
    if (values.areaId && values.areaId !== (event.area?.id ?? "")) body.areaId = values.areaId;
    const arrival = values.arrivalInstructions.trim();
    if (arrival && arrival !== (event.arrivalInstructions ?? "")) {
      body.arrivalInstructions = arrival;
    }
  } else {
    const joiningUrl = values.joiningUrl.trim();
    if (joiningUrl && joiningUrl !== (event.joiningUrl ?? "")) body.joiningUrl = joiningUrl;
  }

  return body;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#EFECF2] pt-8 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
        {title}
      </h2>
      {description && <p className={`mt-1.5 ${HINT}`}>{description}</p>}
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

/** A section the API has no route for yet: shown, but inert and clearly marked. */
function UnbackedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 inline-flex items-start gap-2 rounded-[14px] bg-[#EEE9F5] px-3.5 py-2.5 text-xs font-semibold text-[#5B35F5]">
      <FontAwesomeIcon icon={faLock} className="mt-0.5 h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

interface EventFormProps {
  mode: "create" | "edit";
  event?: Event;
  organizerName: string;
}

export function EventForm({ mode, event = undefined, organizerName }: EventFormProps) {
  const router = useRouter();
  const initial = useMemo(() => valuesFromEvent(event ?? null), [event]);
  const [values, setValues] = useState<FormValues>(initial);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationState[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const versionRef = useRef(event?.version ?? 0);

  useEffect(() => {
    let active = true;
    getCategories()
      .then((res) => {
        if (active) setCategories(res.data);
      })
      .catch(() => {});
    listLocations()
      .then((res) => {
        if (active) setLocations(res);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const areas = useMemo(
    () =>
      locations.flatMap((state) =>
        state.cities.flatMap((city) =>
          city.areas.map((area) => ({
            id: area.id,
            name: area.name,
            slug: area.slug,
            city: city.name,
            state: state.name,
          }))
        )
      ),
    [locations]
  );

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initial),
    [values, initial]
  );

  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setToast(null);
  }, []);

  /** Returns the saved event, or null when the write failed. */
  const save = useCallback(async (): Promise<Event | null> => {
    if (saving) return null;
    setSaving(true);
    setToast(null);
    try {
      if (mode === "create") {
        const response = await createEvent(toCreateBody(values));
        versionRef.current = response.data.version;
        return response.data;
      }
      const body = toUpdateBody(values, { ...event!, version: versionRef.current });
      if (Object.keys(body).length === 1) {
        setToast({ kind: "ok", text: "Nothing to save yet." });
        return { ...event!, version: versionRef.current };
      }
      const response = await updateEvent(event!.id, body);
      versionRef.current = response.data.version;
      setToast({ kind: "ok", text: "Draft saved" });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace("/organizer/sign-in");
        return null;
      }
      if (getApiError(error)?.code === "ORGANIZER_PROFILE_REQUIRED") {
        setToast({ kind: "error", text: "Set up your organizer profile first." });
        return null;
      }
      if (error instanceof ApiError && error.status === 409) {
        setToast({
          kind: "error",
          text: "This draft changed elsewhere. Reload to see the latest version.",
        });
        return null;
      }
      setToast({ kind: "error", text: "Your draft wasn't saved. Try again." });
      return null;
    } finally {
      setSaving(false);
    }
  }, [event, mode, router, saving, values]);

  async function handleSave() {
    const saved = await save();
    if (saved && mode === "create") {
      router.push(`/organizer/events/${saved.id}/saved`);
    }
  }

  function handleManageEvents() {
    if (dirty) {
      setLeaveOpen(true);
      return;
    }
    router.push("/organizer/events");
  }

  async function handleSaveAndLeave() {
    const saved = await save();
    if (saved) {
      setLeaveOpen(false);
      router.push(`/organizer/events/${saved.id}/saved`);
    }
  }

  const range = formatEventRange(
    toIsoValue(values.startsOn, values.startsTime),
    toIsoValue(values.endsOn, values.endsTime)
  );

  const chosenArea =
    areas.find((area) => area.id === values.areaId)?.name ?? event?.area?.name ?? null;

  const selectedCategory =
    categories.find((category) => category.id === values.categoryId)?.label ??
    event?.category?.label ??
    "";

  const missing = describeMissing(event?.missing ?? []);

  return (
    <div className="mx-auto w-full max-w-[74rem] px-6 pb-28 sm:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3 pt-14">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-[#726E77]">
          <span className="size-2 rounded-full bg-[#DDFD57]" />
          Draft • Not public
        </span>
        <button
          type="button"
          onClick={handleManageEvents}
          className="text-sm font-semibold text-[#726E77] transition hover:text-[#5B35F5]"
        >
          Manage events
        </button>
      </div>

      <h1 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-[#1D1725]">
        {mode === "create" ? "Create an event" : "Edit your event"}
      </h1>
      <p className="mt-4 max-w-[42rem] text-base font-medium text-[#726E77] sm:text-lg">
        Help people find your event and know what to expect.
      </p>
      <p className="mt-2 text-sm font-semibold text-[#1D1725]">
        Hosting as {organizerName}
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          {/* About your event */}
          <div className={CARD}>
            <Section
              title="About your event"
              description="Give attendees a clear picture of what you're planning."
            >
              <div>
                <label className={LABEL} htmlFor="event-title">
                  Event title
                </label>
                <input
                  id="event-title"
                  value={values.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="After Hours: Lagos Sessions"
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL} htmlFor="event-category">
                  Category
                </label>
                <select
                  id="event-category"
                  value={values.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className={SELECT}
                >
                  <option value="">Select an option</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL} htmlFor="event-description">
                  Description
                </label>
                <textarea
                  id="event-description"
                  rows={5}
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="An evening of live sets, good food and new connections."
                  className={TEXTAREA}
                />
                <p className={`mt-2 ${HINT}`}>
                  Describe the experience, schedule and entry requirements.
                </p>
              </div>

              <div>
                <span className={LABEL}>Cover image</span>
                <div className={`${DISABLED_GROUP} mt-2`}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-[14px] bg-[#EEE9F5] text-[#5B35F5]">
                      <FontAwesomeIcon icon={faImage} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1D1725]">
                        Image uploader
                      </p>
                      <p className="text-sm font-medium text-[#AAA8AD]">
                        This image appears on your public event page.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button type="button" disabled className={`${OUTLINE} h-10 px-5`}>
                      Replace image
                    </button>
                    <button type="button" disabled className={`${OUTLINE} h-10 px-5`}>
                      Remove image
                    </button>
                  </div>
                </div>
                <UnbackedNote>
                  Cover uploads aren&apos;t connected to the API yet.
                </UnbackedNote>
              </div>
            </Section>
          </div>

          {/* Date and time */}
          <div className={CARD}>
            <Section
              title="Date and time"
              description="Set both dates if your event runs past midnight."
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="event-starts-on">
                    Starts on
                  </label>
                  <input
                    id="event-starts-on"
                    type="date"
                    value={values.startsOn}
                    onChange={(e) => set("startsOn", e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="event-starts-at">
                    Starts at
                  </label>
                  <input
                    id="event-starts-at"
                    type="time"
                    value={values.startsTime}
                    onChange={(e) => set("startsTime", e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="event-ends-on">
                    Ends on
                  </label>
                  <input
                    id="event-ends-on"
                    type="date"
                    value={values.endsOn}
                    onChange={(e) => set("endsOn", e.target.value)}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL} htmlFor="event-ends-at">
                    Ends at
                  </label>
                  <input
                    id="event-ends-at"
                    type="time"
                    value={values.endsTime}
                    onChange={(e) => set("endsTime", e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL} htmlFor="event-timezone">
                  Time zone
                </label>
                <input
                  id="event-timezone"
                  value={timeZoneLabel(DEFAULT_TIME_ZONE)}
                  readOnly
                  disabled
                  className={INPUT}
                />
              </div>
            </Section>
          </div>

          {/* Location */}
          <div className={CARD}>
            <Section title="Location">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["in_person", "online"] as const).map((option) => (
                  <label key={option} className={RADIO}>
                    <input
                      type="radio"
                      name="event-format"
                      value={option}
                      checked={values.format === option}
                      onChange={() => set("format", option)}
                      className="size-4 accent-[#5B35F5]"
                    />
                    {option === "in_person" ? "In-person" : "Online"}
                  </label>
                ))}
              </div>
              {values.format === "online" && (
                <p className={HINT}>Guests join through a private link.</p>
              )}

              {values.format === "in_person" ? (
                <>
                  <div className="opacity-60">
                    <label className={LABEL} htmlFor="event-venue-search">
                      Search for a venue or street address
                    </label>
                    <input
                      id="event-venue-search"
                      disabled
                      placeholder="Search for a venue or street address"
                      className={INPUT}
                    />
                    <UnbackedNote>
                      Address search isn&apos;t connected to the API yet — enter the
                      details below.
                    </UnbackedNote>
                  </div>

                  <div>
                    <span className={LABEL}>Area / neighbourhood</span>
                    <div className="mt-2 flex flex-wrap gap-2.5">
                      {areas
                        .filter((area) => AREA_CHIPS.includes(area.slug))
                        .map((area) => {
                          const active = values.areaId === area.id;
                          return (
                            <button
                              key={area.id}
                              type="button"
                              onClick={() => set("areaId", area.id)}
                              className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                                active
                                  ? "border-[#5B35F5] bg-[#5B35F5] text-white"
                                  : "border-[#DDD9E0] bg-white text-[#1D1725] hover:bg-[#FAFAFC]"
                              }`}
                            >
                              {area.name}
                            </button>
                          );
                        })}
                    </div>
                    <select
                      aria-label="Area / neighbourhood"
                      value={values.areaId}
                      onChange={(e) => set("areaId", e.target.value)}
                      className={SELECT}
                    >
                      <option value="">Select an area</option>
                      {values.areaId &&
                        !areas.some((area) => area.id === values.areaId) &&
                        event?.area && (
                          <option value={event.area.id}>{event.area.name}</option>
                        )}
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} — {area.city}, {area.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className={LABEL} htmlFor="event-venue-name">
                        Venue name
                      </label>
                      <input
                        id="event-venue-name"
                        value={values.venueName}
                        onChange={(e) => set("venueName", e.target.value)}
                        placeholder="After Hours Studio"
                        className={INPUT}
                      />
                    </div>
                    <div>
                      <label className={LABEL} htmlFor="event-street">
                        Street address
                      </label>
                      <input
                        id="event-street"
                        value={values.streetAddress}
                        onChange={(e) => set("streetAddress", e.target.value)}
                        placeholder="24 Example Street"
                        className={INPUT}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={LABEL} htmlFor="event-arrival">
                      Arrival instructions (optional)
                    </label>
                    <input
                      id="event-arrival"
                      value={values.arrivalInstructions}
                      onChange={(e) => set("arrivalInstructions", e.target.value)}
                      placeholder="e.g. Use the side entrance beside the café"
                      className={INPUT}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className={LABEL} htmlFor="event-joining-url">
                    Joining link
                  </label>
                  <input
                    id="event-joining-url"
                    value={values.joiningUrl}
                    onChange={(e) => set("joiningUrl", e.target.value)}
                    placeholder="https://zoom.us/j/1234567890"
                    className={INPUT}
                  />
                  <p className={`mt-2 ${HINT}`}>
                    Only guests who register will see this link.
                  </p>
                </div>
              )}
            </Section>
          </div>

          {/* Admission + tickets: no API routes yet */}
          <div className={CARD}>
            <Section title="Admission">
              <div className="grid gap-3 sm:grid-cols-2 opacity-60">
                {ADMISSION.map((option, index) => (
                  <label key={option} className={RADIO}>
                    <input
                      type="radio"
                      name="event-admission"
                      defaultChecked={index === 0}
                      disabled
                      className="size-4 accent-[#5B35F5]"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <UnbackedNote>
                Admission and ticket types aren&apos;t connected to the API yet.
              </UnbackedNote>
            </Section>

            <div className="mt-8">
              <Section title="Ticket types">
                <div className="flex flex-col gap-4 opacity-60">
                  {TICKET_TYPES.map((tier, index) => (
                    <div
                      key={tier.name}
                      className="rounded-[20px] border border-[#DAD3E1] bg-white p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#1D1725]">
                          {tier.name}
                        </span>
                        <span className="text-xs font-semibold text-[#AAA8AD]">
                          {index === 0 ? "Incl. Admission" : ""}
                        </span>
                      </div>
                      <input
                        disabled
                        placeholder="Tickets available"
                        className={`${INPUT} h-[46px]`}
                      />
                      <input
                        disabled
                        placeholder="Price"
                        className={`${INPUT} h-[46px]`}
                      />
                      <p className={`mt-3 ${HINT}`}>Benefits (optional)</p>
                      <p className="mt-2 text-sm font-semibold text-[#AAA8AD]">
                        Remove ticket type
                      </p>
                    </div>
                  ))}
                </div>
                <div className="opacity-60">
                  <button type="button" disabled className={`${OUTLINE} w-fit`}>
                    Add ticket type
                  </button>
                </div>
              </Section>
            </div>

            <div className="mt-8">
              <Section title="Maximum tickets per order">
                <input
                  disabled
                  placeholder="4"
                  className={`${INPUT} opacity-60`}
                />
              </Section>
            </div>

            <div className="mt-8">
              <Section title="Refund policy">
                <input
                  disabled
                  value="Until 24 hours before"
                  className={`${INPUT} opacity-60`}
                />
              </Section>
            </div>

            <div className="mt-8 rounded-[20px] bg-[#FFF1DD] p-5">
              <p className="text-sm font-semibold text-[#1D1725]">
                Bank details needed before going live
              </p>
              <p className="mt-2 text-sm font-medium text-[#726E77]">
                You can submit for review now. Add your payout bank details before
                this paid event can be published.
              </p>
              <button type="button" disabled className={`${OUTLINE} mt-4`}>
                Add payout details
              </button>
              <p className="mt-3 text-xs font-medium text-[#726E77]">
                Organizer fees are deducted from ticket sales. Review the fee
                breakdown before publishing.
              </p>
              <UnbackedNote>
                Payouts aren&apos;t connected to the API yet — there is no publish
                route to submit to.
              </UnbackedNote>
            </div>
          </div>

          {/* Action bar */}
          <div className="sticky bottom-0 z-30 -mx-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#E7E3EC] bg-white/95 px-6 py-4 backdrop-blur sm:-mx-10 sm:px-10 rounded-t-[24px]">
            <button type="submit" disabled={saving} className={OUTLINE}>
              {saving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="size-4 animate-spin rounded-full border-2 border-[#1D1725]/30 border-t-[#1D1725]"
                  />
                  Saving draft
                </>
              ) : (
                "Save draft"
              )}
            </button>
            <button
              type="button"
              disabled
              title="Events can't be submitted for review yet."
              className={PRIMARY}
            >
              Review event
            </button>
          </div>
        </form>

        {/* Preview */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className={CARD}>
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
              Before you submit
            </h2>
            <p className={`mt-1.5 ${HINT}`}>
              Check the details attendees will see.
            </p>

            <div className="mt-6 border-t border-[#EFECF2] pt-6">
              <p className="font-display text-lg font-bold tracking-tight text-[#1D1725]">
                {values.title.trim() || "Untitled draft"}
              </p>
              <p className="mt-2 text-sm font-medium text-[#1D1725]">
                {range ?? "Dates not set"}
              </p>
              <p className="mt-1 text-sm font-medium text-[#AAA8AD]">
                {timeZoneLabel(DEFAULT_TIME_ZONE)}
              </p>
              <p className="mt-3 text-sm font-medium text-[#1D1725]">
                {values.format === "online"
                  ? "Online"
                  : values.venueName.trim() && chosenArea
                    ? `${values.venueName.trim()} • ${chosenArea}`
                    : values.venueName.trim() || chosenArea || "Location not set"}
              </p>
              <p className="mt-3 text-sm font-medium text-[#AAA8AD]">
                {selectedCategory || "Category not set"}
              </p>
              <p className="mt-1 text-sm font-medium text-[#AAA8AD]">
                Admission not set
              </p>
            </div>

            <div className="mt-6 rounded-[20px] bg-[#EEE9F5] p-5">
              <p className="text-sm font-semibold text-[#1D1725]">
                Review comes first
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#726E77]">
                Your event goes live after approval. We&apos;ll let you know if
                changes are needed.
              </p>
            </div>

            {missing && (
              <p className="mt-4 text-xs font-semibold text-[#726E77]">{missing}</p>
            )}
          </div>
        </aside>
      </div>

      {/* Save toast */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[16px] border bg-white px-5 py-3.5 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.22)] ${
            toast.kind === "ok" ? "border-[#DAD3E1]" : "border-[#E3AEAE]"
          }`}
        >
          <FontAwesomeIcon
            icon={toast.kind === "ok" ? faCircleCheck : faCircleExclamation}
            className={`h-4 w-4 ${toast.kind === "ok" ? "text-[#5B35F5]" : "text-[#B32929]"}`}
          />
          <span className="text-sm font-semibold text-[#1D1725]">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
            className="text-[#726E77] transition hover:text-[#1D1725]"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Unsaved changes */}
      {leaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1725]/40 px-5">
          <div className="w-full max-w-[26rem] rounded-[28px] border border-[#DAD3E1] bg-white p-7 text-center">
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
              Save before leaving?
            </h2>
            <p className={`mt-2 ${HINT}`}>
              Keep your unfinished event so you can return to it later.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void handleSaveAndLeave()}
                disabled={saving}
                className={PRIMARY}
              >
                {saving ? "Saving draft" : "Save and leave"}
              </button>
              <button
                type="button"
                onClick={() => setLeaveOpen(false)}
                disabled={saving}
                className={OUTLINE}
              >
                Keep editing
              </button>
              <Link
                href="/organizer/events"
                className="text-sm font-semibold text-[#726E77] transition hover:text-[#5B35F5]"
              >
                Leave without saving
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
