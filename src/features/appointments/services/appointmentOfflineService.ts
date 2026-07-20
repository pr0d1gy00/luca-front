import { db, type Appointment } from "@/features/offline/database/schema";
import { queueService } from "@/features/offline/services/queueService";
import {
	generateUUID,
	getCurrentTimestamp,
} from "@/features/offline/utils/uuid";
import { getLocalTodayString } from "@/lib/utils";
import type { CreateAppointmentDTO, UpdateAppointmentDTO } from "../types";
import type { EntityType } from "@/features/offline/types/sync.types";

const ENTITY: EntityType = "appointments";

/**
 * Appointment Offline Service
 * Handles CRUD operations with local IndexedDB + sync queue
 */
export const appointmentOfflineService = {
	/**
	 * Create appointment locally and queue for sync
	 */
	create: async (data: CreateAppointmentDTO): Promise<Appointment> => {
		try {
			if (!db.isOpen()) {
				await db.open();
			}

			const now = getCurrentTimestamp();
			const uuid = generateUUID();

			const appointment: Appointment = {
				uuid,
				patientUuid: data.patientUuid ?? "",
				doctorUuid: data.doctorUuid ?? "",
				clinicBranchUuid: data.clinicBranchUuid ?? "",
				date: data.date,
				time: data.time,
				slotTime: data.slotTime ?? null,
				type: data.type,
				status: data.type === "EXCEPTION" ? "IN_ROOM" : "PENDING",
				notes: data.notes ?? "",
				reason: data.reason ?? "",
				updatedAt: now,
				createdAt: now,
				_syncStatus: "pending",
			};

			await db.appointments.add(appointment);
			await queueService.enqueue(ENTITY, "create", appointment);

			return appointment;
		} catch (err) {
			console.warn("[appointmentOfflineService] IndexedDB unavailable or closed, throwing to trigger API fallback:", err);
			throw err;
		}
	},

	/**
	 * Update appointment locally and queue for sync
	 */
	update: async (
		uuid: string,
		data: UpdateAppointmentDTO,
	): Promise<Appointment | null> => {
		const existing = await db.appointments.get(uuid);
		if (!existing) return null;

		const now = getCurrentTimestamp();

		const updated: Appointment = {
			...existing,
			...data,
			uuid,
			updatedAt: now,
			_syncStatus: "pending",
		};

		await db.appointments.put(updated);
		await queueService.enqueue(ENTITY, "update", updated);

		return updated;
	},

	/**
	 * Update appointment status locally
	 */
	updateStatus: async (
		uuid: string,
		status: Appointment["status"],
	): Promise<Appointment | null> => {
		const existing = await db.appointments.get(uuid);
		if (!existing) return null;

		const now = getCurrentTimestamp();

		const updated: Appointment = {
			...existing,
			status,
			updatedAt: now,
			_syncStatus: "pending",
		};

		await db.appointments.put(updated);
		await queueService.enqueue(ENTITY, "update", updated);

		return updated;
	},

	/**
	 * Soft delete appointment locally and queue for sync
	 */
	delete: async (uuid: string): Promise<boolean> => {
		const existing = await db.appointments.get(uuid);
		if (!existing) return false;

		const now = getCurrentTimestamp();

		await db.appointments.update(uuid, {
			updatedAt: now,
			deletedAt: now,
			_syncStatus: "pending",
		});

		await queueService.enqueue(ENTITY, "delete", { uuid });

		return true;
	},

	/**
	 * Get all appointments from local IndexedDB
	 */
	getAll: async (): Promise<Appointment[]> => {
		return db.appointments.toArray();
	},

	/**
	 * Get appointments by patient
	 */
	getByPatient: async (patientUuid: string): Promise<Appointment[]> => {
		return db.appointments.where("patientUuid").equals(patientUuid).toArray();
	},

	/**
	 * Get appointments by doctor
	 */
	getByDoctor: async (doctorUuid: string): Promise<Appointment[]> => {
		return db.appointments.where("doctorUuid").equals(doctorUuid).toArray();
	},

	/**
	 * Get upcoming appointments (future dates)
	 */
	getUpcoming: async (): Promise<Appointment[]> => {
		const today = getLocalTodayString();
		const all = await db.appointments.toArray();
		return all.filter((a) => {
			return !a.deletedAt && a.status !== "CANCELLED" && a.date >= today;
		});
	},

	/**
	 * Get pending sync appointments
	 */
	getPending: async (): Promise<Appointment[]> => {
		return db.appointments.where("_syncStatus").equals("pending").toArray();
	},

	/**
	 * Get single appointment by UUID
	 */
	getByUUID: async (uuid: string): Promise<Appointment | undefined> => {
		return db.appointments.get(uuid);
	},

	/**
	 * Mark appointment as synced
	 */
	markSynced: async (uuid: string): Promise<void> => {
		await db.appointments.update(uuid, { _syncStatus: "synced" });
	},

	/**
	 * Mark appointment as error
	 */
	markError: async (uuid: string, error: string): Promise<void> => {
		await db.appointments.update(uuid, {
			_syncStatus: "error",
			_syncError: error,
		});
	},
};
