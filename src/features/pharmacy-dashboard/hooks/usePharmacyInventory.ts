import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyInventoryItem } from "../types/pharmacy.types";

interface InventoryFilters {
  search?: string;
  sale_condition?: string;
  low_stock?: boolean;
  expiring_days?: number;
  page?: number;
  per_page?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export function usePharmacyInventory(filters: InventoryFilters = {}) {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery<PaginatedResponse<PharmacyInventoryItem>>({
    queryKey: ["pharmacy", "inventory", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.sale_condition)
        params.append("sale_condition", filters.sale_condition);
      if (filters.low_stock) params.append("low_stock", "1");
      if (filters.expiring_days)
        params.append("expiring_days", filters.expiring_days.toString());
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.per_page)
        params.append("per_page", filters.per_page.toString());

      const response = await apiClient.get(
        `/pharmacy/inventory?${params.toString()}`,
      );
      return response.data;
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (payload: Partial<PharmacyInventoryItem>) => {
      const response = await apiClient.post("/pharmacy/inventory", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<PharmacyInventoryItem>;
    }) => {
      const response = await apiClient.put(
        `/pharmacy/inventory/${id}`,
        payload,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
    },
  });

  return {
    inventory: inventoryQuery.data?.data || [],
    pagination: {
      currentPage: inventoryQuery.data?.current_page || 1,
      lastPage: inventoryQuery.data?.last_page || 1,
      total: inventoryQuery.data?.total || 0,
    },
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    createItem: createItemMutation.mutateAsync,
    isCreating: createItemMutation.isPending,
    updateItem: updateItemMutation.mutateAsync,
    isUpdating: updateItemMutation.isPending,
  };
}

export function useExpirationsReport(days: number = 60) {
  return useQuery<PharmacyInventoryItem[]>({
    queryKey: ["pharmacy", "reports", "expirations", days],
    queryFn: async () => {
      const response = await apiClient.get(
        `/pharmacy/inventory/reports/expirations?days=${days}`,
      );
      return response.data.data;
    },
  });
}

export function useControlledBookReport() {
  return useQuery<PharmacyInventoryItem[]>({
    queryKey: ["pharmacy", "reports", "controlled-books"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/pharmacy/inventory/reports/controlled-books",
      );
      return response.data.data;
    },
  });
}
