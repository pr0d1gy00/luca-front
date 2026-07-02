import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  PatientAccount,
  PatientProfile,
  UserProfile,
} from "@/features/auth/types";

export type Role = "patient" | "doctor" | "clinic" | "pharmacy";

export interface AuthState {
  // Legacy/Compatibility
  role: Role;
  name: string;
  email: string;
  avatar?: string;

  // Real auth state
  token: string | null;
  userType: "patient" | "user" | null;
  user: PatientAccount | UserProfile | PatientProfile | null;
  isVerified: boolean;

  // Actions
  setRole: (role: Role) => void;
  setAuth: (
    token: string,
    userType: "patient" | "user",
    user: PatientAccount | UserProfile | PatientProfile,
    isVerified?: boolean,
  ) => void;
  clearAuth: () => void;
}

// ── Cookie helpers (client-side only) ─────────────────────────
const AUTH_COOKIE = "auth_token";

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

// ── Internal helpers ──────────────────────────────────────────
function resolveIsVerified(
  userType: "patient" | "user",
  user: PatientAccount | UserProfile | PatientProfile,
): boolean {
  if (userType === "patient") return true;
  const u = user as UserProfile;
  return (
    u.is_verified ?? u.isVerified ?? u.provider_profile?.is_verified ?? false
  );
}

function resolveRole(
  userType: "patient" | "user",
  user: PatientAccount | UserProfile | PatientProfile,
): Role {
  if (userType === "patient") return "patient";
  const u = user as UserProfile;
  if (u.role === "DOCTOR") return "doctor";
  if (u.role === "PROVIDER") return "pharmacy";
  if (u.role === "ADMIN") return "clinic";
  return "doctor";
}

function resolveAvatar(
  userType: "patient" | "user",
  user: PatientAccount | UserProfile | PatientProfile,
): string {
  if (userType === "patient") {
    const p = user as PatientAccount;
    return p.avatar_url ?? p.avatarUrl ?? "";
  }
  const u = user as UserProfile;
  return u.logo_url ?? u.logoUrl ?? "";
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: "doctor",
      name: "",
      email: "",
      avatar: "",
      token: null,
      userType: null,
      user: null,
      isVerified: false,

      setRole: (role) => set({ role }),

      setAuth: (token, userType, user, isVerified) => {
        const verified = isVerified ?? resolveIsVerified(userType, user);

        set({
          token,
          userType,
          user,
          isVerified: verified,
          role: resolveRole(userType, user),
          name: user.fullName || user.full_name || "Usuario",
          email: user.email ?? "",
          avatar: resolveAvatar(userType, user),
        });

        // Sincronizar cookie para middleware (Next.js server-side)
        setCookie(AUTH_COOKIE, token);
      },

      clearAuth: () => {
        set({
          token: null,
          userType: null,
          user: null,
          isVerified: false,
          role: "doctor",
          name: "",
          email: "",
          avatar: "",
        });

        deleteCookie(AUTH_COOKIE);
      },
    }),
    {
      name: "luca-auth-storage",
    },
  ),
);
