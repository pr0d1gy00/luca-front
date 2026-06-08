# Explore: Doctor Dashboard Redesign

## Shadow Inventory
| Component | Shadow |
|-----------|--------|
| ActionChecklist | `shadow-sm` ×2 |
| BottomNav | `shadow-[0_-1px_3px]` |
| CriticalNotifications | `shadow-sm` |
| DailyAgenda | `shadow-sm` |
| FollowUpView | `shadow-sm` |
| KpiCard | `shadow-sm hover:shadow-md` |
| MobileDrawer | `shadow-xl` |
| NextPatientCard | `shadow-sm` |
| PatientFlowView | `shadow-sm` ×3 |
| QuickActionButton | `shadow-sm hover:shadow-md` ×2 |
| ResumenView | `shadow-sm` |

## Luca Token Inventory
| File | Token |
|------|-------|
| AgendaItem | `luca-primary`, `luca-muted` |
| BottomNav | `luca-primary` ×3 |
| MobileDrawer | `luca-surface`, `luca-muted-dark` |
| StatusBadge | `luca-accent`, `luca-primary`, `luca-muted` |

## What Stays
- DashboardSwitcher (3-view pill tabs)
- ResumenView / PatientFlowView / FollowUpView architecture
- Mock data hooks
- Types
- Barrel export + DashboardPage wiring

## What Changes
- All shadows → removed
- All luca-* → pharmako-care / blue-700 / slate-*
- Add DoctorGreeting component
- Standardize border: `border-slate-200`
- Standardize card bg: `bg-white` (no backdrop-blur, no /70 opacity)
