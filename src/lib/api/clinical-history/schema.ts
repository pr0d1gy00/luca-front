import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClinicalHistorySchema } from '../../features/clinical-history-builder/types';

const BASE = '/api/clinical-history-schema';

async function fetchSchema(id: string): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error('Schema not found');
  return res.json();
}

async function fetchAllSchemas(): Promise<{ schemas: Omit<ClinicalHistorySchema, 'canvas'>[] }> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Failed to fetch schemas');
  return res.json();
}

async function saveSchema(schema: ClinicalHistorySchema): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schema),
  });
  if (!res.ok) throw new Error('Failed to save schema');
  return res.json();
}

async function deleteSchema(id: string): Promise<{ deleted: string }> {
  const res = await fetch(`${BASE}?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete schema');
  return res.json();
}

async function patchSchema(id: string, data: Partial<ClinicalHistorySchema>): Promise<{ schema: ClinicalHistorySchema }> {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to patch schema');
  return res.json();
}

// ─── Hooks ────────────────────────────────────────────────

export function useClinicalHistorySchema(id: string | null) {
  return useQuery({
    queryKey: ['clinical-history-schema', id],
    queryFn: () => fetchSchema(id!),
    enabled: !!id,
  });
}

export function useAllClinicalHistorySchemas() {
  return useQuery({
    queryKey: ['clinical-history-schemas'],
    queryFn: fetchAllSchemas,
  });
}

export function useSaveClinicalHistorySchema() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: saveSchema,
    onSuccess: (data) => {
      // Invalidate list and individual schema cache
      qc.invalidateQueries({ queryKey: ['clinical-history-schemas'] });
      qc.invalidateQueries({ queryKey: ['clinical-history-schema', data.schema.id] });
    },
  });
}

export function useDeleteClinicalHistorySchema() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteSchema,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clinical-history-schemas'] });
    },
  });
}

export function usePatchSchemaStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClinicalHistorySchema> }) =>
      patchSchema(id, data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['clinical-history-schemas'] });
      qc.invalidateQueries({ queryKey: ['clinical-history-schema', result.schema.id] });
    },
  });
}
