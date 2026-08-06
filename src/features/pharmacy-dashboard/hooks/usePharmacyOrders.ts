import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyOrder } from "../types/pharmacy.types";

export function usePharmacyOrders() {
  return [
    {
      id: "ORD-001",
      patientName: "María García",
      prescription: "Amoxicilina 500mg",
      status: "pendiente",
      fulfillmentType: "delivery",
      time: "Hace 10 min",
    },
    {
      id: "ORD-002",
      patientName: "Carlos Rodríguez",
      prescription: "Ibuprofeno 600mg",
      status: "listo",
      fulfillmentType: "presencial",
      time: "Hace 25 min",
    },
  ] as any; // Cast to any to avoid TS conflict with the api PharmacyOrder if it's imported
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
