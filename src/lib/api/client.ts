import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/store/auth";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Interceptor de solicitudes:
 * 1. Inyecta el encabezado Idempotency-Key para peticiones POST.
 * 2. Inyecta el token Bearer JWT desde el almacén de Zustand si existe.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Clave de idempotencia
    if (config.method?.toLowerCase() === "post") {
      if (!config.headers["Idempotency-Key"]) {
        config.headers["Idempotency-Key"] = uuidv4();
      }
    }

    // 2. Token de Autenticación
    const token = useAuthStore.getState().token;
    if (token && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de respuestas:
 * Maneja el refresco automático de tokens JWT (401) con sistema de cola
 * para evitar múltiples llamados simultáneos.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detectamos expiración de sesión (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      const state = useAuthStore.getState();

      // Si no hay token guardado, o es un endpoint de auth público, rechazamos inmediatamente
      // (los endpoints OTP retornan 401 por lógica de negocio, no por sesión expirada)
      if (
        !state.token ||
        originalRequest.url?.includes("/login") ||
        originalRequest.url?.includes("/refresh") ||
        originalRequest.url?.includes("/verify-otp") ||
        originalRequest.url?.includes("/send-otp")
      ) {
        return Promise.reject(error);
      }

      // Si la cuenta fue explícitamente suspendida, limpiamos la sesión local y redirigimos
      if (error.response?.data?.message === "Cuenta suspendida.") {
        state.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Si ya hay un refresco de token en progreso, encolamos la petición
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshPath =
          state.userType === "patient"
            ? "/auth/patients/refresh"
            : "/auth/users/refresh";

        // Usamos una instancia limpia de axios para no disparar interceptores recursivos
        const response = await axios.post(
          `${apiClient.defaults.baseURL}${refreshPath}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${state.token}`,
              "Idempotency-Key": uuidv4(),
            },
          },
        );

        const { access_token, accessToken } = response.data;
        const newToken = access_token || accessToken || "";

        if (state.userType && state.user) {
          state.setAuth(newToken, state.userType, state.user);
        }

        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        state.clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Detectamos KYC Pendiente (403 con mensaje de revisión)
    if (error.response?.status === 403) {
      const message = error.response.data?.message || "";
      const url = originalRequest?.url || "unknown";
      console.warn("[apiClient] 403 intercepted", {
        url,
        message,
        data: error.response?.data,
      });
      // Solo redirigir para DOCTOR/PROVIDER (patients no requieren KYC)
      const userType = useAuthStore.getState().userType;
      console.warn("[apiClient] userType at 403 time:", userType);
      const isPatientEndpoint = url?.includes("/patients/");
      if (
        message.includes("revisión") ||
        message.includes("restringido") ||
        message.includes("revisión")
      ) {
        // NO redirigir si es un paciente — los pacientes no requieren verificación KYC
        if (userType === "patient" || isPatientEndpoint) {
          console.warn(
            "[apiClient] Patient endpoint 403 — NOT redirecting to pending-verification",
          );
          return Promise.reject(error);
        }
        console.warn(
          "[apiClient] Redirecting to pending-verification due to 403",
        );
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard/pending-verification";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
