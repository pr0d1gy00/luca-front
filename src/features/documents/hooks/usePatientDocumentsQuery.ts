"use client";

import { useQuery } from "@tanstack/react-query";
import { patientDocumentApi } from "../api/patientDocumentApi";
import { useAuthStore } from "@/store/auth";

export const patientDocumentKeys = {
  all: ["patient-documents"] as const,
  list: (page: number, search?: string, type?: string) =>
    [...patientDocumentKeys.all, "list", page, { search, type }] as const,
};

export function usePatientDocumentsQuery(
  page: number = 1,
  search?: string,
  type?: string,
) {
  const { user } = useAuthStore();
  const patientUuid = user?.id ?? user?.uuid ?? "";

  return useQuery({
    queryKey: patientDocumentKeys.list(page, search, type),
    queryFn: () => patientDocumentApi.getPatientDocuments(page, search, type),
    enabled: !!patientUuid,
    staleTime: 30 * 1000,
  });
}
