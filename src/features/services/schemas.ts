import { z } from "zod";

export const serviceCategoryEnum = z.enum([
  "IMAGING",
  "LAB",
  "PROCEDURE",
  "CONSULTATION",
  "THERAPY",
  "OTHER",
]);

export type ServiceCategory = z.infer<typeof serviceCategoryEnum>;

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  IMAGING: "Imágenes / Radiología",
  LAB: "Laboratorio Clínico",
  PROCEDURE: "Procedimiento Médico",
  CONSULTATION: "Consulta Médica",
  THERAPY: "Terapia / Rehabilitación",
  OTHER: "Otro Servicio",
};

// --- Catalogo Maestro de Servicios ---
export const serviceSchema = z.object({
  uuid: z.string(),
  name: z.string().min(1, "El nombre del servicio es requerido"),
  category: serviceCategoryEnum,
  code: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().min(0, "El precio base no puede ser negativo").default(0),
});

export type Service = z.infer<typeof serviceSchema>;

// --- Servicio Asociado al Proveedor (Médico o Clínica) ---
export const providerServiceSchema = z.object({
  uuid: z.string(),
  serviceUuid: z.string().min(1, "El servicio base es requerido"),
  providerUuid: z.string().min(1, "El proveedor es requerido"),
  providerType: z.enum(["DOCTOR", "CLINIC"]),
  price: z.number().min(0, "El precio no puede ser negativo"),
  durationMinutes: z.number().int().min(1, "La duración debe ser de al menos 1 minuto"),
  isStandaloneBookable: z.boolean().default(false),
  isActive: z.boolean().default(true),
  customName: z.string().optional(),
  customDescription: z.string().optional(),
});

export type ProviderService = z.infer<typeof providerServiceSchema>;
export type ProviderServiceFormData = Omit<ProviderService, "uuid" | "providerUuid" | "providerType">;
