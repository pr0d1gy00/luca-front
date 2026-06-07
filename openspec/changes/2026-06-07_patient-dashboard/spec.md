# Spec: Patient Dashboard

**Change ID:** patient-dashboard
**Date:** 2026-06-07
**Status:** specified

## Functional Requirements

### FR1: Patient Greeting
- Display "Hola, [nombre]" with patient name from auth store
- Show role badge ("Paciente") in teal pill
- Show current date formatted in Spanish (e.g. "lunes 7 de junio de 2026")
- Graceful fallback: "Hola, Paciente" if name unavailable

### FR2: Health KPIs
- 4 KPI cards: Próximas Citas, Tratamientos Activos, Laboratorios Pendientes, Recetas Activas
- Each KPI shows: icon (teal circle bg), numeric value (large, slate-900), label (slate-500), optional trend (emerald down / amber up)
- Responsive grid: 2 cols mobile, 4 cols desktop

### FR3: Next Appointment
- Card showing next upcoming appointment
- Displays: doctor name, appointment type, date/time, location (presencial/virtual)
- Empty state: "No tenés citas programadas" with calendar icon
- CTA button: "Ver todas las citas →"

### FR4: Quick Actions
- 3 action buttons: Agendar cita, Pedir receta, Contactar médico
- Teal background for primary (Agendar cita), outline for others
- Icons from lucide-react: CalendarPlus, Pill, MessageSquare
- Links to respective pages/routes (stubs: /dashboard/citas, /dashboard/recetas, /dashboard/mensajes)

### FR5: Active Treatment (Migrated)
- Migrate from `src/app/dashboard/ActiveTreatment.tsx` to `src/features/patient-dashboard/components/`
- Accept `Treatment[]` prop from hook
- Notion-isomatic styling: white bg, border-slate-100, no shadows, `rounded-2xl`
- Show: medication name, dosage, frequency, duration, progress bar
- Replace `react-icons/ai` with lucide-react `Pill` icon
- Fix colors: teal primary, slate text, emerald "Activo" badge
- Remove duplicate identical card; support dynamic list
- Empty state: "No tenés tratamientos activos"

### FR6: Vital Signs (Migrated)
- Migrate from `src/app/dashboard/VitalSigns.tsx` to feature folder
- Accept `VitalSign[]` prop from hook
- Desduplicate render code: single map instead of two slices
- Fix colors: slate borders, emerald "Normal" / amber "Alerta"
- Notion-isomatic: white cards, border-slate-100, no shadows, `rounded-2xl`
- Keep timeline-like two-column layout on desktop, stack on mobile

### FR7: Consultation History (Migrated)
- Migrate from `src/app/dashboard/ConsultationHistory.tsx` to feature folder
- Accept `Consultation[]` prop from hook
- Fix colors: teal primary nodes instead of green-950, slate text instead of orange
- Notion-isomatic: white cards, border-slate-100, no shadows, `rounded-2xl`
- Keep alternating timeline layout on desktop, linear list on mobile

### FR8: PatientDashboard Composition Root
- Compose all sections vertically with generous gap
- Follows doctor dashboard pattern: calls hooks, distributes arrays as props
- Framer motion `staggerChildrenVariant` for entry
- Responsive: single column mobile, multi-column desktop

### FR9: DashboardPage Wiring
- Add `role === "patient"` branch in `DashboardPage` → `<PatientDashboard />`
- Remove old inline components and empty placeholder div
- Import `PatientDashboard` from barrel export

## Non-Functional Requirements

### NFR1: Design Consistency
- Zero box-shadows (`shadow-none` explicit or no shadow classes)
- `bg-white` cards, `border-slate-100` or `border-slate-200`
- `rounded-xl` or `rounded-2xl`
- Teal (`text-teal-600`, `bg-teal-600`) for primary actions
- Emerald (`text-emerald-600`, `bg-emerald-50`) for positive/stable
- Amber (`text-amber-600`, `bg-amber-50`) for warnings/alerts
- `text-slate-900` for headings, `text-slate-500` for secondary text
- Lucide-react icons only

### NFR2: TypeScript
- All components typed with explicit interfaces
- Hooks return typed objects
- No `any` types

### NFR3: Build
- `npm run build` passes without errors
- `npm run lint` passes without errors

### NFR4: Responsive
- Mobile (<768px): single column, stacked layout
- Tablet (768-1024px): 2-column where applicable
- Desktop (>1024px): full multi-column layout
