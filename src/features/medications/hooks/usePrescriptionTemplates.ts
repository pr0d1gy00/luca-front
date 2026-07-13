"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prescriptionTemplateApi } from "../api/prescriptionTemplateApi";
import type { PrescriptionTemplate } from "../schemas";
import { toast } from "sonner";

export const templateKeys = {
  all: ["prescription-templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (page?: number) => [...templateKeys.lists(), { page }] as const,
};

export function usePrescriptionTemplates(page = 1) {
  return useQuery({
    queryKey: templateKeys.list(page),
    queryFn: async () => {
      const res = await prescriptionTemplateApi.getAll(page);
      return res;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

export function useCreatePrescriptionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<PrescriptionTemplate>) => {
      const res = await prescriptionTemplateApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Combo registrado con éxito.");
    },
    onError: () => {
      toast.error("Error al registrar el combo.");
    },
  });
}

export function useUpdatePrescriptionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: Partial<PrescriptionTemplate> }) => {
      const res = await prescriptionTemplateApi.update(uuid, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Combo actualizado con éxito.");
    },
    onError: () => {
      toast.error("Error al actualizar el combo.");
    },
  });
}

export function useDeletePrescriptionTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await prescriptionTemplateApi.delete(uuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      toast.success("Combo eliminado con éxito.");
    },
    onError: () => {
      toast.error("Error al eliminar el combo.");
    },
  });
}
