"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Server-safe media query hook using `useSyncExternalStore`.
 * Returns `false` during SSR (via `getServerSnapshot`), resolves to actual
 * `matchMedia` result on mount. Mobile-first default: `false` = mobile.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
