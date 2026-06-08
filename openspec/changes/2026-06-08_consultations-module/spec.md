# Spec: Consultations Module

## Phase 1: Redesign
- AC1: Zero shadows in consultations/
- AC2: Zero luca-* tokens in consultations/
- AC3: DigitalPrescriptionCard compiles (no Badge import error)
- AC4: Build + lint clean

## Phase 2: List Page
- AC5: Route `/dashboard/consultations` renders consultation list
- AC6: Each row shows: patient, date, type, status badge
- AC7: Empty state with icon + message
- AC8: Click navigates to `/dashboard/consultations/[id]`

## Phase 3: Detail Page
- AC9: Route `/dashboard/consultations/[id]` renders full consultation
- AC10: PatientContextCard + ConsultationTabs visible
- AC11: ClinicalNotesForm (SOAP) functional with mock data
- AC12: DigitalPrescriptionCard accessible from tabs
