import apiClient from "@/lib/api/client";
import type { PrescriptionTemplate } from "../schemas";

export interface PrescriptionTemplatesResponse {
  data: PrescriptionTemplate[];
}

export interface PrescriptionTemplateResponse {
  data: PrescriptionTemplate;
}

const mapTemplateToServer = (data: Partial<PrescriptionTemplate>) => {
  return {
    title: data.title,
    items: data.items?.map((item) => ({
      medication_id: item.medicationId,
      dose: item.dose,
      frequency: item.frequency,
      duration: item.duration,
      notes: item.notes || null,
    })),
  };
};

const mapTemplateToClient = (serverObj: any): PrescriptionTemplate => {
  return {
    uuid: serverObj.uuid,
    title: serverObj.title,
    items: (serverObj.items || []).map((item: any) => ({
      medicationId: item.medication_uuid || item.medication_id,
      dose: item.dose,
      frequency: item.frequency,
      duration: item.duration,
      notes: item.notes || "",
    })),
  };
};

export const prescriptionTemplateApi = {
  /**
   * Get all prescription templates (combos) for the current doctor
   */
  getAll: async (page = 1): Promise<{ data: PrescriptionTemplate[]; lastPage: number }> => {
    const response = await apiClient.get<any>(`/prescription-templates?page=${page}`);
    const serverData = response.data?.data?.data ?? response.data?.data ?? response.data ?? [];
    const lastPage = response.data?.data?.last_page ?? 1;

    const mapped = serverData.map((t: any) => mapTemplateToClient(t));
    return { data: mapped, lastPage };
  },

  /**
   * Create new prescription template (combo)
   */
  create: async (data: Partial<PrescriptionTemplate>): Promise<PrescriptionTemplateResponse> => {
    const payload = mapTemplateToServer(data);
    const response = await apiClient.post<any>("/prescription-templates", payload);
    const mapped = mapTemplateToClient(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Update prescription template (combo)
   */
  update: async (uuid: string, data: Partial<PrescriptionTemplate>): Promise<PrescriptionTemplateResponse> => {
    const payload = mapTemplateToServer(data);
    const response = await apiClient.put<any>(`/prescription-templates/${uuid}`, payload);
    const mapped = mapTemplateToClient(response.data.data ?? response.data);
    return { data: mapped };
  },

  /**
   * Delete prescription template (combo)
   */
  delete: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/prescription-templates/${uuid}`);
  },
};
