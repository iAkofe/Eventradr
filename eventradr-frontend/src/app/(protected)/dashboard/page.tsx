"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { logout, refreshSession } from "@/lib/api/auth";
import { getCurrentUser } from "@/lib/api/profile";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

type Status = "loading" | "authenticated" | "unauthenticated" | "error";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [signingOut, setSigningOut] = useState(false);

  const fetchUser = useCallback(() => {
    getCurrentUser()
      .then((response) => {
        setUser(response.data);
        setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError) || err.status !== 401) {
          setStatus("error");
          return;
        }

        // Documented flow: on 401 UNAUTHENTICATED, refresh once, then retry.
        refreshSession()
          .catch((refreshErr: unknown) => {
            // 409 REFRESH_TOKEN_ROTATED: another request refreshed first; retry anyway.
            if (refreshErr instanceof ApiError && refreshErr.status === 409) {
              return null;
            }
            throw refreshErr;
          })
          .then(() => getCurrentUser())
          .then((retry) => {
            setUser(retry.data);
            setStatus("authenticated");
          })
          .catch(() => {
            setStatus("unauthenticated");
          });
      });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  function retry() {
    setStatus("loading");
    fetchUser();
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.push("/sign-in");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-lg rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Dashboard
        </h1>

        {status === "loading" && (
          <p className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Checking your session…
          </p>
        )}

        {status === "unauthenticated" && (
          <div className="mt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              You are not signed in.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Go to sign in
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="mt-4">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
              We couldn&apos;t load your profile. The staging API may be
              unreachable.
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 h-11 rounded-full border border-black/[.12] px-5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/[.16] dark:text-zinc-50 dark:hover:bg-white/[.06]"
            >
              Try again
            </button>
          </div>
        )}

        {status === "authenticated" && user && (
          <div className="mt-4 flex flex-col gap-4">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
                <dd className="truncate text-black dark:text-zinc-50">
                  {user.email}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
                <dd className="text-black dark:text-zinc-50">
                  {user.name ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500 dark:text-zinc-400">Interests</dt>
                <dd className="text-black dark:text-zinc-50">
                  {user.interests.length > 0
                    ? user.interests.map((category) => category.label).join(", ")
                    : "—"}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="h-11 rounded-full border border-black/[.12] px-5 text-sm font-medium text-black hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/[.16] dark:text-zinc-50 dark:hover:bg-white/[.06]"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
