import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// ENUMS — English values (internal), Spanish labels (display)
// ─────────────────────────────────────────────────────────────
export const appointmentTypeEnum = z.enum(["IN_PERSON", "ONLINE"]);
export type AppointmentType = z.infer<typeof appointmentTypeEnum>;

export const appointmentStatusEnum = z.enum([
	"PENDING",
	"CONFIRMED",
	"IN_ROOM",
	"COMPLETED",
	"CANCELLED",
	"NO_SHOW",
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;

// ─────────────────────────────────────────────────────────────
// SCHEMA — ISO date strings, not Date objects
// ─────────────────────────────────────────────────────────────
export const appointmentSchema = z.object({
	patientUuid: z.string().min(1),
	doctorUuid: z.string().min(1),
	clinicBranchUuid: z.string().optional(),
	date: z.string(), // ISO date: YYYY-MM-DD
	time: z.string().min(1), // HH:MM
	type: appointmentTypeEnum,
	status: appointmentStatusEnum,
	reason: z.string().optional(),
	notes: z.string().optional(),
	slotTime: z.string().optional(),
});

export type Appointment = z.infer<typeof appointmentSchema>;

// ─────────────────────────────────────────────────────────────
// LABELS — Spanish display text
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
