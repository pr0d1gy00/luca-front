"use client";

import { useState, useEffect, useCallback } from "react";

interface KeyboardShortcutState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

/**
 * Registers Cmd+K (Mac) / Ctrl+K (Win) to open, Escape to close.
 * Returns controlled `open` state and `setOpen` for external triggers.
 */
export function useKeyboardShortcut(): KeyboardShortcutState {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
      }
    },
    [open],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { open, setOpen };
}
