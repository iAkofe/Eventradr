"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBriefcase,
  faCompass,
  faUser,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { loadSession } from "@/lib/api/session";
import type { User } from "@/lib/api/types";

type Status = "loading" | "authenticated" | "unauthenticated" | "error";

const CARD =
  "rounded-[32px] bg-white shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5";

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const fetchUser = useCallback(() => {
    // loadSession already does the documented 401 → refresh → retry dance, so a
    // surviving 401 here means the session is genuinely gone.
    loadSession()
      .then((account) => {
        setUser(account);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        setStatus(
          err instanceof ApiError && err.status === 401
            ? "unauthenticated"
            : "error"
        );
      });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  function retry() {
    setStatus("loading");
    fetchUser();
  }

  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <div className="px-6 py-10 pb-20 sm:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
          Dashboard
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.05] tracking-tight text-ink">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>

        {status === "loading" && (
          <p className="mt-10 flex items-center gap-3 text-sm font-medium text-ink/50">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Checking your session…
          </p>
        )}

        {status === "unauthenticated" && (
          <div className={`mt-8 p-8 ${CARD}`}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              You&apos;re signed out
            </h2>
            <p className="mt-3 text-sm font-medium text-ink/50">
              Sign in to see your dashboard.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-purple px-6 text-sm font-bold text-white transition hover:bg-purple/90"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className={`mt-8 p-8 ${CARD}`}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              We hit a snag
            </h2>
            <p className="mt-3 text-sm font-medium text-ink/50">
              We couldn&apos;t load your account. The staging API may be
              unreachable.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-6 h-12 rounded-full border border-ink/15 px-6 text-sm font-bold text-ink transition hover:bg-ink/5"
            >
              Try again
            </button>
          </div>
        )}

        {status === "authenticated" && user && (
          <>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Organizing is a capability on top of the attendee account, so
                  it reads as an upgrade until one exists. */}
              <EntryCard
                href={user.organizer ? "/organizer" : "/organizer/setup"}
                title={user.organizer ? "Organizer area" : "Become an organizer"}
                description={
                  user.organizer
                    ? `Hosting as ${user.organizer.name}.`
                    : "Host events of your own."
                }
                icon={faBriefcase}
              />
              <EntryCard
                href="/profile"
                title="Profile settings"
                description="Your name, photo and interests."
                icon={faUser}
              />
              <EntryCard
                href="/"
                title="Discover"
                description="Browse what's on around Lagos."
                icon={faCompass}
              />
            </div>

            <div className={`mt-6 p-7 ${CARD}`}>
              <h2 className="font-display text-lg font-bold tracking-tight text-ink">
                Your account
              </h2>
              <dl className="mt-5 flex flex-col gap-3 text-sm">
                <div className="flex justify-between gap-6">
                  <dt className="font-medium text-ink/40">Email</dt>
                  <dd className="truncate font-bold text-ink">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="font-medium text-ink/40">Name</dt>
                  <dd className="font-bold text-ink">{user.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="font-medium text-ink/40">Interests</dt>
                  <dd className="text-right font-bold text-ink">
                    {user.interests.length > 0
                      ? user.interests
                          .map((category) => category.label)
                          .join(", ")
                      : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-6">
                  <dt className="font-medium text-ink/40">Organizer</dt>
                  <dd className="text-right font-bold text-ink">
                    {user.organizer?.name ?? "Not set up"}
                  </dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
