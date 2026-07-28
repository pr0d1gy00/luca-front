import { useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";
import { MedicalSupplySettings } from "../types";
import { medicalSupplySettingsKeys } from "./useGetSettings";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<MedicalSupplySettings>) => {
      return await medicalSupplyApi.updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalSupplySettingsKeys.all,
      });
    },
  });
}
