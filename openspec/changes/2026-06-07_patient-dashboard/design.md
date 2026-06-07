# Design: Patient Dashboard

**Change ID:** patient-dashboard
**Date:** 2026-06-07
**Status:** designed

## Component Tree

```
PatientDashboard
├── PatientGreeting
│   └── (useAuthStore.name, role)
├── PatientKpiCards
│   ├── PatientKpiCard × 4
│   │   └── (PatientKPI from usePatientKPIs)
│   └── usePatientKPIs()
├── NextAppointmentCard
│   └── usePatientAppointments()
├── PatientQuickActions
│   └── usePatientActions()
├── ActiveTreatment
│   └── usePatientTreatments()
├── VitalSigns
│   └── usePatientVitals()
└── ConsultationHistory
    └── usePatientConsultations()
```

## Data Flow

```
useAuthStore ──→ PatientGreeting (name, role)
usePatientKPIs ──→ PatientKpiCards → PatientKpiCard[]
usePatientAppointments ──→ NextAppointmentCard
usePatientActions ──→ PatientQuickActions → QuickActionButton[]
usePatientTreatments ──→ ActiveTreatment
usePatientVitals ──→ VitalSigns
usePatientConsultations ──→ ConsultationHistory
```

Pattern: Hooks called in `PatientDashboard`, results passed as props. This keeps components pure and testable.

## Type Definitions

```typescript
// types/index.ts

export type TrendDirection = "up" | "down" | "stable";

export interface PatientKPI {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon: LucideIcon;
  trend?: TrendDirection;
  trendLabel?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  type: string;        // "Control general", "Dermatología", etc.
  date: Date;
  time: string;        // "10:30"
  location: "presencial" | "virtual";
  status: "confirmed" | "pending" | "cancelled";
}

export interface Treatment {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  progress: number;     // 0-100
  status: "active" | "completed" | "paused";
  nextDose: string;
}

export interface VitalSign {
  id: string;
  name: string;
  value: string;
  unit: string;
  time: string;
  status: "stable" | "alert";
  icon: LucideIcon;
}

export interface Consultation {
  id: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  diagnosis: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant: "primary" | "secondary" | "outline";
  href: string;
}
```

## Styling Contract (Notion-Isomatic, Zero Shadows)

| Element | Classes |
|---------|---------|
| Card | `bg-white rounded-2xl border border-slate-100 p-6` |
| Card (compact) | `bg-white rounded-xl border border-slate-100 p-4` |
| Icon wrapper | `bg-teal-50 rounded-xl p-3` |
| KPI value | `text-3xl font-bold text-slate-900` |
| KPI label | `text-sm text-slate-500` |
| Heading | `text-lg font-semibold text-slate-900` |
| Body text | `text-sm text-slate-600` |
| Muted text | `text-xs text-slate-400` |
| Primary button | `bg-teal-600 text-white rounded-xl px-4 py-2 font-semibold` |
| Secondary button | `border border-slate-200 text-slate-700 rounded-xl px-4 py-2` |
| Success badge | `bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full px-2 py-0.5` |
| Warning badge | `bg-amber-50 text-amber-600 text-xs font-semibold rounded-full px-2 py-0.5` |
| Role badge | `bg-teal-50 text-teal-600 text-xs font-semibold rounded-full px-2.5 py-0.5` |
| Divider | `border-t border-slate-100` |

**Explicitly prohibited:** `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `drop-shadow`, arbitrary shadow values.

## Animations
- Use `fadeUpVariant` from `@/app/lib/animations` for section entry
- Use `staggerChildrenVariant` for lists (KPIs, quick actions)
- No hover scale on cards (minimalist)
- Smooth opacity transitions on hover: `hover:bg-slate-50 transition-colors`

## Tradeoffs

| Decision | Chosen | Alternative | Reasoning |
|----------|--------|-------------|-----------|
| Mock data hooks | Hooks returning static arrays | Inline constants | Follows doctor/pharmacy pattern; ready for TanStack Query migration |
| Props drilling | Hooks in parent, props to children | Each component calls its own hook | Pure components, easier to test, single source of truth for layout |
| VitalSigns layout | CSS Grid with auto-placement | Two-column slice as current | Desduplica JSX, easier to maintain, responsive naturally |
| Consultation timeline | Keep alternating but fix colors | Convert to simple list | Preserves original UX intent; only fix the styling debt |
| No shadows anywhere | Strict enforcement | Allow subtle shadows | User's explicit requirement; Notion-isomatic aesthetic |

## Mobile Strategy
- `<768px`: Single column, stacked vertically, sections in natural order
- `768-1024px`: KPIs 2×2 grid, treatment+vitals side-by-side
- `>1024px`: Full layout as designed
- Consultation timeline collapses to linear list on mobile (no alternating)
