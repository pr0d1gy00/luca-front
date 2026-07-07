"use client";

import { useQuery } from "@tanstack/react-query";
import { patientInvoiceApi } from "../api/patientInvoiceApi";
import { useAuthStore } from "@/store/auth";

export const patientInvoiceKeys = {
  all: ["patient-invoices"] as const,
  list: (page: number) => [...patientInvoiceKeys.all, "list", page] as const,
};

export function usePatientInvoicesQuery(page: number = 1) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  return useQuery({
    queryKey: patientInvoiceKeys.list(page),
    queryFn: () => patientInvoiceApi.getPatientInvoices(page),
    enabled: !!patientUuid,
    staleTime: 30 * 1000,
  });
}
