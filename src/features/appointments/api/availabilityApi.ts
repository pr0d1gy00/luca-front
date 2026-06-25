import apiClient from "@/lib/api/client";
import type { DoctorAvailabilityResponse } from "../types";

/**
 * Availability API
 * Fetches doctor's available slots for a given date
 * Endpoint: GET /public/doctors/{doctorId}/availability
 */
export const availabilityApi = {
	/**
	 * Get available time slots for a doctor on a specific date
	 *
	 * @param params.doctorUuid - Doctor's UUID
	 * @param params.date - Date in YYYY-MM-DD format
	 * @param params.cityId - Optional city filter
	 * @param params.branchId - Optional branch filter
	 */
	getDoctorSlots: async (params: {
		doctorUuid: string;
		date: string; // YYYY-MM-DD
		cityId?: string;
		branchId?: string;
	}): Promise<DoctorAvailabilityResponse> => {
		const response = await apiClient.get<DoctorAvailabilityResponse>(
			`/public/doctors/${params.doctorUuid}/availability`,
			{
				params: {
					date: params.date,
					city_id: params.cityId,
					branch_id: params.branchId,
				},
			},
		);
		return response.data;
	},
};
