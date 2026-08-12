import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../../inventory/api/inventoryApi";
import apiClient from "@/lib/api/client";
import { useOnlineStatus } from "../../offline/hooks/useOnlineStatus";
import { pharmacyOfflineService } from "../services/pharmacyOfflineService";
import { useAuthStore } from "@/store/auth";

export interface BatchItem {
  id: number;
  uuid: string;
  provider_id: number;
  document_urls: string[] | null;
  notes: string | null;
  status: string;
  created_at: string;
  items_count: number;
  items?: Array<{
    id: number;
    medication_id?: number | null;
    active_ingredient?: string | null;
    laboratory?: string | null;
    batch_number?: string | null;
    stock: number;
    unit_price?: number | null;
    expiration_date?: string | null;
    medication?: {
      id: number;
      name: string;
      active_ingredient: string;
    };
  }>;
}

export function usePharmacyBatchQuery(uuid: string | null) {
  const isOnline = useOnlineStatus();
  
  return useQuery({
    queryKey: ["pharmacy", "batches", uuid],
    queryFn: async () => {
      try {
        const client = await import("@/lib/api/client").then(m => m.default);
        const res = await client.get(`/pharmacy/inventory/batches/${uuid}`);
        return res.data;
      } catch (error) {
        if (!isOnline) {
          // Returning null or fallback for single query offline
          return null;
        }
        throw error;
      }
    },
    enabled: !!uuid,
  });
}

export interface PaginatedBatches {
  current_page: number;
  data: BatchItem[];
  total: number;
}

export function usePharmacyBatchesQuery(providerId: string, page: number = 1) {
  const isOnline = useOnlineStatus();

  return useQuery<PaginatedBatches>({
    queryKey: ["pharmacy", "batches", providerId, page],
    queryFn: async () => {
      try {
        const data = await inventoryApi.getBatches(providerId);
        if (data.data) {
          await pharmacyOfflineService.saveLocalSynced("pharmacyInventoryBatches", data.data);
        }
        return data;
      } catch (error) {
        if (!isOnline) {
          const localData = await pharmacyOfflineService.getBatches(providerId);
          return {
            data: localData as any[],
            current_page: 1,
            total: localData.length
          };
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!providerId,
  });
}

export function useUpdateBatchMutation() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: Partial<BatchItem> }) => {
      if (!isOnline) {
        return await pharmacyOfflineService.saveBatchLocally(providerUuid, { ...data, uuid } as any);
      }
      const res = await apiClient.put(`/pharmacy/inventory/batches/${uuid}`, data);
      await pharmacyOfflineService.saveLocalSynced("pharmacyInventoryBatches", res.data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pharmacy", "batches"] });
    },
  });
}

export interface BatchesMetrics {
  batches_this_month: { value: number; trend: string };
  total_products: { value: string; trend: string };
  inventory_value: { value: string; trend: string };
}

export function usePharmacyBatchesMetricsQuery(providerId: string) {
  return useQuery<BatchesMetrics>({
    queryKey: ["pharmacy", "batches", "metrics", providerId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/pharmacy/inventory/batches/metrics`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!providerId,
  });
}
