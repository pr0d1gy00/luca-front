import apiClient from "@/lib/api/client";
import type {
  Weekday,
  ExceptionType,
} from "@/features/offline/database/schema";

export interface DoctorScheduleResponse {
  id: string;
  uuid: string;
  weekday: Weekday;
  start_time: string; // HH:MM:SS from backend
  end_time: string; // HH:MM:SS from backend
  appointment_duration: number;
  max_per_slot: number;
  is_active: boolean;
  updated_at: string;
  created_at: string;
}

export interface ScheduleExceptionResponse {
  id: string;
  uuid: string;
  exception_date: string; // YYYY-MM-DD
  exception_type: ExceptionType;
  custom_start_time: string | null;
  custom_end_time: string | null;
  reason: string | null;
  updated_at: string;
  created_at: string;
}

export interface CreateScheduleDTO {
  weekday: Weekday;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  appointmentDuration: number;
  maxPerSlot: number;
}

export interface CreateExceptionDTO {
  exceptionDate: string; // YYYY-MM-DD
  exceptionType: ExceptionType;
  customStartTime?: string | null; // HH:MM
  customEndTime?: string | null; // HH:MM
  reason?: string | null;
}

export const scheduleApi = {
  getSchedules: async (): Promise<{ data: DoctorScheduleResponse[] }> => {
    const response = await apiClient.get<{ data: DoctorScheduleResponse[] }>(
      "/schedules/my",
    );
    return response.data;
  },

  createSchedule: async (
    data: CreateScheduleDTO,
  ): Promise<{ data: DoctorScheduleResponse }> => {
    const response = await apiClient.post<{ data: DoctorScheduleResponse }>(
      "/schedules/my",
      {
        weekday: data.weekday,
        start_time: data.startTime,
        end_time: data.endTime,
        appointment_duration: data.appointmentDuration,
        max_per_slot: data.maxPerSlot,
      },
    );
    return response.data;
  },

  updateSchedule: async (
    id: string,
    data: Partial<CreateScheduleDTO> & { isActive?: boolean },
  ): Promise<{ data: DoctorScheduleResponse }> => {
    const body: Record<string, unknown> = {};
    if (data.startTime) body.start_time = data.startTime;
    if (data.endTime) body.end_time = data.endTime;
    if (data.appointmentDuration !== undefined)
      body.appointment_duration = data.appointmentDuration;
    if (data.maxPerSlot !== undefined) body.max_per_slot = data.maxPerSlot;
    if (data.isActive !== undefined) body.is_active = data.isActive;

    const response = await apiClient.put<{ data: DoctorScheduleResponse }>(
      `/schedules/my/${id}`,
      body,
    );
    return response.data;
  },

  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedules/my/${id}`);
  },

  getExceptions: async (params?: {
    from_date?: string;
    to_date?: string;
  }): Promise<{ data: ScheduleExceptionResponse[] }> => {
    const response = await apiClient.get<{ data: ScheduleExceptionResponse[] }>(
      "/schedule-exceptions/my",
      {
        params: params
          ? {
              from_date: params.from_date,
              to_date: params.to_date,
            }
          : undefined,
      },
    );
    return response.data;
  },

  createException: async (
    data: CreateExceptionDTO,
  ): Promise<{ data: ScheduleExceptionResponse }> => {
    const response = await apiClient.post<{ data: ScheduleExceptionResponse }>(
      "/schedule-exceptions/my",
      {
        exception_date: data.exceptionDate,
        exception_type: data.exceptionType,
        custom_start_time: data.customStartTime,
        custom_end_time: data.customEndTime,
        reason: data.reason,
      },
    );
    return response.data;
  },

  deleteException: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule-exceptions/my/${id}`);
  },
};
