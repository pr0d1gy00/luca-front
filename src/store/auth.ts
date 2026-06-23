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

function resolveIsVerified(
  userType: "patient" | "user",
  user: PatientAccount | UserProfile | PatientProfile,
): boolean {
  if (userType === "patient") return false; // pacientes no requieren KYC

  const u = user as UserProfile;
  return u.is_verified ?? u.provider_profile?.is_verified ?? false;
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
    return p.avatar_url ?? "";
  }
  const u = user as UserProfile;
  return u.logo_url ?? "";
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
          name: user.full_name,
          email: user.email ?? "",
          avatar: resolveAvatar(userType, user),
        });
      },

      clearAuth: () =>
        set({
          token: null,
          userType: null,
          user: null,
          isVerified: false,
          role: "doctor",
          name: "",
          email: "",
          avatar: "",
        }),
    }),
    {
      name: "luca-auth-storage",
    },
  ),
);
