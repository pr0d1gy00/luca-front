# Tasks: Clinic Dashboard

- [ ] **1. Create types** — `src/features/clinic-dashboard/types/index.ts` with ClinicKPI, ClinicConsultation, ClinicDoctor, ClinicQuickAction
- [ ] **2. useClinicGreeting** — name from auth (fallback "Clínica") + date ES
- [ ] **3. useClinicKPIs** — 4 KPIs: consultas hoy (12), doctores activos (4), pacientes atendidos (28), recetas emitidas (9)
- [ ] **4. useClinicConsultations** — 6 today consultations with patient, doctor, time, type, status
- [ ] **5. useClinicDoctors** — 4 doctors on duty with name, specialty, patients seen, status
- [ ] **6. useClinicActions** — 3 quick actions: Nueva consulta, Gestionar doctores, Reporte
- [ ] **7. ClinicGreeting** — greeting + "Clínica" badge + date
- [ ] **8. ClinicKpiCard + ClinicKpiCards** — 4 KPI grid
- [ ] **9. TodayAgenda** — consultation list with status badges
- [ ] **10. DoctorsList** — doctor cards with specialty + patient count
- [ ] **11. ClinicQuickActions** — 3 action buttons
- [ ] **12. ClinicDashboard** — composition root with stagger animations
- [ ] **13. Barrel export** — `index.ts`
- [ ] **14. Wire DashboardPage** — `role === "clinic"` → `<ClinicDashboard />`
- [ ] **15. Verify zero shadows** — `grep -r "shadow-" src/features/clinic-dashboard/`
- [ ] **16. Verify build + lint** — zero errors
