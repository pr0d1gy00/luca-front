# Explore: Patient Dashboard

**Date:** 2026-06-07

## Current State

### Architecture
- 3 components in `src/app/dashboard/`: ActiveTreatment, VitalSigns, ConsultationHistory
- No feature folder, no types, no hooks, no barrel export
- Page simply renders: 2×2 grid with ActiveTreatment + VitalSigns on top row, ConsultationHistory + empty placeholder on bottom
- No role-specific greeting or personalization

### Component Analysis

#### ActiveTreatment.tsx
- Hardcoded to "AMOXICILINA 500MG" with duplicate identical cards
- Uses `react-icons/ai` (AiFillMedicineBox) — should use lucide-react for consistency
- `text-orange-400` for button — doesn't match design tokens (should be teal)
- `w-[50%]` hardcoded width, no responsive breakpoints
- Static "12/12/2022" date
- No progress bar for treatment duration
- No types; no data hook

#### VitalSigns.tsx
- 4 mock vital signs: Presión Arterial, Frecuencia Cardíaca, Temperatura, Saturación O₂
- Timeline layout with center vertical line, 2 columns
- Duplicated render code for left/right columns (same JSX, different slices)
- `border-gray-200`, `bg-gray-300` — inconsistent with slate palette
- All hardcoded time "10:30 AM"
- No types; no data hook

#### ConsultationHistory.tsx
- 3 mock consultations with timeline (alternating left/right)
- `text-orange-400` dates, `bg-green-950` timeline nodes — inconsistent palette
- Most complete component in terms of content ✅
- Card shows: type icon, motivo, diagnóstico
- No types; no data hook

### Design Debt Summary
| Issue | Files Affected |
|-------|---------------|
| Wrong color palette (orange-400, green-950, gray-300) | All 3 |
| No TypeScript types/interfaces | All 3 |
| No data hooks (mock data inline) | All 3 |
| Not in feature folder | All 3 |
| No responsive design | All 3 |
| Duplicate JSX in VitalSigns | 1 |
| react-icons dependency only for medicine icon | 1 |
| Empty placeholder div in page | 1 |

### Missing Features
- Patient greeting ("Hola, [nombre]")
- Health KPIs (próxima cita, tratamientos activos, labs pendientes)
- Quick actions (agendar cita, pedir receta, contactar médico)
- Next appointment card
- Medical alerts/reminders
- Treatment progress tracking

### Reference Pattern
Doctor dashboard at `src/features/doctor-dashboard/` provides the model:
- `types/index.ts` — interfaces and type definitions
- `hooks/useDoctor*.ts` — mock data hooks (TanStack Query ready)
- `components/*.tsx` — individual components
- `index.ts` — barrel export
- Notion-style aesthetic: teal primary, slate borders, white cards, soft shadows
