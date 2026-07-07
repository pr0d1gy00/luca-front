import apiClient from "@/lib/api/client";

export const patientConsultationApi = {
  /**
   * Obtiene el listado de consultas médicas del paciente autenticado.
   */
  getPatientConsultations: async (page: number = 1) => {
    const { data } = await apiClient.get(
      `/patients/me/consultations?page=${page}`,
    );
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
