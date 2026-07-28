import { SyncableEntity } from "../../offline/types/sync.types";

// ==========================================
// 1. ORGANIZATION (Departments, Roles)
// ==========================================
export interface ClinicDepartment extends SyncableEntity {
  branchId: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface ClinicRole extends SyncableEntity {
  branchId: string;
  name: string;
  permissions: Record<string, boolean>; // JSON permissions
}

// ==========================================
// 2. STAFF
// ==========================================
export interface ClinicStaff extends SyncableEntity {
  branchId: string;
  userUuid: string;
  clinicRoleUuid: string;
  status: "PENDING" | "ACTIVE" | "INACTIVE";
}

// ==========================================
// 3. INPATIENT & ADMISSIONS
// ==========================================
export interface ClinicRoom extends SyncableEntity {
  branchId: string;
  name: string;
  floor: string;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE";
}

export interface ClinicBed extends SyncableEntity {
  roomUuid: string;
  bedNumber: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
}

export interface Admission extends SyncableEntity {
  branchId: string;
  patientUuid: string;
  clinicBedUuid: string;
  admissionDate: string; // ISO datetime
  dischargeDate: string | null;
  reason: string;
  status: "ACTIVE" | "DISCHARGED";
}

export interface TreatmentNote extends SyncableEntity {
  admissionUuid: string;
  doctorUuid: string;
  note: string;
  type: string; // "EVOLUTION", "NURSING", "GENERAL"
}

export interface AdministeredMedication extends SyncableEntity {
  admissionUuid: string;
  medicationUuid: string;
  dosage: string;
  frequency: string;
  scheduledTime: string; // Time string
  administeredAt: string | null; // ISO datetime if given
}

export interface ServiceCharge extends SyncableEntity {
  admissionUuid: string;
  serviceUuid: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ==========================================
// 4. SURGICAL PLANNING
// ==========================================
export interface SurgicalOperation extends SyncableEntity {
  branchId: string;
  patientUuid: string;
  roomUuid: string; // The operating room
  scheduledDate: string; // ISO datetime
  estimatedDuration: number; // in minutes
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

export interface SurgeryTeamMember extends SyncableEntity {
  operationUuid: string;
  staffUuid: string; // ClinicStaff uuid
  roleInSurgery: "LEAD_SURGEON" | "ASSISTANT" | "ANESTHESIOLOGIST" | "SCRUB_NURSE" | "CIRCULATING_NURSE";
}

export interface SupplyOrder extends SyncableEntity {
  operationUuid: string;
  providerType: "PHARMACY" | "LAB" | "MEDICAL_SUPPLY";
  status: "DRAFT" | "EMITTED" | "FULFILLED";
}

export interface SupplyOrderItem extends SyncableEntity {
  supplyOrderUuid: string;
  itemName: string;
  quantity: number;
  notes: string;
}
