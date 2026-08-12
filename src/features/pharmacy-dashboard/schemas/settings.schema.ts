import { z } from "zod";

export const settingsSchema = z.object({
  auto_quoting_enabled: z.boolean().default(false),
  allow_partial_quotes: z.boolean().default(true),
  is_24_hours: z.boolean().default(false),
  delivery_radius_km: z.number().min(1).max(100).default(5),
  default_currency: z.enum(["USD", "VES", "EUR", "COP"]).default("USD"),
  custom_terms: z.string().optional(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
