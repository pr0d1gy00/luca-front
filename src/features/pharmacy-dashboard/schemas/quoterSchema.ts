import { z } from "zod";

export const quoterItemSchema = z.object({
  tempId: z.string(),
  prescription_item_id: z.number().optional(),
  pharmacy_inventory_id: z.number().optional(),
  originalName: z.string(),
  custom_product_name: z.string().optional(),
  availabilityStatus: z.enum(["available", "substitute"]),
  is_substituted: z.boolean().default(false),
  substituted_inventory_id: z.number().optional(),
  substitution_reason: z.string().optional(),
  sell_format: z.enum(["package", "fraction"]),
  quantity: z.number().min(1).default(1),
  prices_manual: z.object({
    USD: z.number().min(0).default(0),
    VES: z.number().min(0).default(0),
    EUR: z.number().min(0).default(0),
  }),
  notes: z.string().optional(),
});

export const quoterSchema = z.object({
  comments: z.string().optional(),
  items: z.array(quoterItemSchema),
});

export type QuoterFormValues = z.infer<typeof quoterSchema>;
export type QuoterItemFormValues = z.infer<typeof quoterItemSchema>;
