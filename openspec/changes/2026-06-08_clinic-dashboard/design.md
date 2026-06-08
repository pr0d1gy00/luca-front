# Design: Clinic Dashboard

## Types
```typescript
ClinicKPI { id, label, value, unit?, icon, trend?, trendLabel? }
ClinicConsultation { id, patientName, doctorName, time, type, status }
ClinicDoctor { id, name, specialty, avatarUrl?, patientsSeen, status }
ClinicQuickAction { id, label, icon, variant, href }
```

## Component Tree
```
ClinicDashboard
├── ClinicGreeting (useClinicGreeting)
├── ClinicKpiCards (useClinicKPIs)
│   └── ClinicKpiCard × 4
├── Grid 2-col
│   ├── TodayAgenda (useClinicConsultations)
│   │   └── AgendaItem rows
│   └── DoctorsList (useClinicDoctors)
│       └── DoctorRow cards
└── ClinicQuickActions (useClinicActions)
    └── QuickActionButton × 3
```

## Hooks
- `useClinicGreeting` → { name, date }
- `useClinicKPIs` → ClinicKPI[] (4 items)
- `useClinicConsultations` → ClinicConsultation[] (6 items)
- `useClinicDoctors` → ClinicDoctor[] (4 items)
- `useClinicActions` → ClinicQuickAction[] (3 items)

## Styling Contract (Same as patient/pharmacy)
| Element | Classes |
|---------|---------|
| Card | `bg-white rounded-2xl border border-slate-200 p-6` |
| Icon wrapper | `bg-pharmako-care-light rounded-xl p-3` |
| Icon | `text-pharmako-care` |
| Heading | `text-lg font-semibold text-slate-900` |
| KPI value | `text-3xl font-bold text-slate-900` |
| Primary btn | `bg-blue-700 text-white rounded-xl px-4 py-2` |
| Status: active | `bg-emerald-50 text-emerald-600` |
| Status: busy | `bg-amber-50 text-amber-600` |
| Empty state | centered icon + text, bg-slate-50 icon bg |

## Estimated Impact
~12 files, ~500 lines. Single PR (under review budget).
