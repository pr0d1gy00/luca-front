# LUCA Health OS — Database Schema Documentation v3

> **Last updated:** 2026-06-09  
> **Database engine:** PostgreSQL  
> **Total modules:** 14 | **Total tables:** 31 | **Total enums:** 18

---

## Table of Contents

1. [Patient Identity (PatientAccount)](#1-patient-identity)
2. [Users & Roles (User)](#2-users--roles)
3. [Patient Records (Patient)](#3-patient-records)
4. [Clinical Module](#4-clinical-module)
5. [Prescriptions](#5-prescriptions)
6. [Marketplace](#6-marketplace)
7. [System](#7-system)
8. [Medical Background](#8-medical-background)
9. [Institutional (Clinics)](#9-institutional)
10. [Verification (KYC)](#10-verification)
11. [Pharmacy Inventory](#11-pharmacy-inventory)
12. [Lab Results](#12-lab-results)
13. [Billing & Payments](#13-billing--payments)
14. [Audit Log](#14-audit-log)
15. [Entity Relationship Diagram](#15-entity-relationship-diagram)

---

## 1. Patient Identity

**Module purpose:** Global patient identity across the entire LUCA ecosystem. A patient logs in once via WhatsApp/phone and can link to multiple doctors' records.

### PatientAccount

Stores the master identity for every patient in the system. One `PatientAccount` can be linked to multiple `Patient` records (one per doctor).

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `UUID` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `phone` | `VARCHAR` | NOT NULL | — | Global identifier — WhatsApp number. **Unique.** Used for OTP login |
| 3 | `email` | `VARCHAR` | NULL | — | Optional email for notifications. **Unique** when set |
| 4 | `passwordHash` | `VARCHAR` | NULL | — | bcrypt/argon2 hash. Used for web portal login. **Optional** if OTP-only |
| 5 | `fullName` | `VARCHAR` | NOT NULL | — | Patient's full legal name |
| 6 | `avatarUrl` | `VARCHAR` | NULL | — | Profile picture URL (S3/Cloud Storage) |
| 7 | `nationalId` | `VARCHAR` | NULL | — | National ID / Cédula / passport. **Unique** when set |
| 8 | `username` | `VARCHAR` | NULL | — | Unique username for portal/sharing. **Unique** when set |
| 9 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Account creation timestamp |

**Business rules:**
- A patient registers with their phone number (WhatsApp) — this is the universal identifier
- Email is optional but must be unique when provided
- `nationalId` and `username` are optional but must be unique when set
- The phone number is the global key: a patient can have multiple doctors but only one account

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (phone)`
- `UNIQUE (email)` — partial index, nulls not distinct
- `UNIQUE (nationalId)` — partial index, nulls not distinct
- `UNIQUE (username)` — partial index, nulls not distinct

**Zod schema:** _(not exposed to frontend directly — managed via auth flow)_

---

## 2. Users & Roles

**Module purpose:** All professional users: doctors, pharmacy/lab providers, and system administrators. Controls authentication, plan tier, and professional branding.

### User

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `UUID` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `email` | `VARCHAR` | NOT NULL | — | Login email. **Unique** |
| 3 | `passwordHash` | `VARCHAR` | NOT NULL | — | bcrypt/argon2 hash |
| 4 | `fullName` | `VARCHAR` | NOT NULL | — | Full legal name |
| 5 | `phone` | `VARCHAR` | NULL | — | Administrative WhatsApp number |
| 6 | `role` | `UserRole` | NOT NULL | `DOCTOR` | DOCTOR -> PROVIDER -> ADMIN |
| 7 | `isActive` | `BOOLEAN` | NOT NULL | `true` | Soft-delete / account suspension |
| 8 | `planType` | `PlanType` | NOT NULL | `FREE` | FREE -> PRO -> ENTERPRISE |
| 9 | `logoUrl` | `VARCHAR` | NULL | — | Professional logo for prescriptions/certificates |
| 10 | `signatureUrl` | `VARCHAR` | NULL | — | Digital signature image URL |
| 11 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Registration date |
| 12 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last profile update |

**Business rules:**
- `role=DOCTOR` -> medical professional, can manage patients, write prescriptions, conduct consultations
- `role=PROVIDER` -> pharmacy or laboratory, must have a linked `ProviderProfile`
- `role=ADMIN` -> LUCA platform administrator
- `planType` controls feature access: FREE (basic), PRO (full features), ENTERPRISE (multi-clinic, custom branding)
- `logoUrl` and `signatureUrl` are only relevant for DOCTOR role

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (email)`

### Specialty

Global catalog of medical specialties (e.g. Cardiology, Pediatrics, Gynecology).

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `UUID` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `name` | `VARCHAR` | NOT NULL | — | Specialty name (e.g. "Cardiología"). **Unique** |
| 3 | `description` | `TEXT` | NULL | — | Optional description |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (name)`

### DoctorSpecialty

Many-to-many relationship linking doctors to their specialties.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `UUID` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `UUID` | NOT NULL | — | **FK -> User**. Must have role=DOCTOR |
| 3 | `specialtyId` | `UUID` | NOT NULL | — | **FK -> Specialty** |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (userId, specialtyId)`
- `INDEX (specialtyId)`

### Enum: UserRole

| Value | Description |
|-------|-------------|
| `DOCTOR` | Medical professional — can manage patients, prescribe, consult |
| `PROVIDER` | Pharmacy or laboratory — marketplace participant |
| `ADMIN` | LUCA platform administrator |

### Enum: PlanType

| Value | Description |
|-------|-------------|
| `FREE` | Basic tier — limited patients, no marketplace |
| `PRO` | Full tier — unlimited patients, marketplace, templates |
| `ENTERPRISE` | Multi-clinic — custom branding, clinic management, API access |

---

## 3. Patient Records

**Module purpose:** Medical CRM. Each doctor manages their own patient records. A patient can exist in multiple doctors' `Patient` tables linked to the same `PatientAccount`.

### Patient

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Doctor who owns this record |
| 3 | `patientAccountId` | `VARCHAR` | NULL | — | **FK -> PatientAccount**. Global patient link |
| 4 | `firstName` | `VARCHAR` | NOT NULL | — | Patient's first name |
| 5 | `lastName` | `VARCHAR` | NOT NULL | — | Patient's last name |
| 6 | `nationalId` | `VARCHAR` | NOT NULL | — | National ID / DNI / passport |
| 7 | `birthDate` | `DATETIME` | NOT NULL | — | Date of birth |
| 8 | `gender` | `Gender` | NOT NULL | — | MALE -> FEMALE -> OTHER |
| 9 | `email` | `VARCHAR` | NULL | — | Contact email |
| 10 | `phone` | `VARCHAR` | NULL | — | Contact phone |
| 11 | `address` | `VARCHAR` | NULL | — | Physical address |
| 12 | `city` | `VARCHAR` | NULL | — | City of residence |
| 13 | `emergencyContactName` | `VARCHAR` | NULL | — | **v3 ⚪** Emergency contact full name |
| 14 | `emergencyContactPhone` | `VARCHAR` | NULL | — | **v3 ⚪** Emergency contact phone number |
| 15 | `accessCode` | `VARCHAR` | NULL | — | Unique code for patient portal access. **Unique** |
| 16 | `lastLogin` | `DATETIME` | NULL | — | Last patient portal login timestamp |
| 17 | `bloodType` | `VARCHAR` | NULL | — | A+/A-/B+/B-/AB+/AB-/O+/O- |
| 18 | `allergies` | `VARCHAR` | NULL | — | Known allergies (comma-separated or JSON array) |
| 19 | `chronicConditions` | `VARCHAR` | NULL | — | Chronic conditions summary |
| 20 | `privateNotes` | `TEXT` | NULL | — | Doctor-only private notes (not visible to patient) |
| 21 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Record creation |
| 22 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- `userId` defines ownership: only the creating doctor can see this record
- `patientAccountId` links to the global account — enables cross-doctor data sharing with patient consent
- `accessCode` is auto-generated, used for patient portal login without password
- `privateNotes` are NEVER visible to the patient via the portal
- `emergencyContact*` fields were added in v3 — already present in frontend Zod schema

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId)`
- `INDEX (patientAccountId)`
- `UNIQUE (accessCode)`

### Enum: Gender

| Value | Description |
|-------|-------------|
| `MALE` | Male |
| `FEMALE` | Female |
| `OTHER` | Other / non-binary |

**Zod schema:** `src/features/patients/schemas.ts`

---

## 4. Clinical Module

**Module purpose:** Core clinical workflow: dynamic form templates -> consultations with SOAP notes -> vital signs -> lab requests -> appointments.

### FormTemplate

Dynamic form builder — doctors can create custom clinical history templates or use global ones by specialty.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NULL | — | **FK -> User**. NULL = global template, NOT NULL = personal |
| 3 | `specialty` | `VARCHAR` | NULL | — | e.g. "Cardiología". For global templates |
| 4 | `schemaJson` | `JSON` | NOT NULL | — | Array of input definitions: `[{name, label, type, options?}]` |
| 5 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Creation timestamp |

**Business rules:**
- `userId=NULL` -> global template curated by LUCA for a specialty
- `userId=NOT NULL` -> personal template created by a doctor (drag & drop)
- `schemaJson` structure: `[{name: "bpm", label: "Frecuencia cardíaca", type: "number", unit: "bpm"}]`
- Supported field types: text, number, select, multiselect, date, textarea, image

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId)`
- `INDEX (specialty)` WHERE userId IS NULL

### Consultation

The core clinical encounter. Every doctor-patient interaction is a Consultation. Supports dynamic form data via `dynamicData`.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Doctor conducting the consultation |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient**. Patient being seen |
| 4 | `clinicId` | `VARCHAR` | NULL | — | **FK -> Clinic**. NULL if private practice |
| 5 | `formTemplateId` | `VARCHAR` | NULL | — | **FK -> FormTemplate**. Template used for this consult |
| 6 | `date` | `DATETIME` | NOT NULL | — | Consultation date and time |
| 7 | `status` | `VARCHAR` | NOT NULL | `pending` | **v2:** pending -> in-progress -> completed -> cancelled |
| 8 | `reason` | `VARCHAR` | NULL | — | **S (Subjective):** Chief complaint / reason for visit |
| 9 | `physicalExam` | `TEXT` | NULL | — | **O (Objective):** Physical examination findings |
| 10 | `diagnosis` | `VARCHAR` | NULL | — | **A (Assessment):** Diagnosis |
| 11 | `treatmentPlan` | `TEXT` | NULL | — | **P (Plan):** Treatment plan |
| 12 | `dynamicData` | `JSON` | NULL | — | Custom form responses: `{bpm: 85, perimetro: 35}` |

**Business rules:**
- SOAP note structure: Subjective (reason), Objective (physicalExam + vital signs), Assessment (diagnosis), Plan (treatmentPlan)
- `dynamicData` stores form template responses — keyed by form field `name`
- Status workflow: `pending` (scheduled) -> `in-progress` (doctor started) -> `completed` (finished) -> `cancelled` (not attended)
- A consultation can have exactly one `VitalSign` and one `LabRequest`

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId, date)`
- `INDEX (patientId)`
- `INDEX (clinicId)`
- `INDEX (status)`

### Appointment

Scheduling/agenda system. Doctors manage their appointment calendar.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 3 | `doctorId` | `VARCHAR` | NOT NULL | — | **FK -> User** (must have role=DOCTOR) |
| 4 | `clinicId` | `VARCHAR` | NULL | — | **FK -> Clinic**. NULL if private practice |
| 5 | `date` | `DATE` | NOT NULL | — | Appointment date |
| 6 | `time` | `VARCHAR` | NOT NULL | — | Time slot, e.g. "09:30" |
| 7 | `type` | `VARCHAR` | NOT NULL | — | e.g. "Control general", "Cardiología" |
| 8 | `status` | `VARCHAR` | NOT NULL | `pending` | pending -> in-progress -> completed -> cancelled |
| 9 | `notes` | `TEXT` | NULL | — | Internal doctor notes |
| 10 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Creation |
| 11 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- Doctor (and clinic) calendar: appointments are scoped to doctor+date
- Status drives the dashboard queue: `pending` appears in "upcoming", `in-progress` in "now"
- No double-booking enforced at application level

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (doctorId, date)`
- `INDEX (patientId)`
- `INDEX (clinicId)`

### VitalSign

Patient vitals taken during a consultation. 1:1 relationship with Consultation.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 3 | `consultationId` | `VARCHAR` | NOT NULL | — | **FK -> Consultation**. Unique (1:1) |
| 4 | `weight` | `FLOAT` | NULL | — | kg |
| 5 | `height` | `FLOAT` | NULL | — | cm |
| 6 | `systolicBP` | `INT` | NULL | — | Systolic blood pressure (mmHg) |
| 7 | `diastolicBP` | `INT` | NULL | — | Diastolic blood pressure (mmHg) |
| 8 | `heartRate` | `INT` | NULL | — | bpm |
| 9 | `temperature` | `FLOAT` | NULL | — | °C |
| 10 | `oxygenSat` | `INT` | NULL | — | SpO₂ percentage |
| 11 | `date` | `DATETIME` | NOT NULL | — | Measurement date/time |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (consultationId)`
- `INDEX (patientId)`

### LabRequest

Laboratory test order linked to a consultation. 1:1 relationship with Consultation.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `consultationId` | `VARCHAR` | NOT NULL | — | **FK -> Consultation**. Unique (1:1) |
| 3 | `examsList` | `VARCHAR` | NOT NULL | — | JSON array of exam names: `["Hemograma", "Glicemia"]` |
| 4 | `instructions` | `VARCHAR` | NULL | — | Special instructions for patient/lab |
| 5 | `isCompleted` | `BOOLEAN` | NOT NULL | `false` | All results received? |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (consultationId)`

---

## 5. Prescriptions

**Module purpose:** Complete prescription workflow: medication catalog -> prescription templates -> live prescriptions with items.

### Medication

Global and personal medication catalog. Global medications are curated by LUCA; doctors can add personal entries.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NULL | — | **FK -> User**. NULL = global catalog, NOT NULL = doctor's personal |
| 3 | `activePrinciple` | `VARCHAR` | NOT NULL | — | Active ingredient, e.g. "Amoxicilina" |
| 4 | `concentration` | `VARCHAR` | NOT NULL | — | e.g. "500mg", "4mg/ml", "1g" |
| 5 | `presentation` | `PresentationEnum` | NOT NULL | — | CAPSULA -> TABLETA -> JARABE -> GOTAS -> AMPOLLA -> CREMA |
| 6 | `administrationRoute` | `AdministrationRouteEnum` | NOT NULL | — | ORAL -> INTRAVENOSA -> INTRAMUSCULAR -> TOPICA -> OFTALMICA |
| 7 | `commercialName` | `VARCHAR` | NULL | — | Brand name, e.g. "Amoxil" |
| 8 | `requiresPrescription` | `BOOLEAN` | NOT NULL | `true` | **v3 ⚪** Does it require a medical prescription? |
| 9 | `contraindications` | `TEXT` | NULL | — | **v3 ⚪** Known contraindications |
| 10 | `isActive` | `BOOLEAN` | NOT NULL | `true` | Soft-delete / deprecate medication |
| 11 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Creation |
| 12 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- Unique constraint: `(userId, activePrinciple, concentration, presentation, administrationRoute)` — same doctor can't duplicate
- Global catalog: `userId=NULL`, visible to all doctors
- Personal catalog: `userId=NOT NULL`, visible only to that doctor
- Seed data: 12 common medications included in `DATABASE_PATCH_v2.sql`

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (userId, activePrinciple, concentration, presentation, administrationRoute)`
- `INDEX (userId)`

**Zod schema:** `src/features/medications/schemas.ts`

### Enum: PresentationEnum

| Value | Label (es) | Description |
|-------|-----------|-------------|
| `CAPSULA` | Cápsula | Capsule |
| `TABLETA` | Tableta | Tablet |
| `JARABE` | Jarabe | Syrup |
| `GOTAS` | Gotas | Drops |
| `AMPOLLA` | Ampolla | Ampoule / vial |
| `CREMA` | Crema | Cream / ointment |

### Enum: AdministrationRouteEnum

| Value | Label (es) | Description |
|-------|-----------|-------------|
| `ORAL` | Oral | By mouth |
| `INTRAVENOSA` | Intravenosa | Intravenous |
| `INTRAMUSCULAR` | Intramuscular | Intramuscular injection |
| `TOPICA` | Tópica | Topical application |
| `OFTALMICA` | Oftálmica | Ophthalmic (eye) |

### Prescription

A live prescription issued by a doctor. Can be linked to a consultation (but not required).

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Prescribing doctor |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 4 | `consultationId` | `VARCHAR` | NULL | — | **FK -> Consultation**. Optional link. Unique |
| 5 | `clinicId` | `VARCHAR` | NULL | — | **FK -> Clinic**. NULL if private practice |
| 6 | `date` | `DATETIME` | NOT NULL | — | Prescription date |
| 7 | `expirationDate` | `DATETIME` | NOT NULL | — | Expiration date |
| 8 | `notes` | `VARCHAR` | NULL | — | General notes |
| 9 | `publicToken` | `VARCHAR` | NOT NULL | — | Shareable token for pharmacy verification. **Unique** |
| 10 | `status` | `RxStatus` | NOT NULL | — | ACTIVE -> CANCELLED -> EXPIRED |

**Business rules:**
- `publicToken` is a unique, shareable identifier — patients share this with pharmacies (WhatsApp/link)
- Status transitions: ACTIVE -> CANCELLED (doctor revokes) or ACTIVE -> EXPIRED (past expirationDate)
- If linked to a consultation, it's 1:1 (unique constraint)

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (consultationId)` — partial index, nulls not distinct
- `UNIQUE (publicToken)`
- `INDEX (userId)`
- `INDEX (patientId)`

### PrescriptionItem

Individual medication line item within a prescription.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `prescriptionId` | `VARCHAR` | NOT NULL | — | **FK -> Prescription** |
| 3 | `medicationId` | `VARCHAR` | NOT NULL | — | **FK -> Medication**. **v2:** replaced free-text `medication` |
| 4 | `dose` | `VARCHAR` | NULL | — | e.g. "1 cápsula" |
| 5 | `frequency` | `VARCHAR` | NULL | — | e.g. "Cada 8 horas" |
| 6 | `duration` | `VARCHAR` | NULL | — | e.g. "7 días" |
| 7 | `quantity` | `INT` | NOT NULL | `1` | **v2:** Number of units (boxes, blisters) |
| 8 | `notes` | `VARCHAR` | NULL | — | **v2:** Doctor observations for this specific item |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (prescriptionId)`
- `INDEX (medicationId)`

### Enum: RxStatus

| Value | Description |
|-------|-------------|
| `ACTIVE` | Prescription is valid and can be dispensed |
| `CANCELLED` | Revoked by the prescribing doctor |
| `EXPIRED` | Past the expiration date |

### PrescriptionTemplate

Saved prescription templates for quick reuse (e.g. "Post-operatorio estándar").

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Doctor who owns the template |
| 3 | `title` | `VARCHAR` | NOT NULL | — | Template name, e.g. "Post-cirugía abdominal" |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId)`

### TemplateItem

Medication item within a prescription template.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `templateId` | `VARCHAR` | NOT NULL | — | **FK -> PrescriptionTemplate** |
| 3 | `medicationId` | `VARCHAR` | NOT NULL | — | **FK -> Medication**. **v2:** replaced free-text |
| 4 | `dose` | `VARCHAR` | NULL | — | e.g. "1 cápsula" |
| 5 | `frequency` | `VARCHAR` | NULL | — | e.g. "Cada 8 horas" |
| 6 | `duration` | `VARCHAR` | NULL | — | e.g. "7 días" |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (templateId)`
- `INDEX (medicationId)`

---

## 6. Marketplace

**Module purpose:** B2B marketplace connecting patients/doctors with pharmacies and laboratories. Quote request -> offer workflow.

### ProviderProfile

Business profile for pharmacies and laboratories participating in the marketplace.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Unique (1:1) |
| 3 | `type` | `ProviderType` | NOT NULL | — | PHARMACY -> LABORATORY |
| 4 | `commercialName` | `VARCHAR` | NOT NULL | — | Business name |
| 5 | `rif` | `VARCHAR` | NOT NULL | — | Tax ID (Venezuela RIF) |
| 6 | `address` | `VARCHAR` | NOT NULL | — | Physical address |
| 7 | `city` | `VARCHAR` | NOT NULL | — | City |
| 8 | `state` | `VARCHAR` | NOT NULL | — | State / province |
| 9 | `phone` | `VARCHAR` | NOT NULL | — | Business phone |
| 10 | `isOpen` | `BOOLEAN` | NOT NULL | `false` | Currently accepting orders? |
| 11 | `isVerified` | `BOOLEAN` | NOT NULL | `false` | KYC verified? |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (userId)`

### Enum: ProviderType

| Value | Description |
|-------|-------------|
| `PHARMACY` | Retail pharmacy / drugstore |
| `LABORATORY` | Clinical laboratory |

### QuoteRequest

A request for medication/lab quotes, typically created from a prescription.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `prescriptionId` | `VARCHAR` | NOT NULL | — | **FK -> Prescription** |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 4 | `city` | `VARCHAR` | NOT NULL | — | Target city for delivery/pickup |
| 5 | `status` | `QuoteStatus` | NOT NULL | — | OPEN -> CLOSED |
| 6 | `createdAt` | `DATETIME` | NOT NULL | `NOW()` | Request creation |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (prescriptionId)`
- `INDEX (patientId)`
- `INDEX (status)`

### QuoteOffer

A provider's price offer for a quote request.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `quoteRequestId` | `VARCHAR` | NOT NULL | — | **FK -> QuoteRequest** |
| 3 | `providerId` | `VARCHAR` | NOT NULL | — | **FK -> ProviderProfile** |
| 4 | `price` | `FLOAT` | NOT NULL | — | Total price |
| 5 | `currency` | `VARCHAR` | NOT NULL | `"USD"` | Currency code |
| 6 | `availability` | `VARCHAR` | NULL | — | e.g. "Entrega en 24h", "Retiro en sucursal" |
| 7 | `comments` | `VARCHAR` | NULL | — | Provider notes |
| 8 | `createdAt` | `DATETIME` | NOT NULL | `NOW()` | Offer creation |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (quoteRequestId)`
- `INDEX (providerId)`

### Enum: QuoteStatus

| Value | Description |
|-------|-------------|
| `OPEN` | Accepting offers from providers |
| `CLOSED` | Request fulfilled or expired |

---

## 7. System

**Module purpose:** Cross-cutting system features: notifications, medical documents, and patient follow-ups.

### Notification

In-app notification system.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Recipient |
| 3 | `type` | `NotifType` | NOT NULL | — | Notification category |
| 4 | `title` | `VARCHAR` | NOT NULL | — | Notification title |
| 5 | `message` | `VARCHAR` | NOT NULL | — | Notification body |
| 6 | `isRead` | `BOOLEAN` | NOT NULL | `false` | Read status |
| 7 | `link` | `VARCHAR` | NULL | — | Deeplink URL |
| 8 | `createdAt` | `DATETIME` | NOT NULL | `NOW()` | Creation timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId, isRead)`
- `INDEX (createdAt)`

### Enum: NotifType

| Value | Description |
|-------|-------------|
| `SYSTEM` | General platform notification |
| `NEW_QUOTE_REQUEST` | New quote request in marketplace (-> pharmacies) |
| `QUOTE_RECEIVED` | Quote received (-> patient/doctor) |
| `FOLLOW_UP_ALERT` | Patient follow-up reminder |

### MedicalDocument

Legal/medical documents: certificates, referrals, reports.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Issuing doctor |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 4 | `type` | `DocType` | NOT NULL | — | CERTIFICATE -> REFERRAL -> REPORT |
| 5 | `content` | `TEXT` | NOT NULL | — | Document body (HTML or plain text) |
| 6 | `publicToken` | `VARCHAR` | NOT NULL | — | Shareable verification token. **Unique** |
| 7 | `createdAt` | `DATETIME` | NOT NULL | `NOW()` | Creation timestamp |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (publicToken)`
- `INDEX (userId)`
- `INDEX (patientId)`

### Enum: DocType

| Value | Description |
|-------|-------------|
| `CERTIFICATE` | Medical certificate (work/school) |
| `REFERRAL` | Inter-doctor referral |
| `REPORT` | Medical report |

### FollowUp

Scheduled patient follow-up tracking.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Doctor |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 4 | `scheduledDate` | `DATETIME` | NOT NULL | — | When to follow up |
| 5 | `status` | `FollowStatus` | NOT NULL | — | PENDING -> SENT -> RESPONDED |
| 6 | `response` | `VARCHAR` | NULL | — | Patient's WhatsApp response |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId, scheduledDate)`
- `INDEX (patientId)`

### Enum: FollowStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Follow-up scheduled, not yet sent |
| `SENT` | WhatsApp message sent to patient |
| `RESPONDED` | Patient responded |

---

## 8. Medical Background

**Module purpose:** Deep clinical history — antecedents, surgical history, family history, lifestyle, obstetric history, vaccinations.

### MedicalBackground

Key chronic conditions and past hospitalizations. 1:1 with Patient.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient**. Unique (1:1) |
| 3 | `hasDiabetes` | `BOOLEAN` | NOT NULL | `false` | Diabetes diagnosis |
| 4 | `hasHypertension` | `BOOLEAN` | NOT NULL | `false` | Hypertension diagnosis |
| 5 | `hasAsthma` | `BOOLEAN` | NOT NULL | `false` | Asthma diagnosis |
| 6 | `otherConditions` | `TEXT` | NULL | — | Other chronic conditions (free text) |
| 7 | `pastHospitalizations` | `TEXT` | NULL | — | Past hospitalizations summary |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (patientId)`

### SurgicalHistory

Past surgical procedures.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 3 | `procedure` | `VARCHAR` | NOT NULL | — | Procedure name, e.g. "Apendicectomía" |
| 4 | `date` | `DATETIME` | NOT NULL | — | Surgery date |
| 5 | `hospital` | `VARCHAR` | NULL | — | Hospital where performed |
| 6 | `notes` | `VARCHAR` | NULL | — | Additional notes |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (patientId)`

### FamilyHistory

Family medical history — hereditary conditions.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 3 | `condition` | `VARCHAR` | NOT NULL | — | Condition name, e.g. "Diabetes tipo 2" |
| 4 | `relationship` | `VARCHAR` | NOT NULL | — | Family relationship, e.g. "Madre", "Abuelo paterno" |
| 5 | `note` | `VARCHAR` | NULL | — | Additional details |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (patientId)`

### Lifestyle

Patient lifestyle factors. 1:1 with Patient.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient**. Unique (1:1) |
| 3 | `smokingStatus` | `VARCHAR` | NULL | — | e.g. "No fumador", "Fumador activo", "Ex-fumador" |
| 4 | `alcoholConsumption` | `VARCHAR` | NULL | — | e.g. "No consume", "Ocasional", "Frecuente" |
| 5 | `activityLevel` | `VARCHAR` | NULL | — | e.g. "Sedentario", "Moderado", "Activo" |
| 6 | `dietType` | `VARCHAR` | NULL | — | e.g. "Omnívoro", "Vegetariano", "Vegano" |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (patientId)`

### ObstetricHistory

Gynecological/obstetric history. 1:1 with Patient.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient**. Unique (1:1) |
| 3 | `lastPeriodDate` | `DATETIME` | NULL | — | FUM / last menstrual period |
| 4 | `pregnancies` | `INT` | NULL | — | G (Gravida) — total pregnancies |
| 5 | `births` | `INT` | NULL | — | P (Para) — births |
| 6 | `cesareans` | `INT` | NULL | — | C (Cesarean) — C-sections |
| 7 | `abortions` | `INT` | NULL | — | A (Abortions) — miscarriages/abortions |
| 8 | `contraceptiveMethod` | `VARCHAR` | NULL | — | Current contraceptive method |

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (patientId)`

### Vaccination

Immunization records.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 3 | `vaccine` | `VARCHAR` | NOT NULL | — | Vaccine name, e.g. "COVID-19 Pfizer", "Influenza" |
| 4 | `doseNumber` | `INT` | NOT NULL | — | Dose number (1, 2, booster...) |
| 5 | `date` | `DATETIME` | NOT NULL | — | Administration date |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (patientId)`

---

## 9. Institutional

**Module purpose:** Multi-clinic support. Clinics have members (doctors, admins, receptionists) with role-based access.

### Clinic

Healthcare institution profile.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `name` | `VARCHAR` | NOT NULL | — | Clinic / hospital name |
| 3 | `rif` | `VARCHAR` | NOT NULL | — | Tax ID (Venezuela RIF) |
| 4 | `address` | `VARCHAR` | NOT NULL | — | Physical address |
| 5 | `logoUrl` | `VARCHAR` | NULL | — | Clinic logo |
| 6 | `website` | `VARCHAR` | NULL | — | Website URL |
| 7 | `phone` | `VARCHAR` | NOT NULL | — | Main phone |
| 8 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Creation |
| 9 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Indexes:**
- `PRIMARY KEY (id)`

### ClinicMember

Membership linking users to clinics with role-based access.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `clinicId` | `VARCHAR` | NOT NULL | — | **FK -> Clinic** |
| 3 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User** |
| 4 | `role` | `ClinicRole` | NOT NULL | `DOCTOR` | OWNER -> ADMIN -> DOCTOR -> RECEPTIONIST |
| 5 | `isActive` | `BOOLEAN` | NOT NULL | `true` | Active membership? |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (clinicId)`
- `INDEX (userId)`
- `UNIQUE (clinicId, userId)`

### Enum: ClinicRole

| Value | Permissions |
|-------|------------|
| `OWNER` | Full clinic control — billing, member management, analytics |
| `ADMIN` | Administrative — manage appointments, members, reports |
| `DOCTOR` | Clinical — see own patients, prescribe, consult |
| `RECEPTIONIST` | Front desk — schedule appointments, check-in patients |

---

## 10. Verification (KYC)

**Module purpose:** Know Your Customer document verification for doctors, pharmacies, and clinics.

### VerificationDocument

Uploaded documents for identity/business verification.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Who uploaded |
| 3 | `type` | `DocVerificationType` | NOT NULL | — | Document category |
| 4 | `fileUrl` | `VARCHAR` | NOT NULL | — | URL to file (S3/Google Cloud) |
| 5 | `status` | `VerificationStatus` | NOT NULL | `PENDING` | PENDING -> APPROVED -> REJECTED |
| 6 | `comments` | `TEXT` | NULL | — | Rejection reason if applicable |
| 7 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Upload date |
| 8 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last status change |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId, type)`

### Enum: DocVerificationType

| Value | Required by |
|-------|------------|
| `MEDICAL_LICENSE` | DOCTOR — medical degree or college certification |
| `NATIONAL_ID` | All users — national ID card |
| `BUSINESS_RIF` | PROVIDER, CLINIC — tax registration |
| `COMMERCIAL_REGISTER` | PROVIDER, CLINIC — business registration |

### Enum: VerificationStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Awaiting review |
| `APPROVED` | Document verified |
| `REJECTED` | Document rejected (see `comments`) |

---

## 11. Pharmacy Inventory 🟢 v3

**Module purpose:** Real-time inventory management for pharmacies. Tracks stock levels, batches, expiration dates, and pricing. Enables accurate quote generation in the marketplace.

### PharmacyInventory

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `providerId` | `VARCHAR` | NOT NULL | — | **FK -> ProviderProfile**. Pharmacy owning this stock |
| 3 | `medicationId` | `VARCHAR` | NOT NULL | — | **FK -> Medication**. Which medication |
| 4 | `stock` | `INT` | NOT NULL | `0` | Current units available |
| 5 | `minStockAlert` | `INT` | NULL | `10` | Threshold that triggers low-stock alert |
| 6 | `batchNumber` | `VARCHAR` | NULL | — | Batch/lot number for traceability |
| 7 | `expirationDate` | `DATE` | NULL | — | Expiration date of this batch |
| 8 | `unitPrice` | `DECIMAL(10,2)` | NULL | — | Selling price per unit (used for auto-quoting) |
| 9 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Record creation |
| 10 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- Unique constraint: `(providerId, medicationId, batchNumber)` — same pharmacy can't have two records for the same batch
- When `stock <= minStockAlert`, the pharmacy receives a "low stock" notification
- `unitPrice` is used to auto-generate quote offers in the marketplace
- `batchNumber` enables recall tracking in case of medication alerts
- Pharmacies update `stock` after each sale/dispensation

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (providerId, medicationId, batchNumber)`
- `INDEX (providerId)`
- `INDEX (medicationId)`
- `INDEX (expirationDate)` WHERE expirationDate IS NOT NULL — for expiration alerts

**Zod schema:** `src/features/inventory/schemas.ts`

---

## 12. Lab Results 🟢 v3

**Module purpose:** Complements `LabRequest` by storing actual laboratory test results. Supports structured JSON results for flexible test types plus PDF uploads.

### LabResult

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `labRequestId` | `VARCHAR` | NOT NULL | — | **FK -> LabRequest**. Unique (1:1) |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient**. Denormalized for efficient queries |
| 4 | `fileUrl` | `VARCHAR` | NULL | — | URL to the full PDF report (S3) |
| 5 | `resultJson` | `JSONB` | NULL | — | Structured results: `{glucosa: 90, colesterol: 180, ...}` |
| 6 | `notes` | `TEXT` | NULL | — | Bioanalyst / lab technician notes |
| 7 | `reviewedBy` | `VARCHAR` | NULL | — | **FK -> User**. Doctor who reviewed results |
| 8 | `reviewedAt` | `TIMESTAMP` | NULL | — | When the doctor reviewed |
| 9 | `status` | `LabResultStatus` | NOT NULL | `PENDING` | PENDING -> COMPLETED -> ABNORMAL -> CANCELLED |
| 10 | `performedAt` | `TIMESTAMP` | NULL | — | Actual sample collection / analysis date |
| 11 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Record creation |
| 12 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- 1:1 with LabRequest — each lab order produces exactly one result record
- `resultJson` is flexible JSONB: structure depends on the exam type (e.g., hemogram has different fields than glicemia)
- `status=ABNORMAL` triggers a notification to the requesting doctor (values outside normal range)
- `reviewedBy` + `reviewedAt` track when the doctor acknowledged the results
- `patientId` is denormalized for dashboard queries ("show all results for patient X")

**Indexes:**
- `PRIMARY KEY (id)`
- `UNIQUE (labRequestId)`
- `INDEX (patientId)`
- `INDEX (status)`

### Enum: LabResultStatus

| Value | Description |
|-------|-------------|
| `PENDING` | Awaiting lab processing |
| `COMPLETED` | Results ready, within normal range |
| `ABNORMAL` | Results contain values outside normal range — flag for doctor |
| `CANCELLED` | Lab request cancelled |

**Zod schema:** `src/features/lab-results/schemas.ts`

---

## 13. Billing & Payments 🟢 v3

**Module purpose:** Complete medical billing workflow. Doctors/clinics create invoices linked to consultations/prescriptions. Supports multiple line items and partial payments via different methods.

### Invoice

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NOT NULL | — | **FK -> User**. Doctor/clinic issuing the invoice |
| 3 | `patientId` | `VARCHAR` | NOT NULL | — | **FK -> Patient** |
| 4 | `consultationId` | `VARCHAR` | NULL | — | **FK -> Consultation**. Optional link |
| 5 | `prescriptionId` | `VARCHAR` | NULL | — | **FK -> Prescription**. Optional link |
| 6 | `subtotal` | `DECIMAL(10,2)` | NOT NULL | `0` | Sum of line items before tax/discount |
| 7 | `tax` | `DECIMAL(10,2)` | NULL | `0` | Tax amount |
| 8 | `discount` | `DECIMAL(10,2)` | NULL | `0` | Discount amount |
| 9 | `total` | `DECIMAL(10,2)` | NOT NULL | `0` | Final amount due (subtotal + tax - discount) |
| 10 | `currency` | `VARCHAR` | NOT NULL | `USD` | Currency code (ISO 4217) |
| 11 | `status` | `InvoiceStatus` | NOT NULL | `DRAFT` | DRAFT -> SENT -> PAID -> PARTIALLY_PAID -> OVERDUE -> CANCELLED |
| 12 | `dueDate` | `DATE` | NULL | — | Payment due date |
| 13 | `notes` | `TEXT` | NULL | — | Invoice notes / payment instructions |
| 14 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Creation |
| 15 | `updatedAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Last update |

**Business rules:**
- Status workflow: `DRAFT` (being edited) -> `SENT` (sent to patient) -> `PAID` (fully settled) / `PARTIALLY_PAID` (partial payment) / `OVERDUE` (past dueDate) / `CANCELLED` (voided)
- `total` should equal sum of `InvoiceItem.total` + `tax` - `discount`
- Multiple `Payment` records can be linked to one invoice (partial payments)
- `userId` is RESTRICT on delete — invoices cannot be orphaned

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId)`
- `INDEX (patientId)`
- `INDEX (status)`
- `INDEX (dueDate)` WHERE status IN ('SENT', 'PARTIALLY_PAID') — overdue detection

### InvoiceItem

Line item within an invoice.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `invoiceId` | `VARCHAR` | NOT NULL | — | **FK -> Invoice**. CASCADE delete |
| 3 | `description` | `VARCHAR` | NOT NULL | — | e.g. "Consulta general", "Amoxicilina 500mg x30" |
| 4 | `quantity` | `INT` | NOT NULL | `1` | Quantity of this item |
| 5 | `unitPrice` | `DECIMAL(10,2)` | NOT NULL | `0` | Price per unit |
| 6 | `total` | `DECIMAL(10,2)` | NOT NULL | `0` | quantity × unitPrice |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (invoiceId)`

### Payment

Payment received against an invoice.

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `invoiceId` | `VARCHAR` | NOT NULL | — | **FK -> Invoice**. CASCADE delete |
| 3 | `amount` | `DECIMAL(10,2)` | NOT NULL | — | Payment amount |
| 4 | `method` | `PaymentMethod` | NOT NULL | — | CASH -> CARD -> TRANSFER -> INSURANCE -> OTHER |
| 5 | `reference` | `VARCHAR` | NULL | — | Transaction reference number |
| 6 | `paidAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Payment timestamp |
| 7 | `notes` | `TEXT` | NULL | — | Payment notes |

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (invoiceId)`

### Enum: InvoiceStatus

| Value | Description |
|-------|-------------|
| `DRAFT` | Being created/edited, not yet sent |
| `SENT` | Sent to patient, awaiting payment |
| `PAID` | Fully paid |
| `PARTIALLY_PAID` | Partial payment received |
| `OVERDUE` | Past due date without full payment |
| `CANCELLED` | Voided/cancelled invoice |

### Enum: PaymentMethod

| Value | Label (es) | Description |
|-------|-----------|-------------|
| `CASH` | Efectivo | Cash payment |
| `CARD` | Tarjeta | Credit/debit card |
| `TRANSFER` | Transferencia | Bank transfer |
| `INSURANCE` | Seguro | Insurance payment |
| `OTHER` | Otro | Other method |

**Zod schema:** `src/features/billing/schemas.ts`

---

## 14. Audit Log 🟢 v3

**Module purpose:** HIPAA/GDPR-compliant access tracking. Every view, create, update, delete, export, or print of patient data is recorded with user identity, IP address, and action details.

### AuditLog

| # | Field | Type | Null | Default | Description |
|---|-------|------|------|---------|-------------|
| 1 | `id` | `VARCHAR` | NOT NULL | — | Primary key (UUID v7) |
| 2 | `userId` | `VARCHAR` | NULL | — | **FK -> User**. Who performed the action. NULL if user deleted |
| 3 | `patientId` | `VARCHAR` | NULL | — | **FK -> Patient**. Whose data was accessed. NULL for non-patient actions |
| 4 | `action` | `AuditAction` | NOT NULL | — | Type of action performed |
| 5 | `resource` | `VARCHAR` | NOT NULL | — | Resource identifier, e.g. "Consultation:abc123" |
| 6 | `resourceType` | `VARCHAR` | NOT NULL | — | Resource type, e.g. "Consultation", "Prescription" |
| 7 | `details` | `JSONB` | NULL | — | Action metadata: `{changedFields: [...], oldValues: {...}}` |
| 8 | `ipAddress` | `VARCHAR` | NULL | — | Client IP address |
| 9 | `userAgent` | `VARCHAR` | NULL | — | Client user agent string |
| 10 | `createdAt` | `TIMESTAMP` | NOT NULL | `NOW()` | Action timestamp |

**Business rules:**
- Every VIEW of patient data MUST be logged (HIPAA access log requirement)
- CREATE/UPDATE/DELETE store changed field names and old values in `details` JSONB for rollback
- EXPORT logs when data is downloaded (CSV, PDF)
- PRINT logs when data is printed
- LOGIN/LOGOUT track session activity
- `userId` is SET NULL on user deletion — preserves the audit trail
- Recommended: partition table by month for performance with large volumes

**Indexes:**
- `PRIMARY KEY (id)`
- `INDEX (userId)`
- `INDEX (patientId)`
- `INDEX (resourceType, resource)`
- `INDEX (createdAt DESC)` — time-based queries

### Enum: AuditAction

| Value | Description |
|-------|-------------|
| `VIEW` | Data was viewed/read |
| `CREATE` | New record created |
| `UPDATE` | Existing record modified |
| `DELETE` | Record deleted (soft or hard) |
| `EXPORT` | Data exported/downloaded |
| `LOGIN` | User logged in |
| `LOGOUT` | User logged out |
| `PRINT` | Data sent to printer |

**Zod schema:** `src/features/audit/schemas.ts`

---

## 15. Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│  PatientAccount  │       │      User        │
│  (Global ID)     │◄──────│  (Doctors/Prov)  │
└────────┬─────────┘       └────────┬─────────┘
         │                          │
         │ 1:N                      │ 1:N
         ▼                          ▼
┌─────────────────┐       ┌─────────────────┐
│     Patient      │◄──────│   Consultation   │──────► FormTemplate
│   (CRM Record)   │       │   (SOAP Notes)   │
└──┬────┬────┬─────┘       └──┬──────┬───────┘
   │    │    │                │      │
   │    │    │          1:1   │      │ 1:1
   │    │    │    ┌───────────┘      └──────────┐
   │    │    │    ▼                              ▼
   │    │    │  VitalSign                  LabRequest ──► LabResult (v3)
   │    │    │
   │    │    │       ┌─────────────────┐
   │    │    └──────►│   Prescription   │──────► PrescriptionItem ──► Medication
   │    │            └────────┬─────────┘
   │    │                     │
   │    │                     ▼
   │    │            ┌─────────────────┐
   │    │            │  QuoteRequest    │──────► QuoteOffer ◄── ProviderProfile
   │    │            └─────────────────┘
   │    │
   │    ├──────► Appointment ──► Clinic ◄── ClinicMember
   │    │
   │    ├──────► MedicalBackground (1:1)
   │    ├──────► SurgicalHistory (1:N)
   │    ├──────► FamilyHistory (1:N)
   │    ├──────► Lifestyle (1:1)
   │    ├──────► ObstetricHistory (1:1)
   │    ├──────► Vaccination (1:N)
   │    │
   │    ├──────► MedicalDocument
   │    ├──────► FollowUp
   │    │
   │    └──────► Invoice (v3) ──► InvoiceItem
   │                  │
   │                  └──► Payment
   │
   └──────► AuditLog (v3) — tracks all access to patient data

   ┌─────────────────┐
   │PharmacyInventory │──► ProviderProfile + Medication
   │     (v3)         │
   └─────────────────┘

   ┌─────────────────┐
   │VerificationDocument│──► User (KYC)
   └─────────────────┘
```

**Relationship notation:**
- `──►` : Foreign key (many-to-one)
- `────►` : One-to-one
- `1:1` : Unique constraint on FK
- `1:N` : One-to-many

---

## Appendix: Quick Reference

### All Enums

| Enum | Module | Values |
|------|--------|--------|
| `UserRole` | 2 | DOCTOR, PROVIDER, ADMIN |
| `PlanType` | 2 | FREE, PRO, ENTERPRISE |
| `Gender` | 3 | MALE, FEMALE, OTHER |
| `PresentationEnum` | 5 | CAPSULA, TABLETA, JARABE, GOTAS, AMPOLLA, CREMA |
| `AdministrationRouteEnum` | 5 | ORAL, INTRAVENOSA, INTRAMUSCULAR, TOPICA, OFTALMICA |
| `RxStatus` | 5 | ACTIVE, CANCELLED, EXPIRED |
| `ProviderType` | 6 | PHARMACY, LABORATORY |
| `QuoteStatus` | 6 | OPEN, CLOSED |
| `NotifType` | 7 | SYSTEM, NEW_QUOTE_REQUEST, QUOTE_RECEIVED, FOLLOW_UP_ALERT |
| `DocType` | 7 | CERTIFICATE, REFERRAL, REPORT |
| `FollowStatus` | 7 | PENDING, SENT, RESPONDED |
| `ClinicRole` | 9 | OWNER, ADMIN, DOCTOR, RECEPTIONIST |
| `DocVerificationType` | 10 | MEDICAL_LICENSE, NATIONAL_ID, BUSINESS_RIF, COMMERCIAL_REGISTER |
| `VerificationStatus` | 10 | PENDING, APPROVED, REJECTED |
| `LabResultStatus` | 12 🟢 | PENDING, COMPLETED, ABNORMAL, CANCELLED |
| `InvoiceStatus` | 13 🟢 | DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED |
| `PaymentMethod` | 13 🟢 | CASH, CARD, TRANSFER, INSURANCE, OTHER |
| `AuditAction` | 14 🟢 | VIEW, CREATE, UPDATE, DELETE, EXPORT, LOGIN, LOGOUT, PRINT |

### All SQL Patches

| File | Version | Contents |
|------|---------|----------|
| `DATABASE_PATCH_v2.sql` | v2 (2026-06-08) | Medication, Appointment, Consultation.status, PrescriptionItem updates |
| `DATABASE_PATCH_v3.sql` | v3 (2026-06-09) | PharmacyInventory, LabResult, Invoice/InvoiceItem/Payment, AuditLog, Patient/Medication improvements |

### Frontend Zod Schemas

| Feature | Schema file |
|---------|------------|
| Patients | `src/features/patients/schemas.ts` |
| Medications | `src/features/medications/schemas.ts` |
| Appointments | `src/features/appointments/schemas.ts` |
| Consultations | `src/features/consultations/schemas.ts` |
| Inventory 🟢 | `src/features/inventory/schemas.ts` |
| Lab Results 🟢 | `src/features/lab-results/schemas.ts` |
| Billing 🟢 | `src/features/billing/schemas.ts` |
| Audit 🟢 | `src/features/audit/schemas.ts` |

---

*Generated by LUCA Health OS engineering team — 2026-06-09*
