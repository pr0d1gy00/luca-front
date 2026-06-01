import { z } from "zod";

export const biologicalSexEnum = z.enum(["MALE", "FEMALE"]);
export type BiologicalSex = z.infer<typeof biologicalSexEnum>;

export const bloodTypeEnum = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);
export type BloodType = z.infer<typeof bloodTypeEnum>;

export const patientSchema = z.object({
  // Identidad
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  documentId: z.string().min(1, "La cédula/DNI es requerida"),
  birthDate: z.date({ required_error: "La fecha de nacimiento es requerida" }),
  biologicalSex: biologicalSexEnum,

  // Contacto
  phone: z.string().min(1, "El teléfono es requerido"),
  email: z.string().email("Email inválido"),
  address: z.string().min(1, "La dirección es requerida"),

  // Médico Base
  bloodType: bloodTypeEnum,
  allergies: z.array(z.string()).optional().default([]),
  chronicConditions: z.array(z.string()).optional().default([]),

  // Emergencia
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export const bloodTypeLabels: Record<BloodType, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
};

export const biologicalSexLabels: Record<BiologicalSex, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};