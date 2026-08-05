import { useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";
import { QuotePayload } from "../types";
import { medicalSupplyDashboardKeys } from "./useGetDashboardStats";

export function useSubmitQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: QuotePayload) => {
      return await medicalSupplyApi.submitManualQuote(payload);
    },
    onSuccess: () => {
      // Invalidate relevant queries (e.g. orders list, dashboard stats)
      queryClient.invalidateQueries({
        queryKey: medicalSupplyDashboardKeys.stats,
      });
    },
  });
}

export function useTriggerAutoMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      return await medicalSupplyApi.triggerAutoMatch(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalSupplyDashboardKeys.stats,
      });
    },
  });
}
