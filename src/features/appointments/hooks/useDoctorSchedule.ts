"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  scheduleApi,
  type CreateScheduleDTO,
  type CreateExceptionDTO,
} from "../api/scheduleApi";
import { scheduleOfflineService } from "../services/scheduleOfflineService";
import { syncService } from "@/features/offline/services/syncService";
import {
  db,
  type DoctorSchedule,
  type ScheduleException,
  type Weekday,
} from "@/features/offline/database/schema";
import { serverToClient } from "@/features/offline/utils/uuid";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────
export const doctorScheduleKeys = {
  all: ["doctor-schedules"] as const,
  schedules: (doctorUuid: string) =>
    [...doctorScheduleKeys.all, "schedules", doctorUuid] as const,
  exceptions: (doctorUuid: string) =>
    [...doctorScheduleKeys.all, "exceptions", doctorUuid] as const,
};

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get recurrent schedules for a doctor
 */
export function useDoctorSchedulesQuery(doctorUuid: string) {
  return useQuery({
    queryKey: doctorScheduleKeys.schedules(doctorUuid),
    queryFn: async () => {
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          const response = await scheduleApi.getSchedules();

          // Save to IndexedDB
          for (const s of response.data) {
            const clientData = serverToClient<DoctorSchedule>({
              ...s,
              doctor_uuid: doctorUuid, // Backend uses user_id, map to doctorUuid
            });

            // Check if exists
            const existing = await db.doctorSchedules.get(clientData.uuid);
            if (existing) {
              // Update local
              await db.doctorSchedules.put({
                ...existing,
                ...clientData,
                _syncStatus: "synced",
                deletedAt: null,
              });
            } else {
              // Add local
              await db.doctorSchedules.add({
                ...clientData,
                _syncStatus: "synced",
              });
            }
          }

          return scheduleOfflineService.getSchedules(doctorUuid);
        } catch (err) {
          console.warn(
            "Failed to fetch schedules online, falling back to offline db:",
            err,
          );
          return scheduleOfflineService.getSchedules(doctorUuid);
        }
      }
      return scheduleOfflineService.getSchedules(doctorUuid);
    },
    enabled: !!doctorUuid,
  });
}

/**
 * Get schedule exceptions for a doctor
 */
export function useDoctorExceptionsQuery(doctorUuid: string) {
  return useQuery({
    queryKey: doctorScheduleKeys.exceptions(doctorUuid),
    queryFn: async () => {
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          const response = await scheduleApi.getExceptions();

          // Save to IndexedDB
          for (const e of response.data) {
            const clientData = serverToClient<ScheduleException>({
              ...e,
              doctor_uuid: doctorUuid, // Backend uses user_id, map to doctorUuid
            });

            // Check if exists
            const existing = await db.scheduleExceptions.get(clientData.uuid);
            if (existing) {
              await db.scheduleExceptions.put({
                ...existing,
                ...clientData,
                _syncStatus: "synced",
                deletedAt: null,
              });
            } else {
              await db.scheduleExceptions.add({
                ...clientData,
                _syncStatus: "synced",
              });
            }
          }

          return scheduleOfflineService.getExceptions(doctorUuid);
        } catch (err) {
          console.warn(
            "Failed to fetch exceptions online, falling back to offline db:",
            err,
          );
          return scheduleOfflineService.getExceptions(doctorUuid);
        }
      }
      return scheduleOfflineService.getExceptions(doctorUuid);
    },
    enabled: !!doctorUuid,
  });
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Save a recurrent weekday schedule
 */
export function useSaveDoctorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorUuid,
      data,
    }: {
      doctorUuid: string;
      data: {
        weekday: Weekday;
        startTime: string;
        endTime: string;
        appointmentDuration: number;
        maxPerSlot: number;
      };
    }) => {
      return scheduleOfflineService.createSchedule(doctorUuid, data);
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorScheduleKeys.schedules(variables.doctorUuid),
      });
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          await syncService.sync();
          queryClient.invalidateQueries({
            queryKey: doctorScheduleKeys.schedules(variables.doctorUuid),
          });
        } catch (err) {
          console.error("Auto-sync schedules failed:", err);
        }
      }
    },
  });
}

/**
 * Delete a weekday schedule
 */
export function useDeleteDoctorSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorUuid,
      uuid,
    }: {
      doctorUuid: string;
      uuid: string;
    }) => {
      return scheduleOfflineService.deleteSchedule(uuid);
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorScheduleKeys.schedules(variables.doctorUuid),
      });
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          await syncService.sync();
          queryClient.invalidateQueries({
            queryKey: doctorScheduleKeys.schedules(variables.doctorUuid),
          });
        } catch (err) {
          console.error("Auto-sync schedules failed:", err);
        }
      }
    },
  });
}

/**
 * Create a schedule exception
 */
export function useSaveDoctorException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorUuid,
      data,
    }: {
      doctorUuid: string;
      data: {
        exceptionDate: string;
        exceptionType: ScheduleException["exceptionType"];
        customStartTime?: string | null;
        customEndTime?: string | null;
        reason?: string | null;
      };
    }) => {
      return scheduleOfflineService.createException(doctorUuid, data);
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorScheduleKeys.exceptions(variables.doctorUuid),
      });
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          await syncService.sync();
          queryClient.invalidateQueries({
            queryKey: doctorScheduleKeys.exceptions(variables.doctorUuid),
          });
        } catch (err) {
          console.error("Auto-sync exceptions failed:", err);
        }
      }
    },
  });
}

/**
 * Delete a schedule exception
 */
export function useDeleteDoctorException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      doctorUuid,
      uuid,
    }: {
      doctorUuid: string;
      uuid: string;
    }) => {
      return scheduleOfflineService.deleteException(uuid);
    },
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorScheduleKeys.exceptions(variables.doctorUuid),
      });
      if (typeof window !== "undefined" && navigator.onLine) {
        try {
          await syncService.sync();
          queryClient.invalidateQueries({
            queryKey: doctorScheduleKeys.exceptions(variables.doctorUuid),
          });
        } catch (err) {
          console.error("Auto-sync exceptions failed:", err);
        }
      }
    },
  });
}
