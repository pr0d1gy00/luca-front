# Tasks: Dashboard Structure Redesign

## Implementation

- [ ] **1. Extend types** — Add NextPatient, PatientAlert, ActionItem interfaces to types/index.ts
- [ ] **2. Create mock hooks** — useDoctorNextPatient, useDoctorActions with mock data including medical alerts
- [ ] **3. Create DashboardSwitcher** — pill tabs component with localStorage persistence
- [ ] **4. Create NextPatientCard** — shows name, time, type, medical alerts (colored chips)
- [ ] **5. Create ActionChecklist** — interactive checklist with completion toggle, strikethrough animation
- [ ] **6. Create ResumenView** — briefing + next patient + checklist + agenda + quick actions
- [ ] **7. Create PatientFlowView** — waiting → current → post-consultation columns
- [ ] **8. Create FollowUpView** — smart summary + compact next patient + compact actions
- [ ] **9. Rewrite DoctorDashboard** — use DashboardSwitcher + conditional view rendering
- [ ] **10. Verify build** — npm run build passes
