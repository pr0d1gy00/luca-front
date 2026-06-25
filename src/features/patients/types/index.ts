import type {
	SyncableEntity,
	EntityType,
} from "@/features/offline/types/sync.types";

// ─────────────────────────────────────────────────────────────
// Patient — matches offline sync schema
// ─────────────────────────────────────────────────────────────
export interface Patient extends SyncableEntity {
	// Identity
	firstName: string;
	lastName: string;
	nationalId: string;
	birthDate: string;
	gender: "male" | "female" | "other";

	// Contact
	phone: string;
	email: string;
	address: string;
	cityId: string | null;

	// Medical
	bloodType: string;
	allergies: string;
	chronicConditions: string;

	// Private notes
	privateNotes: string;

	// Emergency
	emergencyContactName: string;
	emergencyContactPhone: string;
}

// ─────────────────────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────────────────────
export interface PatientsResponse {
	data: Patient[];
}

export interface PatientResponse {
	data: Patient;
}

// ─────────────────────────────────────────────────────────────
// Create/Update DTOs
// ─────────────────────────────────────────────────────────────
export interface CreatePatientDTO {
	firstName: string;
	lastName: string;
	nationalId: string;
	birthDate: string;
	gender: "male" | "female" | "other";
	phone: string;
	email: string;
	address: string;
	cityId?: string | null;
	bloodType?: string;
	allergies?: string;
	chronicConditions?: string;
	privateNotes?: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
}

export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {
	uuid: string;
}

// ─────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────
export function getPatientFullName(patient: Patient): string {
	return `${patient.firstName} ${patient.lastName}`;
}

export function getPatientAge(patient: Patient): number {
	const birthDate = new Date(patient.birthDate);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}
	return age;
}

// ─────────────────────────────────────────────────────────────
// Sync entity type
// ─────────────────────────────────────────────────────────────
export const PATIENT_ENTITY: EntityType = "patients";
