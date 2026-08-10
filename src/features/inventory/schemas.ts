import { z } from "zod";

// ---------------------------------------------------------------------------
// Pharmacy Inventory
// ---------------------------------------------------------------------------

export const pharmacyInventoryBatchSchema = z.object({
  providerId: z.string().min(1, "La farmacia es requerida"),
  documentUrls: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
});

export type PharmacyInventoryBatch = z.infer<typeof pharmacyInventoryBatchSchema>;

export const pharmacyInventorySchema = z.object({
  providerId: z.string().min(1, "La farmacia es requerida"),
  inventoryBatchId: z.string().optional(),
  medicationId: z.string().optional(), // Nullable if manually entered
  customActivePrinciple: z.string().optional(),
  brandName: z.string().optional(),
  laboratory: z.string().optional(),
  stock: z.number().int().min(0, "El stock no puede ser negativo"),
  minStockAlert: z.number().int().min(0).default(10),
  batchNumber: z.string().optional(),
  expirationDate: z.date().optional(),
  unitPrice: z.number().min(0).optional(),
  isTaxExempt: z.boolean().default(false),
  taxRate: z.number().min(0).max(100).optional(),
  externalSku: z.string().optional(),
  lastSyncAt: z.date().optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => data.medicationId || (data.customActivePrinciple && data.brandName),
  {
    message: "Debe seleccionar un medicamento del catálogo o ingresar el principio activo y marca manualmente.",
    path: ["medicationId"],
  }
);

export const bulkInventoryUploadSchema = z.object({
  batch: pharmacyInventoryBatchSchema,
  items: z.array(pharmacyInventorySchema).min(1, "Debe agregar al menos un medicamento al lote"),
});

export type BulkInventoryUpload = z.infer<typeof bulkInventoryUploadSchema>;

export type PharmacyInventory = z.infer<typeof pharmacyInventorySchema>;

export type PharmacyInventoryFormData = Omit<
  PharmacyInventory,
  "id" | "createdAt" | "updatedAt"
>;

// ---------------------------------------------------------------------------
// Pharmacy SKU Mapping (Anti-Corruption Layer)
// ---------------------------------------------------------------------------

export const pharmacySkuMappingSchema = z.object({
  providerId: z.string().min(1, "La farmacia es requerida"),
  pharmacySku: z.string().min(1, "El código externo es requerido"),
  medicationId: z.string().min(1, "El medicamento de LUCA es requerido"),
  confidenceScore: z.number().int().min(0).max(100).default(100),
});

export type PharmacySkuMapping = z.infer<typeof pharmacySkuMappingSchema>;
