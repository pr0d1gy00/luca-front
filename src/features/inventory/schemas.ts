import { z } from "zod";

// ---------------------------------------------------------------------------
// Pharmacy Inventory
// ---------------------------------------------------------------------------

export const pharmacyInventorySchema = z.object({
  providerId: z.string().min(1, "La farmacia es requerida"),
  medicationId: z.string().min(1, "El medicamento es requerido"),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  minStockAlert: z.number().int().min(0).default(10),
  batchNumber: z.string().optional(),
  expirationDate: z.date().optional(),
  unitPrice: z.number().min(0).optional(),
});

export type PharmacyInventory = z.infer<typeof pharmacyInventorySchema>;

export type PharmacyInventoryFormData = Omit<
  PharmacyInventory,
  "id" | "createdAt" | "updatedAt"
>;
