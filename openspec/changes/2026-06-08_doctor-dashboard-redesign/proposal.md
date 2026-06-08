# Proposal: Doctor Dashboard Redesign

**Change ID:** doctor-dashboard-redesign

## Problem
Doctor dashboard uses old LUCA tokens and shadows everywhere. It's the only dashboard not aligned with the Notion-isomatic system.

## Solution
Redesign all components to match patient/pharmacy/clinic pattern, while preserving the 3-view switcher architecture.

### Changes
1. **Add DoctorGreeting** — "Hola, Dr. [name]" + "Médico" badge + date
2. **Remove all shadows** — 15 occurrences across 11 components
3. **Replace luca-* tokens** — 11 occurrences across 4 components
4. **Standardize cards** — `bg-white border-slate-200` (no backdrop-blur, no /70 opacity)
5. **Standardize buttons** — `bg-blue-700` primary, `border-slate-200` secondary
6. **Standardize status badges** — pharmako-care, emerald, amber patterns

### What Stays the Same
- 3-view switcher (Resumen, Flujo Pacientes, Seguimiento)
- Hook architecture
- Component tree
- DashboardPage wiring

### Out of Scope
- New views or components
- Real API integration
- Mobile drawer/BottomNav (shared components)
