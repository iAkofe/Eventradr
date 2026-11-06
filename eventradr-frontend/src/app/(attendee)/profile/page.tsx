"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
import { describeApiError } from "@/lib/api/errors";
import { getCategories } from "@/lib/api/auth";
import {
  removeAvatar,
  setInterests,
  updateProfile,
  uploadAvatar,
} from "@/lib/api/profile";
import { loadSession } from "@/lib/api/session";
import type { Category, User } from "@/lib/api/types";

/** Documented limits: UpdateProfileBody.name (1–80) and the avatar upload (≤ 5 MB). */
const NAME_MAX = 80;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

type Status = "loading" | "ready" | "unauthenticated" | "error";
/** Which write is in flight; only one at a time. */
type Busy = "name" | "interests" | "avatar" | "remove" | null;

function initialsOf(user: User): string {
  const source = user.name?.trim() || user.email;
  return source.slice(0, 2).toUpperCase();
}

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

export default function ProfileSettingsPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
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

  /** Load the session + categories. State is written only from async
   *  callbacks, so this is safe to call straight from the mount effect. */
  const load = useCallback(() => {
    Promise.all([loadSession(), getCategories()])
      .then(([account, categoryList]) => {
        setUser(account);
        setName(account.name ?? "");
        setSelected(new Set(account.interests.map((category) => category.id)));
        setCategories(categoryList.data);
        setStatus("ready");
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

  function toggleCategory(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const trimmedName = name.trim();
  const nameDirty = user !== null && trimmedName !== (user.name ?? "");
  const canSaveName =
    nameDirty && trimmedName.length > 0 && trimmedName.length <= NAME_MAX && busy === null;

  const savedIds = (user?.interests ?? []).map((category) => category.id).sort();
  const pickedIds = Array.from(selected).sort();
  const interestsDirty = savedIds.join(",") !== pickedIds.join(",");
  const canSaveInterests = interestsDirty && busy === null;

  /** PATCH /me { name } */
  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSaveName) return;

    setError(null);
    setBusy("name");
    try {
      const response = await updateProfile({ name: trimmedName });
      setUser(response.data);
      setName(response.data.name ?? trimmedName);
      notify("Name updated");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  /** PUT /me/interests { categoryIds } */
  async function handleSaveInterests() {
    if (!canSaveInterests) return;

    setError(null);
    setBusy("interests");
    try {
      const response = await setInterests({ categoryIds: pickedIds });
      setUser(response.data);
      setSelected(
        new Set(response.data.interests.map((category) => category.id))
      );
      notify("Interests updated");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  /** PUT /uploads/avatar (multipart) */
  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
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
      const response = await uploadAvatar(file);
      setUser(response.data);
      notify("Photo updated");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  /** DELETE /uploads/avatar */
  async function handleRemoveAvatar() {
    if (busy !== null) return;

    setError(null);
    setBusy("remove");
    try {
      const response = await removeAvatar();
      setUser(response.data);
      notify("Photo removed");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 justify-center px-6 py-10 pb-20 sm:px-10">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
            Your account
          </p>
          <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-ink">
            Profile settings
          </h1>

          {status === "loading" && (
            <p className="mt-10 flex items-center gap-3 text-sm font-medium text-ink/50">
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
              Loading your profile…
            </p>
          )}

          {status === "unauthenticated" && (
            <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                You&apos;re signed out
              </h2>
              <p className="mt-3 text-sm font-medium text-ink/50">
                Sign in to manage your profile.
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
            <div className="mt-8 rounded-[32px] bg-white p-8 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                We hit a snag
              </h2>
              <p className="mt-3 text-sm font-medium text-ink/50">
                We couldn&apos;t load your profile. The staging API may be
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

          {status === "ready" && user && (
            <div className="mt-8">
              <div aria-live="polite">
                {error && (
                  <p
                    role="alert"
                    className="mb-6 rounded-2xl bg-coral/20 px-4 py-3 text-sm font-medium text-ink"
                  >
                    {error}
                  </p>
                )}
                {!error && notice && (
                  <p className="mb-6 flex items-center gap-2 rounded-2xl bg-mint/40 px-4 py-3 text-sm font-bold text-ink">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="h-3.5 w-3.5 text-ink/60"
                    />
                    {notice}
                  </p>
                )}
              </div>

              <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5">
                <Section
                  title="Profile photo"
                  description="Shown on your profile and beside your activity. PNG, JPG or WebP, up to 5 MB."
                >
                  <div className="flex flex-wrap items-center gap-5">
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint">
                      {user.avatar ? (
                        <motion.img
                          key={user.avatar.large}
                          src={user.avatar.large}
                          alt=""
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-display text-xl font-bold text-ink/50">
                          {initialsOf(user)}
                        </span>
                      )}
                      {busy === "avatar" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-ink/45">
                          <span
                            aria-hidden="true"
                            className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy !== null}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-purple px-5 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FontAwesomeIcon
                          icon={faCamera}
                          className="h-3.5 w-3.5"
                        />
                        {user.avatar ? "Replace photo" : "Upload photo"}
                      </button>
                      {user.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={busy !== null}
                          className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/15 px-5 text-sm font-bold text-ink transition hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy === "remove" ? (
                            <span
                              aria-hidden="true"
                              className="size-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faTrashCan}
                              className="h-3.5 w-3.5"
                            />
                          )}
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </Section>

                <Section
                  title="Display name"
                  description={`1–${NAME_MAX} characters. This is the name organizers and guests see.`}
                >
                  <form
                    onSubmit={handleSaveName}
                    className="max-w-md"
                    noValidate
                  >
                    <label
                      htmlFor="display-name"
                      className="text-[0.65rem] font-bold tracking-[0.2em] text-ink/40 uppercase"
                    >
                      Name
                    </label>
                    <input
                      id="display-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      maxLength={NAME_MAX}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Ada Obi"
                      className="mt-3 h-14 w-full rounded-2xl border border-ink/10 bg-white px-5 text-base font-medium text-ink outline-none transition placeholder:text-ink/25 focus:border-purple"
                    />
                    <div className="mt-2 flex justify-between text-xs font-medium text-ink/30">
                      <span>1–{NAME_MAX} characters</span>
                      <span>
                        {trimmedName.length}/{NAME_MAX}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={!canSaveName}
                      aria-busy={busy === "name"}
                      className="mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-purple px-7 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy === "name" && (
                        <span
                          aria-hidden="true"
                          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                      )}
                      {busy === "name" ? "Saving…" : "Save name"}
                    </button>
                  </form>
                </Section>

                <Section
                  title="Interests"
                  description="Pick what you're into so we can surface the right events."
                >
                  {categories.length === 0 ? (
                    <p className="text-sm font-medium text-ink/40">
                      No categories available right now.
                    </p>
                  ) : (
                    <div
                      role="group"
                      aria-label="Interests"
                      className="flex flex-wrap gap-2.5"
                    >
                      {categories.map((category) => {
                        const active = selected.has(category.id);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            aria-pressed={active}
                            disabled={busy !== null}
                            onClick={() => toggleCategory(category.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              active
                                ? "bg-ink text-cream"
                                : "border border-ink/10 bg-white text-ink/50 hover:border-ink/20 hover:text-ink"
                            }`}
                          >
                            {active && (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="h-3 w-3"
                              />
                            )}
                            {category.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveInterests}
                    disabled={!canSaveInterests}
                    aria-busy={busy === "interests"}
                    className="mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-purple px-7 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy === "interests" && (
                      <span
                        aria-hidden="true"
                        className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                      />
                    )}
                    {busy === "interests" ? "Saving…" : "Save interests"}
                  </button>
                </Section>

                <Section
                  title="Email"
                  description="Your sign-in address. Contact support to change it."
                >
                  <p className="text-sm font-bold text-ink/60">{user.email}</p>
                </Section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
