"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import "lenis/dist/lenis.css";

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    el.style.opacity = "1";
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.background = `radial-gradient(600px circle at ${event.clientX}px ${event.clientY}px, rgba(91,53,245,0.10), transparent 60%)`;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] opacity-0 transition-opacity duration-500"
    />
  );
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      smoothWheel: true,
      orientation: "vertical",
      gestureOrientation: "vertical",
      autoRaf: true,
      autoResize: true,
      anchors: { offset: -88, duration: 1.15 },
      respectReducedMotion: true,
      stopInertiaOnNavigate: true,
      overscroll: false,
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <CursorGlow />
      {children}
    </MotionConfig>
  );
}
