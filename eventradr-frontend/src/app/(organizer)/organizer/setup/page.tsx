"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { describeApiError, getApiError } from "@/lib/api/errors";
import {
  createOrganizerProfile,
  describeOrganizerNameProblem,
  normalizeOrganizerName,
  ORGANIZER_NAME_MAX,
} from "@/lib/api/organizer";
import { loadSession } from "@/lib/api/session";

type Status = "loading" | "ready" | "already" | "unauthenticated" | "error";

const CARD =
  "rounded-[32px] bg-white shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5";

const PRIMARY =
  "inline-flex h-12 items-center justify-center rounded-full bg-purple px-6 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY =
  "inline-flex h-12 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-bold text-ink transition hover:bg-ink/5";

export default function OrganizerSetupPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    loadSession()
      .then((user) => {
        // One organizer profile per account, so an existing one ends this flow.
        setStatus(user.organizer ? "already" : "ready");
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
    load();
  }, [load]);

  function retry() {
    setStatus("loading");
    setError(null);
    load();
  }

  // Collapse runs of whitespace the way the API documents its own normalisation.
  const normalized = normalizeOrganizerName(name);
  const problem = describeOrganizerNameProblem(normalized);
  const canSubmit = problem === null && !submitting;

  /** POST /organizer/profile — creates the profile, then hands off to the area. */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSubmitting(true);
    try {
      await createOrganizerProfile({ name: normalized });
      router.push("/organizer");
    } catch (err) {
      // Someone may have created one elsewhere since this page loaded.
      if (getApiError(err)?.code === "ORGANIZER_PROFILE_EXISTS") {
        setStatus("already");
      } else {
        setError(describeApiError(err));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10 pb-20 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink/40 transition hover:text-ink"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-3 w-3" />
          Back to dashboard
        </Link>

        {status === "loading" && (
          <p className="mt-10 flex items-center gap-3 text-sm font-medium text-ink/50">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Checking your account…
          </p>
        )}

        {status === "already" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
              Organizer
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink">
              You already have an organizer profile
            </h1>
            <p className="mt-3 text-sm font-medium text-ink/45">
              An account can hold one organizer profile. Manage it from your
              organizer area.
            </p>
            <Link href="/organizer" className={`mt-7 ${PRIMARY}`}>
              Open organizer area
            </Link>
          </section>
        )}

        {status === "unauthenticated" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink">
              Sign in to become an organizer
            </h1>
            <p className="mt-3 text-sm font-medium text-ink/45">
              Your session has ended. Sign in again and we&apos;ll pick up here.
            </p>
            <Link href="/sign-in" className={`mt-7 ${PRIMARY}`}>
              Go to sign in
            </Link>
          </section>
        )}

        {status === "error" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink">
              We couldn&apos;t load your account
            </h1>
            <p className="mt-3 text-sm font-medium text-ink/45">
              The staging API may be unreachable.
            </p>
            <button type="button" onClick={retry} className={`mt-7 ${SECONDARY}`}>
              Try again
            </button>
          </section>
        )}

        {status === "ready" && (
          <section className={`mt-8 p-8 sm:p-10 ${CARD}`}>
            <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
              Become an organizer
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.05] tracking-tight text-ink">
              Host your first event
            </h1>
            <p className="mt-3 max-w-md text-sm font-medium text-ink/45">
              This name is what attendees see on your events and public profile.
              You can change it later.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="organizer-name"
                className="block text-sm font-bold text-ink"
              >
                Organizer name
              </label>
              <input
                id="organizer-name"
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="organization"
                maxLength={ORGANIZER_NAME_MAX + 20}
                aria-invalid={problem !== null}
                aria-describedby="organizer-name-hint"
                placeholder="e.g. Night Garden Collective"
                className="mt-2 h-14 w-full rounded-2xl border border-ink/10 bg-cream px-5 text-base font-medium text-ink outline-none transition placeholder:text-ink/25 focus:border-purple focus:ring-4 focus:ring-purple/10"
              />
              <p
                id="organizer-name-hint"
                className="mt-2 text-xs font-medium text-ink/35"
              >
                {ORGANIZER_NAME_MAX} characters or fewer. Letters, numbers, spaces
                and &amp; &apos; - . ,
              </p>

              {name.length > 0 && problem !== null && (
                <p
                  role="alert"
                  className="mt-4 rounded-2xl bg-coral/20 px-4 py-3 text-sm font-bold text-ink"
                >
                  {problem}
                </p>
              )}

              {error !== null && (
                <p
                  role="alert"
                  className="mt-4 rounded-2xl bg-coral/20 px-4 py-3 text-sm font-bold text-ink"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                aria-busy={submitting}
                className={`mt-7 w-full sm:w-auto ${PRIMARY}`}
              >
                {submitting ? "Creating…" : "Create organizer profile"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
