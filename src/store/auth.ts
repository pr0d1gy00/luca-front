import { create } from "zustand";

export type Role = "patient" | "doctor" | "clinic" | "pharmacy";

export interface AuthState {
  role: Role;
  name: string;
  avatar?: string;
  email: string;
  setRole: (role: Role) => void;
  setUser: (data: { name: string; email: string; avatar?: string }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: "patient",
  name: "",
  email: "",
  setRole: (role) => set({ role }),
  setUser: (data) =>
    set({ name: data.name, email: data.email, avatar: data.avatar }),
}));
