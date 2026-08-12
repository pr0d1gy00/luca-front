import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  CreateQuoteOfferPayload,
  UpsellRuleSuggestion,
} from "../types/pharmacy.types";
import { useOnlineStatus } from "../../offline/hooks/useOnlineStatus";
import { pharmacyOfflineService } from "../services/pharmacyOfflineService";
import { useAuthStore } from "@/store/auth";

export interface QuoteFilters {
  page?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export function useQuoteRequests(filters: QuoteFilters = { page: 1 }) {
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  return useQuery({
    queryKey: ["pharmacy", "quote-requests", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      try {
        const response = await apiClient.get(
          `/pharmacy/quote-requests?${params.toString()}`,
        );
        if (response.data.data) {
           await pharmacyOfflineService.saveLocalSynced("quoteRequests", response.data.data);
        }
        return response.data;
      } catch (error) {
        if (!isOnline) {
          const localData = await pharmacyOfflineService.getQuoteRequests(providerUuid);
          let filtered = localData;
          if (filters.status) {
            filtered = filtered.filter(item => item.status === filters.status);
          }
          return {
            data: filtered as any[],
            current_page: 1,
            last_page: 1,
            total: filtered.length
          };
        }
        throw error;
      }
    },
  });
}

export function useCreateQuoteOffer() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  return useMutation({
    mutationFn: async ({
      requestId,
      requestUuid,
      payload,
    }: {
      requestId: number;
      requestUuid: string;
      payload: CreateQuoteOfferPayload;
    }) => {
      if (!isOnline) {
         return await pharmacyOfflineService.saveQuoteOfferLocally(requestUuid, providerUuid, payload as any);
      }
      const response = await apiClient.post(
        `/pharmacy/quote-requests/${requestId}/offers`,
        payload,
      );
      await pharmacyOfflineService.saveLocalSynced("quoteOffers", response.data.data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy", "quote-requests"],
      });
    },
  });
}

export function useUpdateQuoteOffer() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  return useMutation({
    mutationFn: async ({
      requestId,
      requestUuid,
      offerId,
      payload,
    }: {
      requestId: number;
      requestUuid: string;
      offerId: number;
      payload: CreateQuoteOfferPayload & { uuid?: string };
    }) => {
      if (!isOnline) {
         return await pharmacyOfflineService.saveQuoteOfferLocally(requestUuid, providerUuid, { ...payload, uuid: payload.uuid } as any);
      }
      const response = await apiClient.put(
        `/pharmacy/quote-requests/${requestId}/offers/${offerId}`,
        payload,
      );
      await pharmacyOfflineService.saveLocalSynced("quoteOffers", response.data.data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pharmacy", "quote-requests"],
      });
    },
  });
}

export function useUpsellSuggestions(activeIngredients: string[]) {
  return useQuery<UpsellRuleSuggestion[]>({
    queryKey: ["pharmacy", "upsell-suggestions", activeIngredients],
    queryFn: async () => {
      if (!activeIngredients || activeIngredients.length === 0) return [];
      const params = new URLSearchParams();
      activeIngredients.forEach((ing) =>
        params.append("active_ingredients[]", ing),
      );
      const response = await apiClient.get(
        `/pharmacy/upsell-suggestions?${params.toString()}`,
      );
      return response.data.data;
    },
    enabled: activeIngredients.length > 0,
  });
}
