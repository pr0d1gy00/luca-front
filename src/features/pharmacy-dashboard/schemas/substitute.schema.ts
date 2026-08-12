import { z } from "zod";

export const substituteSchema = z.object({
  searchTerm: z.string().optional(),
  reason: z.string().min(5, "Debes especificar un motivo válido para la sustitución"),
  selectedItemId: z.string().min(1, "Debes seleccionar un medicamento del inventario"),
});

export type SubstituteFormValues = z.infer<typeof substituteSchema>;
