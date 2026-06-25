import apiClient from "@/lib/api/client";
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
		const response = await apiClient.get<PatientsResponse>("/patients");
		return response.data;
	},

	/**
	 * Get single patient by UUID
	 */
	getByUUID: async (uuid: string): Promise<PatientResponse> => {
		const response = await apiClient.get<PatientResponse>(`/patients/${uuid}`);
		return response.data;
	},

	/**
	 * Create new patient
	 */
	create: async (data: CreatePatientDTO): Promise<PatientResponse> => {
		const response = await apiClient.post<PatientResponse>("/patients", data);
		return response.data;
	},

	/**
	 * Update existing patient
	 */
	update: async (data: UpdatePatientDTO): Promise<PatientResponse> => {
		const response = await apiClient.put<PatientResponse>(
			`/patients/${data.uuid}`,
			data,
		);
		return response.data;
	},

	/**
	 * Delete patient (soft delete)
	 */
	delete: async (uuid: string): Promise<void> => {
		await apiClient.delete(`/patients/${uuid}`);
	},
};
