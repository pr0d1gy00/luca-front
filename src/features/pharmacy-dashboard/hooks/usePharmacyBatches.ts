import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../../inventory/api/inventoryApi";

export interface BatchItem {
  id: number;
  uuid: string;
  provider_id: number;
  document_urls: string[] | null;
  notes: string | null;
  status: string;
  created_at: string;
  items_count: number;
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

export interface BatchesMetrics {
  batches_this_month: { value: number; trend: string };
  total_products: { value: string; trend: string };
  inventory_value: { value: string; trend: string };
}

export function usePharmacyBatchesMetricsQuery(providerId: string) {
  return useQuery<BatchesMetrics>({
    queryKey: ["pharmacy", "batches", "metrics", providerId],
    // Reusing getMetrics from inventoryApi which points to the old endpoint or wait, getMetrics in inventoryApi points to /api/v1/pharmacy/inventory/metrics
    // We should use apiClient directly here for the specific batches metrics endpoint
    queryFn: async () => {
      const { data } = await import("@/lib/api/client").then(m => m.default).then(client => 
        client.get(`/pharmacy/inventory/batches/metrics`)
      );
      return data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!providerId,
  });
}
