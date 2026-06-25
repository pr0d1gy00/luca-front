"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentApi } from "../api/appointmentApi";
import { appointmentOfflineService } from "../services/appointmentOfflineService";
import { syncService } from "@/features/offline/services/syncService";
import type { CreateAppointmentDTO, UpdateAppointmentDTO } from "../types";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────
export const appointmentKeys = {
	all: ["appointments"] as const,
	lists: () => [...appointmentKeys.all, "list"] as const,
	list: () => [...appointmentKeys.lists()] as const,
	upcoming: () => [...appointmentKeys.all, "upcoming"] as const,
	details: () => [...appointmentKeys.all, "detail"] as const,
	detail: (uuid: string) => [...appointmentKeys.details(), uuid] as const,
	byPatient: (uuid: string) =>
		[...appointmentKeys.all, "patient", uuid] as const,
	byDoctor: (uuid: string) => [...appointmentKeys.all, "doctor", uuid] as const,
};

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get all appointments
 */
export function useAppointments() {
	return useQuery({
		queryKey: appointmentKeys.list(),
		queryFn: async () => {
			try {
				const response = await appointmentApi.getAll();
				for (const apt of response.data) {
					await appointmentOfflineService.markSynced(apt.uuid);
				}
				return response.data;
			} catch {
				return appointmentOfflineService.getAll();
			}
		},
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Get upcoming appointments
 */
export function useUpcomingAppointments() {
	return useQuery({
		queryKey: appointmentKeys.upcoming(),
		queryFn: async () => {
			try {
				const response = await appointmentApi.getAll();
				const upcoming = response.data.filter((a) => {
					const today = new Date().toISOString().split("T")[0];
					return a.date >= today && a.status !== "CANCELLED";
				});
				return upcoming;
			} catch {
				return appointmentOfflineService.getUpcoming();
			}
		},
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * Get appointments by patient
 */
export function useAppointmentsByPatient(patientUuid: string) {
	return useQuery({
		queryKey: appointmentKeys.byPatient(patientUuid),
		queryFn: async () => {
			try {
				const response = await appointmentApi.getByPatient(patientUuid);
				return response.data;
			} catch {
				return appointmentOfflineService.getByPatient(patientUuid);
			}
		},
		enabled: !!patientUuid,
	});
}

/**
 * Get appointments by doctor
 */
export function useAppointmentsByDoctor(doctorUuid: string) {
	return useQuery({
		queryKey: appointmentKeys.byDoctor(doctorUuid),
		queryFn: async () => {
			try {
				const response = await appointmentApi.getByDoctor(doctorUuid);
				return response.data;
			} catch {
				return appointmentOfflineService.getByDoctor(doctorUuid);
			}
		},
		enabled: !!doctorUuid,
	});
}

/**
 * Get single appointment
 */
export function useAppointment(uuid: string) {
	return useQuery({
		queryKey: appointmentKeys.detail(uuid),
		queryFn: async () => {
			try {
				const response = await appointmentApi.getByUUID(uuid);
				return response.data;
			} catch {
				return appointmentOfflineService.getByUUID(uuid);
			}
		},
		enabled: !!uuid,
	});
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

/**
 * Create appointment — saves locally immediately, queues for sync
 */
export function useCreateAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateAppointmentDTO) => {
			return appointmentOfflineService.create(data);
		},
		onSuccess: async () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
			if (typeof window !== "undefined" && navigator.onLine) {
				try {
					await syncService.sync();
					queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
				} catch (err) {
					console.error("Auto-sync on creation failed:", err);
				}
			}
		},
	});
}

/**
 * Update appointment — saves locally immediately, queues for sync
 */
export function useUpdateAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			uuid,
			data,
		}: {
			uuid: string;
			data: UpdateAppointmentDTO;
		}) => {
			return appointmentOfflineService.update(uuid, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
		},
	});
}

/**
 * Update appointment status
 */
export function useUpdateAppointmentStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ uuid, status }: { uuid: string; status: string }) => {
			return appointmentOfflineService.updateStatus(
				uuid,
				status as
					| "PENDING"
					| "CONFIRMED"
					| "IN_ROOM"
					| "COMPLETED"
					| "CANCELLED",
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
		},
	});
}

/**
 * Cancel appointment
 */
export function useCancelAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (uuid: string) => {
			return appointmentOfflineService.updateStatus(uuid, "CANCELLED");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
		},
	});
}

/**
 * Delete appointment
 */
export function useDeleteAppointment() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (uuid: string) => {
			return appointmentOfflineService.delete(uuid);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
		},
	});
}
