"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { logout } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { describeApiError, getApiError } from "@/lib/api/errors";
import {
  createOrganizerProfile,
  describeOrganizerNameProblem,
  getOrganizerProfile,
  normalizeOrganizerName,
  ORGANIZER_NAME_MAX,
} from "@/lib/api/organizer";
import { loadSession } from "@/lib/api/session";

/**
 * Every state the host-profile screen can be in. `saving` and `checking` are
 * the in-flight variants; `saveError` is a connection failure, while
 * `unconfirmed` means the write left the browser but its result is unknown.
 */
type Status =
  | "loading"
  | "form"
  | "saving"
  | "saveError"
  | "unconfirmed"
  | "checking";

const INPUT =
  "h-14 w-full rounded-[20px] border border-[#DAD3E1] bg-white px-5 text-base font-medium text-[#1A0B2E] outline-none transition placeholder:text-[#726E77] focus:border-[#5B35F5] disabled:cursor-not-allowed disabled:bg-white disabled:text-[#1A0B2E]";

const PRIMARY =
  "flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#5B35F5] px-6 text-base font-semibold text-white transition hover:bg-[#4B28E1] disabled:cursor-not-allowed disabled:bg-[#C9C2CF]";

const SECONDARY =
  "text-sm font-semibold text-[#5B35F5] transition hover:text-[#4B28E1] disabled:cursor-not-allowed disabled:text-[#C9C2CF]";

export default function OrganizerSetupPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  /** Rejection of the submitted name (taken, or refused by validation). */
  const [nameError, setNameError] = useState<string | null>(null);
  /** A failure of the "check the saved profile" round trip. */
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    loadSession()
      .then((user) => {
        // One organizer profile per account, so an existing one ends this flow.
        if (user.organizer) {
          router.replace("/organizer/setup/ready");
          return;
        }
        setEmail(user.email);
        setStatus("form");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/organizer/sign-in");
          return;
        }
        // A transient read failure must not block a genuine first-time visitor;
        // submitting will surface any real problem.
        setStatus("form");
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const normalized = normalizeOrganizerName(name);
  const problem = describeOrganizerNameProblem(normalized);
  // The design shows the hint until the visitor has typed or tried to submit.
  const fieldMessage =
    (hasAttempted || name.length > 0) && problem !== null
      ? problem
      : nameError;

  const busy = status === "saving" || status === "checking";

  /** POST /organizer/profile — creates the profile, then hands off to the ready screen. */
  async function saveProfile() {
    if (busy) return;
    if (problem !== null) return;

    setNameError(null);
    setActionError(null);
    setStatus("saving");

    try {
      await createOrganizerProfile({ name: normalized });
      router.push("/organizer/setup/ready");
    } catch (err) {
      const payload = getApiError(err);

      // Someone may have created one elsewhere since this page loaded.
      if (payload?.code === "ORGANIZER_PROFILE_EXISTS") {
        router.push("/organizer/setup/ready");
        return;
      }

      if (
        payload &&
        (payload.code === "ORGANIZER_NAME_TAKEN" ||
          payload.code === "VALIDATION_ERROR")
      ) {
        setNameError(describeApiError(err));
        setStatus("form");
        return;
      }

      if (err instanceof ApiError && err.status === 401) {
        router.replace("/organizer/sign-in");
        return;
      }

      // A documented server error means the write may still have landed.
      if (err instanceof ApiError && err.status >= 500) {
        setStatus("unconfirmed");
        return;
      }

      setStatus("saveError");
    }
  }

  /** GET /organizer/profile — settles whether an uncertain save actually landed. */
  async function checkSavedProfile() {
    if (busy) return;

    setActionError(null);
    setStatus("checking");

    try {
      await getOrganizerProfile();
      router.push("/organizer/setup/ready");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/organizer/sign-in");
        return;
      }

      if (getApiError(err)?.code === "ORGANIZER_PROFILE_REQUIRED") {
        // Nothing was saved after all — let the visitor retry the form.
        setStatus("form");
        return;
      }

      setActionError("We couldn't check the saved profile. Please try again.");
      setStatus("unconfirmed");
    }
  }

  /** Abandon this session so a different account can start the flow. */
  async function switchAccount() {
    try {
      await logout();
    } catch {
      // The session is being abandoned either way; a failed revoke must not
      // strand the visitor on this screen.
    }
    router.replace("/organizer/sign-in");
  }

  if (status === "loading") {
    return (
      <p className="flex items-center gap-3 text-sm font-medium text-[#726E77]">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Checking your account…
      </p>
    );
  }

  const heading =
    status === "saving"
      ? "Saving your organizer profile"
      : status === "saveError"
        ? "Finish your organizer profile"
        : status === "unconfirmed" || status === "checking"
          ? "Save not confirmed"
          : "Set up your organizer profile";

  const intro =
    status === "saveError"
      ? "We couldn't save your profile. Check your connection and try again."
      : status === "unconfirmed" || status === "checking"
        ? "Check the saved profile before trying again. Your changes are retained."
        : `Choose a name attendees recognize.${
            email ? ` Account: ${email}.` : ""
          }`;

  // The helper line is dropped on the save-error screen: its paragraph already
  // carries the message, and the design keeps that screen to a single message.
  const showHelper = status !== "saveError";

  return (
    <section className="w-full">
      <h1 className="font-display text-[clamp(1.85rem,3.6vw,2.6rem)] font-bold leading-[1.06] tracking-tight text-[#1A0B2E]">
        {heading}
      </h1>
      <p className="mt-4 max-w-[34rem] text-base font-medium text-[#726E77] sm:text-lg">
        {intro}
      </p>

      <div className="mt-8 flex flex-col gap-2.5">
        <label htmlFor="organizer-name" className="text-sm font-semibold text-[#1D1725]">
          Organizer name
        </label>
        <input
          id="organizer-name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setNameError(null);
          }}
          disabled={busy}
          autoComplete="organization"
          maxLength={ORGANIZER_NAME_MAX + 20}
          aria-invalid={fieldMessage !== null}
          placeholder="Your name or organization"
          className={INPUT}
        />
        {fieldMessage ? (
          <p role="alert" className="text-sm font-semibold text-[#B32929]">
            {fieldMessage}
          </p>
        ) : (
          <p className="text-sm font-medium text-[#726E77]">
            This name appears on your events.
          </p>
        )}
      </div>

      {showHelper && (
        <p className="mt-5 text-sm font-medium text-[#726E77]">
          Start a draft now. Add bank details before publishing paid events.
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-5">
        {actionError && (
          <p role="alert" className="text-sm font-semibold text-[#B32929]">
            {actionError}
          </p>
        )}

        {status === "form" && (
          <button
            type="button"
            onClick={() => {
              setHasAttempted(true);
              void saveProfile();
            }}
            className={PRIMARY}
          >
            Save and continue
          </button>
        )}

        {status === "saveError" && (
          <button
            type="button"
            onClick={() => void saveProfile()}
            className={PRIMARY}
          >
            Try again
          </button>
        )}

        {status === "saving" && (
          <button type="button" disabled aria-busy="true" className={PRIMARY}>
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            <span className="sr-only">Saving your organizer profile</span>
          </button>
        )}

        {status === "unconfirmed" && (
          <button
            type="button"
            onClick={() => void checkSavedProfile()}
            className={PRIMARY}
          >
            Check saved profile
          </button>
        )}

        {status === "checking" && (
          <button type="button" disabled aria-busy="true" className={PRIMARY}>
            <span
              aria-hidden="true"
              className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
            <span className="sr-only">Checking saved profile</span>
          </button>
        )}

        {/* Draft creation (POST /organizer/events) needs an organizer profile,
            so it can't be offered before this profile exists. The organizer
            workspace offers it once setup is done. */}
        <button type="button" disabled className={SECONDARY}>
          Start a draft instead
        </button>

        {status !== "saveError" && (
          <button
            type="button"
            onClick={() => void switchAccount()}
            disabled={busy}
            className={SECONDARY}
          >
            Use another account
          </button>
        )}
      </div>
    </section>
  );
}
