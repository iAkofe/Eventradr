"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { loadSession } from "@/lib/api/session";
import { EventForm } from "@/components/organizer/EventForm";

/**
 * /organizer/events/new — start a draft.
 *
 * Creating an event is guarded by the organizer profile, so the session is
 * checked before the form mounts and the visitor is sent to setup if it is
 * missing.
 */
export default function NewEventPage() {
  const router = useRouter();
  const [organizerName, setOrganizerName] = useState<string | null>(null);

  const load = useCallback(() => {
    loadSession()
      .then((user) => {
        if (!user.organizer) {
          router.replace("/organizer/setup");
          return;
        }
        setOrganizerName(user.organizer.name);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/organizer/sign-in");
          return;
        }
        // A transient read failure must not block a genuine draft; the save
        // call surfaces any real problem.
        setOrganizerName("");
      });
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (organizerName === null) {
    return (
      <p className="mx-auto flex w-full max-w-[74rem] items-center gap-3 px-6 pt-14 text-sm font-medium text-[#726E77] sm:px-10">
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
        Checking your account…
      </p>
    );
  }

  return <EventForm mode="create" organizerName={organizerName} />;
}
