# SDD Design: Auth Tabs + Isomatic Redesign

## Outcome of Proposal Approval

- **Keep** pharmako-login components as the base style
- **Replace** `colors.ts` with CSS variables from `globals.css`
- **Refactor** all components to use Tailwind utility classes (`bg-pharmako-*`, `text-pharmako-*`)
- **Align** CSS variable values with the actual design intent from `colors.ts`

---

## 1. CSS Variables — Alignment Plan

### Current mismatch

| Token | `colors.ts` (target design) | `globals.css` (current) | Action |
|---|---|---|---|
| primary | `#0057FF` | `#4F8EF7` | **Update** |
| primary-hover | `#0046D0` | `#3A7BE5` | **Update** |
| care | `#23DCE1` | `#64D8A4` | **Update** |
| care-hover | `#12C4C9` | `#4FC490` | **Update** |
| background | `#F8FAFC` | `#F5F6F8` | **Update** |
| text-primary | `#0F172A` | `#1A1D24` | **Update** |
| text-secondary | `#475569` | `#5C6370` | **Update** |
| text-muted | `#64748B` | `#9CA3AF` | **Update** |
| border | `#E2E8F0` | `#E5E7EB` | **Update** |

### File: `src/app/globals.css`

Only update the `@theme inline` pharmako-* block values.

---

## 2. Remove `colors.ts`

**File**: `src/components/pharmako-login/colors.ts` — **DELETE**

**Impact**:
- `src/components/pharmako-login/index.ts` — remove `colors` export
- All components that import `colors` must be refactored to use Tailwind classes

---

## 3. Component Refactors (colors.ts → Tailwind classes)

### 3a. `PharmakoInput.tsx`

| Before (colors.ts) | After (Tailwind) |
|---|---|
| `style={{ borderColor: colors.primary }}` | `className="border-pharmako-primary"` |
| `style={{ borderColor: colors.border }}` | `className="border-pharmako-border"` |
| `style={{ color: colors.textPrimary }}` | `className="text-pharmako-text-primary"` |
| `style={{ color: colors.textSecondary }}` | `className="text-pharmako-text-secondary"` |
| `style={{ color: colors.textMuted }}` | `className="text-pharmako-text-muted"` |
| `style={{ boxShadow: ... }}` | `className="shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]"` |

Dynamic border logic: use `focused` state to toggle `border-pharmako-primary` vs `border-pharmako-border`, and `border-red-500` for error.

### 3b. `LoginButton.tsx`

| Before | After |
|---|---|
| `style={{ background: colors.primary }}` | `className="bg-pharmako-primary disabled:bg-slate-400"` |
| `style={{ background: "#94A3B8" }}` (disabled) | already handled by `disabled:bg-slate-400` |

### 3c. `RememberSession.tsx`

| Before | After |
|---|---|
| `style={{ background: checked ? colors.primary : "transparent" }}` | `className={checked ? "bg-pharmako-primary" : "bg-transparent"}` |
| `style={{ borderColor: checked ? colors.primary : colors.border }}` | `className={checked ? "border-pharmako-primary" : "border-pharmako-border"}` |
| `style={{ color: colors.textSecondary }}` | `className="text-pharmako-text-secondary"` |

### 3d. `LoginForm.tsx`

| Before | After |
|---|---|
| `style={{ background: colors.surface }}` | `className="bg-pharmako-surface"` |
| `style={{ color: colors.textPrimary }}` | `className="text-pharmako-text-primary"` |
| `style={{ color: colors.textSecondary }}` | `className="text-pharmako-text-secondary"` |
| `style={{ color: colors.textMuted }}` | `className="text-pharmako-text-muted"` |
| `style={{ color: colors.primary }}` | `className="text-pharmako-primary"` |

### 3e. `PharmiWorkspace.tsx`

| Before | After |
|---|---|
| `style={{ background: colors.primary }}` | `className="bg-pharmako-primary"` |
| `style={{ color: colors.textPrimary }}` | `className="text-pharmako-text-primary"` |

---

## 4. AuthContainer Component (NEW)

**File**: `src/components/pharmako-login/AuthContainer.tsx`

### Behavior

- Wraps `LoginForm` (existing) and `AuthRegisterContent` (new)
- State `activeTab: "login" | "register"`
- Renders `AuthTabs` bar at the top
- Animated tab switching with `AnimatePresence` + `motion.div`

### AuthTabs Refactor

**File**: `src/components/AuthTabs.tsx` → `src/components/pharmako-login/AuthTabs.tsx` (relocated)

Changes:
- Remove inline `text-[#23dce1]` / `bg-[#23dce1]` classes
- Replace with `text-pharmako-primary` / `bg-pharmako-primary/10`
- Keep `layoutId="activeTab"` for animated underline
- Use `colors.primary` → `border-pharmako-primary` / `bg-pharmako-primary`

---

## 5. Register Forms Refactor

### Files to change:
- `src/components/FormRegister.tsx` → relocate + refactor
- `src/components/FormRegisterPatient.tsx` → refactor
- `src/components/FormRegisterMedical.tsx` → refactor
- `src/components/FormRegisterInstitution.tsx` → refactor
- `src/components/TypeProfile.tsx` → refactor

### Register Container (`AuthRegisterContent.tsx` — NEW)

Will be placed inside `AuthContainer.tsx` or as a sibling component.

Structure:
```
<motion.div> (AnimatePresence wrapper)
  <h2> + <p> header (same style as LoginForm)
  <TypeProfile selector> (refactored)
  <conditional sub-form>
  <terms footer>
```

### Sub-Form Refactors

Each register sub-form replaces:
- `InputLogin` → `PharmakoInput` (from pharmako-login)
- `bg-luca-primary` button → `bg-pharmako-primary` with motion/animation
- `rounded-[3rem]` → `rounded-xl` (pharmako standard)
- `fadeUpVariant` → keep motion animations, align easing with pharmako

### TypeProfile Refactor

| Before | After |
|---|---|
| `rounded-full w-24 h-24` | `rounded-xl px-6 py-4` (card style) |
| `bg-[#ebbda8]` (active) | `bg-pharmako-primary-light` |
| `bg-luca-fg-on-primary` (inactive) | `bg-pharmako-surface` with border |
| `text-[#E07A5F]` Icon | `text-pharmako-primary` |

---

## 6. Integration into Login Page

**File**: `src/app/login/page.tsx`

```tsx
// Before
import { PharmiWorkspace, LoginForm } from "@/components/pharmako-login"

// After
import { PharmiWorkspace, AuthContainer } from "@/components/pharmako-login"
// Remove import of LoginForm (now inside AuthContainer)
```

---

## 7. Files to Delete

| File | Reason |
|---|---|
| `src/components/pharmako-login/colors.ts` | No longer needed (use CSS vars) |
| `src/components/FormLogin.tsx` | Replaced by pharmako-login/LoginForm.tsx |
| `src/components/InputLogin.tsx` | Replaced by pharmako-login/PharmakoInput.tsx |

---

## 8. Files Modified

| File | Change type |
|---|---|
| `src/app/globals.css` | Update pharmako-* color values |
| `src/components/pharmako-login/index.ts` | Remove `colors` export, add `AuthContainer` |
| `src/components/pharmako-login/PharmakoInput.tsx` | colors.ts → Tailwind classes |
| `src/components/pharmako-login/LoginButton.tsx` | colors.ts → Tailwind classes |
| `src/components/pharmako-login/RememberSession.tsx` | colors.ts → Tailwind classes |
| `src/components/pharmako-login/LoginForm.tsx` | colors.ts → Tailwind classes |
| `src/components/pharmako-login/PharmiWorkspace.tsx` | colors.ts → Tailwind classes |
| `src/components/pharmako-login/AuthContainer.tsx` | NEW |
| `src/components/pharmako-login/AuthTabs.tsx` | MOVE + refactor (from src/components/AuthTabs.tsx) |
| `src/components/pharmako-login/AuthRegisterContent.tsx` | NEW |
| `src/components/FormRegisterPatient.tsx` | Refactor: InputLogin → PharmakoInput |
| `src/components/FormRegisterMedical.tsx` | Refactor: InputLogin → PharmakoInput |
| `src/components/FormRegisterInstitution.tsx` | Refactor: InputLogin → PharmakoInput |
| `src/components/TypeProfile.tsx` | Refactor to pharmako style |
| `src/app/login/page.tsx` | Import AuthContainer instead of LoginForm |

---

## 9. Animation Architecture

All animations should use the same easing defined in `pharmako-login` pattern:
```ts
ease: [0.25, 0.1, 0.25, 1]  // smooth ease-out
duration: 0.4  // standard
```

Tab switching:
- `AnimatePresence mode="wait"` around the form panels
- `motion.div` with `initial={{ opacity: 0, x: 20 }}` / `animate={{ opacity: 1, x: 0 }}` / `exit={{ opacity: 0, x: -20 }}`
- Tab underline: `layoutId="activeTab"` for smooth spring transition

---

## 10. Styling Checklist

- [ ] All `style={{ color: colors.xxx }}` → Tailwind utility class
- [ ] All `style={{ background: colors.xxx }}` → Tailwind utility class
- [ ] All `style={{ borderColor: colors.xxx }}` → Tailwind utility class
- [ ] Dynamic styles use ternary in className, not inline style
- [ ] Focus ring uses `shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]`
- [ ] `rounded-xl` as primary radius, `rounded-2xl` for larger surfaces
- [ ] Font: `font-sans` (Jakarta via CSS variable)
- [ ] Text hierarchy: `text-pharmako-text-primary` > `text-pharmako-text-secondary` > `text-pharmako-text-muted`
