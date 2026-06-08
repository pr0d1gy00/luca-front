# Proposal: Consultations Module

## Phase 1: Redesign Existing Components
Fix all 6 existing components + schemas:
- Remove shadows (7 occurrences)
- Replace luca-* tokens (74 occurrences) → pharmako-care / blue-700 / slate-*
- Standardize borders: `border-slate-200`
- Fix DigitalPrescriptionCard Badge import error

## Phase 2: Consultation List Page
Route: `/dashboard/consultations`
- List of all consultations with patient name, date, type, status
- Filter by date/status
- Click to open consultation detail
- Mock data hook

## Phase 3: Active Consultation Page
Route: `/dashboard/consultations/[id]`
- Full consultation view with:
  - PatientContextCard (left sidebar)
  - ConsultationTabs (main area): Historial + Consulta Actual (SOAP)
  - DigitalPrescriptionCard (emitir receta)
- Mock data hook for consultation detail
