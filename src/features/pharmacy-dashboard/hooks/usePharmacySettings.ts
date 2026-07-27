import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacySetting } from "../types/pharmacy.types";

export function usePharmacySettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery<PharmacySetting>({
    queryKey: ["pharmacy", "settings"],
    queryFn: async () => {
      const response = await apiClient.get("/pharmacy/settings");
      return response.data.data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: Partial<PharmacySetting>) => {
      const response = await apiClient.put("/pharmacy/settings", payload);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "settings"] });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
}
