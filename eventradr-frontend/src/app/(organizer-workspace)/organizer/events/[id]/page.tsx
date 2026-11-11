"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { getApiError } from "@/lib/api/errors";
import { findEvent } from "@/lib/api/events";
import { loadSession } from "@/lib/api/session";
import { EventForm } from "@/components/organizer/EventForm";
import type { Event } from "@/lib/api/types";

type Status = "loading" | "ready" | "missing" | "error";

const CARD = "rounded-[28px] border border-[#DAD3E1] bg-white p-7 sm:p-8";
const PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#5B35F5] px-7 text-sm font-semibold text-white transition hover:bg-[#4B28E1]";
const OUTLINE =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#DDD9E0] bg-white px-7 text-sm font-semibold text-[#1D1725] transition hover:bg-[#FAFAFC]";

function Loading() {
  return (
    <p className="mx-auto flex w-full max-w-[74rem] items-center gap-3 px-6 pt-14 text-sm font-medium text-[#726E77] sm:px-10">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      Loading your draft…
    </p>
  );
}

/**
 * /organizer/events/[id] — keep editing a draft.
 *
 * The API documents no single-event GET, so the event is resolved out of the
 * drafts list (see `findEvent`).
 */
function EditEvent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [status, setStatus] = useState<Status>("loading");
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerName, setOrganizerName] = useState("");

  const load = useCallback(() => {
    loadSession()
      .then(async (user) => {
        if (!user.organizer) {
          router.replace("/organizer/setup");
          return;
        }
        setOrganizerName(user.organizer.name);
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
      <div className="mx-auto w-full max-w-[74rem] px-6 pt-14 sm:px-10">
        <section className={CARD}>
          <h1 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
            We couldn&apos;t find that draft
          </h1>
          <p className="mt-2 text-sm font-medium text-[#726E77]">
            It may have been deleted. Your other drafts are still here.
          </p>
          <Link href="/organizer/events" className={`mt-6 ${PRIMARY}`}>
            Back to your events
          </Link>
        </section>
      </div>
    );
  }

  if (status === "error" || !event) {
    return (
      <div className="mx-auto w-full max-w-[74rem] px-6 pt-14 sm:px-10">
        <section className={CARD}>
          <h1 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
            We hit a snag
          </h1>
          <p className="mt-2 text-sm font-medium text-[#726E77]">
            We couldn&apos;t load this draft. The staging API may be unreachable.
          </p>
          <button type="button" onClick={retry} className={`mt-6 ${OUTLINE}`}>
            Try again
          </button>
        </section>
      </div>
    );
  }

  return <EventForm mode="edit" event={event} organizerName={organizerName} />;
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EditEvent />
    </Suspense>
  );
}
