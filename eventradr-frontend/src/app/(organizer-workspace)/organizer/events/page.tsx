"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation, faXmark } from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { getApiError } from "@/lib/api/errors";
import { deleteEvent, listEvents } from "@/lib/api/events";
import { loadSession } from "@/lib/api/session";
import {
  describeMissing,
  formatEventRange,
  formatUpdatedAt,
} from "@/lib/events-format";
import type { Event } from "@/lib/api/types";

type Status = "loading" | "ready" | "none" | "error";

const CARD = "rounded-[28px] border border-[#DAD3E1] bg-white p-7 sm:p-8";
const PRIMARY =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-[#5B35F5] px-7 text-sm font-semibold text-white transition hover:bg-[#4B28E1] disabled:cursor-not-allowed disabled:bg-[#C9C2CF]";
const OUTLINE =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#DDD9E0] bg-white px-7 text-sm font-semibold text-[#1D1725] transition hover:bg-[#FAFAFC] disabled:cursor-not-allowed disabled:opacity-50";
const DANGER =
  "inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-[#E3AEAE] bg-white px-7 text-sm font-semibold text-[#B32929] transition hover:bg-[#FDF3F3] disabled:cursor-not-allowed disabled:opacity-50";

/** "After Hours Studio • Yaba", "Online", or a muted placeholder. */
function describePlace(event: Event): string {
  if (event.format === "online") {
    return "Online";
  }
  const venue = event.venueName?.trim();
  const area = event.area?.name;
  if (venue && area) {
    return `${venue} • ${area}`;
  }
  return venue || area || "Location not set";
}

export default function OrganizerEventsPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [events, setEvents] = useState<Event[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const firstPage = useCallback(() => {
    listEvents({ tab: "drafts", page: 1 })
      .then((response) => {
        setEvents(response.data.items);
        setHasNext(response.data.pagination.hasNext);
        setPage(1);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/organizer/sign-in");
          return;
        }
        if (getApiError(err)?.code === "ORGANIZER_PROFILE_REQUIRED") {
          setStatus("none");
          return;
        }
        setStatus("error");
      });
  }, [router]);

  const load = useCallback(() => {
    loadSession()
      .then((user) => {
        if (!user.organizer) {
          setStatus("none");
          return;
        }
        firstPage();
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/organizer/sign-in");
          return;
        }
        setStatus("error");
      });
  }, [firstPage, router]);

  useEffect(() => {
    load();
  }, [load]);

  function retry() {
    setStatus("loading");
    load();
  }

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const response = await listEvents({ tab: "drafts", page: next });
      setEvents((prev) => [...prev, ...response.data.items]);
      setHasNext(response.data.pagination.hasNext);
      setPage(next);
    } catch {
      setToast("We couldn't load more drafts. Try again.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    setToast(null);
    try {
      await deleteEvent(pendingDelete.id);
      setEvents((prev) => prev.filter((event) => event.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/organizer/sign-in");
        return;
      }
      setToast("Your draft wasn't deleted. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[74rem] px-6 pt-14 pb-24 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-[clamp(2rem,4.4vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-[#1D1725]">
            Your events
          </h1>
          <p className="mt-4 max-w-[42rem] text-base font-medium text-[#726E77] sm:text-lg">
            Drafts you&apos;re working on. Submit for review once the required
            details are complete.
          </p>
        </div>
        <Link href="/organizer/events/new" className={PRIMARY}>
          Create an event
        </Link>
      </div>

      {status === "loading" && (
        <p className="mt-10 flex items-center gap-3 text-sm font-medium text-[#726E77]">
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          Loading your events…
        </p>
      )}

      {status === "none" && (
        <section className={`mt-10 ${CARD}`}>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
            Set up your organizer profile first
          </h2>
          <p className="mt-2 text-sm font-medium text-[#726E77]">
            You need an organizer profile before you can create an event.
          </p>
          <Link href="/organizer/setup" className={`mt-6 ${PRIMARY}`}>
            Set up your profile
          </Link>
        </section>
      )}

      {status === "error" && (
        <section className={`mt-10 ${CARD}`}>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
            We hit a snag
          </h2>
          <p className="mt-2 text-sm font-medium text-[#726E77]">
            We couldn&apos;t load your events. The staging API may be
            unreachable.
          </p>
          <button type="button" onClick={retry} className={`mt-6 ${OUTLINE}`}>
            Try again
          </button>
        </section>
      )}

      {status === "ready" && events.length === 0 && (
        <section className={`mt-10 ${CARD}`}>
          <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
            No events yet
          </h2>
          <p className="mt-2 text-sm font-medium text-[#726E77]">
            Start a draft and finish it whenever you&apos;re ready.
          </p>
          <Link href="/organizer/events/new" className={`mt-6 ${PRIMARY}`}>
            Create an event
          </Link>
        </section>
      )}

      {status === "ready" && events.length > 0 && (
        <div className="mt-10 flex flex-col gap-5">
          {events.map((event) => {
            const missing = describeMissing(event.missing);
            return (
              <article key={event.id} className={CARD}>
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-[#726E77]">
                      <span className="size-2 rounded-full bg-[#DDFD57]" />
                      Draft • Not public
                    </span>
                    <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-[#1D1725]">
                      {event.title?.trim() || "Untitled draft"}
                    </h2>
                    <p className="mt-2 text-sm font-semibold text-[#1D1725]">
                      {formatEventRange(event.startsAt, event.endsAt) ??
                        "Dates not set"}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#1D1725]">
                      {describePlace(event)}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#AAA8AD]">
                      {event.category?.label ?? "Category not set"} ·{" "}
                      {formatUpdatedAt(event.updatedAt)}
                    </p>
                    {missing && (
                      <p className="mt-3 text-xs font-semibold text-[#726E77]">
                        {missing}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className={PRIMARY}
                    >
                      Continue editing
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(event)}
                      className={DANGER}
                    >
                      Delete draft
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {hasNext && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className={OUTLINE}
              >
                {loadingMore ? "Loading more" : "Load more drafts"}
              </button>
            </div>
          )}
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1D1725]/40 px-5">
          <div className="w-full max-w-[26rem] rounded-[28px] border border-[#DAD3E1] bg-white p-7 text-center">
            <h2 className="font-display text-xl font-bold tracking-tight text-[#1D1725]">
              Delete this draft?
            </h2>
            <p className="mt-2 text-sm font-medium text-[#726E77]">
              {pendingDelete.title?.trim() || "This draft"} will be removed for
              good. This can&apos;t be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className={`${PRIMARY} bg-[#B32929] hover:bg-[#982020] disabled:bg-[#C9C2CF]`}
              >
                {deleting ? "Deleting draft" : "Delete draft"}
              </button>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className={OUTLINE}
              >
                Keep draft
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-[16px] border border-[#E3AEAE] bg-white px-5 py-3.5 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.22)]"
        >
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="h-4 w-4 text-[#B32929]"
          />
          <span className="text-sm font-semibold text-[#1D1725]">{toast}</span>
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
    </div>
  );
}
