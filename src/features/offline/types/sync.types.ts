// ============================================
// SHARED SYNC TYPES — LUCA Offline-First
// ============================================

// Timestamp ISO 8601 con precisión de milisegundos
export type SyncTimestamp = string; // "2026-06-23T22:05:00.000Z"

// UUID v4 generado por el cliente
export type EntityUUID = string;

// Estado de sync de un registro individual
export type SyncStatus = "pending" | "synced" | "error" | "conflict";

// Entidad base con campos de sync
export interface SyncableEntity {
	uuid: EntityUUID;
	updatedAt: SyncTimestamp;
	createdAt: SyncTimestamp;
	deletedAt?: SyncTimestamp | null;
	_syncStatus?: SyncStatus;
	_syncError?: string;
	_syncErrorField?: string;
}

// Registro encolado para envío (dirty queue)
export interface QueuedChange<T = unknown> {
	id: string; // ID local único
	entity: EntityType;
	action: "create" | "update" | "delete";
	data: T;
	timestamp: SyncTimestamp;
	retryCount: number;
	maxRetries: number;
}

// Entidades sincronizables (orden topológico para push)
export const SYNC_ENTITY_ORDER = [
	// Scheduling (Fase 6)
	"doctor_schedules",
	"schedule_exceptions",
	"clinic_schedules",
	// Clinics (Phase 5)
	"clinic_departments",
	"clinic_roles",
	"clinic_staff",
	"clinic_rooms",
	"clinic_beds",
	"admissions",
	"treatment_notes",
	"administered_medications",
	"service_charges",
	"surgical_operations",
	"surgery_team_members",
	"supply_orders",
	"supply_order_items",
	// Core entities
	"patients",
	"appointments",
	"consultations",
	"medical_backgrounds",
	"lifestyles",
	"obstetric_histories",
	"surgical_histories",
	"family_histories",
	"vaccinations",
	// Medical
	"vital_signs",
	"lab_requests",
	"lab_results",
	// Prescriptions
	"prescriptions",
	"prescription_items",
	"medications",
	// Follow-ups
	"follow_ups",
	// Billing
	"invoices",
	"invoice_items",
	"payments",
	// Marketplace
	"quote_requests",
	"quote_offers",
	// Notifications & Docs
	"notifications",
	"medical_documents",
] as const;

export type EntityType = (typeof SYNC_ENTITY_ORDER)[number];

// ============================================
// REQUEST / RESPONSE TYPES
// ============================================

export interface SyncRequest {
	last_sync_timestamp: SyncTimestamp | null;
	push: Partial<Record<EntityType, SyncableEntity[]>>;
}

export interface SyncError {
	uuid: EntityUUID;
	field: string;
	message: string;
}

export interface EntityPushResult {
	success: EntityUUID[];
	errors: SyncError[];
}

export interface PushResults {
	[entity: string]: EntityPushResult;
}

export interface SyncResponse {
	sync_timestamp: SyncTimestamp;
	has_more: boolean;
	push_results: PushResults;
	pull: Partial<Record<EntityType, SyncableEntity[]>>;
}

// ============================================
// SYNC ENGINE STATE
// ============================================

export type SyncStatusType = "idle" | "syncing" | "error" | "offline";

export interface SyncStats {
	pendingCount: number;
	lastSyncTimestamp: SyncTimestamp | null;
	lastSyncError: string | null;
}

export interface SyncEngineState {
	state: SyncStatusType;
	stats: SyncStats;
	isOnline: boolean;
	isSyncing: boolean;
	pendingChanges: number;
}

// ============================================
// CONFLICT TYPES
// ============================================

export interface ConflictResolution {
	uuid: EntityUUID;
	entity: EntityType;
	resolution: "keep_local" | "keep_server" | "merge";
	resolvedAt: SyncTimestamp;
}

// ============================================
// CATALOG TYPES (readonly, synced in pull)
// ============================================

export interface CatalogEntity extends SyncableEntity {
	name: string;
}

export interface City extends CatalogEntity {
	name: string;
	state_id: number;
}

export interface Specialty extends CatalogEntity {
	name: string;
	code: string;
}

export interface Medication extends CatalogEntity {
	name: string;
	active_ingredient: string;
	presentation: string;
}

export interface FormTemplate extends CatalogEntity {
	name: string;
	version: string;
	schema: Record<string, unknown>;
}

export interface ClinicBranch extends CatalogEntity {
	name: string;
	address: string;
	phone: string;
}

// ============================================
// UTILITY TYPES
// ============================================

// Tipo para extracción de UUID de una entidad
export type EntityByType<T extends EntityType> = T extends T
	? Record<string, unknown> & { uuid: EntityUUID }
	: never;
