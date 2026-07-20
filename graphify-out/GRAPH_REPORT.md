# Graph Report - luca-front  (2026-07-20)

## Corpus Check
- 752 files · ~499,196 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 5383 nodes · 8113 edges · 573 communities (373 shown, 200 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 61 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `acb0f7b6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- SyncableEntity
- Patient Dashboard Design
- Proposal: Doctor Dashboard Redesign
- LUCA Project Architecture (ARCHITECTURE.md)
- LUCA Database Schema v3 (database.md)
- Frontend Implementation Guide of Backend (comprehensive)
- Auth-Login Canonical Spec
- DB Table: Consultation
- API Phase 6 - Scheduling System (api_phase6_scheduling_system copy.md)
- Notion-Isomatic Design System
- Pharmako Design System
- Pharmako Person Full Body (PNG)
- Workflow-Centered Doctor Dashboard
- CatalogEntity
- macOS Sidebar Spec
- AuthState
- ExceptionType
- Weekday
- Medication
- PrescriptionTemplate
- SearchCommand Deduplication
- LUCA Favicon Dark Mode (SVG)
- ClinicalHistorySchema
- SyncError
- DB Table: City
- DB Table: Country
- DB Table: Clinic
- DB Table: FollowUp
- DB Table: MedicalBackground
- DB Table: Notification
- Prescription Flow Diagram
- Framer Motion Animation Pattern
- Adaptive Scrollbar Theme Init
- Patient Dashboard Init
- Clinic Dashboard Init
- Teal Brand Logo
- README (Next.js bootstrapped project)
- DELETE
- GET
- PATCH
- DELETE
- GET
- POST
- BuilderPage
- AppointmentsPage
- ConsultationDetailPage
- DrawerContextType
- useDrawer
- useDrawerToggle
- LaboratoriosPage
- DashboardLayout
- MedicationsPage
- DashboardPage
- PatientsPage
- ProfilePage
- DoctorsPage
- RootLayout
- cn
- PharmakoLoginPage
- AboutUs
- ContactoPage
- ContactUs
- Welcome
- Home
- AuthProvider
- OfflineProvider
- AuthTabs
- Providers
- HeaderContext
- NotificationBell
- UserProfile
- Container
- SelectTrigger
- SelectValue
- NavItem
- NavItemGroup
- BookingModal
- useAppointment
- useAppointments
- useAppointmentsByDoctor
- useAppointmentsByPatient
- useCancelAppointment
- useCreateAppointment
- useDeleteAppointment
- useUpcomingAppointments
- useUpdateAppointment
- useUpdateAppointmentStatus
- useDoctorAvailability
- useDoctorAppointmentsQuery
- useDeleteDoctorException
- useDeleteDoctorSchedule
- useDoctorExceptionsQuery
- useDoctorSchedulesQuery
- useSaveDoctorException
- useSaveDoctorSchedule
- usePatientAppointmentsQuery
- Appointment
- AppointmentResponse
- AppointmentsResponse
- DaySchedule
- DoctorAvailability
- DoctorAvailabilityResponse
- DoctorOption
- PatientOption
- ScheduleExceptionInfo
- Slot
- UpdateAppointmentDTO
- AuditAction
- AuditLog
- FormRegisterMedical
- FormRegisterPatient
- TypeProfile
- useGetPatientProfileQuery
- useGetUserProfileQuery
- useLoginPatientMutation
- useLoginUserMutation
- useRegisterDoctorMutation
- useRegisterPatientMutation
- useRegisterProviderMutation
- useSendOtpMutation
- useVerifyOtpMutation
- Country
- useGetCities
- useGetCountries
- useGetCountryCities
- useGetSpecialties
- useLogout
- AccountStatus
- ApiResponse
- AuthResponse
- City
- Country
- PatientStatusApi
- PlanType
- ProviderType
- Specialty
- State
- UserRole
- UserRoleApi
- VerificationDocPayload
- Invoice
- InvoiceFormData
- InvoiceItem
- InvoiceStatus
- Payment
- PaymentFormData
- PaymentMethod
- ClinicDashboard
- ClinicGreeting
- ClinicKpiCards
- useClinicActions
- useClinicConsultations
- useClinicDoctors
- useClinicGreeting
- useClinicKPIs
- ClinicConsultation
- ClinicDoctor
- ClinicKPI
- ClinicQuickAction
- ImportExportMenu
- createNewElement
- findElementById
- insertElementAt
- removeElementById
- serializeSchema
- updateElementById
- updateGridColumnChildren
- useBuilderDnd
- useDuplicateShortcut
- useKeyboardShortcuts
- useUndoRedo
- clinicalHistorySchema
- ActivePanelTab
- ActiveToolboxTab
- BlockCondition
- BlockType
- BlockWidth
- BuilderUIState
- CanvasElement
- CanvasState
- CheckboxMultipleBlock
- Cie10SelectorBlock
- ClinicalHistorySettings
- DateTimeBlock
- DragItem
- DropdownBlock
- DropResult
- FieldSize
- FileUploadBlock
- GridRowBlock
- HeaderBlock
- NumberBlock
- PropertyFormState
- RadioGroupBlock
- RepeaterBlock
- SectionBlock
- SectionTitleBlock
- SelectorOption
- TemplateStatus
- TextParagraphBlock
- TextShortBlock
- ToggleBlock
- ToolboxBlockDefinition
- ToolboxCategory
- VisualSeparatorBlock
- VitalSignsBlock
- VitalSignsField
- VitalSignsKey
- ConsultationTabs
- DigitalLabRequestCard
- DigitalPrescriptionCard
- ActiveConsultationData
- useActiveConsultationQuery
- ConsultationListItem
- useConsultationList
- useCreateFollowUp
- useStartConsultation
- useUpdateConsultation
- MedicationCatalogItem
- useMedicationsCatalog
- usePatientConsultationsQuery
- AdministrationRoute
- BiologicalSex
- Consultation
- Doctor
- HistoryEntry
- Medication
- Patient
- PrescriptionItem
- Presentation
- Vitals
- AgendaItem
- BottomNav
- DashboardSwitcher
- DoctorDashboard
- DoctorGreeting
- FollowUpView
- KpiCard
- KpiCards
- MobileDrawer
- NotificationAlert
- QuickActions
- ResumenView
- StatusBadge
- useDoctorActions
- useDoctorAgenda
- useDoctorDashboardQuery
- useDoctorKPIs
- useDoctorNextPatient
- useDoctorNotifications
- ActionItem
- ActionType
- AlertType
- Appointment
- AppointmentStatus
- DashboardView
- DoctorProfile
- KPIData
- NextPatient
- Notification
- NotificationType
- PatientAlert
- QuickAction
- QuickActionVariant
- usePatientDocumentDetailQuery
- usePatientDocumentsQuery
- PharmacyInventory
- PharmacyInventoryFormData
- usePatientInvoiceDetailQuery
- usePatientInvoicesQuery
- useReportPaymentMutation
- LabResult
- LabResultFormData
- LabResultStatus
- CreateLabRequestDTO
- UpdateLabRequestDTO
- useCreateLabRequest
- useDeleteLabRequest
- useLabRequest
- useLabRequests
- useUpdateLabRequest
- usePatientLabResultsQuery
- useCreateMedication
- useDeleteMedication
- useMedications
- useTopPrescribedMedications
- useUpdateMedication
- useCreatePrescriptionTemplate
- useDeletePrescriptionTemplate
- usePrescriptionTemplates
- useUpdatePrescriptionTemplate
- AdministrationRoute
- Presentation
- TemplateItem
- DelayBanner
- useMarkAllNotificationsReadMutation
- useMarkNotificationReadMutation
- usePatientNotificationsQuery
- usePatientUnreadCountQuery
- SyncIndicator
- ActiveDelayRecord
- clearSyncErrors
- getLastSyncTimestamp
- getPendingChangesCount
- setLastSyncTimestamp
- SyncMeta
- useOnlineStatus
- useSync
- useSyncQueue
- ConflictResolution
- EntityByType
- EntityPushResult
- EntityUUID
- PushResults
- QueuedChange
- SyncEngineState
- SyncError
- SyncRequest
- SyncResponse
- SyncStats
- SyncStatus
- SyncStatusType
- SyncTimestamp
- clientToServer
- generateUUID
- getCurrentTimestamp
- isValidUUID
- serverToClient
- BookDoctorSection
- NextAppointmentCard
- PatientDashboard
- PatientFormRequests
- PatientGreeting
- PatientKpiCards
- usePatientActions
- usePatientAppointments
- usePatientConsultations
- DashboardResponse
- usePatientGreeting
- usePatientKPIs
- usePatientTreatments
- usePatientVitals
- Appointment
- Consultation
- PatientKPI
- QuickAction
- Treatment
- TrendDirection
- VitalSign
- useCreatePatient
- useDeletePatient
- usePatients
- useUpdatePatient
- BiologicalSex
- Patient
- CreatePatientDTO
- getPatientAge
- getPatientFullName
- PatientResponse
- PatientsResponse
- UpdatePatientDTO
- KpiCards
- NotificationAlert
- OrderItem
- PharmacyDashboard
- PharmacyGreeting
- QuickActionButton
- StatusBadge
- usePharmacyKPIs
- usePharmacyNotifications
- usePharmacyOrders
- usePharmacyPrescription
- usePharmacyQuickActions
- FulfillmentType
- NotificationType
- OrderStatus
- PharmacyKPI
- PharmacyNotification
- PharmacyOrder
- PharmacyQuickAction
- PrescriptionDetail
- PrescriptionMedication
- QuickActionVariant
- TrendDirection
- usePatientPrescriptionsQuery
- usePatientQuotesQuery
- useGetPatientProfileQuery
- useGetUserProfileQuery
- useUpdatePatientMutation
- useUpdateUserMutation
- PatientProfileEdit
- ProfileUpdatePayload
- UserProfileEdit
- CatalogGrid
- useCities
- useClinics
- useDoctors
- usePharmacies
- useDebounce
- City
- Clinic
- ClinicBasic
- ClinicBranch
- ClinicBranchBasic
- ClinicDoctor
- ClinicsResponse
- Doctor
- DoctorsResponse
- PaginationMeta
- PharmaciesResponse
- Pharmacy
- PharmacyBranch
- Specialty
- useDeleteProviderService
- useGlobalServices
- useProviderServices
- useSaveProviderService
- ProviderService
- ProviderServiceFormData
- Service
- ServiceCategory
- useKeyboardShortcut
- useMediaQuery
- useScrollDirection
- useAllClinicalHistorySchemas
- useClinicalHistorySchema
- useDeleteClinicalHistorySchema
- usePatchSchemaStatus
- usePatientFormRequest
- useSaveClinicalHistorySchema
- useShareClinicalHistorySchema
- useSubmitPatientFormRequest
- deleteSchema
- getSchema
- getSchemas
- setSchema
- cn
- getLocalTodayString
- proxy
- proxyConfig
- Role
- array-virtualization-formprovider.md
- ctrl-controller-field-props.md
- ctrl-single-usecontroller-per-component.md
- ctrl-usecontroller-isolation.md
- formcfg-async-default-values.md
- formcfg-revalidate-mode.md
- formcfg-should-unregister.md
- formcfg-validation-mode.md
- formstate-avoid-isvalid-with-onsubmit.md
- formstate-destructure-formstate.md
- formstate-getfieldstate-for-single-field.md
- formstate-subscribe-to-specific-fields.md
- formstate-useformstate-isolation.md
- integ-mui-controller-pattern.md
- integ-shadcn-form-import.md
- integ-shadcn-select-wiring.md
- integ-value-transform.md
- sub-avoid-watch-in-render.md
- sub-deep-subscription.md
- sub-useformcontext-sparingly.md
- sub-usewatch-default-value.md
- sub-usewatch-over-watch.md
- sub-usewatch-with-getvalues.md
- sub-watch-specific-fields.md
- valid-dynamic-schema-factory.md
- valid-error-message-strategy.md
- valid-native-validation.md
- valid-resolver-caching.md
- compose-intersection.md
- compose-lazy-recursive.md
- compose-pipe.md
- compose-preprocess.md
- compose-shared-schemas.md
- error-custom-messages.md
- error-i18n.md
- error-path-for-nested.md
- error-use-flatten.md
- object-extend-for-composition.md
- object-partial-for-updates.md
- object-pick-omit.md
- object-strict-vs-strip.md
- parse-async-for-async-refinements.md
- parse-never-trust-json.md
- parse-use-safeparse.md
- perf-arrays.md
- perf-avoid-dynamic-creation.md
- perf-cache-schemas.md
- perf-lazy-loading.md
- perf-zod-mini.md
- refine-add-path.md
- refine-catch.md
- refine-defaults.md
- refine-vs-superrefine.md
- schema-avoid-optional-abuse.md
- schema-string-validations.md
- schema-use-enums.md
- schema-use-primitives-correctly.md
- type-branded-types.md
- type-enable-strict-mode.md
- type-input-vs-output.md
- type-use-z-infer.md
- graphify.md
- class-variance-authority
- clsx
- cmdk
- dexie
- @dnd-kit/sortable
- @dnd-kit/utilities
- 14. Notificaciones
- 18. Auditoría HIPAA
- 2. Identidad de Pacientes
- 3. Usuarios y Doctores
- 8. Formularios Dinámicos
- eslint.config.mjs
- framer-motion
- @hookform/resolvers
- motion
- next.config.ts
- archive-report.md
- tasks.md
- radix-ui
- react-hook-form
- react-icons
- sonner
- uuid
- zustand
- a323607c99e959f45e4e546d6c3249b8b4e2cddb5bdbf48144a327b6a9071dff50fa253ddeac9019bcafcc9a2181a2030c9d901b9cff9a637063b8b8272364-exec
- a443ab6e5c60dd93189883e1bd3e3bc2aace79ec20d14e5b8f53b9408ce0abe0645af40704c67c58edd06517d181a6912c45453f92e177f1e91dca35aa3007-exec
- 43838285ac812472efbf13c60f465ca08b808637cf3681d8f7bb7ffd002e227839eb08b68626f22b57a5535827b705d9817f7d15eba447215357eab0e124f6-exec
- cdf0042e58f90fea611ff4c6a050faa081bd656374ded2e116de1591a4eb832b90942ec0a20c35e88ee8a9e71779952735c0f8e5c1adb503a4a41f5647eb12-exec
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `cn()` - 184 edges
2. `useAuthStore` - 102 edges
3. `Button()` - 47 edges
4. `apiClient` - 39 edges
5. `useOnlineStatus()` - 36 edges
6. `SyncableEntity` - 35 edges
7. `fadeUpVariant` - 31 edges
8. `db` - 28 edges
9. `Badge()` - 24 edges
10. `CanvasElement` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Clean & Elevated Design Language` --semantically_similar_to--> `Notion-Isomatic Design System`  [INFERRED] [semantically similar]
  AGENTS.md → ARCHITECTURE.md
- `Pharmako Design Token System` --semantically_similar_to--> `LUCA Earth/Green Fluid UI Palette`  [INFERRED] [semantically similar]
  WORKFLOW.md → docs/luca-palette.md
- `LUCA Database Schema v3 (database.md)` --references--> `Complete Database Schema Phases 1-5 (database_complete_schema copy.md)`  [INFERRED]
  database.md → docs/database_complete_schema copy.md
- `LUCA Health OS` --conceptually_related_to--> `Workflow-Centered Doctor Dashboard`  [INFERRED]
  docs/integration-back/api_auth_documentation.md → openspec/changes/2026-06-04_dashboard-structure/proposal.md
- `Select()` --references--> `react`  [EXTRACTED]
  src/components/ui/select.tsx → package.json

## Import Cycles
- 3-file cycle: `src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterInstitution.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthRegisterContent.tsx`
- 3-file cycle: `src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterMedical.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthRegisterContent.tsx`
- 3-file cycle: `src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterPatient.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthRegisterContent.tsx`
- 4-file cycle: `src/components/pharmako-login/AuthContainer.tsx -> src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterInstitution.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthContainer.tsx`
- 4-file cycle: `src/components/pharmako-login/AuthContainer.tsx -> src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterMedical.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthContainer.tsx`
- 4-file cycle: `src/components/pharmako-login/AuthContainer.tsx -> src/components/pharmako-login/AuthRegisterContent.tsx -> src/features/auth/components/FormRegisterPatient.tsx -> src/components/pharmako-login/index.ts -> src/components/pharmako-login/AuthContainer.tsx`

## Hyperedges (group relationships)
- **Core Clinical Encounter: Consultation → VitalSign + LabRequest + FormTemplate** — db_table_consultation, db_table_vitalsign, db_table_labrequest, db_table_formtemplate [EXTRACTED 1.00]
- **Marketplace Quote Flow: Prescription → QuoteRequest → QuoteOffer (ProviderProfile)** — db_table_prescription, db_table_quotequest, db_table_quoteoffer, db_table_providerprofile [EXTRACTED 1.00]
- **LUCA Design System: Notion-Isomatic + Pharmako Tokens + Feature Architecture** — notion_isomatic_design, pharmako_token_system, feature_based_architecture [INFERRED 0.85]
- **Auth Ecosystem — JWT + Cookie + KYC** — concept_jwt_auth_model, concept_kyc_verification, docs_integration-back_api_auth_documentation [INFERRED]
- **Prescription → QR → Marketplace Flow** — concept_prescription_qr_token, concept_marketplace_b2b2c, concept_patient_portal_phase5 [INFERRED]
- **SDD Auth Redesign Artifacts** — openspec_2026-06-04_auth-tabs-redesign_proposal, openspec_2026-06-04_auth-tabs-redesign_design, openspec_2026-06-04_auth-tabs-redesign_tasks [INFERRED]
- **Unified Design System Constraints** — concept_notion_isomatic_design, concept_zero_shadow_constraint, concept_pharmako_care_token [INFERRED 0.95]
- **Dashboard Feature Implementation Pattern** — concept_feature_based_architecture, concept_mock_data_hooks_pattern, concept_role_based_dashboard_routing [INFERRED 0.85]
- **luca-to-pharmako Token Migration Wave** — concept_luca_token_to_pharmako_migration, concept_doctor_dashboard_token_migration, concept_pharmako_care_token [INFERRED 0.85]
- **Doctor Dashboard Views Redesign Suite** — openspec_changes_2026_06_08_doctor_resumen_view_proposal_proposal, openspec_changes_2026_06_08_doctor_patientflow_view_proposal_proposal, openspec_changes_2026_06_08_doctor_followup_view_proposal_proposal, openspec_changes_2026_06_08_doctor_dashboard_redesign_proposal_proposal [EXTRACTED 1.00]
- **SDD Login Responsive Full Lifecycle** — openspec_changes_archive_2026-06-04-login-responsive_proposal, openspec_changes_archive_2026-06-04-login-responsive_verify-report, openspec_specs_auth-login_spec [INFERRED 0.95]
- **Pharmacy Dashboard Redesign Planning Artifacts** — openspec_changes_2026-06-08_pharmacy-dashboard-redesign_proposal, openspec_changes_2026-06-08_pharmacy-dashboard-redesign_spec, openspec_changes_2026-06-08_pharmacy-dashboard-redesign_tasks [INFERRED 0.95]
- **Zero Shadow Aesthetic Applied Across Features** — concept_zero_shadow_aesthetic, openspec_specs_auth-login_spec, openspec_changes_2026-06-08_pharmacy-dashboard-redesign_spec [INFERRED 0.85]

## Communities (573 total, 200 thin omitted)

### Community 0 - "SyncableEntity"
Cohesion: 0.15
Nodes (30): ActiveDelayRecord, Appointment, City, Clinic, ClinicBranch, ClinicSchedule, Consultation, Country (+22 more)

### Community 1 - "Patient Dashboard Design"
Cohesion: 0.19
Nodes (8): Clinic Dashboard Feature, Feature-Based Architecture, Patient Dashboard Feature, Role-Based Dashboard Routing, Current State, DB Context (what the dashboard should surface), Explore: Clinic Dashboard, Reference Pattern

### Community 2 - "Proposal: Doctor Dashboard Redesign"
Cohesion: 0.13
Nodes (10): Design: Doctor FollowUpView, Layout, Init: Doctor FollowUpView Redesign, Scope, Problems, Proposal: Doctor FollowUpView Redesign, Redundant Greeting Removal, Solution (+2 more)

### Community 3 - "LUCA Project Architecture (ARCHITECTURE.md)"
Cohesion: 0.10
Nodes (23): LUCA AI Coding Guidelines (AGENTS.md), LUCA Project Architecture (ARCHITECTURE.md), Auth Middleware (proxy.ts), CLAUDE.md (alias to AGENTS.md), Clean & Elevated Design Language, Clinical History Builder Feature (Drag & Drop), LUCA Brand Palette (luca-palette.md), Doctor Dashboard Feature (+15 more)

### Community 4 - "LUCA Database Schema v3 (database.md)"
Cohesion: 0.07
Nodes (49): Offline Sync API Spec (api_offline_sync_spec.md), LUCA Database Diagrams (DATABASE_DIAGRAMS.md), LUCA Database Schema v3 (database.md), DB Table: Appointment, DB Table: AuditLog (HIPAA), DB Table: ClinicBranch, DB Table: ClinicBranchMember, DB Table: ClinicSchedule (+41 more)

### Community 5 - "Frontend Implementation Guide of Backend (comprehensive)"
Cohesion: 0.28
Nodes (13): HIPAA Audit Log, Idempotency Key Pattern, KYC Verification Process, Marketplace B2B2C Flow, Patient Portal (Phase 5), Prescription QR Public Token, API Authentication Documentation (Phase 1), API Phase 2 Documentation — Clinical Records (+5 more)

### Community 6 - "Auth-Login Canonical Spec"
Cohesion: 0.16
Nodes (17): Auth-Login Domain, Pharmako-Primary Brand Color (#0057FF), Spec-Driven Development (SDD) Workflow, Viewport Overflow Fix, Login Responsive — SDD Archive Report, Login Responsive Apply Progress, Login Responsive Archive Report, Login Responsive Design (+9 more)

### Community 7 - "DB Table: Consultation"
Cohesion: 0.05
Nodes (36): ac(), af(), as(), cc(), cf(), em(), Hi(), ho() (+28 more)

### Community 8 - "API Phase 6 - Scheduling System (api_phase6_scheduling_system copy.md)"
Cohesion: 0.04
Nodes (48): 10.1 Permisos por Rol, 10.2 Campos Expuestos en Disponibilidad Pública, 10. Consideraciones de Seguridad, 11. Índices Recomendados, 19. DoctorSchedule - Horarios Recurrentes del Doctor, 1. El Script SQL, 20. ScheduleException - Excepciones y Vacaciones, 21. ClinicSchedule - Horarios de Clínica por Sucursal (+40 more)

### Community 9 - "Notion-Isomatic Design System"
Cohesion: 0.33
Nodes (11): Notion-Isomatic Design System, Pharmacy Dashboard Feature, PharmacyGreeting Component, Pharmako-Care Design Tokens, TrendDirection Type, usePharmacyQuickActions Hook, Zero Shadow / Notion-Esque Aesthetic, Pharmacy Dashboard Redesign Init (+3 more)

### Community 10 - "Pharmako Design System"
Cohesion: 0.31
Nodes (9): LUCA Health OS, macOS-Style Floating Sidebar, Pharmako Design System, Medications Page Implementation Summary, Auth Tabs Redesign — Technical Design, Auth Tabs Redesign — Proposal, Auth Tabs Redesign — Task Breakdown, macOS-Style Sidebar — Technical Design (+1 more)

### Community 11 - "Pharmako Person Full Body (PNG)"
Cohesion: 0.29
Nodes (7): Pharmako Person Full Body (PNG), Pharmako Person Full Body (WEBP), Pharmako Person Mid-Body Crop (PNG), Pharmako Person Mid-Body Crop (WEBP), Pharmako Person Mid-Body Extra Large (PNG), Pharmako Person Two PC and Phone Scene, Pharmako Person Reviewing Documents Extra Large (WEBP)

### Community 12 - "Workflow-Centered Doctor Dashboard"
Cohesion: 0.40
Nodes (6): Workflow-Centered Doctor Dashboard, Dashboard Structure Redesign — Technical Design, Dashboard Structure Redesign — SDD Init, Dashboard Structure Redesign — Proposal, Dashboard Structure Redesign — Spec, Dashboard Structure Redesign — Tasks

### Community 13 - "CatalogEntity"
Cohesion: 0.13
Nodes (20): syncApi, getLastSyncTimestamp(), setLastSyncTimestamp(), CatalogEntity, City, ClinicBranch, ConflictResolution, EntityByType (+12 more)

### Community 14 - "macOS Sidebar Spec"
Cohesion: 0.11
Nodes (17): macOS-Style Floating Sidebar, Sidebar inDrawer Mobile Prop, Files affected, Interaction, Key Behaviors, Non-goals, Open Questions, Problem (+9 more)

### Community 15 - "AuthState"
Cohesion: 0.08
Nodes (26): HeaderContext(), HeaderContextProps, ROLE_SUBTITLES, fetchSpecialties(), useGetSpecialties(), AccountStatus, ApiResponse, AuthResponse (+18 more)

### Community 16 - "ExceptionType"
Cohesion: 0.19
Nodes (20): CreateExceptionDTO, CreateScheduleDTO, DoctorScheduleResponse, scheduleApi, ScheduleExceptionResponse, doctorScheduleKeys, useDeleteDoctorException(), useDeleteDoctorSchedule() (+12 more)

### Community 17 - "Weekday"
Cohesion: 0.11
Nodes (42): fc18b9fbdee06d4aaf3d9a746bf2fca946f71b3f0c0e8afb3fad2a27c431b3387eef1f559720c537634d856988e40442048431094e1715c8cfc5fc3d6c431e-exec script, check_common_commands(), check_input_file(), check_output_file(), DEBUG(), desktop_file_to_binary(), detectDE(), exit_failure_file_missing() (+34 more)

### Community 18 - "Medication"
Cohesion: 0.08
Nodes (40): medicationApi, MedicationResponse, MedicationsResponse, prescriptionTemplateApi, PrescriptionTemplateResponse, PrescriptionTemplatesResponse, ComboForm(), ComboFormProps (+32 more)

### Community 19 - "PrescriptionTemplate"
Cohesion: 0.12
Nodes (37): f42bc4422d1799ead592ffd3a96f48ea2df1163479353a53a9c29052985406df172eb17e7cb5f989a3cf21f407d8df4d830f787b71525a24d30ee80e7388b4-exec script, check_common_commands(), check_input_file(), check_output_file(), DEBUG(), detectDE(), exit_failure_file_missing(), exit_failure_file_permission_read() (+29 more)

### Community 20 - "SearchCommand Deduplication"
Cohesion: 0.33
Nodes (5): SearchCommand Deduplication, Fix Applied, Problem, SDD Init: SearchCommand Duplicate Fix, Verify

### Community 22 - "ClinicalHistorySchema"
Cohesion: 0.28
Nodes (7): FormPreviewProps, ImportExportMenu(), ImportExportMenuProps, BuilderState, useBuilderStore, ClinicalHistorySchema, PatientFormRequest

### Community 23 - "SyncError"
Cohesion: 0.17
Nodes (16): CreateLabRequestDTO, labRequestApi, LabRequestResponse, LabRequestsResponse, UpdateLabRequestDTO, LabRequestModalProps, db, LabRequest (+8 more)

### Community 32 - "Adaptive Scrollbar Theme Init"
Cohesion: 0.29
Nodes (6): Acceptance Criteria, Current State, Problem, Proposed Solution, Requirements, SDD Init: Adaptive Browser Scrollbar

### Community 33 - "Patient Dashboard Init"
Cohesion: 0.40
Nodes (4): Context, Goals, Init: Patient Dashboard, Scope

### Community 34 - "Clinic Dashboard Init"
Cohesion: 0.50
Nodes (3): Context, Init: Clinic Dashboard, Scope

### Community 37 - "DELETE"
Cohesion: 0.19
Nodes (17): DELETE(), GET(), PATCH(), DELETE(), GET(), POST(), generalMedicineTemplate, gynecologyTemplate (+9 more)

### Community 38 - "GET"
Cohesion: 0.05
Nodes (40): 1. Create ThemeProvider, 1. Install Dependencies, 2. Configure Vite, 2. Wrap Your App, 3. Add Theme Toggle, 3. Update components.json, 4. Delete tailwind.config.ts, Advanced Topics (+32 more)

### Community 39 - "PATCH"
Cohesion: 0.05
Nodes (39): 10. Decision Checklist, 1. Framework Selection (2025), 2. Runtime Considerations (2025), 3. Architecture Principles, 4. Error Handling Principles, 5. Async Patterns Principles, 6. Validation Principles, 7. Security Principles (+31 more)

### Community 40 - "DELETE"
Cohesion: 0.12
Nodes (27): COMMON_SPECIALTIES, ConsultationVitalSign, DetailedConsultation, DetailedLabResult, LabRequestDetail, MedicalDocumentType, DetailedPrescription, PrescriptionItem (+19 more)

### Community 41 - "GET"
Cohesion: 0.05
Nodes (38): Autenticación, Búsqueda de Proveedores, Códigos de Error, Documentos Médicos Legales, El campo `public_token`, El campo `public_token`, Endpoints, Endpoints (+30 more)

### Community 42 - "POST"
Cohesion: 0.05
Nodes (36): 10. FUERA DE SCOPE, 1. Concept & Vision, 2.1 Modelo de datos actual, 2.2 Decisión arquitectónica: FK directa, 2.3 Guard: patient_api, 2. Arquitectura de Acceso, 3.1 Autenticación (ya existe), 3.2 NUEVOS — Patient Portal (+28 more)

### Community 45 - "AppointmentsPage"
Cohesion: 0.31
Nodes (8): AppointmentsPage(), AppointmentRecord, DoctorAppointmentsView(), formatDateCompact(), resolveAlcoholLabel(), resolveSmokingLabel(), TimeframeType, useDoctorAppointmentsQuery()

### Community 46 - "ConsultationDetailPage"
Cohesion: 0.16
Nodes (18): ConsultationDetailPage(), doctorAppointmentKeys, ScheduleFollowUpModal(), ScheduleFollowUpModalProps, ActiveConsultationData, useActiveConsultationQuery(), StartConsultationPayload, UpdateConsultationPayload (+10 more)

### Community 47 - "DrawerContextType"
Cohesion: 0.07
Nodes (32): DrawerContext, DrawerContextType, DrawerToggleContext, useDrawer(), useDrawerToggle(), DashboardLayout(), CTAConfig, FALLBACK_CTA (+24 more)

### Community 48 - "useDrawer"
Cohesion: 0.06
Nodes (33): API Response Format, Authentication & Authorization, Caching Strategies, Database Patterns, Dependency Injection, DI Container, JWT Authentication, MongoDB with Mongoose (+25 more)

### Community 49 - "useDrawerToggle"
Cohesion: 0.06
Nodes (34): Article, Breadcrumbs, Crawlability, Critical, FAQ, Font sizes, Heading structure, High priority (+26 more)

### Community 50 - "LaboratoriosPage"
Cohesion: 0.21
Nodes (13): metadata, Badge(), badgeVariants, COMMON_EXAMS, LabRequestModal(), LabRequestsList(), labRequestKeys, useCreateLabRequest() (+5 more)

### Community 51 - "DashboardLayout"
Cohesion: 0.06
Nodes (34): Antecedentes Médicos del Paciente, Autenticación, Citas Médicas, Consultas, Códigos de Error, Endpoints Públicos, Especialidades, Estados de Cita (+26 more)

### Community 52 - "MedicationsPage"
Cohesion: 0.07
Nodes (29): Auth-Login Specification, Purpose, Requirement: Affected File Boundaries, Requirement: Border-Only Focus States, Requirement: Brand Color Preservation, Requirement: Internal Scroll for Overflow Content, Requirement: No Functional Regression, Requirement: Notion-Esque Aesthetic Consistency (+21 more)

### Community 53 - "DashboardPage"
Cohesion: 0.24
Nodes (7): DashboardPage(), DashboardSwitcher(), DashboardSwitcherProps, useDashboardView(), VIEWS, DoctorDashboard(), DashboardView

### Community 54 - "PatientsPage"
Cohesion: 0.10
Nodes (34): patientApi, calculateAge(), HistoryEntry, Mode, PatientCrudLayout(), PatientCrudLayoutProps, BLOOD_TYPES, PatientForm() (+26 more)

### Community 55 - "ProfilePage"
Cohesion: 0.08
Nodes (16): fetchCities(), useGetCities(), bloodTypeOptions, genderOptions, LocalErrorItem, LocalQueueItem, PatientForm, PatientFormInner() (+8 more)

### Community 56 - "DoctorsPage"
Cohesion: 0.06
Nodes (49): ClinicsPage(), CONTAINER_VARIANTS, FADE_UP_VARIANTS, selectStyles, BookingPage(), CONTAINER_VARIANTS, FADE_UP_VARIANTS, CONTAINER_VARIANTS (+41 more)

### Community 57 - "RootLayout"
Cohesion: 0.18
Nodes (10): geist, jakarta, metadata, newsReader, RootLayout(), viewport, AuthProvider(), PUBLIC_PATHS (+2 more)

### Community 58 - "cn"
Cohesion: 0.60
Nodes (3): cn(), Container(), ContainerProps

### Community 59 - "PharmakoLoginPage"
Cohesion: 0.12
Nodes (17): AuthContainer(), AuthRegisterContent(), AuthTabs(), AuthTabsProps, LoginButton(), LoginButtonProps, LoginForm(), LoginMode (+9 more)

### Community 60 - "AboutUs"
Cohesion: 0.07
Nodes (23): AboutUs(), CONTAINER_VARIANTS, FADE_SCALE_VARIANTS, FADE_UP_VARIANTS, MILESTONES, VALUES, metadata, CONTACT_CHANNELS (+15 more)

### Community 61 - "ContactoPage"
Cohesion: 0.07
Nodes (29): Auth-Login Specification, Purpose, Requirement: Affected File Boundaries, Requirement: Border-Only Focus States, Requirement: Brand Color Preservation, Requirement: Internal Scroll for Overflow Content, Requirement: No Functional Regression, Requirement: Notion-Esque Aesthetic Consistency (+21 more)

### Community 62 - "ContactUs"
Cohesion: 0.07
Nodes (29): eslint, eslint-config-next, eslint-config-prettier, husky, lint-staged, devDependencies, eslint, eslint-config-next (+21 more)

### Community 63 - "Welcome"
Cohesion: 0.07
Nodes (25): _bundler, CHILD_EXIT_TIMEOUT_MS, _child_process, _cpuprofile, _env, _fileexists, _findpagesdir, _getnpxcommand (+17 more)

### Community 64 - "Home"
Cohesion: 0.07
Nodes (28): esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+20 more)

### Community 65 - "AuthProvider"
Cohesion: 0.07
Nodes (27): Benefits, Bootstrap 5, Breakpoint Strategies, Breakpoint Tokens, Cards Grid, Combining Feature and Size Queries, Common Breakpoint Scales, Content-Based Breakpoints (+19 more)

### Community 66 - "OfflineProvider"
Cohesion: 0.07
Nodes (27): 10. Hardcoded Color Values, 11. Missing `cn()` Utility, 12. Empty String in Radix Select, 13. Wrong Tailwind Package, 14. Missing Dependencies, 15. Not Testing Both Themes, 16. Not Checking Contrast, 17. tw-animate-css Import Error (REAL-WORLD ISSUE) (+19 more)

### Community 67 - "AuthTabs"
Cohesion: 0.07
Nodes (26): 1. Static (Auto-Prerendered), 2. Cached (`use cache`), 3. Dynamic (Suspense), Built-in Profiles, Cache Components (Next.js 16+), Cache Invalidation, Cache Key Generation, Cache Profiles (+18 more)

### Community 68 - "Providers"
Cohesion: 0.07
Nodes (26): Auto-fit Grid, Calculating Fluid Values, Cluster Layout, Combining Viewport and Container Units, Complete Type Scale, Container Widths, Content-Based Widths, CSS Grid Fluid Layouts (+18 more)

### Community 69 - "HeaderContext"
Cohesion: 0.07
Nodes (27): axios, @dnd-kit/core, lucide-react, next, dependencies, axios, @dnd-kit/core, lucide-react (+19 more)

### Community 70 - "NotificationBell"
Cohesion: 0.08
Nodes (35): InlineNotification(), NotificationItem, ROLE_LABELS, SidebarProps, MobileHeaderProps, NotificationBell(), NotificationBellProps, NotificationItem (+27 more)

### Community 71 - "UserProfile"
Cohesion: 0.11
Nodes (21): PatientConsultationsPage(), PatientLabResultsPage(), PendingVerificationPage(), PatientPrescriptionsPage(), Sidebar(), UserProfile(), useLogout(), patientConsultationApi (+13 more)

### Community 72 - "Container"
Cohesion: 0.08
Nodes (25): 1. Forgetting to Map in @theme inline, 2. Wrong Opacity Syntax, 3. Mixing Approaches, 4. Not Testing Dark Mode, Common Pitfalls, Example: Badge Component, Further Customization, Migration Guide: Hardcoded Colors → CSS Variables (+17 more)

### Community 73 - "SelectTrigger"
Cohesion: 0.11
Nodes (26): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), Select() (+18 more)

### Community 74 - "SelectValue"
Cohesion: 0.08
Nodes (25): 10. Styling Checklist, 1. CSS Variables — Alignment Plan, 2. Remove `colors.ts`, 3. Component Refactors (colors.ts → Tailwind classes), 3a. `PharmakoInput.tsx`, 3b. `LoginButton.tsx`, 3c. `RememberSession.tsx`, 3d. `LoginForm.tsx` (+17 more)

### Community 75 - "NavItem"
Cohesion: 0.08
Nodes (25): 1.1 `src/app/login/page.tsx` — Right panel height + scroll, 1.2 `src/components/pharmako-login/AuthContainer.tsx` — Height constraint, 1. Viewport Overflow Fix (Files 1–2), 2.1 `src/components/pharmako-login/AuthTabs.tsx` — Active tab shadow, 2.2 `src/components/pharmako-login/PharmakoInput.tsx` — Focus state, 2.3 `src/components/TypeProfile.tsx` — Profile card shadows, 2. Shadow Removal (Files 3–5), 3.1 `src/components/pharmako-login/AuthRegisterContent.tsx` (+17 more)

### Community 76 - "NavItemGroup"
Cohesion: 0.14
Nodes (26): Bf(), Df(), $f(), gn(), Hf(), It(), Lf(), Mf() (+18 more)

### Community 77 - "BookingModal"
Cohesion: 0.05
Nodes (68): appointmentApi, availabilityApi, AppointmentCrudLayoutProps, AppointmentForm(), AppointmentFormProps, AppointmentTable(), AppointmentTableProps, formatDate() (+60 more)

### Community 78 - "useAppointment"
Cohesion: 0.08
Nodes (24): compilerOptions, allowImportingTsExtensions, baseUrl, jsx, lib, module, moduleDetection, moduleResolution (+16 more)

### Community 79 - "useAppointments"
Cohesion: 0.08
Nodes (23): 1. Generics, 1. Infer Keyword, 2. Conditional Types, 2. Type Guards, 3. Assertion Functions, 3. Mapped Types, 4. Template Literal Types, 5. Utility Types (+15 more)

### Community 80 - "useAppointmentsByDoctor"
Cohesion: 0.11
Nodes (24): Ai(), bl(), Cl(), Dl(), Ii(), ji(), kl(), lr() (+16 more)

### Community 81 - "useAppointmentsByPatient"
Cohesion: 0.09
Nodes (22): Build-time vs Runtime, Docker Compose, Docker Deployment, Dockerfile, Environment Variables, Health Check Endpoint, Image Optimization, ISR and Cache Handlers (+14 more)

### Community 82 - "useCancelAppointment"
Cohesion: 0.09
Nodes (22): Browser Support, Combining Conditions, Container Queries Deep Dive, Container Query Syntax, Container Query Units, Container Types, Containment Basics, Dashboard Widget (+14 more)

### Community 83 - "useCreateAppointment"
Cohesion: 0.14
Nodes (10): auth_js_1, index_js_1, InteractiveOAuthClient, main(), node_http_1, node_readline_1, node_url_1, simpleOAuthClientProvider_js_1 (+2 more)

### Community 84 - "useDeleteAppointment"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 85 - "useUpcomingAppointments"
Cohesion: 0.09
Nodes (22): 3.4 Campos por Entidad, `appointments`, `consultations`, `family_histories`, `follow_ups`, `invoice_items`, `invoices`, `lab_requests` (+14 more)

### Community 86 - "useUpdateAppointment"
Cohesion: 0.10
Nodes (9): Rule Title Here, Disable DevTools in Production and During Performance Testing, Use Single useFieldArray Instance Per Field Name, Avoid Double Registration with useController, Combine Local State with useController for UI-Only State, Always Provide defaultValues for Form Initialization, Avoid useForm Return Object in useEffect Dependencies, Use delayError to Debounce Rapid Error Display (+1 more)

### Community 87 - "useUpdateAppointmentStatus"
Cohesion: 0.10
Nodes (8): Rule Title Here, Return False Instead of Throwing in Refine, Use Discriminated Unions for Type Narrowing, Avoid Double Validation, Handle All Validation Issues Not Just First, Validate at System Boundaries, Use Coercion for Form and Query Data, Export Both Schemas and Inferred Types

### Community 88 - "useDoctorAvailability"
Cohesion: 0.10
Nodes (20): 10. Commits atómicos, 11. Guardar en Engram, 1. Entender el contexto (codegraph), 2. Iniciar el SDD, 3. Estructura de feature, 4. Sistema de diseño (obligatorio), 5. Estructura de un componente, 6. Hook de datos (mock pattern) (+12 more)

### Community 89 - "useDoctorAppointmentsQuery"
Cohesion: 0.10
Nodes (20): Async Patterns, Bundling, Data Patterns, Debug Tricks, Directives, Error Handling, File Conventions, Font Optimization (+12 more)

### Community 90 - "useDeleteDoctorException"
Cohesion: 0.10
Nodes (19): 1. Estándares Generales de Comunicación, 2. Estándar de Errores (RFC 7807), 3. Resolución Híbrida de Geolocalización (UUID a BIGINT), 4. Registro de Cuentas (Endpoints), 5. El Flujo de Clínicas / Instituciones Médicas (B2B), 6. Endpoints de Autenticación y Flujo OTP, A. Registro de Paciente, A. Solicitar Código OTP (+11 more)

### Community 91 - "useDeleteDoctorSchedule"
Cohesion: 0.10
Nodes (19): 1.1 `src/app/login/page.tsx`, 1.2 `src/components/pharmako-login/AuthContainer.tsx`, 2.1 `src/components/pharmako-login/AuthTabs.tsx`, 2.2 `src/components/pharmako-login/PharmakoInput.tsx`, 2.3 `src/components/TypeProfile.tsx`, 2.4 Shadow verification (post-change), 3.1 `src/components/pharmako-login/AuthRegisterContent.tsx`, 3.2 `src/components/FormRegisterPatient.tsx` (+11 more)

### Community 92 - "useDoctorExceptionsQuery"
Cohesion: 0.15
Nodes (17): _child_process, _config, _constants, getBinaryVersion(), getNextConfig(), getPackageVersion(), _getregistry, _log (+9 more)

### Community 93 - "useDoctorSchedulesQuery"
Cohesion: 0.11
Nodes (18): Avoid Duplicate Fetches, Basic OG Image, Custom Fonts, Dynamic Metadata, Dynamic OG Image, File Naming, Important Rules, Important: Server Components Only (+10 more)

### Community 94 - "useSaveDoctorException"
Cohesion: 0.11
Nodes (19): Best Practices, Classes Not Applying, Common Patterns, Constraints and Warnings, Dark Mode Issues, Dark Mode Toggle, Examples, External Resources (+11 more)

### Community 95 - "useSaveDoctorSchedule"
Cohesion: 0.11
Nodes (18): Dependency Graph, SDD Tasks: Auth Tabs + Isomatic Redesign, T10 — Create AuthRegisterContent.tsx, T11 — Refactor TypeProfile.tsx, T12 — Refactor FormRegisterPatient.tsx, T13 — Refactor FormRegisterMedical.tsx, T14 — Refactor FormRegisterInstitution.tsx, T15 — Wire login page (+10 more)

### Community 96 - "usePatientAppointmentsQuery"
Cohesion: 0.11
Nodes (17): 1. Missing `default.tsx` → 404 on Refresh, 2. Modal Persists After Navigation, 3. Nested Parallel Routes Need Defaults Too, 4. Intercepted Route Shows Wrong Content, 5. TypeScript Errors with `params`, Common Gotchas, Complete Example: Photo Gallery Modal, File Structure (+9 more)

### Community 97 - "Appointment"
Cohesion: 0.11
Nodes (17): Common Issues, Dark Mode Implementation, Full Implementation, How It Works, Issue: Dark mode not switching, Issue: Flash of wrong theme on load, Issue: Icons not changing, Issue: Theme resets on page refresh (+9 more)

### Community 98 - "AppointmentResponse"
Cohesion: 0.12
Nodes (15): Consultations Module, Doctor Dashboard Token Migration, luca-* Token to pharmako-care Migration, pharmako-care Design Token, Zero Shadow Design Constraint, Current Debt, Init: Consultations Module, Scope (+7 more)

### Community 99 - "AppointmentsResponse"
Cohesion: 0.11
Nodes (17): Active Same-Domain Collisions, ADDED Requirements (7), Artifacts, Canonical Files Updated, Destructive Sync Approvals / Blockers, Domain Synced, Executive Summary, MODIFIED Requirements (+9 more)

### Community 100 - "DaySchedule"
Cohesion: 0.11
Nodes (17): Blockers, Executive Summary, Lint Results, Requirement: Affected File Boundaries — ✅ PASS, Requirement: Border-Only Focus States — ✅ PASS, Requirement: Brand Color Preservation — ✅ PASS, Requirement: Internal Scroll for Overflow Content — ✅ PASS, Requirement: No Functional Regression — ✅ PASS (+9 more)

### Community 101 - "DoctorAvailability"
Cohesion: 0.12
Nodes (15): _cachelifetypeutils, _config, _constants, _findpagesdir, _fs, _getprojectdir, _getRequireWildcardCache(), _installbindings (+7 more)

### Community 102 - "DoctorAvailabilityResponse"
Cohesion: 0.12
Nodes (16): 1.1 Avoid Boolean Prop Proliferation, 1.2 Use Compound Components, 1. Component Architecture, 2.1 Decouple State Management from UI, 2.2 Define Generic Context Interfaces for Dependency Injection, 2.3 Lift State into Provider Components, 2. State Management, 3.1 Create Explicit Component Variants (+8 more)

### Community 103 - "DoctorOption"
Cohesion: 0.12
Nodes (16): 1. Container Queries, 2. Fluid Typography & Spacing, 3. Layout Patterns, 4. Breakpoint Strategy, Core Capabilities, Key Patterns, Modern Breakpoint Scale, Pattern 1: Container Queries (+8 more)

### Community 104 - "PatientOption"
Cohesion: 0.12
Nodes (16): Background Colors, Colors, Container & Max Width, Flexbox Layouts, Font Size & Weight, Grid Layouts, Layout Utilities, Line Height & Letter Spacing (+8 more)

### Community 105 - "ScheduleExceptionInfo"
Cohesion: 0.12
Nodes (17): Applying Variants in CSS, Arbitrary Values, Color System, Custom Theme Configuration, Custom Utilities, Custom Variants, Dark Mode, Functions and Directives (+9 more)

### Community 106 - "Slot"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 107 - "UpdateAppointmentDTO"
Cohesion: 0.12
Nodes (16): 1.1 Enums Globales, 1.2 Modelos de Respuesta de `/me`, 1.3 Payload de Token, 1. Tipos e Interfaces (TypeScript), 2.1 Interceptor de Idempotencia (`Idempotency-Key`), 2.2 Interceptor de Refresh Token (JWT), 2.3 Manejo de Errores (422, 403, 401), 2.4 Envío de Formularios Multipart (Registro Doctores/Proveedores) (+8 more)

### Community 108 - "AuditAction"
Cohesion: 0.33
Nodes (5): AuditAction, auditActionEnum, auditActionLabels, AuditLog, auditLogSchema

### Community 109 - "AuditLog"
Cohesion: 0.12
Nodes (16): FR1: Patient Greeting, FR2: Health KPIs, FR3: Next Appointment, FR4: Quick Actions, FR5: Active Treatment (Migrated), FR6: Vital Signs (Migrated), FR7: Consultation History (Migrated), FR8: PatientDashboard Composition Root (+8 more)

### Community 110 - "FormRegisterMedical"
Cohesion: 0.12
Nodes (21): baseAuthSchema, doctorRegisterSchema, institutionRegisterSchema, patientRegisterSchema, PROFILES, ProfileType, FormRegisterInstitution(), IFormInput (+13 more)

### Community 111 - "FormRegisterPatient"
Cohesion: 0.12
Nodes (16): Active Same-Domain Change Warnings, ADDED Requirements (7), Archive Move, Artifacts Read, Destructive Merge Approvals, Domain Synced, Executive Summary, MODIFIED Requirements (+8 more)

### Community 112 - "TypeProfile"
Cohesion: 0.17
Nodes (17): $a(), Ae(), $c(), ca(), dt(), et(), Fs(), ht() (+9 more)

### Community 113 - "useGetPatientProfileQuery"
Cohesion: 0.12
Nodes (15): Avoiding Data Waterfalls, Client Component Data Fetching, Data Patterns, Decision Tree, Option 1: Pass from Server Component (Preferred), Option 2: Fetch on Mount (When Necessary), Option 3: Server Action for Reads (Works But Not Ideal), Pattern 1: Server Components (Preferred for Reads) (+7 more)

### Community 114 - "useGetUserProfileQuery"
Cohesion: 0.12
Nodes (16): 5.10 Subscribe to Derived State, 5.11 Use Functional setState Updates, 5.12 Use Lazy State Initialization, 5.13 Use Transitions for Non-Urgent Updates, 5.14 Use useDeferredValue for Expensive Derived Renders, 5.15 Use useRef for Transient Values, 5.1 Calculate Derived State During Rendering, 5.2 Defer State Reads to Usage Point (+8 more)

### Community 115 - "useLoginPatientMutation"
Cohesion: 0.12
Nodes (16): 1. Schema Definition (CRITICAL), 2. Parsing & Validation (CRITICAL), 3. Type Inference (HIGH), 4. Error Handling (HIGH), 5. Object Schemas (MEDIUM-HIGH), 6. Schema Composition (MEDIUM), 7. Refinements & Transforms (MEDIUM), 8. Performance & Bundle (LOW-MEDIUM) (+8 more)

### Community 116 - "useLoginUserMutation"
Cohesion: 0.12
Nodes (15): Affected Files, Design Decisions, Implementation Plan, In Scope, Intent, Out of Scope, Problem Statement, Proposal: Responsive Login + Notion-Esque Style Refinement (+7 more)

### Community 117 - "useRegisterDoctorMutation"
Cohesion: 0.12
Nodes (12): _build, _bundler, _cpuprofile, _fs, _getprojectdir, _iserror, _log, _picocolors (+4 more)

### Community 118 - "useRegisterPatientMutation"
Cohesion: 0.12
Nodes (12): _commander, _constants, _formatclihelpoutput, internal, _log, NextRootCommand, _nexttest, _picocolors (+4 more)

### Community 119 - "useRegisterProviderMutation"
Cohesion: 0.17
Nodes (7): GlobalRouteSegmentError(), GlobalError(), ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState, ErrorContext, logErrorToService()

### Community 120 - "useSendOtpMutation"
Cohesion: 0.13
Nodes (14): Bundle Analysis, Bundling, Common Problematic Packages, CSS Imports, Error Signs, Error Signs, ESM/CommonJS Issues, Migrating from Webpack to Turbopack (+6 more)

### Community 121 - "useVerifyOtpMutation"
Cohesion: 0.13
Nodes (15): 7.10 Hoist RegExp Creation, 7.11 Use flatMap to Map and Filter in One Pass, 7.12 Use Loop for Min/Max Instead of Sort, 7.13 Use Set/Map for O(1) Lookups, 7.14 Use toSorted() Instead of sort() for Immutability, 7.1 Avoid Layout Thrashing, 7.2 Build Index Maps for Repeated Lookups, 7.3 Cache Property Access in Loops (+7 more)

### Community 122 - "Country"
Cohesion: 0.13
Nodes (14): 1. Eliminating Waterfalls (CRITICAL), 2. Bundle Size Optimization (CRITICAL), 3. Server-Side Performance (HIGH), 4. Client-Side Data Fetching (MEDIUM-HIGH), 5. Re-render Optimization (MEDIUM), 6. Rendering Performance (MEDIUM), 7. JavaScript Performance (LOW-MEDIUM), 8. Advanced Patterns (LOW) (+6 more)

### Community 123 - "useGetCities"
Cohesion: 0.13
Nodes (14): Acknowledgments, Build AGENTS.md, Contributing, Creating a New Rule, Directory Structure, File Naming Convention, Getting Started, Impact Levels (+6 more)

### Community 124 - "useGetCountries"
Cohesion: 0.13
Nodes (15): 1. Form Configuration (CRITICAL), 2. Field Subscription (CRITICAL), 3. Controlled Components (HIGH), 4. Validation Patterns (HIGH), 5. Field Arrays (MEDIUM-HIGH), 6. State Management (MEDIUM), 7. Integration Patterns (MEDIUM), 8. Advanced Patterns (LOW) (+7 more)

### Community 125 - "useGetCountryCities"
Cohesion: 0.13
Nodes (14): 1. Estrategia General: Push & Pull Unificado (Bulk Sync), 2. Requerimientos de Base de Datos y Modelos, 3. Especificación del Endpoint `POST /api/sync`, 4. Políticas de Sincronización Detalladas, 5. Estructura de la Respuesta (Response JSON), A. Estructura de la Petición (Request JSON), A. Identificadores Únicos (UUID), A. Manejo de Datos Binarios (Fotos, PDFs, Documentos) (+6 more)

### Community 126 - "useGetSpecialties"
Cohesion: 0.13
Nodes (14): 12. Documentos Médicos, 15. Resultados de Laboratorio, 16. Inventario de Farmacias, 19. Verificación KYC, 7. Agenda y Citas, Appointment, Enums Consolidado, LabResult (+6 more)

### Community 127 - "useLogout"
Cohesion: 0.13
Nodes (14): Apply Progress: Responsive Login + Notion-Esque Style Refinement, Arbitrary shadow-value grep, Completed Tasks, Deviations from Design, Files Changed, Remaining Tasks, Shadow-removal grep, Status: COMPLETE (+6 more)

### Community 128 - "AccountStatus"
Cohesion: 0.13
Nodes (14): an(), bo(), Fr(), Gc(), he(), jc(), lt(), qc() (+6 more)

### Community 129 - "ApiResponse"
Cohesion: 0.25
Nodes (15): bt(), ec(), ei(), fc(), ni(), oi(), Qa(), Qo() (+7 more)

### Community 131 - "City"
Cohesion: 0.14
Nodes (10): Directives, Next.js Directive, React Directives, `'use cache'`, `'use client'`, `'use server'`, Quick Reference, Suspense Boundaries (+2 more)

### Community 132 - "Country"
Cohesion: 0.16
Nodes (8): Buttons inside inputs use InputGroup + InputGroupAddon, Contents, Field validation and disabled states, FieldSet + FieldLegend for grouping related fields, Forms & Inputs, Forms use FieldGroup + Field, InputGroup requires InputGroupInput/InputGroupTextarea, Option sets (2–7 choices) use ToggleGroup

### Community 133 - "PatientStatusApi"
Cohesion: 0.14
Nodes (14): 1. Built-in variants, 2. Tailwind classes via `className`, 3. Add a new variant, 4. Wrapper components, Adding Custom Colors, Border Radius, Changing the Theme, Checking for Updates (+6 more)

### Community 134 - "PlanType"
Cohesion: 0.14
Nodes (13): Accessibility Checklist, Alert Dialog, ARIA Patterns with Tailwind, Color Contrast, Contrast Guidelines, Focus Management, Focus Visible vs Focus, Motion Preferences (+5 more)

### Community 135 - "ProviderType"
Cohesion: 0.14
Nodes (13): Advanced v4.1 Features, Creating a Reusable Preset, CSS-First Configuration (v4.1+), Custom Plugin Example, Custom Utilities, Enhanced Arbitrary Values, JavaScript Configuration (Legacy), Native CSS Custom Properties (+5 more)

### Community 136 - "Specialty"
Cohesion: 0.14
Nodes (13): 11. Pharmacy Inventory 🟢 v3, 14. Audit Log 🟢 v3, 15. Entity Relationship Diagram, 1. Patient Identity, 3. Patient Records, AuditLog, Enum: AuditAction, Enum: Gender (+5 more)

### Community 137 - "State"
Cohesion: 0.14
Nodes (13): 1. Claves Primarias y Foráneas (UUID vs VARCHAR), 2. Aislamiento de Clínicas y Farmacias (Row Level Security - RLS), 3. Evitar Venta sin Stock (Concurrencia en Inventario), 4. Escalado de Auditoría (AuditLog), 📝 Checklist de Implementación para el Backend, Código de Ejemplo (SQL):, Código de Ejemplo (SQL):, Código de Ejemplo (SQL & Lógica de API): (+5 more)

### Community 138 - "UserRole"
Cohesion: 0.14
Nodes (13): 10. Módulo: Facturación y Cobros, 11. Módulo: Operaciones y Cumplimiento, 1. Módulo: Geografía y Ubicación, 2. Módulo: Identidad, Accesos y Roles, 3. Módulo: CRM de Pacientes (Fichas Médicas), 4. Módulo: Agenda y Turnos, 5. Módulo: El Acto Clínico (SOAP) y Estudios, 6. Módulo: Expediente Clínico Profundo (Antecedentes) (+5 more)

### Community 139 - "UserRoleApi"
Cohesion: 0.14
Nodes (9): 3-Column Layout, Design: Doctor PatientFlowView, Init: Doctor PatientFlowView Redesign, Scope, Problem, Proposal: Doctor PatientFlowView Redesign, Solution, Spec: Doctor PatientFlowView (+1 more)

### Community 140 - "VerificationDocPayload"
Cohesion: 0.14
Nodes (12): { Command, Option }, commanderVersion, envs, Errors, examples, executeDynamic, getCommanderVersion, packageJson (+4 more)

### Community 141 - "Invoice"
Cohesion: 0.13
Nodes (14): Invoice, InvoiceFormData, InvoiceItem, invoiceItemSchema, invoiceSchema, InvoiceStatus, invoiceStatusEnum, invoiceStatusLabels (+6 more)

### Community 142 - "InvoiceFormData"
Cohesion: 0.15
Nodes (12): Available Tools, Debug Tricks, Example: Get Errors, `get_errors`, `get_logs`, `get_page_metadata`, `get_project_metadata`, `get_routes` (+4 more)

### Community 143 - "InvoiceItem"
Cohesion: 0.15
Nodes (13): Avatar always needs AvatarFallback, Button has no isPending or isLoading prop, Callouts use Alert, Card structure, Choosing between overlay components, Component Composition, Contents, Dialog, Sheet, and Drawer always need a Title (+5 more)

### Community 144 - "InvoiceStatus"
Cohesion: 0.15
Nodes (12): 1. Always Use Semantic Tokens, 2. Use `cn()` for Conditional Styling, 3. Compose shadcn/ui Components, Advanced Patterns, Advanced Usage Patterns, Component Best Practices, Component Variants Pattern, Conditional Theme Variables (+4 more)

### Community 145 - "Payment"
Cohesion: 0.15
Nodes (12): Multi-Sede Branch Architecture, Public Catalog API (Phase 6), 1. Catálogo de Doctores, 2. Catálogo de Farmacias, 3. Catálogo de Clínicas, Consideraciones Generales, Códigos de Error Comunes, Documentación de API: Catálogo Público (Fase 6) (+4 more)

### Community 146 - "PaymentFormData"
Cohesion: 0.15
Nodes (12): 10. Jerarquía de Roles, 1. Diagrama ER Completo (Master), 2. Módulo de Identidad & Auth, 3. Módulo de Expedientes (CRM Médico), 4. Módulo Clínico (Consultas + Signos + Plantillas), 5. Módulo de Recetas, 6. Módulo Marketplace (Farmacias & Labs), 7. Módulo de Sistema (Notificaciones + Docs + Seguimiento) (+4 more)

### Community 147 - "PaymentMethod"
Cohesion: 0.15
Nodes (12): Active Item Indicator, Animation Variants, Collapsed State (~72px), Component Architecture, Design: macOS-Style Floating Sidebar, Expanded State (~220px), Frosted Glass (both states), Hover Interaction (+4 more)

### Community 148 - "ClinicDashboard"
Cohesion: 0.11
Nodes (22): ClinicDashboard(), ClinicGreeting(), ClinicKpiCard(), ClinicKpiCardProps, ClinicKpiCards(), ClinicQuickActions(), QuickActionButton(), DoctorCard() (+14 more)

### Community 149 - "ClinicGreeting"
Cohesion: 0.15
Nodes (12): Phase 1.1 — Types, Phase 1.2 — Data Hooks, Phase 1.3 — Verify Foundation, Phase 2.1 — New Components, Phase 2.2 — Migrate + Refine Existing Components, Phase 2.3 — Composition + Integration, Phase 2.4 — Verify, PR 1: Foundation — Types + Hooks (~310 lines) (+4 more)

### Community 150 - "ClinicKpiCards"
Cohesion: 0.15
Nodes (10): Changes from Current, Component Tree, Design: Doctor ResumenView, Goal, Init: Doctor ResumenView Redesign, Scope, Layout, Problem (+2 more)

### Community 151 - "useClinicActions"
Cohesion: 0.18
Nodes (13): Ar(), ba(), Ce(), Ds(), ft(), Gt(), Ls(), me() (+5 more)

### Community 152 - "useClinicConsultations"
Cohesion: 0.17
Nodes (11): Auth Errors, Error Boundaries, Error Handling, Error Hierarchy, `error.tsx`, `global-error.tsx`, Not Found, `not-found.tsx` (+3 more)

### Community 153 - "useClinicDoctors"
Cohesion: 0.17
Nodes (11): File Conventions, File Conventions Reference, Intercepting Routes, Middleware / Proxy, Next.js 14-15: `middleware.ts`, Next.js 16+: `proxy.ts`, Parallel Routes, Private Folders (+3 more)

### Community 154 - "useClinicGreeting"
Cohesion: 0.17
Nodes (12): 6.10 Use React DOM Resource Hints, 6.11 Use useTransition Over Manual Loading States, 6.1 Animate SVG Wrapper Instead of SVG Element, 6.2 CSS content-visibility for Long Lists, 6.3 Hoist Static JSX Elements, 6.4 Optimize SVG Precision, 6.5 Prevent Hydration Mismatch Without Flickering, 6.6 Suppress Expected Hydration Mismatches (+4 more)

### Community 155 - "useClinicKPIs"
Cohesion: 0.17
Nodes (12): `add` — Add components, `apply` — Apply a preset to an existing project, `build` — Build a custom registry, Commands, `diff` — Check for updates, `docs` — Get component documentation URLs, Dry-Run Mode, `info` — Project information (+4 more)

### Community 156 - "ClinicConsultation"
Cohesion: 0.17
Nodes (11): Configuring Registries, Setup, `shadcn:get_add_command_for_items`, `shadcn:get_audit_checklist`, `shadcn:get_item_examples_from_registries`, `shadcn:get_project_registries`, `shadcn:list_items_in_registries`, shadcn MCP Server (+3 more)

### Community 157 - "ClinicDoctor"
Cohesion: 0.17
Nodes (12): Built-in variants first, className for layout only, Contents, No manual dark: color overrides, No manual z-index on overlay components, No raw color values for status/state indicators, No space-x-* / space-y-*, Prefer size-* over w-* h-* when equal (+4 more)

### Community 158 - "ClinicKPI"
Cohesion: 0.18
Nodes (11): Framer Motion Stagger Animations, Mock Data Hooks Pattern, TanStack Query Readiness, Animations, Component Tree, Data Flow, Design: Patient Dashboard, Mobile Strategy (+3 more)

### Community 159 - "ClinicQuickAction"
Cohesion: 0.17
Nodes (11): 1. Catálogo de Doctores, 2. Catálogo de Farmacias, 3. Catálogo de Clínicas, 4. Catálogo de Disponibilidad de Doctor, Consideraciones Generales, Documentación de API: Catálogo Público (Fase 6), `GET /public/clinics`, `GET /public/doctors` (+3 more)

### Community 160 - "ImportExportMenu"
Cohesion: 0.17
Nodes (11): Core Principle: Next Action Clarity, Current State, Key UX Decisions to Make, Non-Goals, Option A — "Morning Briefing" (Recommended), Option B — "Patient Flow" Layout, Option C — "Contextual" Layout, Proposal: Dashboard that Actually Helps the Doctor (+3 more)

### Community 161 - "createNewElement"
Cohesion: 0.24
Nodes (7): ToolboxSidebar(), createNewElement(), generateId(), getDefaultElementProps(), insertElementAt(), updateGridColumnChildren(), useBuilderDnd()

### Community 162 - "findElementById"
Cohesion: 0.17
Nodes (12): FR1: ClinicGreeting, FR2: KPIs, FR3: TodayAgenda, FR4: DoctorsList, FR5: ClinicQuickActions, FR6: ClinicDashboard, FR7: DashboardPage Wiring, Functional Requirements (+4 more)

### Community 163 - "insertElementAt"
Cohesion: 0.17
Nodes (10): Explore: Doctor Dashboard Redesign, Luca Token Inventory, Shadow Inventory, What Changes, What Stays, Current State Audit, Design Debt, Explore: Pharmacy Dashboard Redesign (+2 more)

### Community 164 - "removeElementById"
Cohesion: 0.12
Nodes (20): SheetTrigger(), ClinicalHistoryBuilder(), PropertiesPanel(), TOOLBOX_BLOCKS, FieldOptionsEditor(), FieldOptionsEditorProps, MobileBottomNav(), MobilePanelsProps (+12 more)

### Community 165 - "serializeSchema"
Cohesion: 0.17
Nodes (10): Current Debt, Init: Doctor Dashboard Redesign, Scope, Changes, Notion-Isomatic Style, Out of Scope, Problem, Proposal: Doctor Dashboard Redesign (+2 more)

### Community 166 - "updateElementById"
Cohesion: 0.17
Nodes (11): Component Changes, CriticalNotifications, Design: Pharmacy Dashboard Redesign, Estimated Impact, KpiCard, OrderAgenda, PharmacyHeader → PharmacyGreeting, QuickActions (+3 more)

### Community 167 - "updateGridColumnChildren"
Cohesion: 0.20
Nodes (12): da(), fa(), ga(), ha(), ka(), ma(), pt(), qt() (+4 more)

### Community 168 - "useBuilderDnd"
Cohesion: 0.21
Nodes (9): config, { ESLint, FlatESLint = experimentalApi.FlatESLint }, experimentalApi, filterRuleNames(), filterRules(), prettier, printRuleNames(), processRules() (+1 more)

### Community 169 - "useDuplicateShortcut"
Cohesion: 0.12
Nodes (21): CanvasBlock(), CanvasBlockProps, COLUMN_GRID, ColumnDropZone(), ColumnDropZoneProps, GAP_SIZE, GridRowBlock(), GridRowBlockProps (+13 more)

### Community 170 - "useKeyboardShortcuts"
Cohesion: 0.18
Nodes (8): Level A (minimum), Level AA (standard), Level AAA (enhanced), Sources, Success criteria by level, Testing tools, WCAG 2.2 Quick Reference, What changed from 2.1 to 2.2

### Community 171 - "useUndoRedo"
Cohesion: 0.18
Nodes (10): 1. Component Architecture (HIGH), 2. State Management (MEDIUM), 3. Implementation Patterns (MEDIUM), 4. React 19 APIs (MEDIUM), Full Compiled Document, How to Use, Quick Reference, React Composition Patterns (+2 more)

### Community 172 - "clinicalHistorySchema"
Cohesion: 0.18
Nodes (11): Common Mistakes, Display Strategy, Don't Use Manual Font Links, Font in Specific Components, Font Optimization, Font Weights and Styles, Google Fonts, Local Fonts (+3 more)

### Community 173 - "ActivePanelTab"
Cohesion: 0.18
Nodes (10): 3.10 Use after() for Non-Blocking Operations, 3.1 Authenticate Server Actions Like API Routes, 3.2 Avoid Duplicate Serialization in RSC Props, 3.3 Avoid Shared Module State for Request Data, 3.4 Cross-Request LRU Caching, 3.5 Hoist Static I/O to Module Level, 3.6 Minimize Serialization at RSC Boundaries, 3.7 Parallel Data Fetching with Component Composition (+2 more)

### Community 174 - "ActiveToolboxTab"
Cohesion: 0.18
Nodes (11): Component Docs, Examples, and Usage, Component Selection, Current Project Context, Detailed References, Key Fields, Key Patterns, Principles, Quick Reference (+3 more)

### Community 175 - "BlockCondition"
Cohesion: 0.08
Nodes (35): VITAL_SIGNS_OPTIONS, VitalSignsBlock(), VitalSignsBlockProps, BaseBlock, BLOCK_TYPE_LABELS, BlockCondition, BlockType, BlockWidth (+27 more)

### Community 176 - "BlockType"
Cohesion: 0.18
Nodes (10): Basic Dark Mode Support, Container Queries (v4.1+), Dark Mode, Dark Mode Best Practices, Dark Mode Toggle (React), Mobile-First Responsive Layout, Responsive Card Component, Responsive Design Patterns (+2 more)

### Community 177 - "BlockWidth"
Cohesion: 0.18
Nodes (10): Common Plugin Errors, Error 1: Using v3 config file syntax, Error 2: Using @import instead of @plugin, Forms Plugin - Reset Form Element Styles, Multiple Plugins, Official Documentation, Official Plugins (Tailwind Labs), Overview (+2 more)

### Community 178 - "BuilderUIState"
Cohesion: 0.18
Nodes (10): Autenticación, CÓDIGOS DE ERROR, ENDPOINTS PÚBLICOS (SIN AUTH), Facturas y Workflow, HIPAA Compliance Checklist, Idempotency — REQUERIDO en todos los POST, Inventario y Marketplace, LUCA Health OS — API Phase 4 Documentation (+2 more)

### Community 179 - "CanvasElement"
Cohesion: 0.18
Nodes (9): Phase 1: Redesign, Phase 2: List Page, Phase 3: Detail Page, Spec: Consultations Module, Phase 1: Redesign, Phase 2: Consultation List, PR 1 — Redesign + List Page (~300 lines), PR 2 — Detail Page (~200 lines) (+1 more)

### Community 180 - "CanvasState"
Cohesion: 0.18
Nodes (9): AC1: Zero Shadows, AC2: Zero Luca Tokens, AC3: Design Tokens, AC4: DoctorGreeting, AC5: 3-View Switcher Preserved, AC6: Build & Lint, Acceptance Criteria, Spec: Doctor Dashboard Redesign (+1 more)

### Community 181 - "CheckboxMultipleBlock"
Cohesion: 0.22
Nodes (11): ea(), Ee(), go(), H(), rr(), rt(), Te(), uo() (+3 more)

### Community 182 - "Cie10SelectorBlock"
Cohesion: 0.27
Nodes (10): argv, fail(), failInc(), help(), main(), options, parseOptions, range (+2 more)

### Community 183 - "ClinicalHistorySettings"
Cohesion: 0.20
Nodes (9): _cpuprofile, _getprojectdir, _getRequireWildcardCache(), _getreservedport, _interop_require_wildcard(), _log, TODO: Implement --inspect-wait, _startserver (+1 more)

### Community 184 - "DateTimeBlock"
Cohesion: 0.18
Nodes (10): 1. Mobile-First (No Negociable), 2. Prevención de Overflow (Scrolls Rotos), 3. Ergonomía Táctil (Touch Targets), 4. Fluid Layouts (Grid & Flex), 5. Respetar la Lógica de Negocio, 🎯 Filosofía del Proyecto (LUCA - Software Médico), 📥 Formato de Salida Esperado, 🛠️ Reglas de Oro (Habilidades Estrictas) (+2 more)

### Community 185 - "DragItem"
Cohesion: 0.20
Nodes (10): Accessibility (a11y), ARIA usage (4.1.2), Automated testing, Conformance levels, Live regions (4.1.3), Manual testing, References, Robust (+2 more)

### Community 186 - "DropdownBlock"
Cohesion: 0.20
Nodes (9): Component Architecture (CRITICAL), Core Principles, Creating a New Rule, Impact Levels, Implementation Patterns (MEDIUM), React Composition Patterns, Rules, State Management (HIGH) (+1 more)

### Community 187 - "DropResult"
Cohesion: 0.20
Nodes (9): Async Cookies and Headers, Async Params and SearchParams, Async Patterns, generateMetadata, Migration Codemod, Pages and Layouts, Route Handlers, SearchParams (+1 more)

### Community 188 - "FieldSize"
Cohesion: 0.20
Nodes (9): After Response, Common Examples, Functions, Generate Functions, Navigation, Navigation Hooks (Client), Request/Response, Server Functions (+1 more)

### Community 189 - "FileUploadBlock"
Cohesion: 0.20
Nodes (9): Browser-only APIs, Common Causes and Fixes, Date/Time Rendering, Debugging, Error Signs, Hydration Errors, Invalid HTML Nesting, Random Values or IDs (+1 more)

### Community 190 - "GridRowBlock"
Cohesion: 0.20
Nodes (9): Always Use next/image, Blur Placeholder, Common Mistakes, Image Optimization, Priority Loading, Remote Images Configuration, Required Props, Responsive Images (+1 more)

### Community 191 - "HeaderBlock"
Cohesion: 0.20
Nodes (9): Basic Usage, Dynamic Route Handlers, Environment Behavior, GET Handler Conflicts with page.tsx, Request Helpers, Response Helpers, Route Handlers, Supported Methods (+1 more)

### Community 192 - "NumberBlock"
Cohesion: 0.20
Nodes (9): Don't Put Script in Head, Google Analytics, Google Tag Manager, Inline Scripts Need ID, Loading Strategies, Other Third-Party Scripts, Quick Reference, Scripts (+1 more)

### Community 193 - "PropertyFormState"
Cohesion: 0.20
Nodes (9): 4.1 Deduplicate Global Event Listeners, 4.2 Use Passive Event Listeners for Scrolling Performance, 4.3 Use SWR for Automatic Deduplication, 4.4 Version and Minimize localStorage Data, 4. Client-Side Data Fetching, Abstract, React Best Practices, References (+1 more)

### Community 194 - "RadioGroupBlock"
Cohesion: 0.20
Nodes (9): 1. Eliminating Waterfalls (async), 2. Bundle Size Optimization (bundle), 3. Server-Side Performance (server), 4. Client-Side Data Fetching (client), 5. Re-render Optimization (rerender), 6. Rendering Performance (rendering), 7. JavaScript Performance (js), 8. Advanced Patterns (advanced) (+1 more)

### Community 195 - "RepeaterBlock"
Cohesion: 0.20
Nodes (9): Basic Transitions, Built-in Animations, Common Use Cases, Custom Animations (v4.1+), Global Reduced Motion Support, Motion Preferences, Tailwind CSS Animations & Transitions, Transform Effects (+1 more)

### Community 196 - "SectionBlock"
Cohesion: 0.20
Nodes (7): Card Component, Form Elements, Modal/Dialog, Navigation Bar, React Button Component with Variants, Responsive User Card, Tailwind CSS Component Patterns

### Community 197 - "SectionTitleBlock"
Cohesion: 0.20
Nodes (9): Best Practices for Performance, Bundle Size Optimization, Content Path Best Practices, CSS Optimization Techniques, Development Performance (v4.1+), Minification, Production Build Optimization, PurgeCSS Configuration (+1 more)

### Community 198 - "SelectorOption"
Cohesion: 0.20
Nodes (9): File Structure, For Claude Code / AI Agents, For Developers, Key Principles, Overview, References, Rule Categories, Usage (+1 more)

### Community 199 - "TemplateStatus"
Cohesion: 0.20
Nodes (9): 1. El Script SQL (Fase 1), 2. Diccionario y Arquitectura de Tablas, LUCA Health OS - Diccionario de Base de Datos (Fase 1), Módulo 1: Normalización de Ubicaciones, Módulo 2: Identidad del Paciente, Módulo 3: Autenticación de Profesionales, Módulo 4: Arquitectura Institucional (Marca vs Edificio), Módulo 5: Proveedores del Marketplace (+1 more)

### Community 200 - "TextParagraphBlock"
Cohesion: 0.20
Nodes (10): 10. Códigos de Error HTTP, 11. Checklist de Implementación, 2. Arquitectura Offline-First, 5. Catálogos (Solo Lectura), 7. Flujo Completo Offline → Online, 8. Conflictos y Last-Write-Wins, Cola de trabajo offline, Guía de Integración Offline-First — API LUCA (+2 more)

### Community 201 - "TextShortBlock"
Cohesion: 0.20
Nodes (10): ActiveTreatment.tsx, Architecture, Component Analysis, ConsultationHistory.tsx, Current State, Design Debt Summary, Explore: Patient Dashboard, Missing Features (+2 more)

### Community 202 - "ToggleBlock"
Cohesion: 0.20
Nodes (9): 1.1 Register Panel Overflow on 1366×768 / 1280×800 (Confirmed), 1.2 AuthContainer `h-full` is broken, 1.3 Breakpoint behavior (lg: = 1024px), 1. Responsive Issues Identified, 2. Shadow Usage (Must Be Removed), 3. Notion-esque Style Adjustments, 4. Files Requiring Changes, 5. No Structural Changes Required (+1 more)

### Community 203 - "ToolboxBlockDefinition"
Cohesion: 0.20
Nodes (7): _analyze, _cpuprofile, _fs, _getprojectdir, _log, _picocolors, _utils

### Community 204 - "ToolboxCategory"
Cohesion: 0.22
Nodes (9): Accessibility Code Patterns, ARIA tabs, Dragging movements, Error handling, Form labels, Live regions and notifications, Modal focus trap, Screen reader commands (+1 more)

### Community 205 - "VisualSeparatorBlock"
Cohesion: 0.22
Nodes (9): Dragging movements (2.5.7) — new in 2.2, Focus not obscured (2.4.11) — new in 2.2, Focus visible (2.4.7), Keyboard accessible (2.1), Motion (2.3), Operable, Skip links (2.4.1), Target size (2.5.8) — new in 2.2 (+1 more)

### Community 206 - "VitalSignsBlock"
Cohesion: 0.22
Nodes (9): 1. Form Configuration (formcfg), 2. Field Subscription (sub), 3. Controlled Components (ctrl), 4. Validation Patterns (valid), 5. Field Arrays (array), 6. State Management (formstate), 7. Integration Patterns (integ), 8. Advanced Patterns (adv) (+1 more)

### Community 207 - "VitalSignsField"
Cohesion: 0.22
Nodes (9): Accordion, Base vs Radix, Button / trigger as non-button element (base only), Composition: asChild (radix) vs render (base), Contents, Select, Select — multiple selection and object values (base only), Slider (+1 more)

### Community 208 - "VitalSignsKey"
Cohesion: 0.22
Nodes (9): 1. Schema Definition (schema), 2. Parsing & Validation (parse), 3. Type Inference (type), 4. Error Handling (error), 5. Object Schemas (object), 6. Schema Composition (compose), 7. Refinements & Transforms (refine), 8. Performance & Bundle (perf) (+1 more)

### Community 209 - "ConsultationTabs"
Cohesion: 0.40
Nodes (8): ActiveConsultationView(), ActiveConsultationViewProps, ConsultationTabs(), calculateAge(), PatientContextCard(), PatientContextCardProps, Patient, Vitals

### Community 210 - "DigitalLabRequestCard"
Cohesion: 0.36
Nodes (7): Separator, calculateAge(), DigitalLabRequestCard(), DigitalLabRequestCardProps, formatDate(), formatId(), Doctor

### Community 211 - "DigitalPrescriptionCard"
Cohesion: 0.39
Nodes (8): calculateAge(), DigitalPrescriptionCard(), DigitalPrescriptionCardProps, formatDate(), formatId(), getMedicationById(), Medication, PrescriptionItem

### Community 212 - "ActiveConsultationData"
Cohesion: 0.22
Nodes (9): 5. Prescriptions, Enum: AdministrationRouteEnum, Enum: PresentationEnum, Enum: RxStatus, Medication, Prescription, PrescriptionItem, PrescriptionTemplate (+1 more)

### Community 213 - "useActiveConsultationQuery"
Cohesion: 0.22
Nodes (9): 1.1 Flujo de Login (respuesta exacta), 1.2 Estructura del Token JWT (Custom Claims), 1.3 Refresh de Token, 1.4 Logout, 1.5 Redirección post-login por rol, 1.6 Middleware de KYC (Doctores y Proveedores), 1.7 Cuenta Suspendida, 1.8 Registro de Doctor (multipart/form-data) (+1 more)

### Community 214 - "ConsultationListItem"
Cohesion: 0.43
Nodes (5): ConsultationListPage(), ConsultationRow(), statusConfig, ConsultationListItem, useConsultationList()

### Community 215 - "useConsultationList"
Cohesion: 0.22
Nodes (9): 8.1 Pago mayor al total de factura, 8.2 Eliminar medicamento usado en receta, 8.3 Múltiples resultados para la misma orden de lab, 8.4 Expiración de recetas, 8.5 Eliminación de facturas, 8.6 Estados deInvoice y transiciones válidas, 8.7 Inventario: stock en cero, 8.8 Duplicidad de lotes (+1 more)

### Community 216 - "useCreateFollowUp"
Cohesion: 0.22
Nodes (9): 1. Estrategia General: Push & Pull Unificado (Bulk Sync), 2. Requerimientos de Base de Datos y Modelos, 3. Especificación del Endpoint `POST /api/sync`, 5. Estructura de la Respuesta (Response JSON), A. Estructura de la Petición (Request JSON), A. Identificadores Únicos (UUID), B. Control de Versiones y Auditoría, B. Lógica del Servidor (Procesamiento del Push) (+1 more)

### Community 217 - "useStartConsultation"
Cohesion: 0.22
Nodes (8): Direction, In Scope, Key Design Decisions, Out of Scope, Problem Statement, Scope, SDD Proposal: Auth Tabs + Isomatic Redesign (v2), Target Architecture

### Community 218 - "useUpdateConsultation"
Cohesion: 0.22
Nodes (8): Component Architecture, DashboardSwitcher, Data Types (extend existing), Design: Dashboard Structure Redesign, FollowUpView grid, Layout Details, PatientFlowView grid, ResumenView grid

### Community 219 - "MedicationCatalogItem"
Cohesion: 0.22
Nodes (7): Component Tree, Design: Clinic Dashboard, Estimated Impact, Hooks, Styling Contract (Same as patient/pharmacy), Types, Tasks: Clinic Dashboard

### Community 220 - "useMedicationsCatalog"
Cohesion: 0.22
Nodes (8): AC1: Zero Shadows, AC2: Design Tokens, AC3: PharmacyGreeting, AC4: QuickActions as Hook, AC5: TrendDirection Standardized, AC6: Build & Lint, Acceptance Criteria, Spec: Pharmacy Dashboard Redesign

### Community 221 - "usePatientConsultationsQuery"
Cohesion: 0.22
Nodes (8): lint-staged, src/**/*.{js,jsx,ts,tsx}, name, packageManager, private, version, eslint --fix, prettier --write

### Community 222 - "AdministrationRoute"
Cohesion: 0.14
Nodes (13): AdministrationRoute, administrationRouteEnum, BiologicalSex, biologicalSexEnum, biologicalSexLabels, doctorSchema, historyEntrySchema, medicationSchema (+5 more)

### Community 223 - "BiologicalSex"
Cohesion: 0.22
Nodes (5): argv, fs, JSON5, path, pkg

### Community 224 - "Consultation"
Cohesion: 0.20
Nodes (15): TabsContent, TabsList, TabsTrigger, ClinicalNotesForm(), ClinicalNotesFormProps, DURATION_UNITS, FREQUENCY_OPTIONS, MedFormState (+7 more)

### Community 225 - "Doctor"
Cohesion: 0.25
Nodes (7): 1. System Context, 2. Tech Stack, 3. Architecture & Directory Structure (Strictly Enforced), 4. UI/UX & Styling Rules ("Clean & Elevated"), 5. Coding Conventions, 6. Execution Command, LUCA Health OS - AI Coding Guidelines

### Community 226 - "HistoryEntry"
Cohesion: 0.24
Nodes (7): ClinicalHistoryTimeline(), ClinicalHistoryTimelineProps, formatDate(), MOCK_FULL_HISTORY, Section(), ConsultationTabsProps, HistoryEntry

### Community 227 - "Medication"
Cohesion: 0.25
Nodes (8): Buttons, Common ARIA patterns, Error states, Form fields, Links, Live regions, Modals, Navigation

### Community 228 - "Patient"
Cohesion: 0.25
Nodes (8): Accessible authentication (3.3.8) — new in 2.2, Consistent help (3.2.6) — new in 2.2, Consistent navigation (3.2.3), Error handling (3.3.1, 3.3.3), Form labels (3.3.2), Page language (3.1.1), Redundant entry (3.3.7) — new in 2.2, Understandable

### Community 229 - "PrescriptionItem"
Cohesion: 0.25
Nodes (7): 13. Dark Mode, 16. File Organization, 17. Checklist Before PR, 1. Brand Identity, LUCA Design System — Skill for AI Agents, Manual Dark Mode Overrides, Purpose

### Community 230 - "Presentation"
Cohesion: 0.25
Nodes (5): initialState, Theme, ThemeProviderContext, ThemeProviderProps, ThemeProviderState

### Community 231 - "Vitals"
Cohesion: 0.25
Nodes (7): 1. El Script SQL (Plan de Estructura), 2. Directrices de Arquitectura para el Agente Backend, Arquitectura de Formularios y JSONB, El Seguimiento Clínico (`FollowUp`), Integridad Referencial 1 a 1, LUCA Health OS - Plan Arquitectónico: Motor Clínico (Fase 2), Modificación respecto a la Fase 1

### Community 232 - "AgendaItem"
Cohesion: 0.09
Nodes (26): AgendaItem(), AgendaItemProps, getInitials(), CriticalNotificationsProps, DailyAgenda(), DailyAgendaProps, NotificationAlert(), NotificationAlertProps (+18 more)

### Community 233 - "BottomNav"
Cohesion: 0.25
Nodes (7): 1. Ruteo y Navegación, 2. Integración de Nuevos Campos de DB v3, 3. Saneamiento del Sistema de Diseño e Interfaz Premium (Feedback), 📈 Archivos Afectados, 🛠️ Cambios Realizados, Historial de Cambios: Ruteo, Refactor, Interfaz e Interfaz Premium (Punto 1), 🎯 Objetivo de la Tarea

### Community 234 - "DashboardSwitcher"
Cohesion: 0.25
Nodes (8): Endpoints, GET /notifications, GET /notifications/unread-count, MÓDULO: NOTIFICACIONES, Notificaciones In-App, PATCH /notifications/{id}/read, POST /notifications/read-all, Tipos de Notificación

### Community 235 - "DoctorDashboard"
Cohesion: 0.25
Nodes (8): Design Constraints (Strict), Feature Structure, Layout (Desktop), Out of Scope, Problem Statement, Proposal: Patient Dashboard, Proposed Solution, Success Criteria

### Community 236 - "DoctorGreeting"
Cohesion: 0.16
Nodes (14): fadeUpVariant, DoctorGreeting(), getGreeting(), OrderAgenda(), OrderAgendaProps, fulfillmentIcon, OrderItem(), OrderItemProps (+6 more)

### Community 237 - "FollowUpView"
Cohesion: 0.14
Nodes (23): doctorDashboardApi, ActionChecklist(), ActionChecklistProps, TYPE_COLORS, TYPE_ICONS, FollowUpView(), ALERT_COLORS, ALERT_ICONS (+15 more)

### Community 238 - "KpiCard"
Cohesion: 0.11
Nodes (19): expandHeightVariant, lucaFastTransition, lucaTransition, pulseStatusVariant, scaleInVariant, sidebarContainerVariant, sidebarFloatContainer, sidebarFloatItem (+11 more)

### Community 239 - "KpiCards"
Cohesion: 0.25
Nodes (8): scripts, build, dev, format, lint, prepare, start, type-check

### Community 240 - "MobileDrawer"
Cohesion: 0.25
Nodes (8): Al(), El(), Fl(), Il(), jl(), $l(), Nl(), Tl()

### Community 241 - "NotificationAlert"
Cohesion: 0.25
Nodes (4): args, { join }, { readFileSync }, updateDb

### Community 242 - "QuickActions"
Cohesion: 0.29
Nodes (6): 1. Async Client Components Are Invalid, 2. Non-Serializable Props to Client Components, 3. Server Actions Are the Exception, Detection Rules, Quick Reference, RSC Boundaries

### Community 243 - "ResumenView"
Cohesion: 0.29
Nodes (6): Detection, Edge Runtime, Node.js Runtime (Default), Runtime Selection, Use Node.js Runtime by Default, When to Use Each

### Community 244 - "StatusBadge"
Cohesion: 0.29
Nodes (7): 1.1 Check Cheap Conditions Before Async Flags, 1.2 Defer Await Until Needed, 1.3 Dependency-Based Parallelization, 1.4 Prevent Waterfall Chains in API Routes, 1.5 Promise.all() for Independent Operations, 1.6 Strategic Suspense Boundaries, 1. Eliminating Waterfalls

### Community 245 - "useDoctorActions"
Cohesion: 0.29
Nodes (7): 2.1 Avoid Barrel File Imports, 2.2 Conditional Module Loading, 2.3 Defer Non-Critical Third-Party Libraries, 2.4 Dynamic Imports for Heavy Components, 2.5 Prefer Statically Analyzable Paths, 2.6 Preload Based on User Intent, 2. Bundle Size Optimization

### Community 246 - "useDoctorAgenda"
Cohesion: 0.29
Nodes (7): CLI, Component Structure → [composition.md](./rules/composition.md), Critical Rules, Forms & Inputs → [forms.md](./rules/forms.md), Icons → [icons.md](./rules/icons.md), Styling & Tailwind → [styling.md](./rules/styling.md), Use Components, Not Custom Markup → [composition.md](./rules/composition.md)

### Community 247 - "useDoctorDashboardQuery"
Cohesion: 0.29
Nodes (7): 7. System, Enum: DocType, Enum: FollowStatus, Enum: NotifType, FollowUp, MedicalDocument, Notification

### Community 248 - "useDoctorKPIs"
Cohesion: 0.29
Nodes (7): 8. Medical Background, FamilyHistory, Lifestyle, MedicalBackground, ObstetricHistory, SurgicalHistory, Vaccination

### Community 249 - "useDoctorNextPatient"
Cohesion: 0.29
Nodes (6): 1. El Script SQL (Plan de Estructura), 2. Directrices de Arquitectura para el Agente Backend, Alineación estricta con la Fase 1, Dinero y Precios, LUCA Health OS - Plan Arquitectónico: Prescripciones y Marketplace (Fase 3), Manejo de Tokens Públicos (`publicToken`)

### Community 250 - "useDoctorNotifications"
Cohesion: 0.29
Nodes (6): 1. El Script SQL (Plan de Estructura), 2. Directrices de Arquitectura para el Agente Backend, Cumplimiento Legal (HIPAA) - AuditLog, Eliminación en Cascada (CASCADE), Facturación y Sedes, LUCA Health OS - Plan Arquitectónico: Operaciones y Cumplimiento (Fase 4)

### Community 251 - "ActionItem"
Cohesion: 0.29
Nodes (7): 10. Antecedentes Médicos, FamilyHistory, Lifestyle, MedicalBackground, ObstetricHistory, SurgicalHistory, Vaccination

### Community 252 - "ActionType"
Cohesion: 0.29
Nodes (7): Acciones Auditadas, Endpoints (SOLO LECTURA), GET /audit-logs, HIPAA: Implementación Automática, Logs de Auditoría, MÓDULO: AUDITORÍA HIPAA, Permissions

### Community 253 - "AlertType"
Cohesion: 0.29
Nodes (7): Documentos de Verificación, Endpoints, Estados de Verificación, MÓDULO: VERIFICACIÓN KYC, Permissions, POST /verification-documents, PUT /verification-documents/{id} (Admin only)

### Community 254 - "Appointment"
Cohesion: 0.29
Nodes (7): Endpoints, Estados de LabResult, HIPAA: Log de Auditoría, MÓDULO: RESULTADOS DE LABORATORIO, POST /lab-results, POST /lab-results/{id}/review, Resultados de Lab (LabResults)

### Community 255 - "AppointmentStatus"
Cohesion: 0.29
Nodes (7): Endpoints, GET /pharmacy-inventories, GET /pharmacy-inventories/alerts/low-stock, Inventario de Farmacias, MÓDULO: INVENTARIO DE FARMACIA, Permissions, POST /pharmacy-inventories

### Community 256 - "DashboardView"
Cohesion: 0.29
Nodes (7): Endpoints, Endpoints, Items de Factura (Nested), MÓDULO: FACTURACIÓN, Pagos (Nested), POST /invoices/{invoice}/items, POST /invoices/{invoice}/payments

### Community 257 - "DoctorProfile"
Cohesion: 0.29
Nodes (6): 6.1 Medicamentos (autocompletado), 6.2 Ciudades por estado, 6. BÚSQUEDA, Anexo: Notas de la Guía, LUCA Health OS — Frontend Implementation Guide, TABLA DE CONTENIDOS

### Community 258 - "KPIData"
Cohesion: 0.29
Nodes (7): 7.1 Flujo: Doctor crea receta con QR, 7.2 Flujo: Farmacia recibe pedido por QR, 7.3 Flujo: Paciente solicita cotización y compara, 7.4 Flujo: Doctor recibe resultados de laboratorio, 7.5 Flujo: Facturación completa, 7.6 Flujo: KYC (Doctor registra y espera aprobación), 7. FLUJOS COMPLETOS POR ROL

### Community 259 - "NextPatient"
Cohesion: 0.29
Nodes (7): Components, Design Constraints, Layout, Out of Scope, Problem, Proposal: Clinic Dashboard, Solution

### Community 260 - "Notification"
Cohesion: 0.29
Nodes (6): Next Recommended Steps, openspec/config.yaml — Current Configuration Summary, Phase Rules, SDD Init — 2026-06-04: Responsive Login + Notion-Esqued Style Refinement, Testing Status, What This Means for This Change

### Community 261 - "NotificationType"
Cohesion: 0.29
Nodes (5): checkVersion, constants_1, fs, index_js_1, packageJson

### Community 262 - "PatientAlert"
Cohesion: 0.29
Nodes (5): argparse, cli, fs, options, yaml

### Community 263 - "QuickAction"
Cohesion: 0.33
Nodes (5): 1. Component Architecture (architecture), 2. State Management (state), 3. Implementation Patterns (patterns), 4. React 19 APIs (react19), Sections

### Community 264 - "QuickActionVariant"
Cohesion: 0.33
Nodes (5): Creating a New Rule, Getting Started, React Best Practices, Rule File Structure, Structure

### Community 265 - "usePatientDocumentDetailQuery"
Cohesion: 0.31
Nodes (6): PatientDocumentsPage(), patientDocumentApi, patientDocumentDetailKeys, usePatientDocumentDetailQuery(), patientDocumentKeys, usePatientDocumentsQuery()

### Community 266 - "usePatientDocumentsQuery"
Cohesion: 0.33
Nodes (5): Best Practices, Common Issues, Detailed patterns and worked examples, Responsive Design, When to Use This Skill

### Community 267 - "PharmacyInventory"
Cohesion: 0.50
Nodes (3): PharmacyInventory, PharmacyInventoryFormData, pharmacyInventorySchema

### Community 268 - "PharmacyInventoryFormData"
Cohesion: 0.33
Nodes (5): Contents, Presets, shadcn CLI Reference, Switching Presets, Templates

### Community 269 - "usePatientInvoiceDetailQuery"
Cohesion: 0.26
Nodes (10): DetailedInvoice, InvoiceItem, PatientInvoicesPage(), PaymentRecord, patientInvoiceApi, patientInvoiceDetailKeys, usePatientInvoiceDetailQuery(), patientInvoiceKeys (+2 more)

### Community 270 - "usePatientInvoicesQuery"
Cohesion: 0.33
Nodes (6): 13. Billing & Payments 🟢 v3, Enum: InvoiceStatus, Enum: PaymentMethod, Invoice, InvoiceItem, Payment

### Community 271 - "useReportPaymentMutation"
Cohesion: 0.33
Nodes (6): 2. Users & Roles, DoctorSpecialty, Enum: PlanType, Enum: UserRole, Specialty, User

### Community 272 - "LabResult"
Cohesion: 0.29
Nodes (6): LabResult, LabResultFormData, labResultSchema, LabResultStatus, labResultStatusEnum, labResultStatusLabels

### Community 273 - "LabResultFormData"
Cohesion: 0.33
Nodes (6): 4. Clinical Module, Appointment, Consultation, FormTemplate, LabRequest, VitalSign

### Community 274 - "LabResultStatus"
Cohesion: 0.33
Nodes (6): 6. Marketplace, Enum: ProviderType, Enum: QuoteStatus, ProviderProfile, QuoteOffer, QuoteRequest

### Community 275 - "CreateLabRequestDTO"
Cohesion: 0.33
Nodes (6): 11. Vademécum y Recetas, Medication, Prescription, PrescriptionItem, PrescriptionTemplate, TemplateItem

### Community 276 - "UpdateLabRequestDTO"
Cohesion: 0.33
Nodes (6): DELETE /invoices/{id}, Endpoints, Estados de Invoice, Facturas (Invoices), POST /invoices, POST /invoices/{id}/send

### Community 277 - "useCreateLabRequest"
Cohesion: 0.33
Nodes (6): 2.1 Estructura Estándar de Paginación, 2.2 Cómo cambiar page size, 2.3 Filtros conocidos por recurso, 2.4 Búsqueda de medicamentos, 2.5 Filtros por Sede (clinic_branch_id), 2. PAGINACIÓN Y FILTROS

### Community 278 - "useDeleteLabRequest"
Cohesion: 0.33
Nodes (6): 3.1 Roles y sus alcances, 3.2 Pacientes: Accesso a sus propios datos, 3.3 Doctores: Scope de sus datos, 3.4 Proveedores: Scope de sus datos, 3.5 Admin: Acceso total, 3. MATRIX DE PERMISOS

### Community 279 - "useLabRequest"
Cohesion: 0.33
Nodes (5): Design Rules, Intentionally Unmapped Colors, LUCA Brand Palette, Tailwind v4 Usage, Token Reference

### Community 280 - "useLabRequests"
Cohesion: 0.33
Nodes (5): Changes, Out of Scope, Problem, Proposal: Pharmacy Dashboard Redesign, Solution

### Community 281 - "useUpdateLabRequest"
Cohesion: 0.40
Nodes (5): auth_extensions_js_1, createProvider(), index_js_1, main(), streamableHttp_js_1

### Community 282 - "usePatientLabResultsQuery"
Cohesion: 0.53
Nodes (5): capFirst(), getValue(), info(), printLines(), si

### Community 283 - "useCreateMedication"
Cohesion: 0.40
Nodes (5): cssesc, fs, main(), options, strings

### Community 284 - "useDeleteMedication"
Cohesion: 0.40
Nodes (4): displayedErrors, getErrorMessage(), mod, onFatalError()

### Community 285 - "useMedications"
Cohesion: 0.67
Nodes (5): fail(), failInc(), help(), main(), success()

### Community 286 - "useTopPrescribedMedications"
Cohesion: 0.33
Nodes (4): mcp_js_1, server, stdio_js_1, z

### Community 287 - "useUpdateMedication"
Cohesion: 0.40
Nodes (5): 7. Components, Badge Styles, Button Variants, Card Structure, Input Styles

### Community 288 - "useCreatePrescriptionTemplate"
Cohesion: 0.40
Nodes (5): 8.1 Do Not Put Effect Events in Dependency Arrays, 8.2 Initialize App Once, Not Per Mount, 8.3 Store Event Handlers in Refs, 8.4 useEffectEvent for Stable Callback Refs, 8. Advanced Patterns

### Community 289 - "useDeletePrescriptionTemplate"
Cohesion: 0.40
Nodes (5): Abstract, React Hook Form, References, Source Files, Table of Contents

### Community 290 - "usePrescriptionTemplates"
Cohesion: 0.40
Nodes (4): Icons, Icons in Button use data-icon attribute, No sizing classes on icons inside components, Pass icons as component objects, not string keys

### Community 291 - "useUpdatePrescriptionTemplate"
Cohesion: 0.40
Nodes (5): Abstract, References, Source Files, Table of Contents, Zod

### Community 292 - "AdministrationRoute"
Cohesion: 0.40
Nodes (4): 🎨 Design tokens, 📁 Estructura completa, 🔀 Flujo de rutas, 🏗️ LUCA Health OS — Arquitectura de proyecto

### Community 293 - "Presentation"
Cohesion: 0.40
Nodes (5): 9. Consultas Médicas (SOAP), Consultation, FollowUp, LabRequest, VitalSign

### Community 294 - "TemplateItem"
Cohesion: 0.40
Nodes (5): 11.1 Auth — Patient API, 11.2 Patient Portal Endpoints, 11.3 Public Verification (sin auth), 11.4 Permisos del Patient Portal, 11 Patient Portal (Phase 5)

### Community 295 - "DelayBanner"
Cohesion: 0.50
Nodes (3): ActiveDelay, DelayBanner(), DelayBannerProps

### Community 296 - "useMarkAllNotificationsReadMutation"
Cohesion: 0.40
Nodes (5): 5.1 No hay WebSockets, 5.2 Notificaciones: estrategia de polling, 5.3 Marketplace: nuevas cotizaciones, 5.4 Resultados de laboratorio, 5. POLLING Y TIEMPO REAL

### Community 297 - "useMarkNotificationReadMutation"
Cohesion: 0.40
Nodes (5): 9.1 Códigos de error del API, 9.2 Mapeo de errores 422 a campos de formulario, 9.3 Estrategia de Retry con Idempotency Key, 9.4 Auto-refresh de token en 401, 9. MANEJO DE ERRORES

### Community 298 - "usePatientNotificationsQuery"
Cohesion: 0.40
Nodes (5): 4. Políticas de Sincronización Detalladas, A. Manejo de Datos Binarios (Fotos, PDFs, Documentos), B. Conflictos de Relaciones (Ej: Claves Foráneas Inexistentes), C. Autenticación y Renovación Offline, D. Velocidad de Sincronización y Paginación (Pull)

### Community 299 - "usePatientUnreadCountQuery"
Cohesion: 0.40
Nodes (5): 3.1 Request — Estructura General, 3.2 Estructura de un Registro (push), 3.3 Orden de Entidades en Push, 3. Sincronización: `POST /api/sync`, Endpoint

### Community 300 - "SyncIndicator"
Cohesion: 0.21
Nodes (13): SyncIndicator(), SyncIndicatorProps, useIsClient(), useSync(), UseSyncOptions, useSyncQueue(), syncService, initialState (+5 more)

### Community 301 - "ActiveDelayRecord"
Cohesion: 0.40
Nodes (5): 4. Respuesta del Servidor, Errores de Relación (FK), Interpretación de `pull`, Interpretación de `push_results`, Paginación con `has_more`

### Community 302 - "clearSyncErrors"
Cohesion: 0.40
Nodes (5): 6. Documentos Binarios (Fotos, PDFs), Notas, Paso 1: Registrar metadata en `/api/sync`, Paso 2: Subir el binario por separado, Paso 3: Limpiar local

### Community 303 - "getLastSyncTimestamp"
Cohesion: 0.40
Nodes (5): 9. Notas Importantes, Campos obligatorios vs opcionales, Primera sync (last_sync_timestamp = null), `public_token` en prescriptions y medical_documents, timezone

### Community 304 - "getPendingChangesCount"
Cohesion: 0.40
Nodes (4): Constraints, Problem Statement, Scope, SDD Init: Dashboard Structure Redesign

### Community 305 - "setLastSyncTimestamp"
Cohesion: 0.40
Nodes (3): Acceptance Criteria, Spec: Doctor ResumenView, Tasks: Doctor ResumenView

### Community 306 - "SyncMeta"
Cohesion: 0.40
Nodes (3): argv, [commands, flags], which

### Community 307 - "useOnlineStatus"
Cohesion: 0.40
Nodes (3): _picocolors, _storage, telemetry

### Community 308 - "useSync"
Cohesion: 0.50
Nodes (4): Color contrast (1.4.3, 1.4.6), Media alternatives (1.2), Perceivable, Text alternatives (1.1)

### Community 309 - "useSyncQueue"
Cohesion: 0.50
Nodes (4): Common issues by impact, Critical (fix immediately), Moderate (fix soon), Serious (fix before launch)

### Community 310 - "ConflictResolution"
Cohesion: 0.50
Nodes (4): 10. Layout Patterns, Page Structure, Sidebar Navigation Item, Tab Switcher Pattern

### Community 311 - "EntityByType"
Cohesion: 0.50
Nodes (4): 11. Section-Specific Theming, Doctor/Patient Sections, Mixed Sections, Pharmacy/Medications Sections

### Community 312 - "EntityPushResult"
Cohesion: 0.50
Nodes (4): 15. Common Patterns, Empty States, Loading States, Toast Notifications

### Community 313 - "EntityUUID"
Cohesion: 0.50
Nodes (4): 2. Color System, Brand Palette — `pharmako-*` tokens, Surface & Neutral Tokens, Tailwind CSS Usage

### Community 314 - "PushResults"
Cohesion: 0.50
Nodes (4): 3. Typography, Font Stack, Scale, Text Colors

### Community 315 - "QueuedChange"
Cohesion: 0.50
Nodes (4): 4. Spacing & Radii, Border Radius Tokens, Spacing Scale, Tailwind Usage

### Community 316 - "SyncEngineState"
Cohesion: 0.50
Nodes (4): 5. Shadows, Correct Shadow Usage, LUCA Shadow System, Prohibited Styles

### Community 317 - "SyncError"
Cohesion: 0.50
Nodes (4): 8. Iconography, Dashboard Icon Color Rules, Icon Color, Icon Sizing

### Community 318 - "SyncRequest"
Cohesion: 0.50
Nodes (4): 9. Animations, Framer Motion (Complex Animations), Prohibited Animations, Tailwind Animations (Preferred)

### Community 320 - "SyncStats"
Cohesion: 0.50
Nodes (3): File-System Paths, Import Paths, Prefer Statically Analyzable Paths

### Community 323 - "SyncTimestamp"
Cohesion: 0.50
Nodes (4): 10. Verification (KYC), Enum: DocVerificationType, Enum: VerificationStatus, VerificationDocument

### Community 324 - "clientToServer"
Cohesion: 0.50
Nodes (4): 9. Institutional, Clinic, ClinicMember, Enum: ClinicRole

### Community 325 - "generateUUID"
Cohesion: 0.50
Nodes (4): All Enums, All SQL Patches, Appendix: Quick Reference, Frontend Zod Schemas

### Community 326 - "getCurrentTimestamp"
Cohesion: 0.50
Nodes (4): 17. Facturación y Pagos, Invoice, InvoiceItem, Payment

### Community 327 - "isValidUUID"
Cohesion: 0.50
Nodes (4): 1. Normalización Geográfica, City, Country, State

### Community 328 - "serverToClient"
Cohesion: 0.50
Nodes (4): 5. Clínicas y Sucursales, Clinic, ClinicBranch, ClinicBranchMember

### Community 329 - "BookDoctorSection"
Cohesion: 0.50
Nodes (4): 10.1 Tabla resumen, 10.2 Endpoints públicos (sin auth), 10.3 Rutas implementadas (previas), 10. REFERENCIA RÁPIDA DE RUTAS

### Community 330 - "NextAppointmentCard"
Cohesion: 0.09
Nodes (34): staggerChildrenVariant, ActiveTreatment(), ActiveTreatmentProps, TreatmentCard(), ConsultationHistory(), ConsultationHistoryProps, ConsultationRow(), NextAppointmentCard() (+26 more)

### Community 331 - "PatientDashboard"
Cohesion: 0.50
Nodes (4): 4.1 El API NO tiene endpoint de upload, 4.2 Límites de archivos (KYC), 4.3 Flujo de upload KYC, 4. ESTRATEGIA DE ARCHIVOS (UPLOAD)

### Community 332 - "PatientFormRequests"
Cohesion: 0.11
Nodes (26): PreviewPage(), TODO: POST to /api/clinical-history, ClinicalHistoryDashboardPage(), FormPreview(), FormRenderer(), ShareTemplateModal(), TemplatesDashboard(), PatientFormRequests() (+18 more)

### Community 333 - "PatientGreeting"
Cohesion: 0.50
Nodes (4): 1. Autenticación y JWT, Login, Logout, Refresh Token

### Community 334 - "PatientKpiCards"
Cohesion: 0.50
Nodes (3): Acceptance Criteria, Decisions (from proposal Q&A), Spec: Dashboard Structure Redesign

### Community 335 - "usePatientActions"
Cohesion: 0.50
Nodes (3): Problem Statement, Scope, SDD Init: macOS-Style Sidebar Redesign

### Community 336 - "usePatientAppointments"
Cohesion: 0.50
Nodes (3): Context, Init: Pharmacy Dashboard Redesign, Scope

### Community 340 - "usePatientGreeting"
Cohesion: 0.50
Nodes (3): cliOptions, debugLog, options

### Community 341 - "usePatientKPIs"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 343 - "usePatientVitals"
Cohesion: 0.67
Nodes (3): 12. Responsive Design, Breakpoints, Responsive Patterns

### Community 344 - "Appointment"
Cohesion: 0.67
Nodes (3): 14. Accessibility, Focus States, Requirements

### Community 345 - "Consultation"
Cohesion: 0.67
Nodes (3): 6. Borders, Border Rules, Prohibited

### Community 346 - "PatientKPI"
Cohesion: 0.67
Nodes (3): ✅ DO, ❌ DON'T, Summary: Do's and Don'ts

### Community 348 - "Treatment"
Cohesion: 0.67
Nodes (3): 12. Lab Results 🟢 v3, Enum: LabResultStatus, LabResult

### Community 349 - "TrendDirection"
Cohesion: 0.67
Nodes (3): 13. Marketplace B2B2C, QuoteOffer, QuoteRequest

### Community 350 - "VitalSign"
Cohesion: 0.67
Nodes (3): 4. Especialidades, DoctorSpecialty (Pivote), Specialty

### Community 351 - "useCreatePatient"
Cohesion: 0.67
Nodes (3): 6. Proveedores (Farmacias/Laboratorios), ProviderBranch, ProviderProfile

### Community 365 - "KpiCards"
Cohesion: 0.09
Nodes (28): CriticalNotifications(), CriticalNotificationsProps, KpiCard(), KpiCardProps, KpiCards(), KpiCardsProps, NotificationAlert(), NotificationAlertProps (+20 more)

### Community 425 - "useKeyboardShortcut"
Cohesion: 0.05
Nodes (54): CATEGORY_LABELS, groupedResults, MOCK_RESULTS, SearchCommand(), SearchCommandProps, SearchResult, Command(), CommandDialog() (+46 more)

## Knowledge Gaps
- **2519 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+2514 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **200 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `useKeyboardShortcut` to `Medication`, `ClinicDashboard`, `removeElementById`, `DELETE`, `useDuplicateShortcut`, `SyncIndicator`, `AppointmentsPage`, `DrawerContextType`, `BlockCondition`, `LaboratoriosPage`, `DashboardPage`, `PatientsPage`, `DoctorsPage`, `RootLayout`, `NotificationBell`, `UserProfile`, `SelectTrigger`, `NextAppointmentCard`, `PatientFormRequests`, `BookingModal`, `DigitalLabRequestCard`, `ConsultationListItem`, `Consultation`, `HistoryEntry`, `AgendaItem`, `DoctorGreeting`, `FollowUpView`, `KpiCard`, `KpiCards`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `dependencies` connect `HeaderContext` to `clsx`, `cmdk`, `dexie`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `framer-motion`, `@hookform/resolvers`, `motion`, `radix-ui`, `react-hook-form`, `react-icons`, `sonner`, `uuid`, `zustand`, `usePatientConsultationsQuery`, `class-variance-authority`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Select()` connect `SelectTrigger` to `DoctorsPage`, `useKeyboardShortcut`, `HeaderContext`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _2519 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Proposal: Doctor Dashboard Redesign` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `LUCA Project Architecture (ARCHITECTURE.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.10276679841897234 - nodes in this community are weakly interconnected._
- **Should `LUCA Database Schema v3 (database.md)` be split into smaller, more focused modules?**
  _Cohesion score 0.0663265306122449 - nodes in this community are weakly interconnected._