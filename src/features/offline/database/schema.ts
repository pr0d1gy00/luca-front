import Dexie, { Table } from "dexie";
import type {
  EntityType,
  SyncableEntity,
  QueuedChange,
  SyncTimestamp,
} from "../types/sync.types";

// ============================================
// PATIENT (PatientAccount en backend)
// ============================================
export interface PatientRecord extends SyncableEntity {
  // Identity
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: "male" | "female" | "other";

  // Contact
  phone: string;
  email: string;
  address: string;
  cityId: string | null; // UUID

  // Medical
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  privateNotes: string;

  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// ============================================
// APPOINTMENT
// ============================================
export interface Appointment extends SyncableEntity {
  patientUuid: string;
  doctorUuid: string;
  clinicBranchUuid: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  slotTime: string | null; // Normalized TIME slot
  type: "IN_PERSON" | "ONLINE";
  status:
  | "PENDING"
  | "CONFIRMED"
  | "IN_ROOM"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
  notes: string;
  reason: string;
}

// ============================================
// SCHEDULING (Fase 6)
// ============================================
export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
export type ExceptionType = "VACATION" | "DAY_OFF" | "CUSTOM_HOURS";

export interface DoctorSchedule extends SyncableEntity {
  doctorUuid: string;
  weekday: Weekday;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  appointmentDuration: number; // minutes
  maxPerSlot: number; // max patients per slot
  isActive: boolean;
}

export interface ScheduleException extends SyncableEntity {
  doctorUuid: string;
  exceptionDate: string; // YYYY-MM-DD
  exceptionType: ExceptionType;
  customStartTime: string | null;
  customEndTime: string | null;
  reason: string | null;
}

export interface ClinicSchedule extends SyncableEntity {
  clinicBranchUuid: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// ============================================
// CONSULTATION
// ============================================
export interface Consultation extends SyncableEntity {
  patientUuid: string;
  doctorUuid: string;
  clinicBranchUuid: string;
  appointmentUuid: string | null;
  formTemplateUuid: string | null;
  date: string;
  status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  reason: string;
  physicalExam: string;
  diagnosis: string;
  treatmentPlan: string;
  dynamicData: Record<string, unknown>;
  formSchemaSnapshot?: Record<string, unknown> | null;
}

// ============================================
// MEDICAL HISTORIES
// ============================================
export interface MedicalBackground extends SyncableEntity {
  patientUuid: string;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAsthma: boolean;
  otherConditions: string;
  pastHospitalizations: string;
}

export interface Lifestyle extends SyncableEntity {
  patientUuid: string;
  smokingStatus: string;
  alcoholConsumption: string;
  activityLevel: string;
  dietType: string;
}

export interface ObstetricHistory extends SyncableEntity {
  patientUuid: string;
  lastPeriodDate: string;
  pregnancies: number;
  births: number;
  cesareans: number;
  abortions: number;
  contraceptiveMethod: string;
}

export interface SurgicalHistory extends SyncableEntity {
  patientUuid: string;
  procedure: string;
  date: string;
  hospital: string;
  notes: string;
}

export interface FamilyHistory extends SyncableEntity {
  patientUuid: string;
  condition: string;
  relationship: string;
  note: string;
}

export interface Vaccination extends SyncableEntity {
  patientUuid: string;
  vaccine: string;
  doseNumber: number;
  date: string;
}

// ============================================
// VITAL SIGNS
// ============================================
export interface VitalSigns extends SyncableEntity {
  patientUuid: string;
  consultationUuid: string | null;
  weight: number | null;
  height: number | null;
  systolicBp: number | null;
  diastolicBp: number | null;
  heartRate: number | null;
  temperature: number | null;
  oxygenSat: number | null;
  respiratoryRate: number | null;
  date: string;
}

// ============================================
// PRESCRIPTIONS & MEDICATIONS
// ============================================
export interface Medication extends SyncableEntity {
  name: string;
  activeIngredient: string;
  concentration: string;
  presentation: string;
  administrationRoute: string;
  commercialName: string;
  requiresPrescription: boolean;
  contraindications: string;
  isActive: boolean;
}

export interface Prescription extends SyncableEntity {
  doctorUuid: string;
  patientUuid: string;
  consultationUuid: string | null;
  clinicBranchUuid: string | null;
  date: string;
  expirationDate: string;
  notes: string;
  publicToken: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
}

export interface PrescriptionItem extends SyncableEntity {
  prescriptionUuid: string;
  medicationUuid: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  notes: string;
}

// ============================================
// LABS & RESULTS
// ============================================
export interface LabRequest extends SyncableEntity {
  patientUuid: string;
  patient: {
    uuid: string
  }
  doctorUuid: string;
  consultationUuid: string | null;
  examsList: string[];
  instructions: string;
  isCompleted: boolean;
}

export interface LabResult extends SyncableEntity {
  labRequestUuid: string;
  patientUuid: string;
  fileUrl: string;
  resultJson: Record<string, unknown>;
  notes: string;
  reviewedByDoctorUuid: string | null;
  reviewedAt: string | null;
  status: "PENDING" | "COMPLETED" | "ABNORMAL" | "CANCELLED";
  performedAt: string;
}

// ============================================
// FOLLOW UPS
// ============================================
export interface FollowUp extends SyncableEntity {
  patientUuid: string;
  consultationUuid: string;
  scheduledDate: string;
  status: "PENDING" | "SENT" | "RESPONDED";
  response: string | null;
  channel: "EMAIL" | "WHATSAPP" | "INTERNAL_CHAT" | "MANUAL_CALL";
  messageTemplate?: string | null;
}

// ============================================
// CATALOGS (readonly, synced in pull)
// ============================================
export interface City extends SyncableEntity {
  name: string;
  stateId: string | null;
}

export interface State extends SyncableEntity {
  name: string;
  countryId: string;
}

export interface Country extends SyncableEntity {
  name: string;
  code: string;
}

export interface Specialty extends SyncableEntity {
  name: string;
  description: string;
}

export interface Clinic extends SyncableEntity {
  name: string;
  rif: string;
  logoUrl: string | null;
  website: string | null;
}

export interface ClinicBranch extends SyncableEntity {
  clinicUuid: string;
  name: string;
  address: string;
  cityId: string;
  phone: string;
  isMainBranch: boolean;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
  observations: string;
}

export interface Doctor extends SyncableEntity {
  fullName: string;
  email: string;
  phone: string;
  logoUrl: string | null;
  isVerified: boolean;
  cityId: string | null;
}

// ============================================
// SERVICES & PROCEDURES (Fase 7)
// ============================================
export interface ServiceRecord extends SyncableEntity {
  name: string;
  category:
  | "IMAGING"
  | "LAB"
  | "PROCEDURE"
  | "CONSULTATION"
  | "THERAPY"
  | "OTHER";
  description: string;
  basePrice: number;
  code?: string;
}

export interface ProviderServiceRecord extends SyncableEntity {
  serviceUuid: string;
  providerUuid: string;
  providerType: "DOCTOR" | "CLINIC";
  price: number;
  durationMinutes: number;
  isStandaloneBookable: boolean;
  isActive: boolean;
  customName?: string;
  customDescription?: string;
}

export interface ActiveDelayRecord {
  doctorUuid: string;
  doctorName: string;
  delayMinutes: number;
  updatedAt: string;
}

// ============================================
// SYNC INFRASTRUCTURE
// ============================================
export interface SyncMeta {
  key: string;
  value: string | number | boolean;
}

export interface SyncError {
  id?: number;
  uuid: string;
  entity: EntityType;
  field: string;
  code?: string;
  message: string;
  retryCount: number;
  createdAt: string;
}

// ============================================
// DATABASE CLASS
// ============================================
class LucaDatabase extends Dexie {
  // Patients
  patients!: Table<PatientRecord>;

  // Scheduling (Fase 6)
  doctorSchedules!: Table<DoctorSchedule>;
  scheduleExceptions!: Table<ScheduleException>;
  clinicSchedules!: Table<ClinicSchedule>;

  // Appointments & Consultations
  appointments!: Table<Appointment>;
  consultations!: Table<Consultation>;

  // Medical Histories
  medicalBackgrounds!: Table<MedicalBackground>;
  lifestyles!: Table<Lifestyle>;
  obstetricHistories!: Table<ObstetricHistory>;
  surgicalHistories!: Table<SurgicalHistory>;
  familyHistories!: Table<FamilyHistory>;
  vaccinations!: Table<Vaccination>;

  // Vitals & Labs
  vitalSigns!: Table<VitalSigns>;
  labRequests!: Table<LabRequest>;
  labResults!: Table<LabResult>;

  // Prescriptions
  prescriptions!: Table<Prescription>;
  prescriptionItems!: Table<PrescriptionItem>;
  medications!: Table<Medication>;
  followUps!: Table<FollowUp>;

  // Catalogs
  cities!: Table<City>;
  states!: Table<State>;
  countries!: Table<Country>;
  specialties!: Table<Specialty>;
  clinics!: Table<Clinic>;
  clinicBranches!: Table<ClinicBranch>;
  doctors!: Table<Doctor>;

  // Sync infrastructure
  syncQueue!: Table<QueuedChange>;
  syncMeta!: Table<SyncMeta>;
  syncErrors!: Table<SyncError>;
  pendingProfileUpdates!: Table<{
    id: string;
    payload: string;
    updatedAt: string;
  }>;

  // Services & Delays
  services!: Table<ServiceRecord>;
  providerServices!: Table<ProviderServiceRecord>;
  activeDelays!: Table<ActiveDelayRecord>;

  constructor() {
    super("LucaOfflineDB");

    this.version(1).stores({
      // Patients
      patients: "uuid, updatedAt, _syncStatus",

      // Scheduling (Fase 6)
      doctorSchedules: "uuid, doctorUuid, weekday, updatedAt",
      scheduleExceptions: "uuid, doctorUuid, exceptionDate, updatedAt",
      clinicSchedules: "uuid, clinicBranchUuid, weekday, updatedAt",

      // Appointments & Consultations
      appointments:
        "uuid, patientUuid, doctorUuid, date, status, updatedAt, _syncStatus",
      consultations:
        "uuid, patientUuid, doctorUuid, date, status, updatedAt, _syncStatus",

      // Medical Histories
      medicalBackgrounds: "uuid, patientUuid, updatedAt",
      lifestyles: "uuid, patientUuid, updatedAt",
      obstetricHistories: "uuid, patientUuid, updatedAt",
      surgicalHistories: "uuid, patientUuid, updatedAt",
      familyHistories: "uuid, patientUuid, updatedAt",
      vaccinations: "uuid, patientUuid, updatedAt",

      // Vitals & Labs
      vitalSigns: "uuid, patientUuid, consultationUuid, date, updatedAt",
      labRequests: "uuid, consultationUuid, updatedAt",
      labResults: "uuid, labRequestUuid, patientUuid, updatedAt",

      // Prescriptions
      prescriptions:
        "uuid, patientUuid, doctorUuid, date, status, updatedAt, _syncStatus",
      prescriptionItems: "uuid, prescriptionUuid, updatedAt",
      medications: "uuid, name, updatedAt",
      followUps:
        "uuid, patientUuid, consultationUuid, scheduledDate, updatedAt",

      // Catalogs
      cities: "uuid, name",
      states: "uuid, name, countryId",
      countries: "uuid, name",
      specialties: "uuid, name",
      clinics: "uuid, name",
      clinicBranches: "uuid, clinicUuid, cityId",
      doctors: "uuid, fullName, cityId",

      // Sync infrastructure
      syncQueue: "id, entity, timestamp",
      syncMeta: "key",
      syncErrors: "++id, uuid, entity, createdAt",
    });

    this.version(2).stores({
      pendingProfileUpdates: "id, updatedAt",
    });

    // v3: Add appointmentUuid index to consultations for offline lookup
    this.version(3).stores({
      consultations:
        "uuid, patientUuid, doctorUuid, appointmentUuid, date, status, updatedAt, _syncStatus",
    });

    // v4: Add patientUuid, doctorUuid, and _syncStatus indexes to labRequests for standalone lookup
    this.version(4).stores({
      labRequests:
        "uuid, patientUuid, doctorUuid, consultationUuid, updatedAt, _syncStatus",
    });

    // v5: Add services, providerServices and activeDelays tables
    this.version(5).stores({
      services: "uuid, category, updatedAt",
      providerServices: "uuid, providerUuid, serviceUuid, isActive, updatedAt",
      activeDelays: "doctorUuid, delayMinutes, updatedAt",
    });
  }
}

export const db = new LucaDatabase();

// ============================================
// HELPER FUNCTIONS
// ============================================
export async function getLastSyncTimestamp(): Promise<SyncTimestamp | null> {
  const meta = await db.syncMeta.get("lastSyncTimestamp");
  return meta ? (meta.value as SyncTimestamp) : null;
}

export async function setLastSyncTimestamp(
  timestamp: SyncTimestamp,
): Promise<void> {
  await db.syncMeta.put({ key: "lastSyncTimestamp", value: timestamp });
}

export async function getPendingChangesCount(): Promise<number> {
  return db.syncQueue.count();
}

export async function clearSyncErrors(olderThan: Date): Promise<void> {
  await db.syncErrors
    .where("createdAt")
    .below(olderThan.toISOString())
    .delete();
}
