import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyOrder } from "../types/pharmacy.types";

export function usePharmacyOrders() {
  return [
    {
      id: "ORD-001",
      customerName: "María García",
      medication: "Amoxicilina 500mg",
      status: "pending",
      time: "Hace 10 min",
    },
    {
      id: "ORD-002",
      customerName: "Carlos Rodríguez",
      medication: "Ibuprofeno 600mg",
      status: "ready",
      time: "Hace 25 min",
    },
  ];
}

export function useConfirmPharmacyOrder() {
  const queryClient = useQueryClient();

  return useMutation<PharmacyOrder, Error, number>({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.post(
        `/pharmacy/orders/${orderId}/confirm`,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "orders"] });
    },
  });
}
