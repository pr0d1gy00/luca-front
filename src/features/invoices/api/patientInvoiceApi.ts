import apiClient from "@/lib/api/client";

export const patientInvoiceApi = {
  /**
   * Obtiene la lista de facturas del paciente autenticado.
   */
  getPatientInvoices: async (page: number = 1) => {
    const { data } = await apiClient.get(`/patients/me/invoices?page=${page}`);
    return data;
  },

  /**
   * Obtiene el detalle de una factura específica con sus ítems y pagos.
   */
  getPatientInvoiceDetail: async (uuid: string) => {
    const { data } = await apiClient.get(`/patients/me/invoices/${uuid}`);
    return data;
  },

  /**
   * Reporta un pago manual para una factura específica, incluyendo captura y datos en texto.
   */
  reportPatientPayment: async (uuid: string, paymentData: FormData) => {
    const { data } = await apiClient.post(
      `/patients/me/invoices/${uuid}/payments`,
      paymentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data;
  },
};
