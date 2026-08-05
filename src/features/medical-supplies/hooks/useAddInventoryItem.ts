import { useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";
import { InventoryItem } from "../types";
import { medicalSupplyInventoryKeys } from "./useGetInventory";

export function useAddInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      item: Omit<InventoryItem, "id" | "provider_profile_id">,
    ) => {
      return await medicalSupplyApi.addInventoryItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: medicalSupplyInventoryKeys.all,
      });
    },
  });
}
