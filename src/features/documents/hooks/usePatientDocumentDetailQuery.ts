"use client";

import { useQuery } from "@tanstack/react-query";
import { patientDocumentApi } from "../api/patientDocumentApi";

export const patientDocumentDetailKeys = {
  detail: (uuid: string) => ["patient-documents", "detail", uuid] as const,
};

export function usePatientDocumentDetailQuery(uuid: string) {
  return useQuery({
    queryKey: patientDocumentDetailKeys.detail(uuid),
    queryFn: () => patientDocumentApi.getPatientDocumentDetail(uuid),
    enabled: !!uuid,
    staleTime: 10 * 1000,
  });
}
