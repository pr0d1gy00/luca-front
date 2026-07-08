"use client";

import { createContext, useContext } from "react";

/** Shared context so SmartHeader can open the mobile drawer from the dashboard layout. */
export interface DrawerContextType {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const DrawerContext = createContext<DrawerContextType | null>(null);

export function useDrawer() {
  return useContext(DrawerContext);
}

export const DrawerToggleContext = createContext<(() => void) | null>(null);

export function useDrawerToggle() {
  return useContext(DrawerToggleContext);
}
