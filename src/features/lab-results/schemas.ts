import { z } from "zod";

// ---------------------------------------------------------------------------
// Lab Result
// ---------------------------------------------------------------------------

export const labResultStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "ABNORMAL",
  "CANCELLED",
]);
export type LabResultStatus = z.infer<typeof labResultStatusEnum>;

export const labResultSchema = z.object({
  labRequestId: z.string().min(1, "La solicitud de laboratorio es requerida"),
  patientId: z.string().min(1, "El paciente es requerido"),
  fileUrl: z.string().url().optional(),
  resultJson: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
  status: labResultStatusEnum.default("PENDING"),
  performedAt: z.date().optional(),
});

export type LabResult = z.infer<typeof labResultSchema>;

export type LabResultFormData = Omit<
  LabResult,
  "id" | "reviewedBy" | "reviewedAt" | "createdAt" | "updatedAt"
>;

export const labResultStatusLabels: Record<LabResultStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  ABNORMAL: "Anormal",
  CANCELLED: "Cancelado",
};
