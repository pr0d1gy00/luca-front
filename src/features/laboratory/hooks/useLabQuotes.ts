import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { LabQuoteOfferPayload } from "../types/laboratory.types";

export function useLabRequests(page = 1) {
  return useQuery({
    queryKey: ["lab-requests", page],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/laboratory/requests?page=${page}`,
      );
      return response.data;
    },
  });
}

export function useCreateLabQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      payload,
    }: {
      requestId: number;
      payload: LabQuoteOfferPayload;
    }) => {
      const response = await apiClient.post(
        `/api/v1/laboratory/requests/${requestId}/quotes`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
    },
  });
}

export function useCreateExternalLabOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      external_patient_name: string;
      external_patient_document?: string;
      exams_list: string[];
      instructions?: string;
    }) => {
      const response = await apiClient.post(
        "/api/v1/laboratory/external-orders",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-requests"] });
      queryClient.invalidateQueries({ queryKey: ["lab-analytics"] });
    },
  });
}
