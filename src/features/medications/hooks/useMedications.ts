"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationApi } from "../api/medicationApi";
import type { Medication } from "../schemas";
import { toast } from "sonner";

export const medicationKeys = {
  all: ["medications"] as const,
  lists: () => [...medicationKeys.all, "list"] as const,
  list: (search?: string, page?: number) => [...medicationKeys.lists(), { search, page }] as const,
};

export function useMedications(search?: string, page = 1) {
  return useQuery({
    queryKey: medicationKeys.list(search, page),
    queryFn: async () => {
      const res = await medicationApi.getAll(search, page);
      return res;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 30 * 1000,
  });
}

export function useTopPrescribedMedications() {
  return useQuery({
    queryKey: [...medicationKeys.all, "top-prescribed"],
    queryFn: async () => {
      const res = await medicationApi.getTopPrescribed();
      return res;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Medication>) => {
      const res = await medicationApi.create(data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medicamento registrado con éxito.");
    },
    onError: () => {
      toast.error("Error al registrar el medicamento.");
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: Partial<Medication> }) => {
      const res = await medicationApi.update(uuid, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medicamento actualizado con éxito.");
    },
    onError: () => {
      toast.error("Error al actualizar el medicamento.");
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await medicationApi.delete(uuid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.lists() });
      toast.success("Medicamento eliminado con éxito.");
    },
    onError: () => {
      toast.error("Error al eliminar el medicamento.");
    },
  });
}
