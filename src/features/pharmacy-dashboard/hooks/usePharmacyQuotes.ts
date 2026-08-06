import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  CreateQuoteOfferPayload,
  UpsellRuleSuggestion,
} from "../types/pharmacy.types";

export interface QuoteFilters {
  page?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

export function useQuoteRequests(filters: QuoteFilters = { page: 1 }) {
  return useQuery({
    queryKey: ["pharmacy", "quote-requests", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);

      const response = await apiClient.get(
        `/pharmacy/quote-requests?${params.toString()}`,
      );
      return response.data;
    },
  });
}

export function useCreateQuoteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      payload,
    }: {
      requestId: number;
      payload: CreateQuoteOfferPayload;
    }) => {
      const response = await apiClient.post(
        `/pharmacy/quote-requests/${requestId}/offers`,
        payload,
      );
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

  return useMutation({
    mutationFn: async ({
      requestId,
      offerId,
      payload,
    }: {
      requestId: number;
      offerId: number;
      payload: CreateQuoteOfferPayload;
    }) => {
      const response = await apiClient.put(
        `/pharmacy/quote-requests/${requestId}/offers/${offerId}`,
        payload,
      );
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
