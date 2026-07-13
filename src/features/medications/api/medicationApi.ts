import apiClient from "@/lib/api/client";
import { serverToClient, clientToServer } from "@/features/offline/utils/uuid";
import type { Medication } from "../schemas";

export interface MedicationsResponse {
  data: Medication[];
}

export interface MedicationResponse {
  data: Medication;
}

export const medicationApi = {
  /**
   * Get top prescribed medications
   */
  getTopPrescribed: async (): Promise<any[]> => {
    const response = await apiClient.get<any>("/medications/top-prescribed");
    return response.data?.data ?? response.data ?? [];
  },

  /**
   * Get all medications (paginated and filtered by search)
   */
  getAll: async (search?: string, page = 1): Promise<{ data: Medication[]; lastPage: number }> => {
    let url = `/medications?page=${page}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const response = await apiClient.get<any>(url);
    const serverData = response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
    const lastPage = response.data?.data?.last_page ?? 1;
    
    const mapped = serverData.map((m: any) => serverToClient<Medication>(m));
    return { data: mapped, lastPage };
  },

  /**
   * Create new custom medication
   */
  create: async (data: Partial<Medication>): Promise<MedicationResponse> => {
    const serverData = clientToServer(data as unknown as Record<string, unknown>);
    const response = await apiClient.post<any>("/medications", serverData);
    const mapped = serverToClient<Medication>(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Update custom medication
   */
  update: async (uuid: string, data: Partial<Medication>): Promise<MedicationResponse> => {
    const serverData = clientToServer(data as unknown as Record<string, unknown>);
    const response = await apiClient.put<any>(`/medications/${uuid}`, serverData);
    const mapped = serverToClient<Medication>(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Delete custom medication
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/medications/${uuid}`);
  },
};
