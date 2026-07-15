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

export interface PatientFormRequest {
  id: number;
  uuid: string;
  patient_id: number;
  user_id: number;
  clinic_id: number | null;
  form_template_id: number;
  status: "pending" | "completed";
  completed_at: string | null;
  consultation_id: number | null;
  created_at: string;
  updated_at: string;
  form_template?: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    schema: ClinicalHistorySchema;
  };
  doctor?: {
    id: number;
    full_name: string;
  };
  clinic?: {
    id: number;
    name: string;
  };
}

async function fetchPatientFormRequests(): Promise<PatientFormRequest[]> {
  const res = await apiClient.get<{ data: PatientFormRequest[] }>(
    "/patients/me/form-requests",
  );
  return res.data.data;
}

async function fetchPatientFormRequest(
  uuid: string,
): Promise<PatientFormRequest> {
  const res = await apiClient.get<{ data: PatientFormRequest }>(
    `/patients/me/form-requests/${uuid}`,
  );
  return res.data.data;
}

async function submitPatientFormRequest({
  uuid,
  data,
}: {
  uuid: string;
  data: Record<string, unknown>;
}): Promise<unknown> {
  const res = await apiClient.post(
    `/patients/me/form-requests/${uuid}/submit`,
    data,
  );
  return res.data;
}

export function usePatientFormRequests() {
  return useQuery({
    queryKey: ["patient-form-requests"],
    queryFn: fetchPatientFormRequests,
  });
}

export function usePatientFormRequest(uuid: string | null) {
  return useQuery({
    queryKey: ["patient-form-request", uuid],
    queryFn: () => fetchPatientFormRequest(uuid!),
    enabled: !!uuid,
  });
}

export function useSubmitPatientFormRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitPatientFormRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-form-requests"] });
    },
  });
}
