# Explore: Pharmacy Dashboard Redesign

## Current State Audit

### Design Debt
| Issue | Affected Files |
|-------|---------------|
| `shadow-sm` + `hover:shadow-md` on all 5 cards | KpiCard, KpiCards, OrderAgenda, QuickActions, CriticalNotifications |
| Old LUCA tokens: `text-luca-primary`, `bg-luca-primary/10`, `text-luca-muted`, `bg-luca-accent` | All components |
| Inline action data in QuickActions (not a hook) | QuickActions.tsx |
| Self-contained header with greeting + CTA button | PharmacyHeader.tsx |
| Different TrendDirection model (`lower-is-better`/`higher-is-better`) | types/index.ts, KpiCard.tsx |

### What's Good (Keep)
- Clean component decomposition: KpiCard, OrderAgenda, QuickActions, CriticalNotifications, NotificationAlert
- Mock data hooks pattern (usePharmacyKPIs, usePharmacyOrders, usePharmacyNotifications)
- Stagger animations
- Types defined
- Barrel export + DashboardPage wiring

### Reference Pattern
`src/features/patient-dashboard/` — the recently redesigned dashboard using:
- Zero shadows
- `text-pharmako-care` for icons, `bg-pharmako-care-light` for icon wrappers
- `bg-blue-700` for primary buttons, `text-blue-700` for links
- `border-slate-200` for card borders
- Greeting as separate component with date formatting
- Consistent type patterns (TrendDirection: `up`/`down`/`stable`)
