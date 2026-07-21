"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentApi } from "../api/appointmentApi";
import { appointmentOfflineService } from "../services/appointmentOfflineService";
import { getLocalTodayString } from "@/lib/utils";
import type { CreateAppointmentDTO, UpdateAppointmentDTO } from "../types";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: () => [...appointmentKeys.lists()] as const,
  upcoming: () => [...appointmentKeys.all, "upcoming"] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (uuid: string) => [...appointmentKeys.details(), uuid] as const,
  byPatient: (uuid: string) =>
    [...appointmentKeys.all, "patient", uuid] as const,
  byDoctor: (uuid: string) => [...appointmentKeys.all, "doctor", uuid] as const,
};

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get all appointments
 */
export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.list(),
    queryFn: async () => {
      try {
        const response = await appointmentApi.getAll();
        for (const apt of response.data) {
          await appointmentOfflineService.markSynced(apt.uuid);
        }
        return response.data;
      } catch {
        return appointmentOfflineService.getAll();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get upcoming appointments
 */
export function useUpcomingAppointments() {
  return useQuery({
    queryKey: appointmentKeys.upcoming(),
    queryFn: async () => {
      try {
        const response = await appointmentApi.getAll();
        const upcoming = response.data.filter((a) => {
          const today = getLocalTodayString();
          return a.date >= today && a.status !== "CANCELLED";
        });
        return upcoming;
      } catch {
        return appointmentOfflineService.getUpcoming();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get appointments by patient
 */
export function useAppointmentsByPatient(patientUuid: string) {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientUuid),
    queryFn: async () => {
      try {
        const response = await appointmentApi.getByPatient(patientUuid);
        return response.data;
      } catch {
        return appointmentOfflineService.getByPatient(patientUuid);
      }
    },
    enabled: !!patientUuid,
  });
}

/**
 * Get appointments by doctor
 */
export function useAppointmentsByDoctor(doctorUuid: string) {
  return useQuery({
    queryKey: appointmentKeys.byDoctor(doctorUuid),
    queryFn: async () => {
      try {
        const response = await appointmentApi.getByDoctor(doctorUuid);
        return response.data;
      } catch {
        return appointmentOfflineService.getByDoctor(doctorUuid);
      }
    },
    enabled: !!doctorUuid,
  });
}

/**
 * Get single appointment
 */
export function useAppointment(uuid: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(uuid),
    queryFn: async () => {
      try {
        const response = await appointmentApi.getByUUID(uuid);
        return response.data;
      } catch {
        return appointmentOfflineService.getByUUID(uuid);
      }
    },
    enabled: !!uuid,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create appointment — saves locally immediately, queues for sync
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAppointmentDTO) => {
      const isOnline = typeof window !== "undefined" && navigator.onLine;

      if (isOnline) {
        try {
          const res = await appointmentApi.create(data);
          const responseData =
            (res as { data?: Record<string, unknown> })?.data ??
            (res as unknown as Record<string, unknown>);
          if (responseData?.uuid && typeof responseData.uuid === "string") {
            await appointmentOfflineService.saveLocalSynced(responseData);
          }
          return { result: responseData, isOffline: false };
        } catch (err: unknown) {
          const errorObj = err as { response?: unknown; code?: string };
          const isNetworkError =
            !errorObj.response ||
            errorObj.code === "ERR_NETWORK" ||
            errorObj.code === "ECONNABORTED";

          if (isNetworkError) {
            console.warn(
              "[useCreateAppointment] Network error while online, falling back to offline IndexedDB:",
              err,
            );
            const appt = await appointmentOfflineService.create(data);
            return { result: appt, isOffline: true };
          }

          throw err;
        }
      } else {
        const appt = await appointmentOfflineService.create(data);
        return { result: appt, isOffline: true };
      }
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Update appointment — saves locally immediately, queues for sync
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uuid,
      data,
    }: {
      uuid: string;
      data: UpdateAppointmentDTO;
    }) => {
      return appointmentOfflineService.update(uuid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Update appointment status
 */
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, status }: { uuid: string; status: string }) => {
      return appointmentOfflineService.updateStatus(
        uuid,
        status as
          "PENDING" | "CONFIRMED" | "IN_ROOM" | "COMPLETED" | "CANCELLED",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Cancel appointment
 */
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      return appointmentOfflineService.updateStatus(uuid, "CANCELLED");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

/**
 * Delete appointment
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      return appointmentOfflineService.delete(uuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}
