# Spec: Doctor Dashboard Redesign

## Acceptance Criteria

### AC1: Zero Shadows
`grep -r "shadow-" src/features/doctor-dashboard/` returns empty

### AC2: Zero Luca Tokens
`grep -r "luca-" src/features/doctor-dashboard/` returns empty

### AC3: Design Tokens
- Icons: `text-pharmako-care` / `bg-pharmako-care-light`
- Primary buttons: `bg-blue-700 text-white`
- Card borders: `border-slate-200`
- Card backgrounds: `bg-white` (solid, no opacity)
- Status: pharmako-care (en curso), emerald (completado), amber (pendiente)

### AC4: DoctorGreeting
- "Hola, Dr. [name]" with "Médico" badge + date
- Matches patient/pharmacy/clinic greeting pattern

### AC5: 3-View Switcher Preserved
- ResumenView, PatientFlowView, FollowUpView all functional
- DashboardSwitcher tabs work

### AC6: Build & Lint
- Zero new TS errors
- Zero lint errors in doctor-dashboard
