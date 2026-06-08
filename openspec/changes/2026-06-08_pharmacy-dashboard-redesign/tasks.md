# Tasks: Pharmacy Dashboard Redesign

- [ ] **1. Update types** — Change TrendDirection to `"up" | "down" | "stable"` in types/index.ts
- [ ] **2. Update hooks** — Fix usePharmacyKPIs to use new TrendDirection values
- [ ] **3. Create usePharmacyQuickActions hook** — Extract inline data from QuickActions.tsx
- [ ] **4. Redesign PharmacyHeader → PharmacyGreeting** — Remove bell/CTA, add role badge, match PatientGreeting pattern
- [ ] **5. Redesign KpiCard** — Zero shadows, pharmako-care icons, blue-700, slate borders, fix trend logic
- [ ] **6. Redesign OrderAgenda** — Zero shadows, pharmako-care heading icon
- [ ] **7. Redesign QuickActions** — Zero shadows, use hook, blue-700 primary, border-slate-200
- [ ] **8. Redesign CriticalNotifications** — Zero shadows, bg-blue-700 count badge
- [ ] **9. Redesign NotificationAlert** — Zero shadows, blue-700 action link
- [ ] **10. Update PharmacyDashboard** — Remove Container wrapper, use PharmacyGreeting
- [ ] **11. Verify zero shadows** — `grep -r "shadow-" src/features/pharmacy-dashboard/` returns empty
- [ ] **12. Verify build** — `npx tsc --noEmit` zero new errors
- [ ] **13. Verify lint** — `npx eslint src/features/pharmacy-dashboard/` zero errors
