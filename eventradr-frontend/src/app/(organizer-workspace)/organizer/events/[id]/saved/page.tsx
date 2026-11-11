"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { getApiError } from "@/lib/api/errors";
import { findEvent } from "@/lib/api/events";
import { loadSession } from "@/lib/api/session";
import type { Event, EventMissingField } from "@/lib/api/types";

const CARD =
  "w-full max-w-[40rem] rounded-[28px] border border-[#DAD3E1] bg-white p-8 sm:p-9";
const PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#5B35F5] px-7 text-sm font-semibold text-white transition hover:bg-[#4B28E1]";

/** Missing-field nouns, read as a list: "the description, category and cover image". */
const NOUNS: Record<EventMissingField, string> = {
  title: "title",
  category: "category",
  description: "description",
  cover: "cover image",
  startsAt: "start date",
  endsAt: "end date",
  format: "in-person or online",
  admission: "admission details",
  coordinates: "map location",
};

/** "the description, category and cover image" */
function listMissing(missing: EventMissingField[]): string {
  const nouns = missing.map((field) => NOUNS[field] ?? field);
  if (nouns.length === 1) {
    return `the ${nouns[0]}`;
  }
  return `the ${nouns.slice(0, -1).join(", ")} and ${nouns[nouns.length - 1]}`;
}

/**
 * The only body variants the design shows: a specific list while required
 * fields are still empty, and a general line once they are all filled in.
 * Cover and admission have no API route yet, so on their own they don't
 * produce the list.
 */
function describeProgress(missing: EventMissingField[]): string {
  const pending = missing.filter(
    (field) => field !== "cover" && field !== "admission"
  );
  if (pending.length === 0) {
    return "Your draft keeps unfinished details. Continue editing when you're ready.";
  }
  return `Your unfinished details are saved. Add ${listMissing(missing)} when you're ready.`;
}

type Status = "loading" | "ready" | "missing" | "error";

function Loading() {
  return (
    <p className="flex items-center gap-3 text-sm font-medium text-[#726E77]">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      Loading your draft…
    </p>
  );
}

/** /organizer/events/[id]/saved — the "Draft saved" confirmation. */
function DraftSaved() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [status, setStatus] = useState<Status>("loading");
  const [event, setEvent] = useState<Event | null>(null);

  const load = useCallback(() => {
    loadSession()
      .then(async () => {
        const found = await findEvent(id);
        if (!found) {
          setStatus("missing");
          return;
        }
        setEvent(found);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/organizer/sign-in");
          return;
        }
        if (getApiError(err)?.code === "ORGANIZER_PROFILE_REQUIRED") {
          router.replace("/organizer/setup");
          return;
        }
        setStatus("error");
      });
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  function retry() {
    setStatus("loading");
    load();
  }

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "missing") {
    return (
      <section className={CARD}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D1725]">
          We couldn&apos;t find that draft
        </h1>
        <p className="mt-2 text-sm font-medium text-[#726E77]">
          It may have been deleted. Your other drafts are still here.
        </p>
        <Link href="/organizer/events" className={`mt-6 ${PRIMARY}`}>
          Back to your events
        </Link>
      </section>
    );
  }

  if (status === "error" || !event) {
    return (
      <section className={CARD}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D1725]">
          We hit a snag
        </h1>
        <p className="mt-2 text-sm font-medium text-[#726E77]">
          We couldn&apos;t load this draft. The staging API may be unreachable.
        </p>
        <button type="button" onClick={retry} className={`mt-6 ${PRIMARY}`}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className={CARD}>
      <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D1725]">
        Draft saved
      </h1>
      <p className="mt-2 text-sm font-medium text-[#726E77]">
        Your event is saved, but it isn&apos;t public.
      </p>

      <p className="mt-7 font-display text-xl font-bold tracking-tight text-[#1D1725]">
        {event.title?.trim() || "Untitled draft"}
      </p>

      <p className="mt-5 text-sm font-medium leading-[1.7] text-[#1D1725]">
        {describeProgress(event.missing)}
      </p>

      <div className="mt-6 rounded-[20px] bg-[#EEE9F5] p-5">
        <p className="text-sm font-medium text-[#726E77]">
          Submit for review once the required details are complete.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link href={`/organizer/events/${event.id}`} className={PRIMARY}>
          Continue editing
        </Link>
        <Link
          href="/organizer/events"
          className="text-sm font-semibold text-[#726E77] transition hover:text-[#5B35F5]"
        >
          Manage events
        </Link>
      </div>
    </section>
  );
}

export default function DraftSavedPage() {
  return (
    <div className="flex flex-1 justify-center px-6 pt-14 pb-24 sm:px-10">
      <Suspense fallback={<Loading />}>
        <DraftSaved />
      </Suspense>
    </div>
  );
}
