# Spec: Clinic Dashboard

## Functional Requirements

### FR1: ClinicGreeting
- "Buenos días/tardes/noches, [clinicName]" from auth store (fallback "Clínica")
- "Clínica" badge: `bg-pharmako-care-light text-pharmako-care`
- Date formatted in Spanish

### FR2: KPIs
- Consultas hoy: count + trend
- Doctores activos: count
- Pacientes atendidos: total today + trend
- Recetas emitidas: count
- Icons: Stethoscope, Users, UserCheck, ClipboardList

### FR3: TodayAgenda
- List of today's consultations (appointments at the clinic)
- Each row: patient name, doctor name, time, status badge
- Empty state: "No hay consultas programadas para hoy"

### FR4: DoctorsList
- List of doctors on duty
- Each row: name, specialty, patients seen today, status (available/busy)
- Empty state: "No hay doctores activos"

### FR5: ClinicQuickActions
- 3 actions: Nueva consulta (primary), Gestionar doctores (secondary), Reporte del día (outline)
- Icons: Plus, Users, FileText

### FR6: ClinicDashboard
- Composition root, calls hooks, distributes props
- staggerChildrenVariant animations
- Matches patient/pharmacy dashboard layout pattern

### FR7: DashboardPage Wiring
- `role === "clinic"` → `<ClinicDashboard />`

## Non-Functional

### NFR1: Design
- Zero shadows across all components
- pharmako-care icons, blue-700 buttons
- border-slate-200 cards, white backgrounds

### NFR2: Build
- `npx tsc --noEmit` zero errors in clinic-dashboard
- `npx eslint src/features/clinic-dashboard/` zero errors
