import { useQuery } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";

export const medicalSupplyInventoryKeys = {
  all: ["medical-supply-inventory"] as const,
};

export function useGetInventory() {
  return useQuery({
    queryKey: medicalSupplyInventoryKeys.all,
    queryFn: async () => {
      const response = await medicalSupplyApi.getInventory();
      return response;
    },
  });
}
