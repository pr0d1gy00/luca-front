import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyOrder } from "../types/pharmacy.types";
import { useOnlineStatus } from "../../offline/hooks/useOnlineStatus";
import { pharmacyOfflineService } from "../services/pharmacyOfflineService";
import { useAuthStore } from "@/store/auth";

export function usePharmacyOrders() {
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  // Still using mock data as baseline, but we could sync it offline
  return useQuery({
    queryKey: ["pharmacy", "orders", providerUuid],
    queryFn: async () => {
      if (!isOnline) {
        const localOrders = await pharmacyOfflineService.getOrders(providerUuid);
        if (localOrders.length > 0) return localOrders;
      }
      
      const mockOrders = [
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
      ];

      // Store mocks locally for offline testing
      const mapped = mockOrders.map(o => ({ ...o, uuid: o.id, providerUuid }));
      await pharmacyOfflineService.saveLocalSynced("pharmacyOrders", mapped as any);

      return mockOrders;
    }
  }).data || [];
}

export function useConfirmPharmacyOrder() {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const user = useAuthStore((state) => state.user);
  const providerUuid = (user as any)?.providerProfile?.uuid || (user as any)?.provider_profile?.uuid || "fallback-uuid";

  return useMutation<PharmacyOrder, Error, string>({
    mutationFn: async (orderId: string) => {
      if (!isOnline) {
        return await pharmacyOfflineService.saveOrderLocally(providerUuid, { 
          uuid: orderId, 
          status: 'confirmado' 
        } as any) as any;
      }
      const response = await apiClient.post(
        `/pharmacy/orders/${orderId}/confirm`,
      );
      await pharmacyOfflineService.saveLocalSynced("pharmacyOrders", { ...response.data.data, providerUuid });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "inventory"] });
      queryClient.invalidateQueries({ queryKey: ["pharmacy", "orders"] });
    },
  });
}
