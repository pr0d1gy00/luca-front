// ============================================
// PUBLIC CATALOG TYPES — LUCA Health OS
// ============================================

export interface City {
	id: number;
	name: string;
}

export interface PaginationMeta {
	current_page: number;
	per_page: number;
	total: number;
	last_page: number;
}

export interface Specialty {
	id: number;
	name: string;
}

// ============================================
// DOCTORS
// ============================================

export interface ClinicBranchBasic {
	id: string;
	name: string;
	address: string;
	city?: City | null;
	department?: string | null;
	office_number?: string | null;
}

export interface ClinicBasic {
	id: string;
	name: string;
	branches: ClinicBranchBasic[];
}

export interface Doctor {
	id: string;
	full_name: string;
	specialties: Specialty[];
	city: City | null;
	logo_url: string | null;
	is_verified: boolean;
	clinics?: ClinicBasic[];
}

export interface DoctorsResponse {
	data: Doctor[];
	meta?: PaginationMeta;
}

// ============================================
// PHARMACIES
// ============================================

export interface PharmacyBranch {
	id: string;
	name: string;
	address: string;
	phone: string;
	is_open: boolean;
	latitude: number | null;
	longitude: number | null;
	google_maps_url: string | null;
}

export interface Pharmacy {
	id: string;
	commercial_name: string;
	rif: string;
	address: string;
	phone: string;
	is_open: boolean;
	is_verified: boolean;
	logo_url: string | null;
	city: City | null;
	branches: PharmacyBranch[];
}

export interface PharmaciesResponse {
	data: Pharmacy[];
	meta?: PaginationMeta;
}

// ============================================
// CLINICS
// ============================================

export interface ClinicDoctor {
	id: string;
	full_name: string;
	logo_url: string | null;
	department: string | null;
	office_number: string | null;
}

export interface ClinicBranch {
	id: string;
	name: string;
	address: string;
	phone: string;
	is_main_branch: boolean;
	latitude: number | null;
	longitude: number | null;
	google_maps_url: string | null;
	city: City | null;
	doctors: ClinicDoctor[];
}

export interface Clinic {
	id: string;
	name: string;
	rif: string;
	logo_url: string | null;
	website: string | null;
	branches: ClinicBranch[];
}

export interface ClinicsResponse {
	data: Clinic[];
	meta?: PaginationMeta;
}
