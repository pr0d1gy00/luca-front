import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

export function useLabAnalytics() {
  return useQuery({
    queryKey: ["lab-analytics"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/api/v1/laboratory/analytics/metrics",
      );
      return response.data?.data;
    },
  });
}
