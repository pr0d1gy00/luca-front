# Tasks: Consultations Module

## PR 1 — Redesign + List Page (~300 lines)

### Phase 1: Redesign
- [ ] **1.1** Bulk sed: shadow → remove, luca-* → pharmako-care / blue-700 / slate
- [ ] **1.2** Fix DigitalPrescriptionCard Badge import
- [ ] **1.3** Verify zero shadows + zero luca tokens
- [ ] **1.4** Verify build + lint

### Phase 2: Consultation List
- [ ] **2.1** Create `useConsultationList` hook — mock consultations data
- [ ] **2.2** Create `ConsultationListPage` — route `/dashboard/consultations/page.tsx`
- [ ] **2.3** Wire into navigation (sidebar link to consultations)
- [ ] **2.4** Empty state, status badges, click → detail

## PR 2 — Detail Page (~200 lines)

- [ ] **3.1** Create `useConsultationDetail` hook — mock consultation by ID
- [ ] **3.2** Create `ConsultationDetailPage` — route `/dashboard/consultations/[id]/page.tsx`
- [ ] **3.3** Compose PatientContextCard + ConsultationTabs + DigitalPrescriptionCard
- [ ] **3.4** Verify build + lint
