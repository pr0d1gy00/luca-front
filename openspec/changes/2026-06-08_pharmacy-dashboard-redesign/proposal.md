# Proposal: Pharmacy Dashboard Redesign

**Change ID:** pharmacy-dashboard-redesign
**Date:** 2026-06-08

## Problem
Pharmacy dashboard uses old LUCA design tokens, shadows everywhere, self-contained header, and inconsistent patterns compared to recently redesigned patient/doctor dashboards.

## Solution
Redesign all pharmacy dashboard components to Notion-isomatic style matching the patient-dashboard pattern:

### Changes
1. **Zero shadows** — Remove `shadow-sm`, `hover:shadow-md` from all 5 card components
2. **Design tokens** — Replace old LUCA tokens with current system:
   - Icons: `text-pharmako-care` / `bg-pharmako-care-light`
   - Buttons: `bg-blue-700` / `text-blue-700`
   - Borders: `border-slate-200`
   - Text: `text-slate-900` (headings), `text-slate-500` (secondary)
3. **PharmacyHeader → PharmacyGreeting** — Follow patient pattern: name + date only, no CTA, no bell (sidebar handles all)
4. **QuickActions → hook** — Extract inline data to `usePharmacyQuickActions.ts`
5. **TrendDirection** — Align with standard `up`/`down`/`stable` (currently uses `lower-is-better`/`higher-is-better`)
6. **Remove Container wrapper** — PharmacyDashboard shouldn't wrap in Container (layout handles it)

### Out of Scope
- New components
- Real API/backend integration
- Notification system changes
