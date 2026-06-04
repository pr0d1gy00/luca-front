# SDD Tasks: Auth Tabs + Isomatic Redesign

> Review workload estimate: ~250-350 changed lines across ~14 files
> Strategy: Single PR

## Dependency Graph

```
T1 (CSS vars update)
├── T2 (Delete colors.ts + refactor index.ts)
│   └── T3 (Refactor PharmakoInput.tsx)
│       ├── T4 (Refactor LoginButton.tsx)
│       │   └── T5 (Refactor LoginForm.tsx)
│       ├── T6 (Refactor RememberSession.tsx)
│       │   └── T5
│       └── T7 (Refactor PharmiWorkspace.tsx)
├── T8 (Create AuthTabs.tsx in pharmako-login)
│   └── T9 (Create AuthContainer.tsx)
│       ├── T10 (Create AuthRegisterContent.tsx)
│       │   ├── T11 (Refactor TypeProfile.tsx)
│       │   ├── T12 (Refactor FormRegisterPatient.tsx)
│       │   ├── T13 (Refactor FormRegisterMedical.tsx)
│       │   └── T14 (Refactor FormRegisterInstitution.tsx)
│       └── T15 (Wire login/page.tsx)
│           └── T16 (Delete legacy files + cleanup)
```

## T1 — Align CSS variable values

**File**: `src/app/globals.css`

**Changes**:
- Update `@theme inline` block values to match `colors.ts` design intent

**Acceptance**:
- [ ] `--color-pharmako-primary: #0057FF`
- [ ] `--color-pharmako-primary-hover: #0046D0`
- [ ] `--color-pharmako-care: #23DCE1`
- [ ] `--color-pharmako-care-hover: #12C4C9`
- [ ] `--color-pharmako-background: #F8FAFC`
- [ ] `--color-pharmako-text-primary: #0F172A`
- [ ] `--color-pharmako-text-secondary: #475569`
- [ ] `--color-pharmako-text-muted: #64748B`
- [ ] `--color-pharmako-border: #E2E8F0`

## T2 — Remove colors.ts + clean index.ts

**Files**: 
- `src/components/pharmako-login/colors.ts` → DELETE
- `src/components/pharmako-login/index.ts` → EDIT (remove colors export)

## T3 — Refactor PharmakoInput.tsx

**File**: `src/components/pharmako-login/PharmakoInput.tsx`

**Changes**:
- Replace all `style={{ borderColor: colors.xxx }}` with conditional Tailwind classes
- Replace `style={{ color: colors.xxx }}` with `text-pharmako-*`
- Replace `style={{ boxShadow: ... }}` with `shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]`
- Remove `import { colors } from "./colors"`

## T4 — Refactor LoginButton.tsx

**File**: `src/components/pharmako-login/LoginButton.tsx`

**Changes**:
- Replace `style={{ background: colors.primary }}` → `className="bg-pharmako-primary"`
- Replace `style={{ background: "#94A3B8" }}` → `className="disabled:bg-slate-400"`
- Remove colors import

## T5 — Refactor LoginForm.tsx

**File**: `src/components/pharmako-login/LoginForm.tsx`

**Changes**:
- Replace all `style={{ color: colors.xxx }}` / `style={{ background: colors.xxx }}` with Tailwind classes
- Remove colors import

## T6 — Refactor RememberSession.tsx

**File**: `src/components/pharmako-login/RememberSession.tsx`

**Changes**:
- Dynamic `bg-pharmako-primary` / `border-pharmako-primary` for checked state
- Dynamic `bg-transparent` / `border-pharmako-border` for unchecked
- Remove colors import

## T7 — Refactor PharmiWorkspace.tsx

**File**: `src/components/pharmako-login/PharmiWorkspace.tsx`

**Changes**:
- Replace `style={{ background: colors.primary }}` → `bg-pharmako-primary`
- Replace `style={{ color: colors.textPrimary }}` → `text-pharmako-text-primary`
- Remove colors import

## T8 — Create/Move AuthTabs.tsx

**File**: `src/components/pharmako-login/AuthTabs.tsx` (move from `src/components/AuthTabs.tsx`)

**Changes**:
- Relocate into pharmako-login folder
- Replace `text-[#23dce1]` → `text-pharmako-primary`
- Replace `bg-[#23dce1]/10` → `bg-pharmako-primary/10`
- Replace `bg-[#23dce1]` → `bg-pharmako-primary`
- Keep `layoutId="activeTab"` animation

## T9 — Create AuthContainer.tsx

**File**: `src/components/pharmako-login/AuthContainer.tsx` (NEW)

**Structure**:
```tsx
'use client'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LoginForm } from './LoginForm'
import { AuthRegisterContent } from './AuthRegisterContent'
import { AuthTabs } from './AuthTabs'

export function AuthContainer() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  return (
    <div className="h-full flex items-center justify-center px-8 lg:px-16 bg-pharmako-surface">
      <div className="w-full max-w-[380px] space-y-6">
        <AuthTabs active={tab} onSelect={setTab} />
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.div key="login" ...>
              <LoginForm />
            </motion.div>
          ) : (
            <motion.div key="register" ...>
              <AuthRegisterContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
```

**Animation**: 
- Slide: `initial={{ opacity: 0, x: 20 }}` / `animate={{ opacity: 1, x: 0 }}` / `exit={{ opacity: 0, x: -20 }}`
- Duration: 0.3, ease: [0.25, 0.1, 0.25, 1]

## T10 — Create AuthRegisterContent.tsx

**File**: `src/components/pharmako-login/AuthRegisterContent.tsx` (NEW)

Merges the structure of the existing `FormRegister.tsx` but using pharmako style:
- Profile selector (TypeProfile) with pharmako colors
- Conditional sub-form rendering (Patient / Doctor / Institution)
- Terms footer matching LoginForm style

## T11 — Refactor TypeProfile.tsx

**File**: `src/components/TypeProfile.tsx`

**Changes**:
- `rounded-full w-24 h-24` → `rounded-xl px-5 py-3 min-w-[120px]`
- Active: `bg-pharmako-primary-light text-pharmako-primary border border-pharmako-primary/20`
- Inactive: `bg-white text-pharmako-text-secondary border border-pharmako-border hover:border-pharmako-primary/30`
- Icon: `text-pharmako-primary`
- Remove circular layout, use flex row

## T12 — Refactor FormRegisterPatient.tsx

**File**: `src/components/FormRegisterPatient.tsx`

**Changes**:
- Replace `InputLogin` → `PharmakoInput`
- Replace `bg-luca-primary text-white rounded-[3rem] p-6` → `bg-pharmako-primary text-white rounded-xl py-3.5 px-6`
- Add same motion/loading behavior as LoginButton
- Use pharmako color tokens for text

## T13 — Refactor FormRegisterMedical.tsx

Same pattern as T12.

## T14 — Refactor FormRegisterInstitution.tsx

Same pattern as T12.

## T15 — Wire login page

**File**: `src/app/login/page.tsx`

**Changes**:
- Import `AuthContainer` instead of `LoginForm` from pharmako-login
- No changes to PharmiWorkspace

## T16 — Delete legacy files + final cleanup

**Delete**:
- `src/components/FormLogin.tsx`
- `src/components/InputLogin.tsx`
- `src/components/AuthTabs.tsx` (moved to pharmako-login)

**Verify**:
- No remaining imports to `colors` from pharmako-login
- No remaining imports to `FormLogin` (legacy) or `InputLogin` anywhere
- No unused `colors.ts` file
- `npm run build` or at least `npm run lint` passes
