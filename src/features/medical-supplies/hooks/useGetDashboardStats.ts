import { useQuery } from "@tanstack/react-query";
import { medicalSupplyApi } from "../api/medicalSupplyApi";

export const medicalSupplyDashboardKeys = {
  stats: ["medical-supply-dashboard-stats"] as const,
  topDemanded: ["medical-supply-dashboard-top-demanded"] as const,
};

export function useGetDashboardStats() {
  return useQuery({
    queryKey: medicalSupplyDashboardKeys.stats,
    queryFn: async () => {
      const response = await medicalSupplyApi.getDashboardStats();
      return response;
    },
  });
}

export function useGetTopDemanded() {
  return useQuery({
    queryKey: medicalSupplyDashboardKeys.topDemanded,
    queryFn: async () => {
      const response = await medicalSupplyApi.getTopDemanded();
      return response;
    },
  });
}
