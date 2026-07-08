import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  PatientAccount,
  PatientProfile,
  UserProfile,
} from "@/features/auth/types";
import type { PatientProfileEdit, UserProfileEdit } from "../types";

export function useGetPatientProfileQuery(enabled = true) {
  return useQuery<PatientAccount, unknown>({
    queryKey: ["profile", "patient"],
    queryFn: async () => {
      const { data } = await apiClient.get<PatientProfile>(
        "/auth/patients/me",
      );
      return data as unknown as PatientAccount;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserProfileQuery(enabled = true) {
  return useQuery<UserProfile, unknown>({
    queryKey: ["profile", "user"],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>("/auth/users/me");
      return data;
    },
    enabled,
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
