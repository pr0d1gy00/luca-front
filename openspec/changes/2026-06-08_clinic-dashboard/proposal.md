# Proposal: Clinic Dashboard

**Change ID:** clinic-dashboard
**Date:** 2026-06-08

## Problem
The clinic role has no dashboard — shows "Dashboard no disponible". Clinics need to see their daily operations: consultations, doctors on duty, and quick actions.

## Solution
Build `src/features/clinic-dashboard/` following the patient/doctor/pharmacy pattern.

### Components
| Component | Purpose |
|-----------|---------|
| `ClinicGreeting` | "Buenos días, Clínica [name]" + "Clínica" badge + date |
| `ClinicKpiCard` / `ClinicKpiCards` | 4 KPIs: Consultas hoy, Doctores activos, Pacientes atendidos, Recetas emitidas |
| `TodayAgenda` | List of today's consultations with patient, doctor, time, status |
| `DoctorsList` | Doctors on duty with name, specialty, patients seen today |
| `ClinicQuickActions` | Nueva consulta, Gestionar doctores, Reporte del día |
| `ClinicDashboard` | Composition root |

### Design Constraints
- Zero shadows (no `shadow-sm`, `shadow-md`, etc.)
- `text-pharmako-care` icons, `bg-pharmako-care-light` wrappers
- `bg-blue-700` primary buttons, `text-blue-700` links
- `border-slate-200` card borders
- `bg-white` cards, `text-slate-900` headings

### Layout
```
┌──────────────────────────────────────────────────┐
│  👋 Greeting + Clínica badge + Date              │
├──────────┬──────────┬──────────┬─────────────────┤
│  KPI 1   │  KPI 2   │  KPI 3   │  KPI 4          │
├──────────────────────────┬───────────────────────┤
│  📋 Consultas de hoy     │  👨‍⚕️ Doctores activos  │
├──────────────────────────┴───────────────────────┤
│  ⚡ Acciones rápidas                              │
└──────────────────────────────────────────────────┘
```

### Out of Scope
- Real API/backend integration
- Clinic management (add/remove doctors) — just display
- Financial reports
- Patient search
