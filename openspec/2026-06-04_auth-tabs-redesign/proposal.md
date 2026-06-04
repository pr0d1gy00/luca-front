# SDD Proposal: Auth Tabs + Isomatic Redesign (v2)

## Problem Statement

The login and register flows in Luca/Pharmako have structural and visual issues:

1. **Disconnected auth flows**: Login and Register have no tab-based switching. `AuthTabs.tsx` exists but is not wired into any flow.

2. **Register forms have old styling**: `FormRegisterPatient`, `FormRegisterMedical`, `FormRegisterInstitution` use the legacy `InputLogin` component with `bg-luca-primary`, `rounded-[3rem]` — inconsistent with the new `pharmako-login` component system (blue `#0057FF` primary, rounded-xl, subtle shadows, PharmakoInput primitives).

3. **Two login implementations**: `FormLogin.tsx` (legacy) and `pharmako-login/LoginForm.tsx` (new). The new one is the keeper.

## Direction

The `pharmako-login` component library IS the target "isomatic" style. All new auth surfaces should use `PharmakoInput`, `LoginButton`, `RememberSession`, and the `colors.ts` token system as primitives.

## Scope

### In Scope

- [ ] Create `AuthContainer.tsx` — a unified wrapper with a tab bar (Login | Register) in pharmako style
- [ ] Refactor `AuthTabs.tsx` to use pharmako color tokens and `motion` layout animations
- [ ] Keep `pharmako-login/LoginForm.tsx` as the login panel inside the container
- [ ] Redesign register flow to use pharmako primitives: `PharmakoInput`, `LoginButton`, pharmako colors
- [ ] Keep profile-type selection (Patient/Doctor/Institution) inside register tab — refactor `TypeProfile.tsx` to match pharmako aesthetics
- [ ] Use `react-hook-form` + `zod` + existing schemas for register validation
- [ ] Wire everything into `src/app/login/page.tsx`

### Out of Scope

- Backend API integration
- Password recovery flow
- Social login / OAuth
- Changes to `PharmiWorkspace`
- Changes to Zod validation schemas
- Tests

## Target Architecture

```
src/app/login/page.tsx
  → PharmiWorkspace (left panel) — unchanged
  → AuthContainer (right panel) — NEW
      → AuthTabs (Login | Register) — REFACTORED to pharmako style
      → LoginForm (from pharmako-login) — KEPT
      → AuthRegisterForm — REFACTORED
          → TypeProfile (Patient/Doctor/Institution) — REFACTORED to pharmako style
          → FormRegisterPatient — REFACTORED: uses PharmakoInput, pharmako colors
          → FormRegisterMedical — REFACTORED: uses PharmakoInput, pharmako colors
          → FormRegisterInstitution — REFACTORED: uses PharmakoInput, pharmako colors
```

### Key Design Decisions

1. **Tab bar**: Uses `layoutId` for animated underline indicator, pharmako `colors.primary` for active state
2. **Register inputs**: Replace `InputLogin` with `PharmakoInput` from pharmako-login
3. **Register buttons**: Replace old buttons with `LoginButton` (renamed contextually) from pharmako-login
4. **Colors**: All forms use `colors.ts` tokens (primary: #0057FF, care: #23DCE1) and Tailwind pharmako custom properties
5. **Profile selector**: Redesigned as rounded-xl cards with pharmako colors instead of old circular avatars
