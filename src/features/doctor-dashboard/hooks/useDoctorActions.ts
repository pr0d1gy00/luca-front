"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDoctorDashboardQuery, doctorDashboardKeys } from "./useDoctorDashboardQuery";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import type { ActionItem } from "../types";
import { toast } from "sonner";

export function useDoctorActions() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const { data, isLoading, error } = useDoctorDashboardQuery();

  const actions: ActionItem[] = (data?.actions ?? []) as ActionItem[];

  const toggleActionMutation = useMutation({
    mutationFn: async (id: string) => {
      const type = id.split("-")[0];
      const uuid = id.substring(type.length + 1); // Extraer el UUID real después del prefijo (ej: "lab-uuid" -> "uuid")

      if (!isOnline) {
        // --- Modo Offline (Actualizar localmente en Dexie) ---
        if (type === "lab") {
          await db.labResults.update(uuid, {
            reviewedAt: new Date().toISOString(),
            status: "COMPLETED",
            _syncStatus: "updated",
            updatedAt: new Date().toISOString(),
          });
        } else if (type === "follow") {
          await db.followUps.update(uuid, {
            status: "RESPONDED",
            _syncStatus: "updated",
            updatedAt: new Date().toISOString(),
          });
        } else if (type === "call") {
          await db.appointments.update(uuid, {
            status: "CANCELLED",
            _syncStatus: "updated",
            updatedAt: new Date().toISOString(),
          });
        }
        return { success: true, offline: true };
      }

      // --- Modo Online (Llamar a la API del servidor) ---
      if (type === "lab") {
        await apiClient.post(`/lab-results/${uuid}/review`);
      } else if (type === "follow") {
        await apiClient.patch(`/follow-ups/${uuid}`, {
          status: "RESPONDED",
        });
      } else if (type === "call") {
        await apiClient.patch(`/appointments/${uuid}`, {
          status: "cancelled",
        });
      }
      return { success: true, offline: false };
    },
    onSuccess: (res) => {
      // Invalidar query para recargar datos dinámicos en tiempo real
      queryClient.invalidateQueries({
        queryKey: doctorDashboardKeys.summary(),
      });
      toast.success(
        res.offline
          ? "Acción completada y guardada localmente (Modo Offline)"
          : "Acción completada con éxito"
      );
    },
    onError: (err) => {
      console.error("[useDoctorActions] Mutation error:", err);
      toast.error("No se pudo completar la acción");
    },
  });

  const toggleAction = (id: string) => {
    toggleActionMutation.mutate(id);
  };

  const pendingCount = actions.filter((a) => !a.completed).length;

  return {
    actions,
    toggleAction,
    pendingCount,
    isLoading: isLoading || toggleActionMutation.isPending,
    error,
  };
}
