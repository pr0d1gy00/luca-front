# Proposal: Doctor ResumenView Redesign

## Problem
ResumenView has an inline custom KPI ("Pacientes Hoy") instead of using the shared `DoctorKpiCard`/`DoctorKpiCards` pattern. Layout hierarchy could be improved.

## Solution
- Replace inline KPI with `KpiCards` component (already exists in doctor-dashboard)
- Reorganize layout: KPIs → Next Patient + Checklist → Agenda + Quick Actions
- Better visual rhythm with consistent card sizes

## Layout
```
┌──────────────────────────────────────────────┐
│  KPI 1    │  KPI 2    │  KPI 3    │  KPI 4   │
├────────────────────────┬─────────────────────┤
│  📌 Próximo Paciente   │  ✅ Acciones         │
│  (con alertas médicas) │  (checklist)         │
├────────────────────────┴─────────────────────┤
│  📅 Agenda de hoy       │  ⚡ Acciones rápidas │
└────────────────────────┴─────────────────────┘
```
