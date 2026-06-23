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
      full_name: string;
      email?: string;
      phone: string;
      password?: string;
      national_id?: string;
      username?: string;
      city_id?: string;
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

export function useGetPatientProfileQuery(token: string | null) {
  return useQuery<PatientProfile, unknown>({
    queryKey: ["auth", "patient", "me", token],
    queryFn: async () => {
      const { data } = await apiClient.get<PatientProfile>(
        "/auth/patients/me",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data;
    },
    enabled: !!token,
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
        "/auth/users/login",
        credentials,
      );
      return data;
    },
  });
}

export function useGetUserProfileQuery(token: string | null) {
  return useQuery<UserProfile, unknown>({
    queryKey: ["auth", "user", "me", token],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>("/auth/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
