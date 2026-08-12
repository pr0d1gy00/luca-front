import { z } from "zod";

export const inventorySchema = z.object({
  medicationId: z.number().min(0, "Medication ID is required"),
  eanCode: z.string().optional(),
  activeIngredient: z.string().min(1, "Active ingredient is required"),
  laboratory: z.string().optional(),
  saleCondition: z.enum(["prescription", "free", "controlled"]),
  packageStock: z.number().min(0).default(0),
  fractionStock: z.number().min(0).default(0),
  minStockAlert: z.number().min(0).default(5),
  batchNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  locationRack: z.string().optional(),
  allowsFractioning: z.boolean().default(false),
  unitsPerPackage: z.number().min(1).default(1),
  fractionUnitName: z.string().optional(),
  prices: z.object({
    USD: z.number().min(0).default(0),
    VES: z.number().min(0).default(0),
    EUR: z.number().min(0).default(0),
  }),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;
