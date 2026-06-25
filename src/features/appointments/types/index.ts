import type { AppointmentType, AppointmentStatus } from "../schemas";
import type { SyncableEntity } from "@/features/offline/types/sync.types";

// ─────────────────────────────────────────────────────────────
// AVAILABILITY — slots disponibles del doctor
// ─────────────────────────────────────────────────────────────

/** Single time slot from API */
export interface Slot {
	time: string; // "08:00"
	available: boolean;
}

/** Schedule info for the day */
export interface DaySchedule {
	start_time: string; // "08:00"
	end_time: string; // "17:00"
	appointment_duration: number; // minutes
	max_per_slot: number;
}

/** Exception info when doctor is unavailable */
export interface ScheduleExceptionInfo {
	type: "VACATION" | "DAY_OFF" | "CUSTOM_HOURS";
	reason: string | null;
}

/** Full availability response from backend */
export interface DoctorAvailabilityResponse {
	data: {
		doctor_id: string;
		date: string; // YYYY-MM-DD
		weekday: string; // "WEDNESDAY"
		is_available: boolean;
		schedule: DaySchedule | null;
		slots: Slot[];
		exception: ScheduleExceptionInfo | null;
	};
}

/** Normalized availability for UI consumption */
export interface DoctorAvailability {
	doctorUuid: string;
	date: string;
	weekday: string;
	isAvailable: boolean;
	schedule: DaySchedule | null;
	slots: Slot[];
	exception: ScheduleExceptionInfo | null;
}

// ─────────────────────────────────────────────────────────────
// BOOKING FORM DATA
// ─────────────────────────────────────────────────────────────
export interface BookingFormData {
	doctorUuid: string;
	clinicBranchUuid?: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:MM
	slotTime: string; // HH:MM (normalized)
	type: AppointmentType;
	reason: string;
	notes?: string;
}

// ─────────────────────────────────────────────────────────────
// LABELS — Spanish display
// ─────────────────────────────────────────────────────────────
export const appointmentTypeLabels: Record<AppointmentType, string> = {
	IN_PERSON: "Presencial",
	ONLINE: "Online",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
	PENDING: "Pendiente",
	CONFIRMED: "Confirmada",
	IN_ROOM: "En Sala",
	COMPLETED: "Completada",
	CANCELLED: "Cancelada",
	NO_SHOW: "No asistida",
};

// ─────────────────────────────────────────────────────────────
// DTOs — Data Transfer Objects for mutations
// ─────────────────────────────────────────────────────────────

export interface CreateAppointmentDTO {
	patientUuid: string;
	doctorUuid: string;
	clinicBranchUuid?: string;
	date: string; // YYYY-MM-DD
	time: string; // HH:MM
	slotTime?: string; // HH:MM:SS
	type: AppointmentType;
	reason?: string;
	notes?: string;
}

export interface UpdateAppointmentDTO extends Partial<CreateAppointmentDTO> {
	uuid: string;
}

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────────────────────

export interface Appointment extends SyncableEntity {
	patientUuid: string;
	doctorUuid: string;
	clinicBranchUuid: string;
	date: string;
	time: string;
	slotTime: string | null;
	type: AppointmentType;
	status: AppointmentStatus;
	reason: string;
	notes: string;
}

export interface AppointmentsResponse {
	data: Appointment[];
}

export interface AppointmentResponse {
	data: Appointment;
}

// ─────────────────────────────────────────────────────────────
// HELPER TYPES for forms
// ─────────────────────────────────────────────────────────────

export type DoctorOption = {
	uuid: string;
	fullName: string;
	specialtyName: string;
};

export type PatientOption = {
	uuid: string;
	fullName: string;
	nationalId: string;
};

// Status badge colors
export const statusColors: Record<
	AppointmentStatus,
	{ bg: string; text: string; dot: string }
> = {
	PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
	CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
	IN_ROOM: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
	COMPLETED: {
		bg: "bg-emerald-50",
		text: "text-emerald-700",
		dot: "bg-emerald-400",
	},
	CANCELLED: {
		bg: "bg-slate-100",
		text: "text-slate-500",
		dot: "bg-slate-400",
	},
	NO_SHOW: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
};
