"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface ScrollState {
  isCompact: boolean;
  scrollDirection: "up" | "down";
}

const COMPACT_THRESHOLD = 100;

/**
 * Tracks window scroll position with rAF throttling.
 * Returns `isCompact` (true after 100px) and `scrollDirection`.
 * GPU-friendly: drives CSS class toggles, never layout thrashing reads.
 */
export function useScrollDirection(): ScrollState {
  const [state, setState] = useState<ScrollState>({
    isCompact: false,
    scrollDirection: "up",
  });

  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  const handleScroll = useCallback(() => {
    if (rafIdRef.current !== null) return;

    rafIdRef.current = requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollYRef.current;

      const isCompact = currentScrollY > COMPACT_THRESHOLD;
      const scrollDirection: "up" | "down" =
        currentScrollY <= prevScrollY ? "up" : "down";

      lastScrollYRef.current = currentScrollY;

      setState((prev) => {
        if (
          prev.isCompact === isCompact &&
          prev.scrollDirection === scrollDirection
        ) {
          return prev;
        }
        return { isCompact, scrollDirection };
      });

      rafIdRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [handleScroll]);

  return state;
}
