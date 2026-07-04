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
    const response = await apiClient.post<AppointmentResponse>(
      "/appointments",
      data,
    );
    return response.data;
  },

  /**
   * Update existing appointment
   */
  update: async (data: UpdateAppointmentDTO): Promise<AppointmentResponse> => {
    const response = await apiClient.put<AppointmentResponse>(
      `/appointments/${data.uuid}`,
      data,
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

  /**
   * Get paginated appointments for the authenticated patient
   */
  getPatientAppointments: async (page: number = 1): Promise<unknown> => {
    const response = await apiClient.get<unknown>("/patients/me/appointments", {
      params: { page },
    });
    return response.data;
  },
};
