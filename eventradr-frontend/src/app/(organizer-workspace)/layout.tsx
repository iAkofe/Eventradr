import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Organizer workspace: the event-creation surface.
 *
 * Deliberately shell-free — the design replaces the app chrome with a plain
 * white top bar carrying the brand and an "Organizer workspace" label, and the
 * page sits on the #FAFAFC workspace background.
 */
export default function OrganizerWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#FAFAFC] text-[#1D1725]">
      <header className="sticky top-0 z-50 border-b border-[#E7E3EC] bg-white">
        <div className="mx-auto flex h-[70px] w-full max-w-[80rem] items-center gap-3 px-6 sm:px-10">
          <Link
            href="/organizer/events"
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#1D1725]"
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

          <span
            aria-hidden="true"
            className="hidden h-5 w-px bg-[#E7E3EC] sm:block"
          />

          <span className="hidden text-[0.7rem] font-bold tracking-[0.18em] text-[#726E77] uppercase sm:block">
            Organizer workspace
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
