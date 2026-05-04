import { create } from "zustand";

export type Role = "patient" | "doctor" | "clinic" | "pharmacy";

export interface AuthState {
  role: Role;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: "doctor",
  setRole: (role) => set({ role }),
}));
