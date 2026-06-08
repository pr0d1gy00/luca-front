# Design: Doctor Dashboard Redesign

## Token Mapping
| Old | New |
|-----|-----|
| `shadow-sm` | (remove) |
| `shadow-md` | (remove) |
| `shadow-xl` | (remove) |
| `bg-luca-primary/10 text-luca-primary` | `bg-pharmako-care-light text-pharmako-care` |
| `bg-luca-accent/10 text-luca-accent` | `bg-emerald-50 text-emerald-600` |
| `text-luca-muted` | `text-slate-500` |
| `text-luca-primary` | `text-blue-700` |
| `bg-luca-surface` | `bg-white` |
| `bg-white/70 backdrop-blur-sm` | `bg-white` |
| `border-slate-100/80` | `border-slate-200` |
| `hover:bg-luca-surface-dark/50` | `hover:bg-slate-100` |

## Component Changes
- **DoctorGreeting** (new) — matches patient/pharmacy/clinic pattern
- **DoctorDashboard** — add greeting, keep switcher + views
- **All cards** — remove shadows, remove backdrop-blur, solid bg-white
- **StatusBadge** — align with pharmako-care / emerald / amber
- **AgendaItem** — pharmako-care avatar + slate text
- **BottomNav** — blue-700 active color (keep shadow for bottom nav UX)
- **MobileDrawer** — bg-white (remove shadow-xl, keep for drawer)
- **KpiCard** — remove shadows, pharmako-care icons, slate borders
- **QuickActionButton** — remove shadows, blue-700 primary
- **DashboardSwitcher** — restyle tabs
