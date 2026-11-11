"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBriefcase,
  faCompass,
  faGauge,
  faUser,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

import { logout } from "@/lib/api/auth";

interface NavItem {
  href: string;
  label: string;
  icon: IconDefinition;
  /** Extra paths that should still light this item up (e.g. a sub-flow). */
  also?: string[];
}

// Only routes that exist today are linked; more appear as surfaces land.
const NAV_BY_VARIANT: Record<AppShellVariant, NavItem[]> = {
  attendee: [
    { href: "/", label: "Discover", icon: faCompass },
    { href: "/dashboard", label: "Dashboard", icon: faGauge },
    { href: "/profile", label: "Profile", icon: faUser },
  ],
  organizer: [
    { href: "/", label: "Discover", icon: faCompass },
    { href: "/dashboard", label: "Dashboard", icon: faGauge },
    { href: "/organizer", label: "Organizer", icon: faBriefcase, also: ["/organizer/setup"] },
    { href: "/organizer/profile", label: "Public profile", icon: faUser },
  ],
};

export type AppShellVariant = "attendee" | "organizer";

function NavLink({ href, label, icon, also }: NavItem) {
  const pathname = usePathname();
  const active = pathname === href || (also?.includes(pathname) ?? false);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-bold transition sm:px-4 ${
        active
          ? "bg-ink text-cream"
          : "text-ink/50 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

/**
 * Shared chrome for the signed-in areas: brand, primary navigation and the
 * sign-out utility at the far edge. Presentational on purpose — each page owns
 * its own session and data, so the shell adds no extra `/me` round trip.
 */
export function AppShell({
  children,
  variant = "attendee",
}: {
  children: ReactNode;
  variant?: AppShellVariant;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await logout();
    } finally {
      router.push("/sign-in");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream">
      <header className="sticky top-0 z-50 border-b border-ink/5 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-6 sm:h-20 sm:px-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-ink"
          >
            <Image
              src="/signal-mark.png"
              alt=""
              width={32}
              height={32}
              priority
              aria-hidden="true"
              className="size-8 shrink-0"
            />
            eventradr
          </Link>

          <nav aria-label="Primary" className="flex items-center gap-1">
            {NAV_BY_VARIANT[variant].map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut}
            aria-label="Sign out"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 px-3.5 text-sm font-bold text-ink/60 transition hover:border-ink/20 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            <span className="hidden sm:inline">
              {signingOut ? "Signing out…" : "Sign out"}
            </span>
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="h-3.5 w-3.5"
            />
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <footer className="border-t border-ink/5 px-6 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs font-medium text-ink/40 sm:flex-row">
          <span>Eventradr — find something worth showing up for.</span>
          <span>Lagos, Nigeria</span>
        </div>
      </footer>
    </div>
  );
}
