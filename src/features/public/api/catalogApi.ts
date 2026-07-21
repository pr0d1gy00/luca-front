import axios from "axios";
import type {
	DoctorsResponse,
	PharmaciesResponse,
	ClinicsResponse,
	City,
} from "../types/catalog.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/**
 * Public Catalog API
 * No authentication required
 */
export const catalogApi = {
	/**
	 * Get doctors catalog
	 */
	getDoctors: async (params?: {
		city_id?: number | string;
		specialty_id?: number | string;
		page?: number;
		per_page?: number;
		search?: string;
	}): Promise<DoctorsResponse> => {
		const response = await axios.get<DoctorsResponse>(
			`${API_BASE}/public/doctors`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get pharmacies catalog
	 */
	getPharmacies: async (params?: {
		city_id?: number | string;
		page?: number;
		per_page?: number;
		search?: string;
	}): Promise<PharmaciesResponse> => {
		const response = await axios.get<PharmaciesResponse>(
			`${API_BASE}/public/pharmacies`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get clinics catalog
	 */
	getClinics: async (params?: {
		city_id?: number | string;
		page?: number;
		per_page?: number;
		search?: string;
	}): Promise<ClinicsResponse> => {
		const response = await axios.get<ClinicsResponse>(
			`${API_BASE}/public/clinics`,
			{ params },
		);
		return response.data;
	},

	/**
	 * Get cities list (for filters)
	 */
	getCities: async (): Promise<{ data: City[] }> => {
		const response = await axios.get<{ data: City[] }>(
			`${API_BASE}/locations/cities`,
		);
		return response.data;
	},
};
