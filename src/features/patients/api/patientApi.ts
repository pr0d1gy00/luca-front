import apiClient from "@/lib/api/client";
import { serverToClient, clientToServer } from "@/features/offline/utils/uuid";
import type {
	Patient,
	PatientsResponse,
	PatientResponse,
	CreatePatientDTO,
	UpdatePatientDTO,
} from "../types";

/**
 * Patient API — uses authenticated apiClient (JWT)
 */
export const patientApi = {
	/**
	 * Get all patients for current doctor
	 */
	getAll: async (): Promise<PatientsResponse> => {
		const response = await apiClient.get<{ data: any[] }>("/patients");
		const mappedData = (response.data.data ?? response.data ?? []).map((p) =>
			serverToClient<Patient>(p),
		);
		return { data: mappedData };
	},

	/**
	 * Get single patient by UUID
	 */
	getByUUID: async (uuid: string): Promise<PatientResponse> => {
		const response = await apiClient.get<{ data: any }>(`/patients/${uuid}`);
		const mappedData = serverToClient<Patient>(response.data.data ?? response.data);
		return { data: mappedData };
	},

	/**
	 * Create new patient
	 */
	create: async (data: CreatePatientDTO): Promise<PatientResponse> => {
		const serverData = clientToServer(data as unknown as Record<string, unknown>);
		const response = await apiClient.post<{ data: any }>("/patients", serverData);
		const mappedData = serverToClient<Patient>(response.data.data ?? response.data);
		return { data: mappedData };
	},

	/**
	 * Update existing patient
	 */
	update: async (data: UpdatePatientDTO): Promise<PatientResponse> => {
		const serverData = clientToServer(data as unknown as Record<string, unknown>);
		const response = await apiClient.put<{ data: any }>(
			`/patients/${data.uuid}`,
			serverData,
		);
		const mappedData = serverToClient<Patient>(response.data.data ?? response.data);
		return { data: mappedData };
	},

	/**
	 * Delete patient (soft delete)
	 */
	delete: async (uuid: string): Promise<void> => {
		await apiClient.delete(`/patients/${uuid}`);
	},
};
