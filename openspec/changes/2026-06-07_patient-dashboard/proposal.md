# Proposal: Patient Dashboard

**Change ID:** patient-dashboard
**Date:** 2026-06-07
**Status:** proposed

## Problem Statement
The patient role has no real dashboard. The current `DashboardPage` fallback renders 3 hardcoded components (ActiveTreatment, VitalSigns, ConsultationHistory) with:
- Inconsistent color palette (orange-400, green-950, gray-300)
- No TypeScript types or data hooks
- Zero personalization (no greeting, no patient name)
- No KPIs, quick actions, or next appointment
- Components in `src/app/dashboard/` violating feature-based architecture
- No responsive design
- An empty placeholder div

## Proposed Solution
Build `src/features/patient-dashboard/` following the established doctor/pharmacy dashboard pattern:

### Feature Structure
```
src/features/patient-dashboard/
├── types/index.ts
├── hooks/
│   ├── usePatientGreeting.ts
│   ├── usePatientKPIs.ts
│   ├── usePatientAppointments.ts
│   ├── usePatientVitals.ts
│   ├── usePatientTreatments.ts
│   ├── usePatientConsultations.ts
│   └── usePatientActions.ts
├── components/
│   ├── PatientGreeting.tsx
│   ├── PatientKpiCard.tsx / PatientKpiCards.tsx
│   ├── NextAppointmentCard.tsx
│   ├── PatientQuickActions.tsx
│   ├── ActiveTreatment.tsx (migrated + refined)
│   ├── VitalSigns.tsx (migrated + refined)
│   ├── ConsultationHistory.tsx (migrated + refined)
│   └── PatientDashboard.tsx (composition root)
└── index.ts
```

### Design Constraints (Strict)
- **No shadows** — no `shadow-sm`, `shadow-md`, or any box-shadow
- **Notion-isomatic style** — `bg-slate-50` app bg, `bg-white` cards, `border-slate-100/200` subtle borders, `rounded-xl/2xl`
- **Teal primary** — `bg-teal-600`, `text-teal-600` for actions and accents
- **Slate typography** — `text-slate-900` primary, `text-slate-500` secondary
- **Lucide icons only** — remove `react-icons/ai` dependency
- **Generous spacing** — `p-6` or `p-8` on cards

### Layout (Desktop)
```
┌──────────────────────────────────────────────────┐
│  👋 Greeting + Role Badge + Date                 │
├──────────┬──────────┬──────────┬─────────────────┤
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4          │
├──────────┴──────────┴──────────┴─────────────────┤
│  Next Appointment        │  Quick Actions         │
├──────────────────────────┴────────────────────────┤
│  Active Treatment        │  Vital Signs           │
├───────────────────────────────────────────────────┤
│  Consultation History (full width)                │
└───────────────────────────────────────────────────┘
```

### Out of Scope
- Real API/backend integration (mock data hooks, TanStack Query ready)
- Clinic dashboard (continues using patient fallback for now)
- Push notifications / WebSocket
- Full medical history page
- Dark mode

### Success Criteria
1. All 3 legacy components migrated and refined to Notion-isometric style
2. New greeting, KPIs, next appointment, and quick actions components
3. Zero shadows across all components
4. Consistent lucide-react icons (no react-icons)
5. TypeScript types defined for all data
6. Mock data hooks following doctor dashboard pattern
7. Barrel export wired into `DashboardPage`
8. `npm run build` passes
