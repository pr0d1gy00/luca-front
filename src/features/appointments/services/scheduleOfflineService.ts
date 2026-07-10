import {
  db,
  type DoctorSchedule,
  type ScheduleException,
  type Weekday,
  type ExceptionType,
} from "@/features/offline/database/schema";
import { queueService } from "@/features/offline/services/queueService";
import {
  generateUUID,
  getCurrentTimestamp,
  serverToClient,
} from "@/features/offline/utils/uuid";
import type { EntityType } from "@/features/offline/types/sync.types";
import { scheduleApi } from "../api/scheduleApi";

const SCHEDULE_ENTITY: EntityType = "doctor_schedules";
const EXCEPTION_ENTITY: EntityType = "schedule_exceptions";

export const scheduleOfflineService = {
  /**
   * Create schedule: direct to backend if online, fallback to local IndexedDB and sync queue
   */
  createSchedule: async (
    doctorUuid: string,
    data: {
      weekday: Weekday;
      startTime: string; // HH:MM
      endTime: string; // HH:MM
      appointmentDuration: number;
      maxPerSlot: number;
    },
  ): Promise<DoctorSchedule> => {
    const now = getCurrentTimestamp();

    // 1. Try online write first
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const response = await scheduleApi.createSchedule({
          weekday: data.weekday,
          start_time: data.startTime,
          end_time: data.endTime,
          appointment_duration: data.appointmentDuration,
          max_per_slot: data.maxPerSlot,
        });

        // Successfully saved in backend. Map to client structure.
        const clientData = serverToClient<DoctorSchedule>({
          ...response.data,
          doctor_uuid: doctorUuid, // Keep doctorUuid mapped correctly
        });

        // Save directly as synced locally
        const existing = await db.doctorSchedules.get(clientData.uuid);
        if (existing) {
          await db.doctorSchedules.put({
            ...existing,
            ...clientData,
            _syncStatus: "synced",
            deletedAt: null,
          });
        } else {
          await db.doctorSchedules.add({
            ...clientData,
            _syncStatus: "synced",
          });
        }

        return clientData;
      } catch (err) {
        console.warn(
          "Failed to create schedule online, falling back to local/sync queue:",
          err,
        );
        // Fallback to offline logic below
      }
    }

    // 2. Offline Fallback
    const uuid = generateUUID();

    // Check if there is already a schedule for this weekday and doctor (including soft-deleted)
    const existing = await db.doctorSchedules
      .where("doctorUuid")
      .equals(doctorUuid)
      .filter((s) => s.weekday === data.weekday)
      .first();

    if (existing) {
      // Reuse the record and update it, undoing any soft deletion
      const updated: DoctorSchedule = {
        ...existing,
        startTime: data.startTime,
        endTime: data.endTime,
        appointmentDuration: data.appointmentDuration,
        maxPerSlot: data.maxPerSlot,
        isActive: true,
        deletedAt: null,
        updatedAt: now,
        _syncStatus: "pending",
      };
      await db.doctorSchedules.put(updated);
      await queueService.enqueue(SCHEDULE_ENTITY, "update", updated);
      return updated;
    }

    const schedule: DoctorSchedule = {
      uuid,
      doctorUuid,
      weekday: data.weekday,
      startTime: data.startTime,
      endTime: data.endTime,
      appointmentDuration: data.appointmentDuration,
      maxPerSlot: data.maxPerSlot,
      isActive: true,
      updatedAt: now,
      createdAt: now,
      _syncStatus: "pending",
    };

    await db.doctorSchedules.add(schedule);
    await queueService.enqueue(SCHEDULE_ENTITY, "create", schedule);

    return schedule;
  },

  /**
   * Update schedule: (Unused by UI currently, but refactored to support online-first)
   */
  updateSchedule: async (
    uuid: string,
    data: {
      startTime?: string;
      endTime?: string;
      appointmentDuration?: number;
      maxPerSlot?: number;
      isActive?: boolean;
    },
  ): Promise<DoctorSchedule | null> => {
    const existing = await db.doctorSchedules.get(uuid);
    if (!existing) return null;

    const now = getCurrentTimestamp();

    // 1. Try online first
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const response = await scheduleApi.createSchedule({
          weekday: existing.weekday,
          start_time: data.startTime ?? existing.startTime,
          end_time: data.endTime ?? existing.endTime,
          appointment_duration:
            data.appointmentDuration ?? existing.appointmentDuration,
          max_per_slot: data.maxPerSlot ?? existing.maxPerSlot,
        });

        const clientData = serverToClient<DoctorSchedule>({
          ...response.data,
          doctor_uuid: existing.doctorUuid,
        });

        await db.doctorSchedules.put({
          ...existing,
          ...clientData,
          _syncStatus: "synced",
        });

        return clientData;
      } catch (err) {
        console.warn(
          "Failed to update schedule online, falling back to local queue:",
          err,
        );
      }
    }

    // 2. Offline Fallback
    const updated: DoctorSchedule = {
      ...existing,
      ...data,
      uuid,
      updatedAt: now,
      _syncStatus: "pending",
    };

    await db.doctorSchedules.put(updated);
    await queueService.enqueue(SCHEDULE_ENTITY, "update", updated);

    return updated;
  },

  /**
   * Delete schedule: direct to backend if online, fallback to local soft-delete and sync queue
   */
  deleteSchedule: async (uuid: string): Promise<boolean> => {
    const existing = await db.doctorSchedules.get(uuid);
    if (!existing) return false;

    const now = getCurrentTimestamp();

    // 1. Try online first
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        await scheduleApi.deleteSchedule(uuid);
        // If successful online, delete from local IndexedDB entirely
        await db.doctorSchedules.delete(uuid);
        return true;
      } catch (err) {
        console.warn(
          "Failed to delete schedule online, falling back to local queue:",
          err,
        );
      }
    }

    // 2. Offline Fallback
    await db.doctorSchedules.update(uuid, {
      updatedAt: now,
      deletedAt: now,
      _syncStatus: "pending",
    });

    await queueService.enqueue(SCHEDULE_ENTITY, "delete", { uuid });

    return true;
  },

  /**
   * Get all active schedules for a doctor
   */
  getSchedules: async (doctorUuid: string): Promise<DoctorSchedule[]> => {
    const list = await db.doctorSchedules
      .where("doctorUuid")
      .equals(doctorUuid)
      .toArray();
    return list.filter((s) => !s.deletedAt);
  },

  /**
   * Create schedule exception: direct to backend if online, fallback to local IndexedDB and sync queue
   */
  createException: async (
    doctorUuid: string,
    data: {
      exceptionDate: string; // YYYY-MM-DD
      exceptionType: ExceptionType;
      customStartTime?: string | null;
      customEndTime?: string | null;
      reason?: string | null;
    },
  ): Promise<ScheduleException> => {
    const now = getCurrentTimestamp();

    // 1. Try online write first
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        const response = await scheduleApi.createException({
          exception_date: data.exceptionDate,
          exception_type: data.exceptionType,
          custom_start_time: data.customStartTime ?? null,
          custom_end_time: data.customEndTime ?? null,
          reason: data.reason ?? null,
        });

        const clientData = serverToClient<ScheduleException>({
          ...response.data,
          doctor_uuid: doctorUuid,
        });

        // Save directly as synced locally
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

        return clientData;
      } catch (err) {
        console.warn(
          "Failed to create exception online, falling back to local/sync queue:",
          err,
        );
      }
    }

    // 2. Offline Fallback
    const uuid = generateUUID();

    // Check if exception already exists for this date and doctor
    const existing = await db.scheduleExceptions
      .where("doctorUuid")
      .equals(doctorUuid)
      .filter((e) => e.exceptionDate === data.exceptionDate)
      .first();

    if (existing) {
      const updated: ScheduleException = {
        ...existing,
        exceptionType: data.exceptionType,
        customStartTime: data.customStartTime ?? null,
        customEndTime: data.customEndTime ?? null,
        reason: data.reason ?? null,
        deletedAt: null,
        updatedAt: now,
        _syncStatus: "pending",
      };
      await db.scheduleExceptions.put(updated);
      await queueService.enqueue(EXCEPTION_ENTITY, "update", updated);
      return updated;
    }

    const exception: ScheduleException = {
      uuid,
      doctorUuid,
      exceptionDate: data.exceptionDate,
      exceptionType: data.exceptionType,
      customStartTime: data.customStartTime ?? null,
      customEndTime: data.customEndTime ?? null,
      reason: data.reason ?? null,
      updatedAt: now,
      createdAt: now,
      _syncStatus: "pending",
    };

    await db.scheduleExceptions.add(exception);
    await queueService.enqueue(EXCEPTION_ENTITY, "create", exception);

    return exception;
  },

  /**
   * Delete exception: direct to backend if online, fallback to local soft-delete and sync queue
   */
  deleteException: async (uuid: string): Promise<boolean> => {
    const existing = await db.scheduleExceptions.get(uuid);
    if (!existing) return false;

    const now = getCurrentTimestamp();

    // 1. Try online first
    if (typeof window !== "undefined" && navigator.onLine) {
      try {
        await scheduleApi.deleteException(uuid);
        // If successful online, delete from local IndexedDB entirely
        await db.scheduleExceptions.delete(uuid);
        return true;
      } catch (err) {
        console.warn(
          "Failed to delete exception online, falling back to local queue:",
          err,
        );
      }
    }

    // 2. Offline Fallback
    await db.scheduleExceptions.update(uuid, {
      updatedAt: now,
      deletedAt: now,
      _syncStatus: "pending",
    });

    await queueService.enqueue(EXCEPTION_ENTITY, "delete", { uuid });

    return true;
  },

  /**
   * Get all active exceptions for a doctor
   */
  getExceptions: async (doctorUuid: string): Promise<ScheduleException[]> => {
    const list = await db.scheduleExceptions
      .where("doctorUuid")
      .equals(doctorUuid)
      .toArray();
    return list.filter((e) => !e.deletedAt);
  },

  /**
   * Mark schedule as synced
   */
  markScheduleSynced: async (uuid: string): Promise<void> => {
    await db.doctorSchedules.update(uuid, { _syncStatus: "synced" });
  },

  /**
   * Mark exception as synced
   */
  markExceptionSynced: async (uuid: string): Promise<void> => {
    await db.scheduleExceptions.update(uuid, { _syncStatus: "synced" });
  },
};
