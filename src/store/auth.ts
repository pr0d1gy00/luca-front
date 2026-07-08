import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  PatientAccount,
  PatientProfile,
  UserProfile,
} from "@/features/auth/types";

export type Role = "patient" | "doctor" | "clinic" | "pharmacy" | null;

export interface AuthState {
  // Legacy/Compatibility
  role: Role;
  name: string;
  email: string;
  avatar?: string;

  // Real auth state
  userType: "patient" | "user" | null;
  user: PatientAccount | UserProfile | PatientProfile | null;
  isVerified: boolean;

  // Actions
  setRole: (role: Role) => void;
  setAuth: (
    userType: "patient" | "user",
    user: PatientAccount | UserProfile | PatientProfile,
    isVerified?: boolean,
  ) => void;
  clearAuth: () => void;
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
      role: null,
      name: "",
      email: "",
      avatar: "",
      userType: null,
      user: null,
      isVerified: false,

      setRole: (role) => set({ role }),

      setAuth: (userType, user, isVerified) => {
        console.log(
          "[setAuth] Called with userType:",
          userType,
          "isVerified:",
          isVerified,
        );
        const actualUser =
          user && typeof user === "object" && "user" in user
            ? ((user as Record<string, unknown>).user as
              | PatientAccount
              | UserProfile
              | PatientProfile)
            : user;

        const verified = isVerified ?? resolveIsVerified(userType, actualUser);
        console.log(
          "[setAuth] actualUser role:",
          (actualUser as { role?: string }).role,
        );
        console.log(
          "[setAuth] Full state before set:",
          JSON.stringify({
            userType,
            isVerified: verified,
            user: actualUser
              ? {
                fullName: (actualUser as { fullName?: string }).fullName,
                role: (actualUser as { role?: string }).role,
              }
              : null,
          }),
        );

        set({
          userType,
          user: actualUser,
          isVerified: verified,
          role: resolveRole(userType, actualUser),
          name: actualUser.fullName || actualUser.full_name || "Usuario",
          email: actualUser.email ?? "",
          avatar: resolveAvatar(userType, actualUser),
        });
      },

      clearAuth: () => {
        // Seteamos role a null, así el DashboardPage no flashea el componente por defecto.
        set({
          userType: null,
          user: null,
          isVerified: false,
          role: null,
          name: "",
          email: "",
          avatar: "",
        });
      },
    }),
    {
      name: "luca-auth-storage",
      // SessionStorage es más seguro que localStorage: se limpia al cerrar pestaña
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        role: state.role,
        name: state.name,
        email: state.email,
        avatar: state.avatar,
        userType: state.userType,
        isVerified: state.isVerified,
        user: state.user,
      }),
    },
  ),
);
