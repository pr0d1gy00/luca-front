"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { db } from "@/features/offline/database/schema";
import { useSyncStore } from "@/features/offline/store/useSyncStore";
import { useAuthStore } from "@/store/auth";
import apiClient from "@/lib/api/client";
import type { PatientAccount, UserProfile } from "@/features/auth/types";

/**
 * Initializes Dexie (IndexedDB) when the app starts.
 * Renders children immediately — DB initialization is async and non-blocking.
 * Shows a minimal loading overlay only on first-ever visit (cold start).
 * Coordinates background synchronization of pending profile updates.
 */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useSyncStore((s) => s.isOnline);
  const { userType, token, setAuth } = useAuthStore();

  useEffect(() => {
    // Open the database — triggers version 1 migrations
    db.open().catch((err) => {
      console.error("[OfflineProvider] IndexedDB open failed:", err);
    });
  }, []);

  // Background sync loop for offline-edited profiles
  useEffect(() => {
    if (!isOnline) return;

    const syncPendingProfiles = async () => {
      try {
        // 1. Sincronización de perfil de paciente
        const pendingPatient = localStorage.getItem(
          "pending_patient_profile_update",
        );
        if (pendingPatient && userType === "patient") {
          const payload = JSON.parse(pendingPatient);
          const { data } = await apiClient.patch<{
            status: string;
            user: PatientAccount;
          }>("/auth/patients/me", payload);
          setAuth(token ?? "", "patient", data.user, true);
          localStorage.removeItem("pending_patient_profile_update");
          toast.success(
            "¡Tus cambios de perfil se sincronizaron con el servidor!",
          );
        }

        // 2. Sincronización de perfil de usuario profesional (Doctor/Farmacia/Clínica)
        const pendingUser = localStorage.getItem("pending_user_profile_update");
        if (pendingUser && userType && userType !== "patient") {
          const payload = JSON.parse(pendingUser);
          const { data } = await apiClient.patch<{
            status: string;
            user: UserProfile;
          }>("/auth/users/me", payload);
          setAuth(token ?? "", userType, data.user, data.user.is_verified);
          localStorage.removeItem("pending_user_profile_update");
          toast.success(
            "¡Tus cambios de perfil profesional se sincronizaron con el servidor!",
          );
        }
      } catch (err) {
        console.error(
          "[OfflineProvider] Error syncing profiles in background:",
          err,
        );
      }
    };

    syncPendingProfiles();
  }, [isOnline, userType, token, setAuth]);

  return <>{children}</>;
}
