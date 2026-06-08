# Explore: Clinic Dashboard

## Current State
- `DashboardPage` → `role === "clinic"` → fallback: "Dashboard no disponible para este rol"
- No feature folder, no types, no components
- Zero clinic infrastructure

## DB Context (what the dashboard should surface)
| Entity | Relevance |
|--------|-----------|
| `Clinic` | Name, address, logo for greeting |
| `ClinicMember` | Doctors/staff belonging to clinic |
| `Consultation.clinicId` | Today's consultations at clinic |
| `Prescription.clinicId` | Prescriptions issued at clinic |
| `User (role=DOCTOR)` | Doctors profiles via ClinicMember |

## Reference Pattern
`src/features/patient-dashboard/` — the canonical dashboard pattern:
- `types/index.ts` → interfaces
- `hooks/useClinic*.ts` → mock data hooks
- `components/*.tsx` → individual components
- `components/ClinicDashboard.tsx` → composition root
- `index.ts` → barrel export
- Notion-isomatic: zero shadows, pharmako-care icons, blue-700 buttons, border-slate-200
