"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faIdBadge,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { getApiError } from "@/lib/api/errors";
import { getOrganizerProfile } from "@/lib/api/organizer";
import { loadSession } from "@/lib/api/session";
import type { Organizer } from "@/lib/api/types";

type Status = "loading" | "ready" | "none" | "unauthenticated" | "error";

const CARD =
  "rounded-[32px] bg-white shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5";

const PRIMARY =
  "inline-flex h-12 items-center justify-center rounded-full bg-purple px-6 text-sm font-bold text-white transition hover:bg-purple/90";

const SECONDARY =
  "inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-bold text-ink transition hover:bg-ink/5";

function EntryCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: IconDefinition;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col justify-between gap-8 p-7 transition hover:-translate-y-1 ${CARD}`}
    >
      <span className="flex size-11 items-center justify-center rounded-2xl bg-purple text-white">
        <FontAwesomeIcon icon={icon} className="h-4 w-4" />
      </span>
      <span>
        <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink">
          {title}
          <FontAwesomeIcon
            icon={faArrowRight}
            className="h-3 w-3 text-ink/30 transition group-hover:translate-x-0.5 group-hover:text-purple"
          />
        </span>
        <span className="mt-1.5 block text-sm font-medium text-ink/45">
          {description}
        </span>
      </span>
    </Link>
  );
}

export default function OrganizerHomePage() {
  const [status, setStatus] = useState<Status>("loading");
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  const load = useCallback(() => {
    loadSession()
      .then(async (user) => {
        // The account summary only carries id + name; the rest needs the profile.
        if (!user.organizer) {
          setStatus("none");
          return;
        }
        const profile = await getOrganizerProfile();
        setOrganizer(profile.data);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          setStatus("unauthenticated");
          return;
        }
        // 403 ORGANIZER_PROFILE_REQUIRED — no profile exists yet.
        if (getApiError(err)?.code === "ORGANIZER_PROFILE_REQUIRED") {
          setStatus("none");
          return;
        }
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function retry() {
    setStatus("loading");
    load();
  }

  return (
    <div className="px-6 py-10 pb-20 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
          Organizer
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
          {status === "ready" && organizer ? organizer.name : "Organizer area"}
        </h1>

        {status === "loading" && (
          <p className="mt-10 flex items-center gap-3 text-sm font-medium text-ink/50">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Loading your organizer profile…
          </p>
        )}

        {status === "none" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              No organizer profile yet
            </h2>
            <p className="mt-3 max-w-md text-sm font-medium text-ink/45">
              Create one to start hosting events. Your attendee account stays
              exactly as it is.
            </p>
            <Link href="/organizer/setup" className={`mt-7 ${PRIMARY}`}>
              Become an organizer
            </Link>
          </section>
        )}

        {status === "unauthenticated" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              You&apos;re signed out
            </h2>
            <p className="mt-3 text-sm font-medium text-ink/45">
              Sign in to reach your organizer area.
            </p>
            <Link href="/sign-in" className={`mt-7 ${PRIMARY}`}>
              Go to sign in
            </Link>
          </section>
        )}

        {status === "error" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              We hit a snag
            </h2>
            <p className="mt-3 text-sm font-medium text-ink/45">
              We couldn&apos;t load your organizer profile. The staging API may be
              unreachable.
            </p>
            <button type="button" onClick={retry} className={`mt-7 ${SECONDARY}`}>
              Try again
            </button>
          </section>
        )}

        {status === "ready" && organizer && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <EntryCard
                href="/organizer/profile"
                title="Public profile"
                description="Your organizer name, photo and description."
                icon={faIdBadge}
              />
            </div>

            <div
              className={`mt-6 flex flex-col gap-5 p-7 sm:flex-row sm:items-center ${CARD}`}
            >
              <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-mint text-lg font-bold text-ink/60">
                {organizer.avatar ? (
                  <motion.img
                    src={organizer.avatar.large}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  organizer.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <div>
                <p className="font-display text-lg font-bold tracking-tight text-ink">
                  {organizer.name}
                </p>
                <p className="mt-1 text-sm font-medium text-ink/45">
                  {organizer.about ?? "No description yet."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
