import { z } from "zod";

export const appointmentTypeEnum = z.enum(["PRESENCIAL", "ONLINE"]);
export type AppointmentType = z.infer<typeof appointmentTypeEnum>;

export const appointmentStatusEnum = z.enum([
  "PENDIENTE",
  "CONFIRMADA",
  "EN_SALA",
  "COMPLETADA",
  "CANCELADA",
]);
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "El paciente es requerido"),
  date: z.date({ required_error: "La fecha es requerida" }),
  time: z.string().min(1, "La hora es requerida"),
  reason: z.string().min(1, "El motivo es requerido"),
  type: appointmentTypeEnum,
  status: appointmentStatusEnum,
});

export type Appointment = z.infer<typeof appointmentSchema>;

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  PRESENCIAL: "Presencial",
  ONLINE: "Online",
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  EN_SALA: "En Sala",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

export type DoctorOption = {
  id: string;
  name: string;
  specialty: string;
};

export type PatientOption = {
  id: string;
  name: string;
  documentId: string;
};