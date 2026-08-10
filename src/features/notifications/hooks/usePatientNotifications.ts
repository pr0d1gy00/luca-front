"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientNotificationApi } from "../api/patientNotificationApi";
import { useAuthStore } from "@/store/auth";

export const patientNotificationKeys = {
  all: ["patient-notifications"] as const,
  list: () => [...patientNotificationKeys.all, "list"] as const,
  unreadCount: () => [...patientNotificationKeys.all, "unread-count"] as const,
};

export function usePatientNotificationsQuery() {
  const { user, role } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  return useQuery({
    queryKey: patientNotificationKeys.list(),
    queryFn: () => patientNotificationApi.getNotifications(),
    enabled: !!patientUuid && role === "patient",
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: false, // Auto-refetch desactivado temporalmente
  });
}

export function usePatientUnreadCountQuery() {
  const { user, role } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  return useQuery({
    queryKey: patientNotificationKeys.unreadCount(),
    queryFn: () => patientNotificationApi.getUnreadCount(),
    enabled: !!patientUuid && role === "patient",
    staleTime: 10 * 1000,
    refetchInterval: false,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => patientNotificationApi.markAsRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patientNotificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientNotificationKeys.all });
    },
  });
}
