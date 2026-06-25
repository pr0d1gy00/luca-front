// Components
export { PatientCrudLayout } from "./components/PatientCrudLayout";
export { PatientTable } from "./components/PatientTable";
export { PatientForm } from "./components/PatientForm";

// Schemas (solo los que no chocan con types)
export {
	patientSchema,
	biologicalSexEnum,
	biologicalSexLabels,
	bloodTypeLabels,
} from "./schemas";
export type { Patient } from "./types";
export type { BiologicalSex, BloodType } from "./schemas";

// API
export { patientApi } from "./api/patientApi";

// Hooks
export {
	usePatients,
	usePatient,
	useCreatePatient,
	useUpdatePatient,
	useDeletePatient,
	patientKeys,
} from "./hooks/usePatients";

// Services
export { patientOfflineService } from "./services/patientOfflineService";
