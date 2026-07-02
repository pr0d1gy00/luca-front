// ================================================================
// Auth Types — alineados con api_auth_documentation.md (Phase 1)
// ================================================================

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface State {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  state: State;
  country: Country;
}

export interface Specialty {
  id: string;
  name: string;
  description: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

// ── Roles y estados (API native enums) ──────────────────────────

export type UserRole = "DOCTOR" | "PROVIDER" | "ADMIN";
export type PlanType = "FREE" | "PRO" | "ENTERPRISE";
export type ProviderType = "PHARMACY" | "LABORATORY";

/** Solo para UserProfile (doctors/providers/admins) */
export type AccountStatus = "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED";

export type UserRoleApi = "DOCTOR" | "PROVIDER" | "ADMIN";
export type PatientStatusApi = "ACTIVE" | "WARNED" | "SUSPENDED" | "BANNED";

// ── Perfiles que retorna el API (/me y dentro de login response) ─

/**
 * Perfil de Paciente — retorna del API.
 * NO tiene `is_verified`: los pacientes no pasan verificación KYC manual.
 */
export interface PatientProfile {
  uuid: string;
  email: string | null;
  fullName?: string;
  full_name: string;
  is_active: boolean;
  status: PatientStatusApi;
}

/**
 * Perfil de Doctor/Proveedor/Admin — retorna del API.
 * SÍ tiene `is_verified`: doctores y proveedores requieren aprobación KYC manual.
 */
export interface UserProfile {
  uuid: string;
  email: string;
  fullName?: string;
  full_name: string;
  role: UserRoleApi;
  is_active: boolean;
  status: AccountStatus;
  isVerified?: boolean;
  is_verified: boolean;
  pending_documents: number;
  plan_type?: PlanType;
  phone?: string | null;
  logoUrl?: string | null;
  logo_url?: string | null;
  signatureUrl?: string | null;
  signature_url?: string | null;
  city_id?: string | null;
  provider_profile?: {
    id: string;
    user_id: string;
    type: ProviderType;
    commercial_name: string;
    rif: string;
    is_verified: boolean;
    address?: string | null;
    cityId?: string | null;
    phone?: string | null;
    googleMapsUrl?: string | null;
    observations?: string | null;
  };
}

// ── Auth Response (login / register) ───────────────────────────

/** Respuesta directa de login y register endpoints */
export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  user: UserProfile | PatientProfile;
}

// ── Internal store types (derivados) ──────────────────────────

/**
 * PatientAccount — representación interna usada en el store de Zustand.
 * Incluye campos adicionales de la DB que el API no retorna en el login response.
 */
export interface PatientAccount extends PatientProfile {
  id: number;
  phone: string;
  national_id: string | null;
  username: string | null;
  city_id: string | null;
  avatarUrl?: string | null;
  avatar_url: string | null;
  created_at: string;
}
