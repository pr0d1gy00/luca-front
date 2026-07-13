import { z } from "zod";

export const biologicalSexEnum = z.enum(["male", "female", "other"]);
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
	// Identity
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	nationalId: z.string().min(1),
	birthDate: z.string(), // ISO date string, not Date object
	gender: biologicalSexEnum,

	// Contact
	phone: z.string().min(1),
	email: z.string().email(),
	address: z.string().min(1),

	// Medical
	bloodType: z.string().optional(),
	allergies: z.string().optional(), // Comma-separated
	chronicConditions: z.string().optional(), // Comma-separated

	// Emergency
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
});

export type Patient = z.infer<typeof patientSchema>;

export const bloodTypeLabels: Record<string, string> = {
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
	male: "Masculino",
	female: "Femenino",
	other: "Otro",
};
