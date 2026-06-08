# Init: Clinic Dashboard

**Change ID:** clinic-dashboard
**Created:** 2026-06-08
**Status:** init

## Scope
Build `src/features/clinic-dashboard/` from scratch. The clinic role currently hits a "Dashboard no disponible" fallback.

## Context
- Patient, doctor, and pharmacy dashboards are complete with SDD
- Clinic role exists in auth store but has no dashboard
- DB schema supports clinic: Clinic table, ClinicMember (doctors/staff), Consultation.clinicId, Prescription.clinicId
