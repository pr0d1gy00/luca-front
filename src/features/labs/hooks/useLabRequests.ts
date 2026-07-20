"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  labRequestApi,
  type CreateLabRequestDTO,
  type UpdateLabRequestDTO,
} from "../api/labRequestApi";
import { labRequestOfflineService } from "../services/labRequestOfflineService";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { useAuthStore } from "@/store/auth";

export const labRequestKeys = {
  all: ["lab-requests"] as const,
  lists: () => [...labRequestKeys.all, "list"] as const,
  list: (patientUuid?: string, page = 1, perPage = 10) =>
    [...labRequestKeys.lists(), { patientUuid, page, perPage }] as const,
  details: () => [...labRequestKeys.all, "detail"] as const,
  detail: (uuid: string) => [...labRequestKeys.details(), uuid] as const,
};

/**
 * Get all laboratory requests — prefers server data, falls back to local
 */
export function useLabRequests(patientUuid?: string, page = 1, perPage = 10) {
  return useQuery({
    queryKey: labRequestKeys.list(patientUuid, page, perPage),
    queryFn: async () => {
      try {
        const response = await labRequestApi.getAll(patientUuid, page, perPage);
        const mappedList = response.data.map((req) => ({
          ...req,
          consultationUuid:
            req.consultationUuid ||
            (req as unknown as { consultation?: { uuid?: string } })
              .consultation?.uuid,
        }));
        // Save to local IndexedDB for offline access
        for (const req of mappedList) {
          await labRequestOfflineService.saveLocalSynced(req);
        }
        return {
          data: mappedList,
          pagination: response.pagination,
        };
      } catch {
        // Fallback to local data
        let allLocal: LabRequest[] = [];
        if (patientUuid) {
          allLocal = await labRequestOfflineService.getByPatient(patientUuid);
        } else {
          allLocal = await labRequestOfflineService.getAll();
        }
        const total = allLocal.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        const startIndex = (page - 1) * perPage;
        const sliced = allLocal.slice(startIndex, startIndex + perPage);

        return {
          data: sliced,
          pagination: {
            currentPage: page,
            lastPage,
            perPage,
            total,
            from: total > 0 ? startIndex + 1 : 0,
            to: total > 0 ? Math.min(startIndex + perPage, total) : 0,
          },
        };
      }
    },
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Get single laboratory request by UUID
 */
export function useLabRequest(uuid: string) {
  return useQuery({
    queryKey: labRequestKeys.detail(uuid),
    queryFn: async () => {
      try {
        const response = await labRequestApi.getByUUID(uuid);
        await labRequestOfflineService.saveLocalSynced(response.data);
        return response.data;
      } catch {
        return labRequestOfflineService.getByUUID(uuid);
      }
    },
    enabled: !!uuid,
  });
}

/**
 * Create lab request — saves locally immediately, queues for sync if offline
 */
export function useCreateLabRequest() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? "";

  return useMutation({
    mutationFn: async (data: CreateLabRequestDTO) => {
      if (!isOnline) {
        return labRequestOfflineService.create(data, doctorUuid);
      } else {
        const response = await labRequestApi.create(data);
        const labReq = response.data;
        await labRequestOfflineService.saveLocalSynced(labReq);
        return labReq;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labRequestKeys.lists() });
    },
  });
}

/**
 * Update lab request — saves locally immediately, queues for sync if offline
 */
export function useUpdateLabRequest() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (data: UpdateLabRequestDTO) => {
      if (!isOnline) {
        return labRequestOfflineService.update(data.uuid, data);
      } else {
        const response = await labRequestApi.update(data);
        const labReq = response.data;
        await labRequestOfflineService.saveLocalSynced(labReq);
        return labReq;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: labRequestKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: labRequestKeys.detail(variables.uuid),
      });
    },
  });
}

/**
 * Delete lab request — saves locally immediately, queues for sync if offline
 */
export function useDeleteLabRequest() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (uuid: string) => {
      if (!isOnline) {
        await labRequestOfflineService.delete(uuid);
      } else {
        await labRequestApi.delete(uuid);
        await labRequestOfflineService.deleteLocal(uuid);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labRequestKeys.lists() });
    },
  });
}
