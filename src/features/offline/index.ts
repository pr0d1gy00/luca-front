// ============================================
// OFFLINE SYNC FEATURE — Public API
// ============================================

// Types
export * from "./types/sync.types";

// Database — export renamed types
export { db } from "./database/schema";
export type {
	// Patients
	PatientRecord,
	// Scheduling (Fase 6)
	DoctorSchedule,
	ScheduleException,
	ClinicSchedule,
	Weekday,
	ExceptionType,
	// Appointments
	Appointment,
	// Consultations
	Consultation,
	// Medical Histories
	MedicalBackground,
	Lifestyle,
	ObstetricHistory,
	SurgicalHistory,
	FamilyHistory,
	Vaccination,
	// Vitals & Labs
	VitalSigns,
	LabRequest,
	LabResult,
	// Prescriptions
	Prescription,
	PrescriptionItem,
	Medication,
	// Follow-ups
	FollowUp,
	// Catalogs
	City,
	State,
	Country,
	Specialty,
	Clinic,
	ClinicBranch,
	Doctor,
} from "./database/schema";

// Services (pure business logic)
export { syncService } from "./services/syncService";
export { queueService } from "./services/queueService";

// API
export { syncApi } from "./api/syncApi";

// Store
export { useSyncStore } from "./store/useSyncStore";

// Hooks
export { useOnlineStatus } from "./hooks/useOnlineStatus";
export { useSyncQueue } from "./hooks/useSyncQueue";
export { useSync } from "./hooks/useSync";

// Components (UI only)
export { SyncIndicator } from "./components/SyncIndicator";
