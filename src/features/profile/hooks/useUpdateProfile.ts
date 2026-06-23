import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  PatientAccount,
  PatientProfile,
  UserProfile,
} from "@/features/auth/types";
import type { PatientProfileEdit, UserProfileEdit } from "../types";

export function useGetPatientProfileQuery(token: string | null) {
  return useQuery<PatientAccount, unknown>({
    queryKey: ["profile", "patient", token],
    queryFn: async () => {
      const { data } = await apiClient.get<PatientProfile>(
        "/auth/patients/me",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return data as PatientAccount;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserProfileQuery(token: string | null) {
  return useQuery<UserProfile, unknown>({
    queryKey: ["profile", "user", token],
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

export function useUpdatePatientMutation() {
  const queryClient = useQueryClient();
  return useMutation<PatientAccount, unknown, PatientProfileEdit>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.patch<PatientAccount>(
        "/auth/patients/me",
        payload,
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", "patient"], updated);
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, unknown, UserProfileEdit>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.patch<UserProfile>(
        "/auth/users/me",
        payload,
      );
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["profile", "user"], updated);
    },
  });
}
