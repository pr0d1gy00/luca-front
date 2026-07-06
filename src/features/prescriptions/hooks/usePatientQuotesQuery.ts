"use client";

import { useQuery } from "@tanstack/react-query";
import { prescriptionApi } from "../api/prescriptionApi";
import { useAuthStore } from "@/store/auth";

export const patientQuotesKeys = {
  all: ["patient-quotes"] as const,
};

export function usePatientQuotesQuery() {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  return useQuery({
    queryKey: patientQuotesKeys.all,
    queryFn: async () => {
      const response = await prescriptionApi.getPatientQuotes();
      const payload = response as Record<string, unknown>;
      return payload?.data || payload;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!patientUuid,
  });
}
