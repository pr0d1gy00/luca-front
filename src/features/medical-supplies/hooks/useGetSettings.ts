import { useQuery } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";

export const medicalSupplySettingsKeys = {
  all: ["medical-supply-settings"] as const,
};

export function useGetSettings() {
  return useQuery({
    queryKey: medicalSupplySettingsKeys.all,
    queryFn: async () => {
      const response = await medicalSupplyApi.getSettings();
      return response;
    },
  });
}
