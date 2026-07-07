import apiClient from "@/lib/api/client";

export const patientDocumentApi = {
  /**
   * Obtiene el listado de documentos médicos del paciente con filtros opcionales.
   */
  getPatientDocuments: async (
    page: number = 1,
    search?: string,
    type?: string,
  ) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (search) params.append("search", search);
    if (type) params.append("type", type);

    const { data } = await apiClient.get(
      `/patients/me/medical-documents?${params.toString()}`,
    );
    return data;
  },

  /**
   * Obtiene el detalle de un documento médico específico.
   */
  getPatientDocumentDetail: async (uuid: string) => {
    const { data } = await apiClient.get(
      `/patients/me/medical-documents/${uuid}`,
    );
    return data;
  },
};
