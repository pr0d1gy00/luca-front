import { useQuery } from "@tanstack/react-query";
import { availabilityApi } from "../api/availabilityApi";
import type { DoctorAvailability } from "../types";

// ─────────────────────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────────────────────
export const availabilityKeys = {
	all: ["availability"] as const,
	byDoctorDate: (doctorUuid: string, date: string, branchId?: string) =>
		[...availabilityKeys.all, doctorUuid, date, branchId || ""] as const,
};

// ─────────────────────────────────────────────────────────────
// Normalize API response to camelCase
// ─────────────────────────────────────────────────────────────
function normalizeAvailability(
	response: Awaited<ReturnType<typeof availabilityApi.getDoctorSlots>>,
): DoctorAvailability {
	const { data } = response;
	return {
		doctorUuid: data.doctor_id,
		date: data.date,
		weekday: data.weekday,
		isAvailable: data.is_available,
		schedule: data.schedule,
		slots: data.slots,
		exception: data.exception,
		branchId: (data as any).branch_id || undefined,
	};
}

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

/**
 * Get available slots for a doctor on a specific date
 *
 * Returns normalized camelCase data for UI consumption:
 * - is_available → isAvailable
 * - slots with available → isAvailable
 * - schedule info with snake_case keys (as-is from backend)
 */
export function useDoctorAvailability(params: {
	doctorUuid: string;
	date: string; // YYYY-MM-DD
	cityId?: string;
	branchId?: string;
	hasBranches?: boolean;
}) {
	return useQuery({
		queryKey: availabilityKeys.byDoctorDate(params.doctorUuid, params.date, params.branchId),
		queryFn: async () => {
			const response = await availabilityApi.getDoctorSlots({
				doctorUuid: params.doctorUuid,
				date: params.date,
				cityId: params.cityId,
				branchId: params.branchId,
			});
			return normalizeAvailability(response);
		},
		enabled: !!params.doctorUuid && !!params.date && (!params.hasBranches || !!params.branchId),
		staleTime: 30 * 1000, // 30 seconds — slots change frequently
		retry: 1,
	});
}
