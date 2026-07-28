import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});
export type DepartmentFormData = z.infer<typeof departmentSchema>;

export const roleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});
export type RoleFormData = z.infer<typeof roleSchema>;

export const inviteStaffSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  clinic_role_id: z.string().uuid("Invalid role ID"),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]),
});
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;

export const admitPatientSchema = z.object({
  patient_account_id: z.string().uuid("Invalid patient ID"),
  clinic_bed_id: z.string().uuid("Invalid bed ID"),
  admission_date: z.string().datetime({ message: "Invalid date format" }),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});
export type AdmitPatientFormData = z.infer<typeof admitPatientSchema>;

export const treatmentNoteSchema = z.object({
  doctor_id: z.string().uuid("Invalid doctor ID"),
  note: z.string().min(5, "Note must be at least 5 characters"),
  type: z.enum(["EVOLUTION", "NURSING", "GENERAL"]),
});
export type TreatmentNoteFormData = z.infer<typeof treatmentNoteSchema>;

export const scheduleOperationSchema = z.object({
  patient_account_id: z.string().uuid("Invalid patient ID"),
  room_id: z.string().uuid("Invalid room ID"),
  scheduled_date: z.string().datetime({ message: "Invalid date format" }),
  estimated_duration: z.number().min(15, "Duration must be at least 15 minutes"),
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});
export type ScheduleOperationFormData = z.infer<typeof scheduleOperationSchema>;

export const assignTeamMemberSchema = z.object({
  staff_id: z.string().uuid("Invalid staff ID"),
  role_in_surgery: z.enum(["LEAD_SURGEON", "ASSISTANT", "ANESTHESIOLOGIST", "SCRUB_NURSE", "CIRCULATING_NURSE"]),
});
export type AssignTeamMemberFormData = z.infer<typeof assignTeamMemberSchema>;

export const supplyOrderSchema = z.object({
  provider_type: z.enum(["PHARMACY", "LAB", "MEDICAL_SUPPLY"]),
  items: z.array(
    z.object({
      itemName: z.string().min(1, "Item name is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      notes: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
});
export type SupplyOrderFormData = z.infer<typeof supplyOrderSchema>;
