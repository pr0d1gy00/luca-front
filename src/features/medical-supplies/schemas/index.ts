import { z } from "zod";

export const medicalSupplySettingsSchema = z.object({
  is_24_hours: z.boolean(),
  working_days: z.array(z.string()),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  auto_matching_enabled: z.boolean(),
});

export const inventoryItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  sku: z.string().min(1, "SKU is required"),
  price_usd: z.number().min(0, "Price must be positive"),
  price_bs: z.number().min(0, "Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  is_active: z.boolean(),
});

export const quoteItemDetailSchema = z.object({
  item: z.string().min(1, "Item descriptor is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  price_usd: z.number().min(0, "Price must be positive"),
});

export const quotePayloadSchema = z.object({
  medical_supply_order_id: z.number(),
  total_price: z.number().min(0),
  currency: z.enum(["USD", "BS", "EUR"]),
  items_detail: z
    .array(quoteItemDetailSchema)
    .min(1, "At least one item is required"),
});

export type MedicalSupplySettingsFormValues = z.infer<
  typeof medicalSupplySettingsSchema
>;
export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
export type QuotePayloadFormValues = z.infer<typeof quotePayloadSchema>;
