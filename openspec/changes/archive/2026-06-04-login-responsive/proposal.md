# Proposal: Responsive Login + Notion-Esque Style Refinement

## Intent

Fix the register tab ("Crear Cuenta") viewport overflow on 15" laptops (~768px height) and apply a Notion-esque aesthetic refinement across all login-related components. The visual treatment blends the existing primary blue (`#0057FF`) brand colors with a clean, shadow-free, neutral-surface aesthetic inspired by Notion's design language.

## Problem Statement

- The login form fits within the viewport, but the register form (profile selector + 5–7 fields) silently overflows on screens with ~768px height (1366×768, 1280×800).
- The right panel wrapper in `page.tsx` has no explicit height or overflow handling, causing content to flow unbounded below the fold.
- Multiple `shadow-*` classes are used across login components, conflicting with the desired Notion-esque "no shadows" aesthetic.
- Spacing (`space-y-6`, `gap-4`, `text-3xl`) is generous enough that register forms exceed available vertical space on common laptop resolutions.

## Scope

### In Scope
1. **Responsive overflow fix** — Add proper height constraints and `overflow-y-auto` to the right panel so register content scrolls gracefully when it exceeds viewport height.
2. **Shadow removal** — Remove all `shadow-*` classes from login-related components, replacing focus states with border-only styling.
3. **Spacing compression** — Reduce vertical spacing (`space-y-6` → `space-y-5`, `gap-4` → `gap-3`, `text-3xl` → `text-2xl`) so register content fits closer to viewport height, minimizing the need for scrolling.
4. **Notion-esque aesthetic** — Apply clean, neutral surfaces with subtle borders and generous-but-compact whitespace while preserving all existing brand colors (primary blue `#0057FF`, teal, emerald, amber).

### Out of Scope
- Structural changes to component hierarchy or file organization.
- Changes to form logic, validation, or data fetching.
- Mobile (<1024px) layout changes beyond existing responsive behavior.
- The PharmiWorkspace left panel (already `h-screen sticky top-0` and working correctly).

## Affected Files

| # | File | Change Type | Details |
|---|---|---|---|
| 1 | `src/app/login/page.tsx` | CSS | Add `lg:h-screen overflow-y-auto` to right panel wrapper |
| 2 | `src/components/pharmako-login/AuthContainer.tsx` | CSS + Layout | Fix `h-full` → `min-h-[100dvh] lg:min-h-0`; add scroll wrapper |
| 3 | `src/components/pharmako-login/AuthTabs.tsx` | CSS | Remove `shadow-sm` from active tab |
| 4 | `src/components/pharmako-login/PharmakoInput.tsx` | CSS | Replace focus ring shadow with border-only `ring` or `border-color` approach |
| 5 | `src/components/TypeProfile.tsx` | CSS | Remove `shadow-sm` + `hover:shadow-sm` from profile cards |
| 6 | `src/components/pharmako-login/AuthRegisterContent.tsx` | CSS | `space-y-6`→`space-y-5`, `text-3xl`→`text-2xl` |
| 7 | `src/components/FormRegisterPatient.tsx` | CSS | `gap-4`→`gap-3` |
| 8 | `src/components/FormRegisterMedical.tsx` | CSS | `gap-4`→`gap-3` |
| 9 | `src/components/FormRegisterInstitution.tsx` | CSS | `gap-4`→`gap-3` (7 fields — worst offender) |

## Implementation Plan

### Step 1: Fix viewport overflow (Files 1–2)
- In `page.tsx`, the right panel `<div className="w-full lg:w-1/2">` receives `lg:h-screen overflow-y-auto` so it matches the left panel height and scrolls when content exceeds it.
- In `AuthContainer.tsx`, replace `h-full` with `min-h-[100dvh] lg:min-h-0` to prevent the container from claiming full height on mobile while properly constraining on desktop.

### Step 2: Remove all shadows (Files 3–5)
- `AuthTabs.tsx`: Remove `shadow-sm` from the active tab indicator. Replace with a solid bottom border (`border-b-2 border-pharmako-primary`) if visual emphasis is needed.
- `PharmakoInput.tsx`: Replace `shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]` on focus with `border-pharmako-primary ring-1 ring-pharmako-primary/20` or equivalent border-only approach.
- `TypeProfile.tsx`: Remove `shadow-sm` and `hover:shadow-sm`. Replace active state with `border-2 border-pharmako-primary` and hover with `border-slate-200 hover:border-slate-300`.

### Step 3: Compact spacing (Files 6–9)
- `AuthRegisterContent.tsx`: Reduce section spacing and header size to reclaim ~40–50px vertical space.
- All three form components: Reduce `gap-4` to `gap-3` to reclaim ~4px per field row (~20–28px total per form).

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scrolling feels unexpected on desktop | Low | Low | Scroll only triggers when content exceeds viewport; most of the time content will fit after spacing compression |
| Focus state without shadow feels less prominent | Low | Low | Border-only focus rings are standard in Notion-like designs; maintain sufficient contrast with `border-pharmako-primary` |
| Spacing compression makes forms feel cramped | Medium | Medium | Compression is minimal (1 Tailwind step per class); test on actual 1280×800 viewport |
| `overflow-y-auto` adds scrollbar on pages that don't need it | Low | Low | Only applies at `lg:` breakpoint; scrollbar appears only when content exceeds `h-screen` |

## Rollback

All changes are CSS-class-only adjustments within existing components. Rollback is a simple git revert with zero risk to form logic, data fetching, or authentication flow. No database, API, or state changes are involved.

## Success Criteria

1. **No overflow on 1280×800 and 1366×768** — Register tab content either fits within the viewport or scrolls gracefully within the right panel (no body-level scroll, no content clipped below fold).
2. **Zero `shadow-*` classes** in any login-related component (verified by grep across `src/components/pharmako-login/`, `src/components/TypeProfile.tsx`, and `src/app/login/`).
3. **All brand colors preserved** — Primary blue `#0057FF`, teal, emerald, amber, and all existing color tokens remain unchanged.
4. **No functional regression** — Login, register (all 3 profile types), form validation, and submission behavior unchanged.
5. **Visual consistency** — All login components share the same Notion-esque aesthetic: clean surfaces, subtle borders, no shadows, compact but breathable spacing.

## Design Decisions

- **Border-only focus states**: Replacing the focus ring shadow with a solid border color change aligns with Notion's minimal approach while maintaining accessibility (visible focus indicator).
- **`min-h-[100dvh]` for mobile**: Using `dvh` (dynamic viewport height) prevents the address bar overlap issue on mobile Safari/Chrome while keeping the auth form vertically centered.
- **Incremental spacing reduction**: Each spacing class is reduced by exactly one Tailwind step (6→5, 4→3) — the smallest change that meaningfully impacts total height without making forms feel cramped.
- **No structural refactoring**: All changes stay within existing file boundaries. This keeps the PR small, reviewable, and safe to ship independently.
