import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { AuthResponse, PatientProfile, UserProfile } from "../types";

// ==========================================
// PACIENTES (PATIENTS)
// ==========================================

export function useRegisterPatientMutation() {
  return useMutation<
    AuthResponse,
    unknown,
    {
      fullName: string;
      email?: string;
      phone: string;
      password?: string;
      nationalId?: string;
      username?: string;
      cityId?: string;
    }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/patients/register",
        payload,
      );
      return data;
    },
  });
}

export function useLoginPatientMutation() {
  return useMutation<
    AuthResponse,
    unknown,
    { email: string; password?: string }
  >({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/patients/login",
        credentials,
      );
      return data;
    },
  });
}

export function useGetPatientProfileQuery(enabled = true) {
  return useQuery<PatientProfile, unknown>({
    queryKey: ["auth", "patient", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<PatientProfile>(
        "/auth/patients/me",
      );
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ==========================================
// USUARIOS (DOCTORES/PROVEEDORES/ADMINS)
// ==========================================

export function useRegisterDoctorMutation() {
  return useMutation<AuthResponse, unknown, FormData>({
    mutationFn: async (formData) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/users/register/doctor",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
  });
}

export function useRegisterProviderMutation() {
  return useMutation<AuthResponse, unknown, FormData>({
    mutationFn: async (formData) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/users/register/provider",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return data;
    },
  });
}

export function useLoginUserMutation() {
  return useMutation<
    AuthResponse,
    unknown,
    { email: string; password?: string }
  >({
    mutationFn: async (credentials) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/login-password",
        credentials,
      );
      return data;
    },
  });
}

export function useSendOtpMutation() {
  return useMutation<
    { status: string; message: string; otpExpirySeconds: number },
    unknown,
    {
      phone?: string;
      email?: string;
      role: string;
      channel: "WHATSAPP" | "EMAIL";
    }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post("/auth/send-otp", payload);
      return data;
    },
  });
}

export function useVerifyOtpMutation() {
  return useMutation<
    AuthResponse,
    unknown,
    { phone?: string; email?: string; code: string; role?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<AuthResponse>(
        "/auth/verify-otp",
        payload,
      );
      return data;
    },
  });
}

export function useGetUserProfileQuery(enabled = true) {
  return useQuery<UserProfile, unknown>({
    queryKey: ["auth", "user", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>("/auth/users/me");
      return data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
