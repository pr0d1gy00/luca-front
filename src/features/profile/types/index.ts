import type { City } from "@/features/auth/types";

/** Datos editables del perfil de paciente */
export interface PatientProfileEdit {
  full_name: string;
  email?: string;
  phone?: string;
  national_id?: string;
  username?: string;
  city_id?: string;
  avatar_url?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

/** Datos editables del perfil de usuario (doctor/proveedor/admin) */
export interface UserProfileEdit {
  full_name: string;
  email: string;
  phone?: string;
  logo_url?: string;
  signature_url?: string;
  city_id?: string;
}

/** Payload de actualización de perfil — agnostic al tipo de usuario */
export type ProfileUpdatePayload = PatientProfileEdit | UserProfileEdit;
