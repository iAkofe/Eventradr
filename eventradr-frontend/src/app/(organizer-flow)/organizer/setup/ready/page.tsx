import Link from "next/link";

export default function OrganizerReadyPage() {
  return (
    <section className="w-full">
      <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.02] tracking-tight text-[#1A0B2E]">
        Your organizer profile is ready
      </h1>
      <p className="mt-4 text-base font-medium text-[#726E77] sm:text-lg">
        Use this account to organize events and book tickets.
      </p>

      <Link
        href="/organizer/events"
        className="mt-10 flex h-14 items-center justify-center rounded-full bg-[#5B35F5] px-6 text-base font-semibold text-white transition hover:bg-[#4B28E1]"
      >
        Manage events
      </Link>
    </section>
  );
}
