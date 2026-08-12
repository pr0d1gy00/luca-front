import { z } from "zod";

export const bulkInventoryItemSchema = z.object({
  id: z.string(),
  uuid: z.string().optional(),
  medicationId: z.string().optional(),
  customActivePrinciple: z.string().min(1, "Requerido"),
  brandName: z.string().optional(),
  laboratory: z.string().optional(),
  stock: z.number().min(0),
  batchNumber: z.string().optional(),
  unitPrice: z.number().min(0),
});

export const bulkInventorySchema = z.object({
  notes: z.string().optional(),
  documents: z.array(z.any()).optional(), // Store file/url objects
  items: z.array(bulkInventoryItemSchema).min(1, "Debes agregar al menos un medicamento"),
});

export type BulkInventoryItemFormValues = z.infer<typeof bulkInventoryItemSchema>;
export type BulkInventoryFormValues = z.infer<typeof bulkInventorySchema>;
