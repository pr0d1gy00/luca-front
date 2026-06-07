# Tasks: Patient Dashboard

**Change ID:** patient-dashboard
**Date:** 2026-06-07
**Status:** tasks-defined

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~935 |
| 400-line budget risk | High |
| Chained PRs required | Yes |
| Delivery strategy | feature-branch-chain |

### Suggested Work Units

| Unit | Goal | PR | ~Lines |
|------|------|-----|--------|
| 1 | Types + data hooks (foundation) | PR 1 | ~310 |
| 2 | UI components + integration + cleanup | PR 2 | ~625 |

---

## PR 1: Foundation — Types + Hooks (~310 lines)

### Phase 1.1 — Types

- [ ] **1.1.1** Create `src/features/patient-dashboard/types/index.ts` — Define PatientKPI, Appointment, Treatment, VitalSign, Consultation, QuickAction interfaces and TrendDirection union type

### Phase 1.2 — Data Hooks

- [ ] **1.2.1** Create `src/features/patient-dashboard/hooks/usePatientGreeting.ts` — Returns `{ name, date }` from auth store name (fallback "Paciente") + Intl formatted date in ES
- [ ] **1.2.2** Create `src/features/patient-dashboard/hooks/usePatientKPIs.ts` — Returns `PatientKPI[]` mock: Próximas Citas (3), Tratamientos Activos (2), Laboratorios Pendientes (1), Recetas Activas (2). Icons: Calendar, Pill, FlaskConical, ClipboardList
- [ ] **1.2.3** Create `src/features/patient-dashboard/hooks/usePatientAppointments.ts` — Returns `Appointment[]` mock: 2 upcoming appointments with doctor name, specialty, type, date, time, location, status
- [ ] **1.2.4** Create `src/features/patient-dashboard/hooks/usePatientVitals.ts` — Returns `VitalSign[]` mock: Presión Arterial (120/80, stable), Frecuencia Cardíaca (72, stable), Temperatura (38.5, alert), Saturación O₂ (98, stable). Icons: Heart, Heart, Thermometer, Waves
- [ ] **1.2.5** Create `src/features/patient-dashboard/hooks/usePatientTreatments.ts` — Returns `Treatment[]` mock: Amoxicilina 500mg (active, 5/7 days), Ibuprofeno 400mg (active, 2/5 days). Includes medication, dosage, frequency, duration, progress %, status, nextDose
- [ ] **1.2.6** Create `src/features/patient-dashboard/hooks/usePatientConsultations.ts` — Returns `Consultation[]` mock: 3 past consultations (Consulta General Oct 12, Revisión General Oct 15, Dermatología Nov 2) with reason and diagnosis
- [ ] **1.2.7** Create `src/features/patient-dashboard/hooks/usePatientActions.ts` — Returns `QuickAction[]` mock: Agendar cita (CalendarPlus, primary), Pedir receta (Pill, secondary), Contactar médico (MessageSquare, outline)

### Phase 1.3 — Verify Foundation

- [ ] **1.3.1** Run `npm run build` — TypeScript compiles cleanly with types + hooks only
- [ ] **1.3.2** Run `npm run lint` — Zero errors

---

## PR 2: Components + Integration (~625 lines)

### Phase 2.1 — New Components

- [ ] **2.1.1** Create `src/features/patient-dashboard/components/PatientGreeting.tsx` — "Hola, [name]" in text-2xl font-bold text-slate-900, role badge (bg-teal-50 text-teal-600), date in text-sm text-slate-500. No shadows, no card wrapper
- [ ] **2.1.2** Create `src/features/patient-dashboard/components/PatientKpiCard.tsx` — Single KPI: icon wrapper (bg-teal-50 rounded-xl p-3), value (text-3xl font-bold text-slate-900), label (text-sm text-slate-500), optional trend badge. No shadows, border-slate-100
- [ ] **2.1.3** Create `src/features/patient-dashboard/components/PatientKpiCards.tsx` — Grid wrapper: grid-cols-2 lg:grid-cols-4 gap-4. Maps PatientKPI[] → PatientKpiCard[]. staggerChildrenVariant for entry
- [ ] **2.1.4** Create `src/features/patient-dashboard/components/NextAppointmentCard.tsx` — Card with doctor name, type, date/time, location badge (presencial/virtual). Empty state with Calendar icon. "Ver todas →" link. No shadows
- [ ] **2.1.5** Create `src/features/patient-dashboard/components/PatientQuickActions.tsx` — 3 action buttons in flex row. Agendar cita (primary, bg-teal-600), Pedir receta (secondary, border), Contactar médico (outline). staggerChildrenVariant. No shadows

### Phase 2.2 — Migrate + Refine Existing Components

- [ ] **2.2.1** Create `src/features/patient-dashboard/components/ActiveTreatment.tsx` — Migrate from `src/app/dashboard/ActiveTreatment.tsx`. Accept `Treatment[]` prop. Refine: lucide Pill icon, teal primary colors, no shadows, dynamic list (not duplicate), progress bar, empty state
- [ ] **2.2.2** Create `src/features/patient-dashboard/components/VitalSigns.tsx` — Migrate from `src/app/dashboard/VitalSigns.tsx`. Accept `VitalSign[]` prop. Refine: desduplicate render code, slate borders, emerald/amber status, no shadows, responsive grid
- [ ] **2.2.3** Create `src/features/patient-dashboard/components/ConsultationHistory.tsx` — Migrate from `src/app/dashboard/ConsultationHistory.tsx`. Accept `Consultation[]` prop. Refine: teal nodes instead of green-950, slate text, no shadows, linear list on mobile

### Phase 2.3 — Composition + Integration

- [ ] **2.3.1** Create `src/features/patient-dashboard/components/PatientDashboard.tsx` — Composition root. Calls all hooks, distributes arrays as props to child components. staggerChildrenVariant parent. Vertical layout with gap-8
- [ ] **2.3.2** Create `src/features/patient-dashboard/index.ts` — Barrel export: `export { PatientDashboard } from "./components/PatientDashboard"`
- [ ] **2.3.3** Modify `src/app/dashboard/page.tsx` — Add `role === "patient"` branch → `<PatientDashboard />`. Remove old inline components and empty placeholder div. Import PatientDashboard from `@/features/patient-dashboard`
- [ ] **2.3.4** Delete migrated files: `src/app/dashboard/ActiveTreatment.tsx`, `src/app/dashboard/VitalSigns.tsx`, `src/app/dashboard/ConsultationHistory.tsx`

### Phase 2.4 — Verify

- [ ] **2.4.1** Run `npm run build` — TypeScript compiles cleanly
- [ ] **2.4.2** Run `npm run lint` — Zero errors
- [ ] **2.4.3** Manual verification: zero shadow classes in patient-dashboard feature folder. Run: `grep -r "shadow-" src/features/patient-dashboard/` returns empty
