import apiClient from "@/lib/api/client";

export const prescriptionApi = {
  /**
   * Obtiene la lista de recetas médicas del paciente autenticado.
   */
  getPatientPrescriptions: async (page: number = 1) => {
    const { data } = await apiClient.get(
      `/patients/me/prescriptions?page=${page}`,
    );
    return data;
  },

  /**
   * Obtiene el detalle de una receta médica específica para el paciente.
   */
  getPatientPrescriptionDetail: async (uuid: string) => {
    const { data } = await apiClient.get(`/patients/me/prescriptions/${uuid}`);
    return data;
  },

  /**
   * Obtiene las cotizaciones/ofertas del mercado para el paciente.
   */
  getPatientQuotes: async () => {
    const { data } = await apiClient.get("/patients/me/quote-requests");
    return data;
  },
};
