import { db, type PatientRecord } from "@/features/offline/database/schema";
import { queueService } from "@/features/offline/services/queueService";
import {
	generateUUID,
	getCurrentTimestamp,
} from "@/features/offline/utils/uuid";
import type { CreatePatientDTO, UpdatePatientDTO, Patient } from "../types";
import type { EntityType } from "@/features/offline/types/sync.types";

const ENTITY: EntityType = "patients";

export const patientOfflineService = {
	create: async (data: CreatePatientDTO): Promise<PatientRecord> => {
		const now = getCurrentTimestamp();
		const uuid = generateUUID();

		const patient: PatientRecord = {
			uuid,
			firstName: data.firstName,
			lastName: data.lastName,
			nationalId: data.nationalId,
			birthDate: data.birthDate,
			gender: data.gender,
			phone: data.phone,
			email: data.email,
			address: data.address,
			cityId: data.cityId ?? null,
			bloodType: data.bloodType ?? "",
			allergies: data.allergies ?? "",
			chronicConditions: data.chronicConditions ?? "",
			privateNotes: data.privateNotes ?? "",
			emergencyContactName: data.emergencyContactName ?? "",
			emergencyContactPhone: data.emergencyContactPhone ?? "",
			updatedAt: now,
			createdAt: now,
			_syncStatus: "pending",
		};

		await db.patients.add(patient);
		await queueService.enqueue(ENTITY, "create", patient);
		return patient;
	},

	update: async (
		uuid: string,
		data: UpdatePatientDTO,
	): Promise<PatientRecord | null> => {
		const existing = await db.patients.get(uuid);
		if (!existing) return null;

		const now = getCurrentTimestamp();
		const updated: PatientRecord = {
			...existing,
			...data,
			uuid,
			updatedAt: now,
			_syncStatus: "pending",
		};

		await db.patients.put(updated);
		await queueService.enqueue(ENTITY, "update", updated);
		return updated;
	},

	delete: async (uuid: string): Promise<boolean> => {
		const existing = await db.patients.get(uuid);
		if (!existing) return false;

		const now = getCurrentTimestamp();
		await db.patients.update(uuid, {
			updatedAt: now,
			deletedAt: now,
			_syncStatus: "pending",
		});
		await queueService.enqueue(ENTITY, "delete", { uuid });
		return true;
	},

	getAll: async (): Promise<PatientRecord[]> => {
		return db.patients.toArray();
	},

	getByUUID: async (uuid: string): Promise<PatientRecord | undefined> => {
		return db.patients.get(uuid);
	},

	getPending: async (): Promise<PatientRecord[]> => {
		return db.patients.where("_syncStatus").equals("pending").toArray();
	},

	saveLocalSynced: async (patient: Patient): Promise<void> => {
		await db.patients.put({
			uuid: patient.uuid,
			firstName: patient.firstName,
			lastName: patient.lastName,
			nationalId: patient.nationalId,
			birthDate: patient.birthDate,
			gender: patient.gender,
			phone: patient.phone,
			email: patient.email,
			address: patient.address,
			cityId: patient.cityId ?? null,
			bloodType: patient.bloodType ?? "",
			allergies: patient.allergies ?? "",
			chronicConditions: patient.chronicConditions ?? "",
			privateNotes: patient.privateNotes ?? "",
			emergencyContactName: patient.emergencyContactName ?? "",
			emergencyContactPhone: patient.emergencyContactPhone ?? "",
			updatedAt: patient.updatedAt ?? getCurrentTimestamp(),
			createdAt: patient.createdAt ?? getCurrentTimestamp(),
			_syncStatus: "synced",
		});
	},

	deleteLocal: async (uuid: string): Promise<void> => {
		await db.patients.delete(uuid);
	},

	markSynced: async (uuid: string): Promise<void> => {
		await db.patients.update(uuid, { _syncStatus: "synced" });
	},

	markError: async (uuid: string, error: string): Promise<void> => {
		await db.patients.update(uuid, { _syncStatus: "error", _syncError: error });
	},
};
