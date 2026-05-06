"use client";

import { createContext, useContext } from "react";

/** Shared context so SmartHeader can open the mobile drawer from the dashboard layout. */
export const DrawerToggleContext = createContext<(() => void) | null>(null);

export function useDrawerToggle() {
  return useContext(DrawerToggleContext);
}
