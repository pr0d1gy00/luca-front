import apiClient from "@/lib/api/client";

export const doctorDashboardApi = {
  /**
   * Obtiene los datos del dashboard del médico (KPIs, agenda de hoy y próximo paciente).
   */
  getDoctorDashboard: async () => {
    const { data } = await apiClient.get("/doctor/dashboard");
    return data;
  },
};
