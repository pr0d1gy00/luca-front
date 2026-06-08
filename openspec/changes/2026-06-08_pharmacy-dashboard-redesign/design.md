# Design: Pharmacy Dashboard Redesign

**Change ID:** pharmacy-dashboard-redesign

## Styling Contract

| Element | Old | New |
|---------|-----|-----|
| Icon | `text-luca-primary` | `text-pharmako-care` |
| Icon wrapper | `bg-luca-primary/10` | `bg-pharmako-care-light` |
| Primary button | `bg-luca-primary text-luca-fg-on-primary` | `bg-blue-700 text-white` |
| Card border | `border-slate-100` | `border-slate-200` |
| Card shadow | `shadow-sm hover:shadow-md` | (none) |
| Muted text | `text-luca-muted` | `text-slate-500` |
| Accent badge | `bg-luca-accent` | `bg-blue-700` |

## Component Changes

### PharmacyHeader → PharmacyGreeting
Remove bell icon, CTA button. Keep greeting + date, add "Farmacia" badge.
```
"Buenos días, Farmacia Central" [Farmacia]
"lunes 8 de junio de 2026"
```

### KpiCard
- Remove shadow classes
- Replace luca tokens with pharmako/blue
- Fix TrendDirection logic to match patient-dashboard pattern

### OrderAgenda
- Remove shadow classes
- Replace luca token on heading icon

### QuickActions
- Extract data to `usePharmacyQuickActions` hook
- Remove shadow classes
- Button styling: primary `bg-blue-700`, secondary `border-slate-200`, outline same

### CriticalNotifications
- Remove shadow classes
- Replace `bg-luca-accent` on count badge with `bg-blue-700`

### Types
- `TrendDirection`: `"lower-is-better" | "higher-is-better"` → `"up" | "down" | "stable"`
- `QuickActionVariant` stays the same

## Estimated Impact
~200-300 lines changed across 8-10 files. Single PR.
