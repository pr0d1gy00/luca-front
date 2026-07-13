"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientApi } from "../api/patientApi";
import { patientOfflineService } from "../services/patientOfflineService";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
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
					await patientOfflineService.saveLocalSynced(patient);
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
				await patientOfflineService.saveLocalSynced(response.data);
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
 * Create patient — saves locally immediately, queues for sync if offline
 */
export function useCreatePatient() {
	const queryClient = useQueryClient();
	const isOnline = useOnlineStatus();

	return useMutation({
		mutationFn: async (data: CreatePatientDTO) => {
			if (!isOnline) {
				return patientOfflineService.create(data);
			} else {
				const response = await patientApi.create(data);
				const patient = response.data;
				await patientOfflineService.saveLocalSynced(patient);
				return patient;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}

/**
 * Update patient — saves locally immediately, queues for sync if offline
 */
export function useUpdatePatient() {
	const queryClient = useQueryClient();
	const isOnline = useOnlineStatus();

	return useMutation({
		mutationFn: async ({
			uuid,
			data,
		}: {
			uuid: string;
			data: UpdatePatientDTO;
		}) => {
			if (!isOnline) {
				return patientOfflineService.update(uuid, data);
			} else {
				const response = await patientApi.update({ ...data, uuid });
				const patient = response.data;
				await patientOfflineService.saveLocalSynced(patient);
				return patient;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}

/**
 * Delete patient — marks locally, queues for sync if offline
 */
export function useDeletePatient() {
	const queryClient = useQueryClient();
	const isOnline = useOnlineStatus();

	return useMutation({
		mutationFn: async (uuid: string) => {
			if (!isOnline) {
				return patientOfflineService.delete(uuid);
			} else {
				await patientApi.delete(uuid);
				await patientOfflineService.deleteLocal(uuid);
				return true;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
		},
	});
}
