"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface CategoryBreakdown {
  category: string;
  count: number;
  averagePrice: number;
  percentage: number;
}

export interface PreviewService {
  uuid: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  isStandaloneBookable: boolean;
}

export interface ProviderServicesStats {
  totalServices: number;
  averagePrice: number;
  standaloneBookableCount: number;
  totalCategories: number;
  categoryBreakdown: CategoryBreakdown[];
  previewServices: PreviewService[];
}

export function useProviderServicesStats(providerUuid: string) {
  return useQuery<ProviderServicesStats>({
    queryKey: ["provider-services-stats", providerUuid],
    queryFn: async () => {
      if (!providerUuid) {
        return {
          totalServices: 0,
          averagePrice: 0,
          standaloneBookableCount: 0,
          totalCategories: 0,
          categoryBreakdown: [],
          previewServices: [],
        };
      }

      const { data } = await apiClient.get(
        `/services/provider/${providerUuid}/stats`,
      );
      return (
        data?.data || {
          totalServices: 0,
          averagePrice: 0,
          standaloneBookableCount: 0,
          totalCategories: 0,
          categoryBreakdown: [],
          previewServices: [],
        }
      );
    },
    enabled: !!providerUuid,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
