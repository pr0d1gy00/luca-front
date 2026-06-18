import { z } from "zod";

// ---------------------------------------------------------------------------
// Billing — Invoice, InvoiceItem & Payment
// ---------------------------------------------------------------------------

export const invoiceStatusEnum = z.enum([
  "DRAFT",
  "SENT",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "CANCELLED",
]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const paymentMethodEnum = z.enum([
  "CASH",
  "CARD",
  "TRANSFER",
  "INSURANCE",
  "OTHER",
]);
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;

// --- Invoice Item ---

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  unitPrice: z.number().min(0, "El precio unitario no puede ser negativo"),
  total: z.number().min(0),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

// --- Invoice ---

export const invoiceSchema = z.object({
  userId: z.string().min(1, "El profesional es requerido"),
  patientId: z.string().min(1, "El paciente es requerido"),
  consultationId: z.string().optional(),
  prescriptionId: z.string().optional(),
  subtotal: z.number().min(0),
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  currency: z.string().default("USD"),
  status: invoiceStatusEnum.default("DRAFT"),
  dueDate: z.date().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).optional().default([]),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export type InvoiceFormData = Omit<Invoice, "id" | "createdAt" | "updatedAt">;

// --- Payment ---

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "La factura es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  method: paymentMethodEnum,
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

export type PaymentFormData = Omit<Payment, "id" | "paidAt">;

// --- Labels ---

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  SENT: "Enviada",
  PAID: "Pagada",
  PARTIALLY_PAID: "Pago parcial",
  OVERDUE: "Vencida",
  CANCELLED: "Cancelada",
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  INSURANCE: "Seguro",
  OTHER: "Otro",
};
