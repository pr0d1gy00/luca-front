import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export interface LabSettingsPayload {
  daily_max_slots?: number;
  auto_quoting_enabled?: boolean;
  default_currency?: string;
  instructions_for_patient?: string;
  is_24_hours?: boolean;
  opening_time?: string;
  closing_time?: string;
  working_days?: string[];
}

export function useLabSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["lab-settings"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/laboratory/settings");
      return response.data?.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: LabSettingsPayload) => {
      const response = await apiClient.put(
        "/api/v1/laboratory/settings",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lab-settings"] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}
