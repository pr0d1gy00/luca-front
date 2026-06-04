I've completed the exploration of all login-related files. Unfortunately, the available tools don't include `write` or `edit` for file creation, so I can't directly write to `exploration.md`. Here are my full findings:

---

# Exploration: Login Page Responsive + Notion-esque Style Refinement

## 1. Responsive Issues Identified

### 1.1 Register Panel Overflow on 1366×768 / 1280×800 (Confirmed)

**Root cause:** `AuthContainer.tsx` has `h-full flex items-center justify-center`, but its parent `<div className="w-full lg:w-1/2">` in `page.tsx` has **no explicit height**. `h-full` resolves to `height: auto` — the form flows unbounded.

**Register content height estimate** (~1280×800):
- AuthTabs: ~48px
- Header + subtitle: ~80px
- Profile selector × 3: ~80px
- Form fields (5–7 × ~72px): 360–504px
- LoginButton: ~64px
- Terms footer: ~24px
- `space-y-6` gaps: ~96px
- **Total: ~752–896px** → exceeds 768px viewport height.

Login form (~520px) fits fine. Register forms overflow silently.

### 1.2 AuthContainer `h-full` is broken
The intermediate wrapper `<div className="w-full lg:w-1/2">` doesn't pass through the `min-h-screen` height from the flex parent. `items-center justify-center` on AuthContainer is a no-op.

**Fix:** Wrapper needs `lg:h-screen`, or AuthContainer should use `min-h-[100dvh] lg:min-h-0`.

### 1.3 Breakpoint behavior (lg: = 1024px)
- Below `lg:`: `flex-col`, PharmiWorkspace hidden, single-column auth. Padding `px-8` is fine but tight on <360px.
- Above `lg:`: `flex-row` split. Left panel `h-screen sticky top-0` works. Right panel has **no overflow handling**.

---

## 2. Shadow Usage (Must Be Removed)

| File | Class | Context |
|---|---|---|
| `AuthTabs.tsx:24` | `shadow-sm` | Active tab |
| `PharmakoInput.tsx:28` | `shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]` | Focus ring |
| `TypeProfile.tsx:20` | `shadow-sm` | Active profile |
| `TypeProfile.tsx:21` | `hover:shadow-sm` | Profile hover |

All 4 must be removed/replaced with border-only styling.

---

## 3. Notion-esque Style Adjustments

| Current | Notion-esque |
|---|---|
| `text-3xl` headers | → `text-2xl` (save ~16px vertical) |
| `space-y-6` on register sections | → `space-y-5` |
| Form `gap-4` | → `gap-3` (critical for Institution form with 7 fields) |
| Input `py-3.5` | → `py-3` |
| AuthContainer `px-8 lg:px-16` | → `px-6 lg:px-12` |
| Shadows (all) | → Remove (border-only states) |

---

## 4. Files Requiring Changes

| # | Severity | File | Fix |
|---|---|---|---|
| 1 | High | `page.tsx` | Add `lg:h-screen overflow-y-auto` to right panel wrapper |
| 2 | Medium | `AuthContainer.tsx` | Fix `h-full` → `min-h-[100dvh] lg:min-h-0`; add scroll wrapper |
| 3 | Low | `AuthTabs.tsx` | Remove `shadow-sm` |
| 4 | Medium | `PharmakoInput.tsx` | Replace focus shadow with border-only |
| 5 | Low | `TypeProfile.tsx` | Remove `shadow-sm` + `hover:shadow-sm` |
| 6 | Medium | `AuthRegisterContent.tsx` | `space-y-6`→`space-y-5`, `text-3xl`→`text-2xl` |
| 7 | Medium | `FormRegisterPatient.tsx` | `gap-4`→`gap-3` |
| 8 | Medium | `FormRegisterMedical.tsx` | `gap-4`→`gap-3` |
| 9 | Medium | `FormRegisterInstitution.tsx` | `gap-4`→`gap-3` (worst offender — 7 fields) |

---

## 5. No Structural Changes Required

All changes are CSS class adjustments, overflow handling, and spacing tweaks within existing file boundaries. No files need moving, renaming, or reorganizing.