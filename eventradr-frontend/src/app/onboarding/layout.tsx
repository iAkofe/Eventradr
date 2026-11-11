import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 bg-[#FAFAFC] text-[#1A0B2E]">
      <Link
        href="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#1A0B2E] sm:top-8 sm:left-8 lg:top-12 lg:left-16"
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

      <div className="hidden flex-1 pt-36 lg:block">
        <div className="relative h-[calc(100vh-9rem)] min-h-[720px] overflow-hidden rounded-tr-[64px]">
          <Image
            src="/event-image.png"
            alt="Friends enjoying an event together"
            fill
            priority
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex min-h-screen w-full flex-1 items-center justify-center px-5 pt-28 pb-8 sm:px-8 sm:pt-32 sm:pb-10 lg:px-10 lg:pt-12">
        <div className="w-full max-w-[34rem] rounded-[32px] border border-[#DAD3E1] bg-white px-5 py-7 shadow-[0_24px_60px_-28px_rgba(26,11,46,0.22)] sm:rounded-[40px] sm:px-8 sm:py-10 lg:max-w-[39rem] lg:rounded-[48px] lg:px-10 lg:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
