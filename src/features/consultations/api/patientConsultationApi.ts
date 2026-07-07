import apiClient from "@/lib/api/client";

export const patientConsultationApi = {
  /**
   * Obtiene el listado de consultas médicas del paciente autenticado.
   */
  getPatientConsultations: async (
    page: number = 1,
    search?: string,
    specialty?: string,
  ) => {
    let url = `/patients/me/consultations?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (specialty) url += `&specialty=${encodeURIComponent(specialty)}`;
    const { data } = await apiClient.get(url);
    return data;
  },

  /**
   * Obtiene el detalle completo de una consulta médica específica para el paciente.
   */
  getPatientConsultationDetail: async (uuid: string) => {
    const { data } = await apiClient.get(`/patients/me/consultations/${uuid}`);
    return data;
  },
};
