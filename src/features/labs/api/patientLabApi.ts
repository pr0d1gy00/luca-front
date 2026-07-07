import apiClient from "@/lib/api/client";

export const patientLabApi = {
  /**
   * Obtiene la lista de resultados de laboratorio e imágenes del paciente autenticado.
   */
  getPatientLabResults: async (
    page: number = 1,
    search?: string,
    status?: string,
  ) => {
    let url = `/patients/me/lab-results?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const { data } = await apiClient.get(url);
    return data;
  },

  /**
   * Obtiene el detalle completo de un resultado de laboratorio específico.
   */
  getPatientLabResultDetail: async (uuid: string) => {
    const { data } = await apiClient.get(`/patients/me/lab-results/${uuid}`);
    return data;
  },
};
