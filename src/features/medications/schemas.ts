import { z } from "zod";

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

export const medicationSchema = z.object({
  uuid: z.string().optional(),
  userId: z.string().optional(),
  commercialName: z.string().optional(),
  activePrinciple: z.string().min(1, "El principio activo es requerido"),
  concentration: z.string().min(1, "La concentración es requerida"),
  presentation: presentationEnum,
  administrationRoute: administrationRouteEnum,
  requiresPrescription: z.boolean(),
  contraindications: z.string().optional(),
});

export type Medication = z.infer<typeof medicationSchema>;

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

export const templateItemSchema = z.object({
  medicationId: z.string().uuid("Seleccione un medicamento válido"),
  dose: z.string().min(1, "La dosis es requerida"),
  frequency: z.string().min(1, "La frecuencia es requerida"),
  duration: z.string().min(1, "La duración es requerida"),
  notes: z.string().optional(),
});

export type TemplateItem = z.infer<typeof templateItemSchema>;

export const prescriptionTemplateSchema = z.object({
  uuid: z.string().optional(),
  title: z.string().min(1, "El título del combo es requerido"),
  items: z.array(templateItemSchema).min(1, "Debe agregar al menos un medicamento al combo"),
});

export type PrescriptionTemplate = z.infer<typeof prescriptionTemplateSchema>;
