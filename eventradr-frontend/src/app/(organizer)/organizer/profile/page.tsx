"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faCheck,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import { ApiError } from "@/lib/api/client";
import { describeApiError, getApiError } from "@/lib/api/errors";
import {
  describeOrganizerNameProblem,
  getOrganizerProfile,
  normalizeOrganizerName,
  ORGANIZER_NAME_MAX,
  removeOrganizerAvatar,
  updateOrganizerProfile,
  uploadOrganizerAvatar,
} from "@/lib/api/organizer";
import { loadSession } from "@/lib/api/session";
import type { Organizer, UpdateOrganizerBody } from "@/lib/api/types";

/** Documented avatar upload limit. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

type Status = "loading" | "ready" | "none" | "unauthenticated" | "error";
/** Which write is in flight; only one at a time. */
type Busy = "save" | "avatar" | "remove" | null;

const CARD =
  "rounded-[32px] bg-white shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5";

const PRIMARY =
  "inline-flex h-12 items-center justify-center rounded-full bg-purple px-6 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-50";

const SECONDARY =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ink/15 px-6 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-ink/5 px-6 py-8 first:border-t-0 sm:px-10 sm:py-10">
      <h2 className="font-display text-xl font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-1.5 max-w-md text-sm font-medium text-ink/40">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function OrganizerProfilePage() {
  const [status, setStatus] = useState<Status>("loading");
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    };
  }, []);

  function notify(message: string) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 2500);
  }

  /** Load the session + organizer profile. State is written only from async
   *  callbacks, so this is safe to call straight from the mount effect. */
  const load = useCallback(() => {
    loadSession()
      .then(async (user) => {
        if (!user.organizer) {
          setStatus("none");
          return;
        }
        const profile = await getOrganizerProfile();
        setOrganizer(profile.data);
        setName(profile.data.name);
        setAbout(profile.data.about ?? "");
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          setStatus("unauthenticated");
          return;
        }
        // 403 ORGANIZER_PROFILE_REQUIRED — nothing to edit yet.
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
    setError(null);
    load();
  }

  /** Every write returns the full profile, so re-seed the form from it. */
  function applyOrganizer(next: Organizer) {
    setOrganizer(next);
    setName(next.name);
    setAbout(next.about ?? "");
  }

  const normalizedName = normalizeOrganizerName(name);
  const normalizedAbout = about.trim();
  const nameProblem = describeOrganizerNameProblem(normalizedName);
  const nameDirty = organizer !== null && normalizedName !== organizer.name;
  const aboutDirty = organizer !== null && normalizedAbout !== (organizer.about ?? "");
  const canSave =
    (nameDirty || aboutDirty) && nameProblem === null && busy === null;

  /** PATCH /organizer/profile — sends only the fields that changed. */
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    const body: UpdateOrganizerBody = {};
    if (nameDirty) {
      body.name = normalizedName;
    }
    if (aboutDirty) {
      // `about: null` clears it, per the documented contract.
      body.about = normalizedAbout.length > 0 ? normalizedAbout : null;
    }

    setError(null);
    setBusy("save");
    try {
      const response = await updateOrganizerProfile(body);
      applyOrganizer(response.data);
      notify("Changes saved.");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires onChange.
    event.target.value = "";
    if (!file || busy !== null) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (PNG, JPG or WebP).");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("That image is larger than 5 MB. Choose a smaller one.");
      return;
    }

    setError(null);
    setBusy("avatar");
    try {
      const response = await uploadOrganizerAvatar(file);
      applyOrganizer(response.data);
      notify("Photo updated.");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleRemoveAvatar() {
    if (busy !== null) return;

    setError(null);
    setBusy("remove");
    try {
      const response = await removeOrganizerAvatar();
      applyOrganizer(response.data);
      notify("Photo removed.");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1 justify-center px-6 py-10 pb-20 sm:px-10">
      <div className="mx-auto w-full max-w-2xl">
        <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
          Public profile
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-[1.05] tracking-tight text-ink">
          How attendees see you
        </h1>
        <p className="mt-3 text-sm font-medium text-ink/45">
          Your organizer name and photo appear on every event you host.
        </p>

        <div className={`mt-8 overflow-hidden ${CARD}`}>
          {status === "loading" && (
            <p className="flex items-center gap-3 px-6 py-10 text-sm font-medium text-ink/50 sm:px-10">
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Loading your organizer profile…
            </p>
          )}

          {status === "none" && (
            <div className="px-6 py-10 sm:px-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                No organizer profile yet
              </h2>
              <p className="mt-2 max-w-md text-sm font-medium text-ink/45">
                Create one to start hosting events.
              </p>
              <Link href="/organizer/setup" className={`mt-6 ${PRIMARY}`}>
                Become an organizer
              </Link>
            </div>
          )}

          {status === "unauthenticated" && (
            <div className="px-6 py-10 sm:px-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                You&apos;re signed out
              </h2>
              <p className="mt-2 text-sm font-medium text-ink/45">
                Sign in to edit your organizer profile.
              </p>
              <Link href="/sign-in" className={`mt-6 ${PRIMARY}`}>
                Go to sign in
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="px-6 py-10 sm:px-10">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                We couldn&apos;t load your profile
              </h2>
              <p className="mt-2 text-sm font-medium text-ink/45">
                The staging API may be unreachable.
              </p>
              <button
                type="button"
                onClick={retry}
                className={`mt-6 ${SECONDARY}`}
              >
                Try again
              </button>
            </div>
          )}

          {status === "ready" && organizer && (
            <form onSubmit={handleSave} noValidate>
              <Section
                title="Organizer photo"
                description="Square images work best. Up to 5 MB."
              >
                <div className="flex flex-wrap items-center gap-5">
                  <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-mint">
                    {organizer.avatar ? (
                      <motion.img
                        key={organizer.avatar.large}
                        src={organizer.avatar.large}
                        alt=""
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-ink/60">
                        {organizer.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy !== null}
                      className={SECONDARY}
                    >
                      <FontAwesomeIcon icon={faCamera} className="h-3.5 w-3.5" />
                      {busy === "avatar" ? "Uploading…" : "Upload photo"}
                    </button>
                    {organizer.avatar && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={busy !== null}
                        className={SECONDARY}
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="h-3.5 w-3.5"
                        />
                        {busy === "remove" ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </div>
                </div>
              </Section>

              <Section
                title="Organizer name"
                description="Shown on your events and your public page. Must be unique."
              >
                <label htmlFor="organizer-profile-name" className="sr-only">
                  Organizer name
                </label>
                <input
                  id="organizer-profile-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="organization"
                  maxLength={ORGANIZER_NAME_MAX + 20}
                  aria-invalid={nameDirty && nameProblem !== null}
                  className="h-14 w-full rounded-2xl border border-ink/10 bg-cream px-5 text-base font-medium text-ink outline-none transition placeholder:text-ink/25 focus:border-purple focus:ring-4 focus:ring-purple/10"
                />
                <p className="mt-2 text-xs font-medium text-ink/35">
                  {ORGANIZER_NAME_MAX} characters or fewer.
                </p>
                {nameDirty && nameProblem !== null && (
                  <p
                    role="alert"
                    className="mt-4 rounded-2xl bg-coral/20 px-4 py-3 text-sm font-bold text-ink"
                  >
                    {nameProblem}
                  </p>
                )}
              </Section>

              <Section
                title="About"
                description="A short description of what you host. Leave empty to clear it."
              >
                <label htmlFor="organizer-profile-about" className="sr-only">
                  About
                </label>
                <textarea
                  id="organizer-profile-about"
                  name="about"
                  value={about}
                  onChange={(event) => setAbout(event.target.value)}
                  rows={4}
                  placeholder="Live music in hidden corners of Lagos."
                  className="w-full resize-y rounded-2xl border border-ink/10 bg-cream px-5 py-4 text-base font-medium text-ink outline-none transition placeholder:text-ink/25 focus:border-purple focus:ring-4 focus:ring-purple/10"
                />
              </Section>

              <div className="border-t border-ink/5 px-6 py-6 sm:px-10">
                {error !== null && (
                  <p
                    role="alert"
                    className="mb-4 rounded-2xl bg-coral/20 px-4 py-3 text-sm font-bold text-ink"
                  >
                    {error}
                  </p>
                )}
                {notice !== null && (
                  <p
                    role="status"
                    className="mb-4 flex items-center gap-2 rounded-2xl bg-mint/40 px-4 py-3 text-sm font-bold text-ink"
                  >
                    <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                    {notice}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-ink/35">
                    {nameDirty || aboutDirty
                      ? "You have unsaved changes."
                      : "Everything is up to date."}
                  </p>
                  <button type="submit" disabled={!canSave} className={PRIMARY}>
                    {busy === "save" ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
