import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ClinicalHistorySchema } from "../../features/clinical-history-builder/types";
import apiClient from "@/lib/api/client";

const BASE = "/form-templates";

async function fetchSchema(
  id: string,
): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await apiClient.get<{ schema: ClinicalHistorySchema }>(
    `${BASE}/${id}`,
  );
  return res.data;
}

async function fetchAllSchemas(): Promise<{
  schemas: Omit<ClinicalHistorySchema, "canvas">[];
}> {
  const res = await apiClient.get<{
    schemas: Omit<ClinicalHistorySchema, "canvas">[];
  }>(BASE);
  return res.data;
}

async function saveSchema(
  schema: ClinicalHistorySchema,
): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await apiClient.post<{ schema: ClinicalHistorySchema }>(
    BASE,
    schema,
  );
  return res.data;
}

async function deleteSchema(id: string): Promise<{ deleted: string }> {
  const res = await apiClient.delete<{ deleted: string }>(`${BASE}/${id}`);
  return res.data;
}

async function patchSchema(
  id: string,
  data: Partial<ClinicalHistorySchema>,
): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await apiClient.patch<{ schema: ClinicalHistorySchema }>(
    `${BASE}/${id}`,
    data,
  );
  return res.data;
}

// ─── Hooks ────────────────────────────────────────────────

export function useClinicalHistorySchema(id: string | null) {
  return useQuery({
    queryKey: ["clinical-history-schema", id],
    queryFn: () => fetchSchema(id!),
    enabled: !!id,
  });
}

export function useAllClinicalHistorySchemas() {
  return useQuery({
    queryKey: ["clinical-history-schemas"],
    queryFn: fetchAllSchemas,
  });
}

export function useSaveClinicalHistorySchema() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: saveSchema,
    onSuccess: (data) => {
      // Invalidate list and individual schema cache
      qc.invalidateQueries({ queryKey: ["clinical-history-schemas"] });
      qc.invalidateQueries({
        queryKey: ["clinical-history-schema", data.schema.id],
      });
    },
  });
}

export function useDeleteClinicalHistorySchema() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSchema,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clinical-history-schemas"] });
    },
  });
}

export function usePatchSchemaStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClinicalHistorySchema>;
    }) => patchSchema(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["clinical-history-schemas"] });
      qc.invalidateQueries({
        queryKey: ["clinical-history-schema", result.schema.id],
      });
    },
  });
}

async function shareSchema(payload: {
  patient_uuid: string;
  form_template_uuid: string;
  clinic_uuid?: string;
}): Promise<unknown> {
  const res = await apiClient.post(`${BASE}/share`, payload);
  return res.data;
}

export function useShareClinicalHistorySchema() {
  return useMutation({
    mutationFn: shareSchema,
  });
}
