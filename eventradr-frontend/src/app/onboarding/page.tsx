"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";
import { getCategories } from "@/lib/api/auth";
import { setInterests, updateProfile } from "@/lib/api/profile";
import { loadSession } from "@/lib/api/session";
import type { Category } from "@/lib/api/types";

// Typed easing tuple — Framer Motion needs the literal 4-tuple, not number[].
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Documented limit for UpdateProfileBody.name. */
const NAME_MAX = 80;

type Step = "name" | "interests";
type Status = "loading" | "ready" | "unauthenticated" | "error";

// Cycled across category tiles so the grid reads like the landing page.
const CHIP_TONES = [
  "bg-purple text-white",
  "bg-coral text-ink",
  "bg-mint text-ink",
  "bg-lime text-ink",
  "bg-ink text-white",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [step, setStep] = useState<Step>("name");
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Load the session + categories. State is written only from async
   *  callbacks, so this is safe to call straight from the mount effect. */
  const load = useCallback(() => {
    Promise.all([loadSession(), getCategories()])
      .then(([user, categoryList]) => {
        setName(user.name ?? "");
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

  /** PATCH /me { name } — step one. */
  async function handleNameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Enter a name to continue.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const response = await updateProfile({ name: trimmed });
      setName(response.data.name ?? trimmed);
      setStep("interests");
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setSaving(false);
    }
  }

  /** PUT /me/interests { categoryIds } — step two. */
  async function handleFinish() {
    if (saving) return;

    setError(null);
    setSaving(true);
    try {
      await setInterests({ categoryIds: Array.from(selected) });
      router.push("/dashboard");
    } catch (err) {
      setError(describeApiError(err));
      setSaving(false);
    }
  }

  const progress = step === "name" ? 50 : 100;
  const trimmedLength = name.trim().length;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-cream">
      <header className="px-6 py-6 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-ink"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple">
              <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            </div>
            eventradr
          </Link>
          {status === "ready" && (
            <span className="text-[0.65rem] font-bold tracking-[0.2em] text-ink/30 uppercase">
              Step {step === "name" ? "1" : "2"} of 2
            </span>
          )}
        </div>
      </header>

      <div className="h-1 w-full bg-ink/5" role="presentation">
        <motion.div
          className="h-full bg-purple"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        {status === "loading" && (
          <p className="flex items-center gap-3 text-sm font-medium text-ink/50">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Getting things ready…
          </p>
        )}

        {status === "unauthenticated" && (
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              You&apos;re signed out
            </h1>
            <p className="mt-3 text-sm font-medium text-ink/50">
              Sign in to finish setting up your account.
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
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_50px_-12px_rgba(26,11,46,0.12)] ring-1 ring-ink/5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              We hit a snag
            </h1>
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

        {status === "ready" && (
          <div className="w-full max-w-2xl">
            <div aria-live="polite">
              {error && (
                <p
                  role="alert"
                  className="mb-6 rounded-2xl bg-coral/15 px-4 py-3 text-sm font-medium text-coral"
                >
                  {error}
                </p>
              )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === "name" ? (
                <motion.section
                  key="name"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
                    Welcome to eventradr
                  </p>
                  <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.02] tracking-tight text-ink">
                    What should we call you?
                  </h1>
                  <p className="mt-4 max-w-md text-base font-medium text-ink/50">
                    This is the name organizers and guests see. You can change it
                    later in your profile.
                  </p>

                  <form
                    onSubmit={handleNameSubmit}
                    className="mt-10 max-w-md"
                    noValidate
                  >
                    <label
                      htmlFor="name"
                      className="text-[0.65rem] font-bold tracking-[0.2em] text-ink/40 uppercase"
                    >
                      Display name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      autoFocus
                      maxLength={NAME_MAX}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="e.g. Ada Obi"
                      className="mt-3 h-14 w-full rounded-2xl border border-ink/10 bg-white px-5 text-base font-medium text-ink outline-none transition placeholder:text-ink/25 focus:border-purple"
                    />
                    <div className="mt-2 flex justify-between text-xs font-medium text-ink/30">
                      <span>1–{NAME_MAX} characters</span>
                      <span>
                        {trimmedLength}/{NAME_MAX}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={saving || trimmedLength === 0}
                      aria-busy={saving}
                      className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-purple px-8 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving && (
                        <span
                          aria-hidden="true"
                          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                      )}
                      {saving ? "Saving…" : "Continue"}
                    </button>
                  </form>
                </motion.section>
              ) : (
                <motion.section
                  key="interests"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <p className="text-[0.65rem] font-bold tracking-[0.24em] text-purple uppercase">
                    Almost there
                  </p>
                  <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.02] tracking-tight text-ink">
                    What are you into?
                  </h1>
                  <p className="mt-4 max-w-lg text-base font-medium text-ink/50">
                    Pick a few interests so we can surface the right events.
                    You can change these anytime.
                  </p>

                  {categories.length === 0 ? (
                    <p className="mt-10 text-sm font-medium text-ink/40">
                      No categories available right now — you can pick interests
                      later from your profile.
                    </p>
                  ) : (
                    <div
                      role="group"
                      aria-label="Interests"
                      className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3"
                    >
                      {categories.map((category, index) => {
                        const active = selected.has(category.id);
                        return (
                          <motion.button
                            key={category.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleCategory(category.id)}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.97 }}
                            className={`flex aspect-[1.4/1] flex-col justify-between rounded-[24px] p-5 text-left transition-shadow ${
                              active
                                ? `${CHIP_TONES[index % CHIP_TONES.length]} shadow-lg`
                                : "border border-ink/10 bg-white text-ink hover:border-ink/20"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] font-bold transition ${
                                  active
                                    ? "bg-white/30"
                                    : "border border-ink/15"
                                }`}
                                aria-hidden="true"
                              >
                                {active ? "✓" : ""}
                              </span>
                            </div>
                            <span className="font-display text-sm font-bold leading-tight sm:text-base">
                              {category.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep("name");
                      }}
                      className="order-2 text-sm font-bold text-ink/40 transition hover:text-ink sm:order-1"
                    >
                      ← Back
                    </button>

                    <div className="order-1 flex items-center gap-4 sm:order-2">
                      <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="text-sm font-bold text-ink/40 transition hover:text-ink"
                      >
                        Skip for now
                      </button>
                      <button
                        type="button"
                        onClick={handleFinish}
                        disabled={saving}
                        aria-busy={saving}
                        className="flex h-14 items-center justify-center gap-3 rounded-full bg-purple px-8 text-sm font-bold text-white transition hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving && (
                          <span
                            aria-hidden="true"
                            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                          />
                        )}
                        {saving
                          ? "Saving…"
                          : selected.size > 0
                            ? `Finish · ${selected.size}`
                            : "Finish"}
                      </button>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
