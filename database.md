// ============================================================
// LUCA HEALTH OS — ESQUEMA DE BASE DE DATOS v2
// 
// v2 (2026-06-08):
//   + Medication (catálogo global + personal)
//   + Appointment (citas/agenda)
//   + Consultation.status (flujo: pending → in-progress → completed)
//   ~ PrescriptionItem: +quantity, +notes, medication → medicationId FK
//   ~ TemplateItem: medication → medicationId FK
// ============================================================

// ---------------------------------------------------------
// 1. MÓDULO DE IDENTIDAD MAESTRA (PACIENTE GLOBAL)
// ---------------------------------------------------------

Table PatientAccount {
  id varchar [pk]
  phone varchar [unique, note: "Identificador global (WhatsApp)"]
  email varchar [unique]
  passwordHash varchar
  fullName varchar
  avatarUrl varchar
  createdAt timestamp
}

// ---------------------------------------------------------
// 2. MÓDULO DE USUARIOS (DOCTORES, FARMACIAS, LABS)
// ---------------------------------------------------------

Table User {
  id varchar [pk]
  email varchar [unique]
  passwordHash varchar
  fullName varchar
  phone varchar [note: "WhatsApp Administrativo"]
  
  role UserRole [default: "DOCTOR"]
  isActive boolean [default: true]
  planType PlanType [default: "FREE"]
  
  // Branding Doctores (Personal)
  specialty varchar
  logoUrl varchar
  signatureUrl varchar
  
  createdAt timestamp
  updatedAt timestamp
}

Enum UserRole {
  DOCTOR
  PROVIDER // Farmacias y Laboratorios
  ADMIN
}

Enum PlanType {
  FREE
  PRO
  ENTERPRISE
}

// ---------------------------------------------------------
// 3. MÓDULO DE EXPEDIENTES (CRM MÉDICO)
// ---------------------------------------------------------

Table Patient {
  id varchar [pk]
  userId varchar [note: "Dueño del expediente (Doctor)"]
  patientAccountId varchar [note: "Link a Cuenta Global"]
  
  // Identificación Local
  firstName varchar
  lastName varchar
  nationalId varchar
  birthDate datetime
  gender Gender
  
  // Contacto
  email varchar
  phone varchar
  address varchar
  city varchar
  
  // Portal
  accessCode varchar [unique]
  lastLogin datetime
  
  // Resumen Clínico
  bloodType varchar
  allergies varchar
  chronicConditions varchar
  privateNotes text [note: "Solo visible por el doctor"]
  
  createdAt timestamp
  updatedAt timestamp
}

Enum Gender {
  MALE
  FEMALE
  OTHER
}

// ---------------------------------------------------------
// 4. MÓDULO CLÍNICO (CONSULTAS, SIGNOS Y PLANTILLAS DINÁMICAS)
// ---------------------------------------------------------

Table FormTemplate {
  id varchar [pk]
  userId varchar [note: "Opcional: Si es una plantilla personalizada de un doctor (Drag & Drop)"]
  specialty varchar [note: "Ej: Cardiología. Si userId es null, es una plantilla global de la especialidad"]
  schemaJson json [note: "Array con la estructura de los inputs: [{name, label, type}]"]
  createdAt timestamp
}

Table Consultation {
  id varchar [pk]
  userId varchar
  patientId varchar
  clinicId varchar [note: "Opcional: Si fue en hospital"]
  formTemplateId varchar [note: "Saber con qué esquema se llenó esta historia"]
  date datetime
  status varchar [default: "pending", note: "pending | in-progress | completed | cancelled"]
  
  // SOAP (Campos Universales)
  reason varchar
  physicalExam text
  diagnosis varchar
  treatmentPlan text
  
  // MOTOR DINÁMICO
  dynamicData json [note: "Aquí se guardan las respuestas (ej. {bpm: 85, perimetro: 35})"]
}

Table Appointment {
  id varchar [pk]
  patientId varchar
  doctorId varchar [note: "User con role=DOCTOR"]
  clinicId varchar [note: "Opcional"]
  date date
  time varchar [note: "Ej: 09:30"]
  type varchar [note: "Ej: Control general, Cardiología"]
  status varchar [default: "pending", note: "pending | in-progress | completed | cancelled"]
  notes text [note: "Notas internas del doctor"]
  createdAt timestamp
  updatedAt timestamp
}

Table VitalSign {
  id varchar [pk]
  patientId varchar
  consultationId varchar [unique]
  
  weight float
  height float
  systolicBP int
  diastolicBP int
  heartRate int
  temperature float
  oxygenSat int
  date datetime
}

Table LabRequest {
  id varchar [pk]
  consultationId varchar [unique]
  examsList varchar [note: "JSON"]
  instructions varchar
  isCompleted boolean
}
// ---------------------------------------------------------
// 5. MÓDULO DE RECETAS (CORE)
// ---------------------------------------------------------

Table Medication {
  id varchar [pk]
  userId varchar [note: "NULL = catálogo global LUCA; NOT NULL = personal del doctor"]
  activePrinciple varchar
  concentration varchar [note: "Ej: 500mg, 4mg/ml, 1g"]
  presentation PresentationEnum [note: "CAPSULA | TABLETA | JARABE | GOTAS | AMPOLLA | CREMA"]
  administrationRoute AdministrationRouteEnum [note: "ORAL | INTRAVENOSA | INTRAMUSCULAR | TOPICA | OFTALMICA"]
  commercialName varchar [note: "Nombre comercial opcional"]
  isActive boolean [default: true]
  createdAt timestamp
  updatedAt timestamp
}

Enum PresentationEnum {
  CAPSULA
  TABLETA
  JARABE
  GOTAS
  AMPOLLA
  CREMA
}

Enum AdministrationRouteEnum {
  ORAL
  INTRAVENOSA
  INTRAMUSCULAR
  TOPICA
  OFTALMICA
}

Table Prescription {
  id varchar [pk]
  userId varchar
  patientId varchar
  consultationId varchar [unique]
  clinicId varchar [note: "Opcional: Si fue en hospital"]
  
  date datetime
  expirationDate datetime
  notes varchar
  
  publicToken varchar [unique]
  status RxStatus
}

Table PrescriptionItem {
  id varchar [pk]
  prescriptionId varchar
  medicationId varchar [note: "FK a Medication"]
  dose varchar [note: "Ej: 1 cápsula"]
  frequency varchar [note: "Ej: Cada 8 horas"]
  duration varchar [note: "Ej: 7 días"]
  quantity int [default: 1]
  notes varchar [note: "Observaciones del médico"]
}

Enum RxStatus {
  ACTIVE
  CANCELLED
  EXPIRED
}

Table PrescriptionTemplate {
  id varchar [pk]
  userId varchar
  title varchar
}

Table TemplateItem {
  id varchar [pk]
  templateId varchar
  medicationId varchar [note: "FK a Medication"]
  dose varchar
  frequency varchar
  duration varchar
}

// ---------------------------------------------------------
// 6. MÓDULO MARKETPLACE (FARMACIAS & LABORATORIOS)
// ---------------------------------------------------------

// Renombrado a 'Provider' para incluir Laboratorios
Table ProviderProfile {
  id varchar [pk]
  userId varchar [unique]
  
  type ProviderType [note: "Farmacia o Laboratorio"]
  commercialName varchar
  rif varchar
  address varchar
  city varchar
  state varchar
  phone varchar
  isOpen boolean
  isVerified boolean
}

Enum ProviderType {
  PHARMACY
  LABORATORY
}

Table QuoteRequest {
  id varchar [pk]
  prescriptionId varchar
  patientId varchar
  city varchar
  status QuoteStatus
  createdAt datetime
}

Table QuoteOffer {
  id varchar [pk]
  quoteRequestId varchar
  providerId varchar
  price float
  currency varchar [default: "USD"]
  availability varchar
  comments varchar
  createdAt datetime
}

Enum QuoteStatus {
  OPEN
  CLOSED
}

// ---------------------------------------------------------
// 7. MÓDULO DE SISTEMA (NOTIFICACIONES & DOCS)
// ---------------------------------------------------------

Table Notification {
  id varchar [pk]
  userId varchar
  type NotifType
  title varchar
  message varchar
  isRead boolean
  link varchar
  createdAt datetime
}

Enum NotifType {
  SYSTEM
  NEW_QUOTE_REQUEST
  QUOTE_RECEIVED
  FOLLOW_UP_ALERT
}

Table MedicalDocument {
  id varchar [pk]
  userId varchar
  patientId varchar
  type DocType
  content text
  publicToken varchar [unique]
  createdAt datetime
}

Enum DocType {
  CERTIFICATE
  REFERRAL
  REPORT
}

Table FollowUp {
  id varchar [pk]
  userId varchar
  patientId varchar
  scheduledDate datetime
  status FollowStatus
  response varchar
}

Enum FollowStatus {
  PENDING
  SENT
  RESPONDED
}

// ---------------------------------------------------------
// 8. MÓDULO DE ANTECEDENTES (HOSPITALARIO)
// ---------------------------------------------------------

Table MedicalBackground {
  id varchar [pk]
  patientId varchar [unique]
  hasDiabetes boolean
  hasHypertension boolean
  hasAsthma boolean
  otherConditions text
  pastHospitalizations text
}

Table SurgicalHistory {
  id varchar [pk]
  patientId varchar
  procedure varchar
  date datetime
  hospital varchar
  notes varchar
}

Table FamilyHistory {
  id varchar [pk]
  patientId varchar
  condition varchar
  relationship varchar
  note varchar
}

Table Lifestyle {
  id varchar [pk]
  patientId varchar [unique]
  smokingStatus varchar
  alcoholConsumption varchar
  activityLevel varchar
  dietType varchar
}

Table ObstetricHistory {
  id varchar [pk]
  patientId varchar [unique]
  lastPeriodDate datetime
  pregnancies int
  births int
  cesareans int
  abortions int
  contraceptiveMethod varchar
}

Table Vaccination {
  id varchar [pk]
  patientId varchar
  vaccine varchar
  doseNumber int
  date datetime
}

// ---------------------------------------------------------
// 9. MÓDULO INSTITUCIONAL (CLÍNICAS) - ¡NUEVO!
// ---------------------------------------------------------

Table Clinic {
  id varchar [pk]
  name varchar
  rif varchar
  address varchar
  logoUrl varchar
  website varchar
  phone varchar
  createdAt timestamp
  updatedAt timestamp
}

Table ClinicMember {
  id varchar [pk]
  clinicId varchar
  userId varchar
  role ClinicRole [default: "DOCTOR"]
  isActive boolean [default: true]
}

Enum ClinicRole {
  OWNER
  ADMIN
  DOCTOR
  RECEPTIONIST
}

// ---------------------------------------------------------
// 10. MÓDULO DE VERIFICACIÓN (KYC)
// ---------------------------------------------------------

Table VerificationDocument {
  id varchar [pk]
  userId varchar [note: "Usuario que sube el documento"]
  type DocVerificationType
  fileUrl varchar [note: "Link al archivo en S3/Google Cloud"]
  status VerificationStatus [default: "PENDING"]
  comments text [note: "Razón del rechazo si aplica"]
  createdAt timestamp
  updatedAt timestamp
}

Enum DocVerificationType {
  MEDICAL_LICENSE // Título o Carnet del Colegio de Médicos
  NATIONAL_ID // Cédula de Identidad
  BUSINESS_RIF // RIF de la Farmacia o Clínica
  COMMERCIAL_REGISTER // Registro Mercantil
}

Enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

// Relación
Ref: VerificationDocument.userId > User.id

// ---------------------------------------------------------
// RELACIONES (FOREIGN KEYS)
// ---------------------------------------------------------

// Usuarios y Perfiles
Ref: ProviderProfile.userId - User.id // 1 a 1

// Pacientes
Ref: Patient.userId > User.id
Ref: Patient.patientAccountId > PatientAccount.id

// Consultas (Ahora con soporte para Clínica y Citas)
Ref: Consultation.userId > User.id
Ref: Consultation.patientId > Patient.id
Ref: Consultation.clinicId > Clinic.id // Nulo si es privado

Ref: Appointment.patientId > Patient.id
Ref: Appointment.doctorId > User.id
Ref: Appointment.clinicId > Clinic.id

Ref: VitalSign.consultationId - Consultation.id // 1 a 1
Ref: VitalSign.patientId > Patient.id
Ref: LabRequest.consultationId - Consultation.id // 1 a 1

// Recetas (Ahora con soporte para Clínica y Catálogo de Medicamentos)
Ref: Prescription.userId > User.id
Ref: Prescription.patientId > Patient.id
Ref: Prescription.consultationId - Consultation.id // 1 a 1 (Opcional)
Ref: Prescription.clinicId > Clinic.id // Nulo si es privado
Ref: PrescriptionItem.prescriptionId > Prescription.id
Ref: PrescriptionItem.medicationId > Medication.id

// Catálogo de Medicamentos
Ref: Medication.userId > User.id // Nulo si es global

// Templates (actualizado con Medication)
Ref: PrescriptionTemplate.userId > User.id
Ref: TemplateItem.templateId > PrescriptionTemplate.id
Ref: TemplateItem.medicationId > Medication.id

// Marketplace (Proveedores)
Ref: QuoteRequest.prescriptionId > Prescription.id
Ref: QuoteRequest.patientId > Patient.id
Ref: QuoteOffer.quoteRequestId > QuoteRequest.id
Ref: QuoteOffer.providerId > ProviderProfile.id

// Sistema
Ref: Notification.userId > User.id
Ref: MedicalDocument.userId > User.id
Ref: MedicalDocument.patientId > Patient.id
Ref: FollowUp.userId > User.id
Ref: FollowUp.patientId > Patient.id

// Antecedentes (Historia Profunda)
Ref: MedicalBackground.patientId - Patient.id // 1 a 1
Ref: Lifestyle.patientId - Patient.id // 1 a 1
Ref: ObstetricHistory.patientId - Patient.id // 1 a 1
Ref: SurgicalHistory.patientId > Patient.id
Ref: FamilyHistory.patientId > Patient.id
Ref: Vaccination.patientId > Patient.id

// Clínicas (Institucional)
Ref: ClinicMember.clinicId > Clinic.id
Ref: ClinicMember.userId > User.id

//
// Plantillas Dinámicas
Ref: FormTemplate.userId > User.id // Un doctor puede tener sus propias plantillas
Ref: Consultation.formTemplateId > FormTemplate.id // La consultards In 15 Minutes 🔥 guarda qué plantilla usó