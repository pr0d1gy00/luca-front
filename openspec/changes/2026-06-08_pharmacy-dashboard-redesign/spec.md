# Spec: Pharmacy Dashboard Redesign

**Change ID:** pharmacy-dashboard-redesign

## Acceptance Criteria

### AC1: Zero Shadows
- `grep -r "shadow-" src/features/pharmacy-dashboard/` returns empty

### AC2: Design Tokens
- Icons use `text-pharmako-care` with `bg-pharmako-care-light` wrappers
- Primary buttons use `bg-blue-700 text-white hover:bg-blue-800`
- Links use `text-blue-700 hover:text-blue-800`
- Card borders use `border-slate-200`
- Headings `text-slate-900`, secondary text `text-slate-500`
- Zero references to `luca-primary`, `luca-muted`, `luca-accent`, `luca-fg-on-primary` in pharmacy-dashboard

### AC3: PharmacyGreeting
- Follows `PatientGreeting` pattern: name + role badge + date
- Badge text: "Farmacia"
- Name from auth store, fallback "Farmacia"

### AC4: QuickActions as Hook
- Create `usePharmacyQuickActions.ts` returning typed `QuickAction[]`
- Remove inline `PHARMACY_ACTIONS` constant from component

### AC5: TrendDirection Standardized
- `TrendDirection` type: `"up" | "down" | "stable"`
- KpiCard trend colors match patient-dashboard (emerald up, amber down, slate stable)

### AC6: Build & Lint
- `npx tsc --noEmit` — zero new errors in pharmacy-dashboard
- `npx eslint src/features/pharmacy-dashboard/` — zero errors
