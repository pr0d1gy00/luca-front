import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type {
  CreateQuoteOfferPayload,
  UpsellRuleSuggestion,
} from "../types/pharmacy.types";

export function useQuoteRequests(page: number = 1) {
  return useQuery({
    queryKey: ["pharmacy", "quote-requests", page],
    queryFn: async () => {
      const response = await apiClient.get(
        `/pharmacy/quote-requests?page=${page}`,
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
