import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

/**
 * Attendee area. Every route under this group is wrapped in the shared shell
 * (brand, primary nav, sign-out). Route groups do not affect the URL, so
 * `/dashboard` and `/profile` keep their paths.
 */
export default function AttendeeLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
