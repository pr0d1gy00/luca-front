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

  /**
   * Solicita cotizaciones al mercado para una receta médica.
   */
  requestQuote: async (payload: {
    prescription_id: string;
    patient_id: string;
    city_id?: string;
    latitude?: number;
    longitude?: number;
    search_radius_km?: number;
  }) => {
    const { data } = await apiClient.post("/quote-requests", payload);
    return data;
  },

  /**
   * Actualiza las preferencias de ubicación y radio de una cotización automática.
   */
  updateQuoteRequest: async (uuid: string, payload: {
    latitude?: number;
    longitude?: number;
    search_radius_km?: number;
    status?: string;
  }) => {
    const { data } = await apiClient.put(`/quote-requests/${uuid}`, payload);
    return data;
  },
};
