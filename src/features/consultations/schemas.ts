import { z } from "zod";

// ── Enums ────────────────────────────────────────────────
export const biologicalSexEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export type BiologicalSex = z.infer<typeof biologicalSexEnum>;

export const presentationEnum = z.enum([
  "CAPSULA",
  "TABLETA",
  "JARABE",
  "GOTAS",
  "AMPOLLA",
  "CREMA",
]);
export type Presentation = z.infer<typeof presentationEnum>;

export const administrationRouteEnum = z.enum([
  "ORAL",
  "INTRAVENOSA",
  "INTRAMUSCULAR",
  "TOPICA",
  "OFTALMICA",
]);
export type AdministrationRoute = z.infer<typeof administrationRouteEnum>;

// ── Medication (from medications feature) ─────────────────
export const medicationSchema = z.object({
  commercialName: z.string().optional(),
  activePrinciple: z.string().min(1, "El principio activo es requerido"),
  concentration: z.string().min(1, "La concentración es requerida"),
  presentation: presentationEnum,
  administrationRoute: administrationRouteEnum,
});
export type Medication = z.infer<typeof medicationSchema>;

// ── Prescription Item (useFieldArray) ──────────────────────
export const prescriptionItemSchema = z.object({
  medicationId: z.string().min(1, "Seleccioná un medicamento"),
  dose: z.string().min(1, "La dosis es requerida"),
  frequency: z.string().min(1, "La frecuencia es requerida"),
  duration: z.string().min(1, "La duración es requerida"),
  notes: z.string().optional(),
});

export type PrescriptionItem = z.infer<typeof prescriptionItemSchema>;

// ── Consultation ───────────────────────────────────────────
export const consultationSchema = z.object({
  uuid: z.string().optional(),
  motivoConsulta: z.string().min(1, "El motivo de consulta es requerido"),
  examenFisico: z.string().optional(),
  diagnostico: z.string().min(1, "El diagnóstico es requerido"),
  prescriptions: z
    .array(prescriptionItemSchema)
    .min(1, "Al menos un medicamento es requerido"),
  vitals: z
    .object({
      weight: z.string().optional(),
      height: z.string().optional(),
      systolic_bp: z.string().optional(),
      diastolic_bp: z.string().optional(),
      heart_rate: z.string().optional(),
      respiratory_rate: z.string().optional(),
      temperature: z.string().optional(),
      oxygen_sat: z.string().optional(),
    })
    .optional(),
  laboratorios: z
    .array(
      z.object({
        uuid: z.string().optional(),
        examsList: z.array(z.string()),
        instructions: z.string().optional(),
      })
    )
    .optional(),
  followUp: z
    .object({
      uuid: z.string().optional(),
      scheduledDate: z.string(),
      channel: z.enum(["EMAIL", "WHATSAPP", "INTERNAL_CHAT", "MANUAL_CALL"]),
      messageTemplate: z.string().nullable().optional(),
    })
    .optional(),
});

export type Consultation = z.infer<typeof consultationSchema>;

// ── Patient (context) ──────────────────────────────────────
export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  documentId: z.string(),
  birthDate: z.date(),
  biologicalSex: biologicalSexEnum,
  phone: z.string(),
  email: z.string(),
  address: z.string(),
  bloodType: z.string(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

// ── Vitals ─────────────────────────────────────────────────
export const vitalsSchema = z.object({
  weight: z.string().optional(),
  height: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  respiratoryRate: z.string().optional(),
  oxygenSat: z.string().optional(),
});

export type Vitals = z.infer<typeof vitalsSchema>;

// ── History Entry (Timeline) ───────────────────────────────
export const historyEntrySchema = z.object({
  id: z.string(),
  date: z.date(),
  motivo: z.string(),
  diagnostico: z.string(),
  doctorName: z.string(),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;

// ── Doctor ─────────────────────────────────────────────────
export const doctorSchema = z.object({
  name: z.string(),
  specialty: z.string(),
  mpps: z.string(),
  cm: z.string(),
  avatarUrl: z.string().optional(),
});

export type Doctor = z.infer<typeof doctorSchema>;

// ── Labels ────────────────────────────────────────────────
export const biologicalSexLabels: Record<BiologicalSex, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro",
};

export const presentationLabels: Record<Presentation, string> = {
  CAPSULA: "Cápsula",
  TABLETA: "Tableta",
  JARABE: "Jarabe",
  GOTAS: "Gotas",
  AMPOLLA: "Ampolla",
  CREMA: "Crema",
};

export const administrationRouteLabels: Record<AdministrationRoute, string> = {
  ORAL: "Oral",
  INTRAVENOSA: "Intravenosa",
  INTRAMUSCULAR: "Intramuscular",
  TOPICA: "Tópica",
  OFTALMICA: "Oftálmica",
};
