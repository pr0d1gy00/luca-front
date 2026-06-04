# Tasks: Responsive Login + Notion-Esque Style Refinement

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~15 (CSS class edits only, zero logic changes) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

---

## Task 1: Fix viewport overflow — page.tsx + AuthContainer.tsx

**References:** design.md §1.1, §1.2 | spec.md Requirement: Viewport-Safe Height at 768px, Requirement: Internal Scroll for Overflow Content

### 1.1 `src/app/login/page.tsx`
- Locate the right panel wrapper `<div className="w-full lg:w-1/2">`.
- Add `lg:h-screen overflow-y-auto` to the className.
- **Verify:** The right panel matches left panel height at `lg:` breakpoint and scrolls internally when content exceeds it.

### 1.2 `src/components/pharmako-login/AuthContainer.tsx`
- Locate the outer `<div>` with `className="h-full flex items-center justify-center ..."`
- Replace `h-full` → `min-h-[100dvh] lg:min-h-0`.
- **Verify:** On mobile, container fills dynamic viewport height (`dvh`). On desktop, `lg:min-h-0` lets the parent's `lg:h-screen` control height while flex centering still works.

**Acceptance:** Login page at `lg:` breakpoint with register tab selected — no body-level scroll, right panel scrolls internally only when needed.

---

## Task 2: Remove all shadow classes — AuthTabs, PharmakoInput, TypeProfile

**References:** design.md §2.1, §2.2, §2.3 | spec.md Requirement: Zero Shadow Classes in Login Components, Requirement: Border-Only Focus States

### 2.1 `src/components/pharmako-login/AuthTabs.tsx`
- Locate active tab conditional className (line ~24): `"text-pharmako-primary bg-white shadow-sm"`.
- Remove `shadow-sm` from the string.
- **Verify:** Active tab shows no shadow; `motion.div` `layoutId="activeAuthTab"` pill remains the sole active indicator.

### 2.2 `src/components/pharmako-login/PharmakoInput.tsx`
- Locate the focus-state conditional className (line ~28): `"border-pharmako-primary shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]"`.
- Replace with `"border-2 border-pharmako-primary"`.
- **Verify:** Focused input shows a solid 2px primary-blue border. No shadow ring visible. Error state (`border-red-500`) and hover state unchanged.

### 2.3 `src/components/TypeProfile.tsx`
- Locate the ternary className (lines ~20–21):
  - Active: `"bg-pharmako-primary-light text-pharmako-primary border border-pharmako-primary/20 shadow-sm"`
    → Replace with `"bg-pharmako-primary-light text-pharmako-primary border-2 border-pharmako-primary"`.
  - Inactive: Remove `hover:shadow-sm` from the inactive branch.
- **Verify:** Active profile card shows a bold 2px primary border. Inactive cards show no shadow on hover.

### 2.4 Shadow verification (post-change)
- Run the grep commands from design.md §7 across all login-related files:
  ```bash
  grep -rn "shadow-" src/app/login/page.tsx src/components/pharmako-login/ src/components/TypeProfile.tsx src/components/FormRegisterPatient.tsx src/components/FormRegisterMedical.tsx src/components/FormRegisterInstitution.tsx
  ```
- **Verify:** Zero matches. If any `shadow-*` class remains, remove it.

**Acceptance:** No `shadow-*` Tailwind utility classes exist in any of the 9 affected files.

---

## Task 3: Compact vertical spacing — AuthRegisterContent + 3 form components

**References:** design.md §3.1–§3.4 | spec.md Requirement: Notion-Esque Aesthetic Consistency

### 3.1 `src/components/pharmako-login/AuthRegisterContent.tsx`
- Replace `space-y-6` → `space-y-5` on the outer wrapper (line ~26).
- Replace `text-3xl` → `text-2xl` on the `<h2>` header (line ~34).
- **Verify:** Section spacing reduced by 4px; header font size reduced by one Tailwind step.

### 3.2 `src/components/FormRegisterPatient.tsx`
- Replace `gap-4` → `gap-3` on the form container (line ~66).
- **Verify:** ~16px total height reduction (4 gaps × 4px).

### 3.3 `src/components/FormRegisterMedical.tsx`
- Replace `gap-4` → `gap-3` on the form container (line ~73).
- **Verify:** ~20px total height reduction (5 gaps × 4px).

### 3.4 `src/components/FormRegisterInstitution.tsx`
- Replace `gap-4` → `gap-3` on the form container (line ~81).
- **Verify:** ~24px total height reduction (6 gaps × 4px). This is the worst-case form and should now fit within ~740px vertical space.

**Acceptance:** All three register form variants render with tighter vertical spacing. Institution form (7 fields) should fit within 768px viewport or require minimal internal scroll.

---

## Task 4: Visual regression + no-functional-regression verification

**References:** spec.md Requirement: Brand Color Preservation, Requirement: No Functional Regression, Requirement: Affected File Boundaries

### 4.1 Visual verification
- Open login page at `lg:` breakpoint (≥1024px).
- Verify login tab renders centered, no scrollbar.
- Switch to register tab for each profile type (Patient, Medical, Institution):
  - Content fits or scrolls within right panel only (no body scroll).
  - Profile cards show border-only selection (no shadows).
  - Form inputs show border-only focus (no ring shadows).
  - Active tab has no shadow; pill indicator visible.

### 4.2 Functional verification
- Submit login form with valid credentials → authentication proceeds unchanged.
- Fill each registration form (Patient, Medical, Institution) → validation and submission unchanged.
- Verify brand colors (`pharmako-primary` = `#0057FF`, teal, emerald, amber) are preserved.

### 4.3 File boundary verification
- Confirm exactly 9 files modified (diff count).
- Confirm only Tailwind class strings changed — zero TypeScript logic, event handlers, or structural changes.

**Acceptance:** All spec requirements met. Zero shadows, proper viewport behavior, preserved brand colors, no functional regression.
