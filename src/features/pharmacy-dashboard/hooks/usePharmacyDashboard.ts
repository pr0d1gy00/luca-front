import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { PharmacyKPI, PharmacyOrder, PharmacyNotification } from "../types";

export interface PharmacyDashboardSummary {
  kpis: PharmacyKPI[];
  orders: PharmacyOrder[];
  notifications: PharmacyNotification[];
}

export function usePharmacyDashboard() {
  return useQuery<PharmacyDashboardSummary, Error>({
    queryKey: ["pharmacy", "dashboard", "summary"],
    queryFn: async () => {
      const response = await apiClient.get("/pharmacy/dashboard/summary");
      return response.data;
    },
    // Optional: refresh every minute for live dashboard feel
    refetchInterval: false,
  });
}
