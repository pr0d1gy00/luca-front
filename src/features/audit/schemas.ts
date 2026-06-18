import { z } from "zod";

// ---------------------------------------------------------------------------
// Audit Log — HIPAA / GDPR compliance
// ---------------------------------------------------------------------------

export const auditActionEnum = z.enum([
  "VIEW",
  "CREATE",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "LOGIN",
  "LOGOUT",
  "PRINT",
]);
export type AuditAction = z.infer<typeof auditActionEnum>;

export const auditLogSchema = z.object({
  userId: z.string().optional(),
  patientId: z.string().optional(),
  action: auditActionEnum,
  resource: z.string().min(1, "El recurso es requerido"),
  resourceType: z.string().min(1, "El tipo de recurso es requerido"),
  details: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

// --- Labels ---

export const auditActionLabels: Record<AuditAction, string> = {
  VIEW: "Visualización",
  CREATE: "Creación",
  UPDATE: "Actualización",
  DELETE: "Eliminación",
  EXPORT: "Exportación",
  LOGIN: "Inicio de sesión",
  LOGOUT: "Cierre de sesión",
  PRINT: "Impresión",
};
