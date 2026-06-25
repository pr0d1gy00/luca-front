// Components
export { AppointmentCrudLayout } from "./components/AppointmentCrudLayout";
export { AppointmentTable } from "./components/AppointmentTable";
export { AppointmentForm } from "./components/AppointmentForm";
export { BookingModal } from "./components/BookingModal";

// Schemas
export { appointmentSchema } from "./schemas";
export type { AppointmentType, AppointmentStatus } from "./schemas";

// Types
export * from "./types";

// API
export { appointmentApi } from "./api/appointmentApi";

// Hooks
export {
	useAppointments,
	useUpcomingAppointments,
	useAppointmentsByPatient,
	useAppointmentsByDoctor,
	useAppointment,
	useCreateAppointment,
	useUpdateAppointment,
	useUpdateAppointmentStatus,
	useCancelAppointment,
	useDeleteAppointment,
	appointmentKeys,
} from "./hooks/useAppointments";

// Services
export { appointmentOfflineService } from "./services/appointmentOfflineService";
