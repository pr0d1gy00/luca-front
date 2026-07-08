import apiClient from "@/lib/api/client";

export const patientNotificationApi = {
  /**
   * Obtiene la lista de notificaciones del paciente autenticado.
   */
  getNotifications: async () => {
    const { data } = await apiClient.get("/patients/me/notifications");
    return data;
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas del paciente.
   */
  getUnreadCount: async () => {
    const { data } = await apiClient.get(
      "/patients/me/notifications/unread-count",
    );
    return data;
  },

  /**
   * Marca una notificación como leída.
   */
  markAsRead: async (uuid: string) => {
    const { data } = await apiClient.patch(
      `/patients/me/notifications/${uuid}/read`,
    );
    return data;
  },

  /**
   * Marca todas las notificaciones como leídas.
   */
  markAllAsRead: async () => {
    const { data } = await apiClient.post(
      "/patients/me/notifications/read-all",
    );
    return data;
  },
};
