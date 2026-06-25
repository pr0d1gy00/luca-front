"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "../api/patientApi";
import { patientOfflineService } from "../services/patientOfflineService";
import type { CreatePatientDTO, UpdatePatientDTO } from "../types";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────
export const patientKeys = {
	all: ["patients"] as const,
	lists: () => [...patientKeys.all, "list"] as const,
	list: () => [...patientKeys.lists()] as const,
	details: () => [...patientKeys.all, "detail"] as const,
	detail: (uuid: string) => [...patientKeys.details(), uuid] as const,
};

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get all patients — prefers server data, falls back to local
 */
export function usePatients() {
	return useQuery({
		queryKey: patientKeys.list(),
		queryFn: async () => {
			try {
				const response = await patientApi.getAll();
				// Save to local IndexedDB for offline access
				for (const patient of response.data) {
					await patientOfflineService.markSynced(patient.uuid);
				}
				return response.data;
			} catch {
				// Fallback to local data
				return patientOfflineService.getAll();
			}
		},
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Get single patient by UUID
 */
export function usePatient(uuid: string) {
	return useQuery({
		queryKey: patientKeys.detail(uuid),
		queryFn: async () => {
			try {
				const response = await patientApi.getByUUID(uuid);
				await patientOfflineService.markSynced(response.data.uuid);
				return response.data;
			} catch {
				return patientOfflineService.getByUUID(uuid);
			}
		},
		enabled: !!uuid,
	});
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create patient — saves locally immediately, queues for sync
 */
export function useCreatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreatePatientDTO) => {
			return patientOfflineService.create(data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}

/**
 * Update patient — saves locally immediately, queues for sync
 */
export function useUpdatePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			uuid,
			data,
		}: {
			uuid: string;
			data: UpdatePatientDTO;
		}) => {
			return patientOfflineService.update(uuid, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}

/**
 * Delete patient — marks locally, queues for sync
 */
export function useDeletePatient() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (uuid: string) => {
			return patientOfflineService.delete(uuid);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}
