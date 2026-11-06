import type { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";

/**
 * Organizer area. Reuses the shared shell with organizer navigation — every
 * organizer is also an attendee, so a second chrome would only duplicate it.
 */
export default function OrganizerLayout({ children }: { children: ReactNode }) {
  return <AppShell variant="organizer">{children}</AppShell>;
}
