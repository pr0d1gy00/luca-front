# Init: Patient Dashboard

**Change ID:** patient-dashboard
**Created:** 2026-06-07
**Status:** init
**Mode:** interactive
**Artifact store:** openspec + engram
**PR strategy:** single-pr-default
**Review budget:** 400 lines

## Scope
Build a complete patient-facing dashboard under `src/features/patient-dashboard/`, replacing the current bare-bones fallback in `src/app/dashboard/page.tsx`.

## Context
- The app has 4 roles: patient, doctor, clinic, pharmacy
- Doctor and pharmacy dashboards are already feature-complete with SDD workflows
- Patient dashboard is currently a minimal fallback with 3 hardcoded components + an empty placeholder
- Components live in `src/app/dashboard/` instead of a feature folder
- No data hooks, no types, no responsive design

## Goals
1. Migrate existing components to `src/features/patient-dashboard/`
2. Add greeting, KPIs, next appointment, quick actions
3. Refine existing components (ActiveTreatment, VitalSigns, ConsultationHistory) to Notion-style
4. Create mock data hooks following the pattern established by doctor/pharmacy dashboards
5. Wire into `DashboardPage` with role-based routing
