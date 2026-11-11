"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { describeApiError } from "@/lib/api/errors";
import { getCategories } from "@/lib/api/auth";
import { setInterests } from "@/lib/api/profile";
import { loadSession } from "@/lib/api/session";
import type { Category } from "@/lib/api/types";

type Status = "loading" | "ready" | "unauthenticated" | "error";
type SubmitIntent = "save" | "skip" | null;

export default function OnboardingPage() {
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savingIntent, setSavingIntent] = useState<SubmitIntent>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([loadSession(), getCategories()])
      .then(([user, categoryResponse]) => {
        setSelected(new Set(user.interests.map((category) => category.id)));
        setCategories(categoryResponse.data);
        setError(null);
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
    if (savingIntent !== null) {
      return;
    }

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

  async function handleSubmit(intent: Exclude<SubmitIntent, null>) {
    if (savingIntent !== null) {
      return;
    }

    setError(null);
    setSavingIntent(intent);

    try {
      await setInterests({
        categoryIds: intent === "skip" ? [] : Array.from(selected),
      });
      router.push("/onboarding/all-set");
    } catch (err) {
      setError(describeApiError(err));
      setSavingIntent(null);
    }
  }

  const helperCopy =
    selected.size > 0
      ? `${selected.size} interest${selected.size === 1 ? "" : "s"} selected`
      : "Choose as many as you like.";

  return (
    <section className="w-full">
      {status === "loading" && (
        <p className="flex items-center gap-3 text-sm font-semibold text-[#726E77]">
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-[#726E77]/30 border-t-[#726E77]"
          />
          Getting things ready...
        </p>
      )}

      {status === "unauthenticated" && (
        <div>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-tight text-[#1A0B2E]">
            You&apos;re signed out
          </h1>
          <p className="mt-4 text-base font-medium text-[#726E77] sm:text-lg">
            Sign in to finish setting up your account.
          </p>
          <Link
            href="/sign-in"
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#5B35F5] px-6 text-base font-semibold text-white transition hover:bg-[#4B28E1]"
          >
            Go to sign in
          </Link>
        </div>
      )}

      {status === "error" && (
        <div>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-tight text-[#1A0B2E]">
            We hit a snag
          </h1>
          <p className="mt-4 text-base font-medium text-[#726E77] sm:text-lg">
            We couldn&apos;t load your account right now.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full border border-[#DAD3E1] px-6 text-base font-semibold text-[#1A0B2E] transition hover:border-[#5B35F5] hover:text-[#5B35F5]"
          >
            Try again
          </button>
        </div>
      )}

      {status === "ready" && (
        <>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-tight text-[#1A0B2E]">
            What are you into?
          </h1>
          <p className="mt-4 max-w-[34rem] text-base font-medium text-[#726E77] sm:text-lg">
            Choose your interests. You can still explore all events.
          </p>

          {error && (
            <p role="alert" className="mt-6 text-sm font-semibold text-[#B32929]">
              {error}
            </p>
          )}

          {categories.length === 0 ? (
            <p className="mt-10 text-sm font-medium text-[#726E77]">
              No categories are available right now.
            </p>
          ) : (
            <div
              role="group"
              aria-label="Interests"
              className="mt-8 flex flex-wrap gap-3"
            >
              {categories.map((category) => {
                const active = selected.has(category.id);

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setError(null);
                      toggleCategory(category.id);
                    }}
                    className={`rounded-full border px-4 py-3 text-sm font-semibold transition sm:px-5 ${
                      active
                        ? "border-[#1A0B2E] bg-[#1A0B2E] text-white"
                        : "border-[#DAD3E1] bg-white text-[#1D1725] hover:border-[#1A0B2E]"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-7 text-sm font-medium text-[#726E77]">{helperCopy}</p>

          <div className="mt-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => void handleSubmit("save")}
              disabled={selected.size === 0 || savingIntent !== null}
              aria-busy={savingIntent === "save"}
              className="flex h-14 items-center justify-center gap-3 rounded-full bg-[#5B35F5] px-6 text-base font-semibold text-white transition hover:bg-[#4B28E1] disabled:cursor-not-allowed disabled:bg-[#C9C2CF]"
            >
              {savingIntent === "save" && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              )}
              {savingIntent === "save"
                ? "Saving..."
                : selected.size > 0
                  ? "Save and continue"
                  : "Continue"}
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit("skip")}
              disabled={savingIntent !== null}
              aria-busy={savingIntent === "skip"}
              className="text-sm font-semibold text-[#1A0B2E] transition hover:text-[#5B35F5] disabled:cursor-not-allowed disabled:text-[#726E77]"
            >
              {savingIntent === "skip" ? "Saving..." : "Skip for now"}
            </button>

            <p className="pt-4 text-sm font-medium text-[#726E77]">
              Change your interests in Account settings.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
