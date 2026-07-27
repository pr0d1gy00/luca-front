import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { LabResultPayload } from "../types/laboratory.types";

export function useLabResults(page = 1) {
  return useQuery({
    queryKey: ["lab-results", page],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/v1/laboratory/results?page=${page}`,
      );
      return response.data;
    },
  });
}

export function useUploadLabResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LabResultPayload) => {
      const response = await apiClient.post(
        "/api/v1/laboratory/results",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-results"] });
      queryClient.invalidateQueries({ queryKey: ["lab-analytics"] });
    },
  });
}
