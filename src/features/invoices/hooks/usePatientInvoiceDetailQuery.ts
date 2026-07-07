"use client";

import { useQuery } from "@tanstack/react-query";
import { patientInvoiceApi } from "../api/patientInvoiceApi";

export const patientInvoiceDetailKeys = {
  detail: (uuid: string) => ["patient-invoices", "detail", uuid] as const,
};

export function usePatientInvoiceDetailQuery(uuid: string) {
  return useQuery({
    queryKey: patientInvoiceDetailKeys.detail(uuid),
    queryFn: () => patientInvoiceApi.getPatientInvoiceDetail(uuid),
    enabled: !!uuid,
    staleTime: 10 * 1000,
  });
}
