import apiClient from "@/lib/api/client";
import type {
  AppointmentsResponse,
  AppointmentResponse,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "../types";

/**
 * Appointment API — uses authenticated apiClient (JWT)
 */
export const appointmentApi = {
  /**
   * Get all appointments for current user
   */
  getAll: async (): Promise<AppointmentsResponse> => {
    const response = await apiClient.get<AppointmentsResponse>("/appointments");
    return response.data;
  },

  /**
   * Get appointments for a specific patient
   */
  getByPatient: async (patientUuid: string): Promise<AppointmentsResponse> => {
    const response = await apiClient.get<AppointmentsResponse>(
      "/appointments",
      {
        params: { patient_uuid: patientUuid },
      },
    );
    return response.data;
  },

  /**
   * Get appointments for a specific doctor
   */
  getByDoctor: async (doctorUuid: string): Promise<AppointmentsResponse> => {
    const response = await apiClient.get<AppointmentsResponse>(
      "/appointments",
      {
        params: { doctor_uuid: doctorUuid },
      },
    );
    return response.data;
  },

  /**
   * Get single appointment by UUID
   */
  getByUUID: async (uuid: string): Promise<AppointmentResponse> => {
    const response = await apiClient.get<AppointmentResponse>(
      `/appointments/${uuid}`,
    );
    return response.data;
  },

  /**
   * Create new appointment
   */
  create: async (data: CreateAppointmentDTO): Promise<AppointmentResponse> => {
    const payload = {
      patient_id: data.patientUuid,
      user_id: data.doctorUuid,
      clinic_branch_id: data.clinicBranchUuid || null,
      date: data.date,
      time: data.time,
      type: data.type,
      notes: data.notes || data.reason || "",
    };
    const response = await apiClient.post<AppointmentResponse>(
      "/appointments",
      payload,
    );
    return response.data;
  },

  /**
   * Update existing appointment
   */
  update: async (data: UpdateAppointmentDTO): Promise<AppointmentResponse> => {
    const payload = {
      ...(data.patientUuid && { patient_id: data.patientUuid }),
      ...(data.doctorUuid && { user_id: data.doctorUuid }),
      ...(data.clinicBranchUuid && { clinic_branch_id: data.clinicBranchUuid }),
      ...(data.date && { date: data.date }),
      ...(data.time && { time: data.time }),
      ...(data.type && { type: data.type }),
      ...(data.notes && { notes: data.notes }),
    };
    const response = await apiClient.put<AppointmentResponse>(
      `/appointments/${data.uuid}`,
      payload,
    );
    return response.data;
  },

  /**
   * Update appointment status
   */
  updateStatus: async (
    uuid: string,
    status: string,
  ): Promise<AppointmentResponse> => {
    const response = await apiClient.patch<AppointmentResponse>(
      `/appointments/${uuid}/status`,
      { status },
    );
    return response.data;
  },

  /**
   * Cancel appointment
   */
  cancel: async (uuid: string): Promise<AppointmentResponse> => {
    const response = await apiClient.post<AppointmentResponse>(
      `/appointments/${uuid}/cancel`,
    );
    return response.data;
  },

  /**
   * Delete appointment (soft delete)
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/appointments/${uuid}`);
  },

  getPatientAppointments: async (
    page: number = 1,
    filter: string = "all",
  ): Promise<unknown> => {
    const response = await apiClient.get<unknown>("/patients/me/appointments", {
      params: { page, filter },
    });
    return response.data;
  },

  getPatientAppointmentDetail: async (uuid: string): Promise<unknown> => {
    const response = await apiClient.get<unknown>(
      `/patients/me/appointments/${uuid}`,
    );
    return response.data;
  },
};
