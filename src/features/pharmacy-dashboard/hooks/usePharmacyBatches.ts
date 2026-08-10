import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "../../inventory/api/inventoryApi";
import apiClient from "@/lib/api/client";

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
  return useQuery({
    queryKey: ["pharmacy", "batches", uuid],
    queryFn: async () => {
      const client = await import("@/lib/api/client").then(m => m.default);
      const res = await client.get(`/pharmacy/inventory/batches/${uuid}`);
      return res.data;
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
  return useQuery<PaginatedBatches>({
    queryKey: ["pharmacy", "batches", providerId, page],
    queryFn: () => inventoryApi.getBatches(providerId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!providerId,
  });
}

export function useUpdateBatchMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: Partial<BatchItem> }) => {
      const res = await apiClient.put(`/pharmacy/inventory/batches/${uuid}`, data);
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
