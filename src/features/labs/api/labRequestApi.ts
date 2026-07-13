import apiClient from "@/lib/api/client";
import { serverToClient, clientToServer } from "@/features/offline/utils/uuid";
import type { LabRequest } from "@/features/offline/database/schema";

export interface CreateLabRequestDTO {
  patientUuid: string;
  consultationUuid?: string | null;
  examsList: string[];
  instructions?: string;
  isCompleted?: boolean;
}

export interface UpdateLabRequestDTO {
  uuid: string;
  examsList?: string[];
  instructions?: string;
  isCompleted?: boolean;
}

export interface LabRequestResponse {
  data: LabRequest;
}

export interface LabRequestsResponse {
  data: LabRequest[];
}

export const labRequestApi = {
  /**
   * Get all lab requests for current doctor, optionally filtered by patient UUID
   */
  getAll: async (patientUuid?: string): Promise<LabRequestsResponse> => {
    let url = "/lab-requests";
    if (patientUuid) {
      url += `?patient_uuid=${encodeURIComponent(patientUuid)}`;
    }
    const response = await apiClient.get<{ data: any[] }>(url);
    const mapped = (response.data.data ?? response.data ?? []).map((r) =>
      serverToClient<LabRequest>(r)
    );
    return { data: mapped };
  },

  /**
   * Get single lab request by UUID
   */
  getByUUID: async (uuid: string): Promise<LabRequestResponse> => {
    const response = await apiClient.get<{ data: any }>(`/lab-requests/${uuid}`);
    const mapped = serverToClient<LabRequest>(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Create new lab request
   */
  create: async (data: CreateLabRequestDTO): Promise<LabRequestResponse> => {
    const serverData = clientToServer(data as unknown as Record<string, unknown>);
    const response = await apiClient.post<{ data: any }>("/lab-requests", serverData);
    const mapped = serverToClient<LabRequest>(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Update existing lab request
   */
  update: async (data: UpdateLabRequestDTO): Promise<LabRequestResponse> => {
    const serverData = clientToServer(data as unknown as Record<string, unknown>);
    const response = await apiClient.put<{ data: any }>(
      `/lab-requests/${data.uuid}`,
      serverData
    );
    const mapped = serverToClient<LabRequest>(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Delete lab request (soft delete)
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/lab-requests/${uuid}`);
  },
};
