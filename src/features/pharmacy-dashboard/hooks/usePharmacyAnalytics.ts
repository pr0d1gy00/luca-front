import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyAnalyticsData, PharmacyAnalyticsFilters } from "../types/analytics.types";

export function usePharmacyAnalytics(filters?: PharmacyAnalyticsFilters) {
  return useQuery<PharmacyAnalyticsData, Error>({
    queryKey: ["pharmacy", "analytics", filters],
    queryFn: async () => {
      const response = await apiClient.get("/pharmacy/analytics", {
        params: filters,
      });
      return response.data;
    },
    // Cache analytics for 5 minutes
    staleTime: 1000 * 60 * 5,
  });
}
