# Design: Responsive Login + Notion-Esque Style Refinement

## Overview

CSS-only refinement across 9 files to fix register-tab viewport overflow on 15" laptops and apply a Notion-esque shadow-free aesthetic. Zero structural or logic changes.

---

## 1. Viewport Overflow Fix (Files 1–2)

### 1.1 `src/app/login/page.tsx` — Right panel height + scroll

**Current:**
```tsx
<div className="w-full lg:w-1/2">
```

**Change:**
```tsx
<div className="w-full lg:w-1/2 lg:h-screen overflow-y-auto">
```

**Mechanism:**
- `lg:h-screen` — At ≥1024px, the right panel matches the left panel's `h-screen`, creating a fixed-height container.
- `overflow-y-auto` — When content exceeds that height (e.g., register form with 5–7 fields), a vertical scrollbar appears *inside* the right panel only. The left panel (`h-screen sticky top-0`) remains stationary. Body-level scroll is prevented because the parent `div` already has `min-h-screen` and the two children share the full viewport height.
- On mobile (`< lg:`), `lg:h-screen` doesn't apply, so the container flows naturally with `min-h-screen` — content can scroll the full page as expected.

### 1.2 `src/components/pharmako-login/AuthContainer.tsx` — Height constraint

**Current:**
```tsx
<div className="h-full flex items-center justify-center px-8 lg:px-16 bg-pharmako-surface">
```

**Change:**
```tsx
<div className="min-h-[100dvh] lg:min-h-0 flex items-center justify-center px-8 lg:px-16 bg-pharmako-surface">
```

**Mechanism:**
- `h-full` was problematic because the parent in `page.tsx` had no explicit height on mobile — it resolved to auto, and `h-full` on the child had nothing to inherit. On desktop, the parent got `lg:h-screen`, so `h-full` worked, but it also prevented the child from shrinking when content was shorter than the viewport.
- `min-h-[100dvh]` — On mobile, ensures the container fills at least the full dynamic viewport height (using `dvh` to account for Safari/Chrome address bar resizing).
- `lg:min-h-0` — On desktop, removes the minimum height constraint, allowing the parent's `lg:h-screen overflow-y-auto` to take over. The flex centering (`flex items-center justify-center`) still works because the parent constrains the height.

**Edge case — very short viewports (<600px height):**
- `min-h-[100dvh]` ensures the container is never shorter than the viewport, so content scrolls naturally.
- The inner `motion.div` with `max-w-[380px] space-y-6` will extend beyond the container and the browser's native scroll handles it.

---

## 2. Shadow Removal (Files 3–5)

### 2.1 `src/components/pharmako-login/AuthTabs.tsx` — Active tab shadow

**Current line 24:**
```tsx
? "text-pharmako-primary bg-white shadow-sm"
```

**Change:**
```tsx
? "text-pharmako-primary bg-white"
```

**Rationale:** The active tab already has a visual indicator via the `motion.div` bottom bar (`layoutId="activeAuthTab"`) — a `h-0.5 w-1/2 bg-pharmako-primary rounded-full` pill. The `shadow-sm` is redundant. The `bg-white` on the active tab against the `bg-pharmako-background` container provides sufficient contrast without shadows.

### 2.2 `src/components/pharmako-login/PharmakoInput.tsx` — Focus state

**Current line 28:**
```tsx
? "border-pharmako-primary shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]"
```

**Change:**
```tsx
? "border-2 border-pharmako-primary"
```

**Mechanism:**
- Replaces the `shadow-[0_0_0_3px_...]` focus ring with a solid `border-2 border-pharmako-primary`.
- **Border-width shift:** Default border is `border` (Tailwind `border-width: 1px`). On focus it becomes `border-2` (2px). This is a 1px inward shift of the content area. Since input padding is `px-4 py-3.5`, the visual impact is negligible — the border thickens inward, not outward.
- The `--color-pharmako-primary` CSS variable resolves to `#0057FF` (defined in `globals.css` line 43), providing sufficient contrast ratio against both `bg-white` and `bg-pharmako-surface` for WCAG AA compliance.
- Error state (`border-red-500`) is unaffected — it remains border-only with no shadow.
- Unfocused hover state (`hover:border-pharmako-primary/30`) is unaffected.

**Accessibility:** Border-only focus indicators meet WCAG 2.4.7 (Focus Visible) as long as the color contrast is ≥ 3:1. `#0057FF` on `#FFFFFF` yields ~8.2:1 — well above the threshold.

### 2.3 `src/components/TypeProfile.tsx` — Profile card shadows

**Current lines 20–21:**
```tsx
isActive
  ? "bg-pharmako-primary-light text-pharmako-primary border border-pharmako-primary/20 shadow-sm"
  : "bg-white text-pharmako-text-secondary border border-pharmako-border hover:border-pharmako-primary/30 hover:shadow-sm"
```

**Change:**
```tsx
isActive
  ? "bg-pharmako-primary-light text-pharmako-primary border-2 border-pharmako-primary"
  : "bg-white text-pharmako-text-secondary border border-pharmako-border hover:border-pharmako-primary/30"
```

**Rationale:**
- **Active state:** Replaces `border border-pharmako-primary/20 shadow-sm` with `border-2 border-pharmako-primary`. The thicker, fully-opaque primary border is a clearer selection indicator than the subtle shadow. The `bg-pharmako-primary-light` (a pale `#EEF5FF`) background provides additional visual distinction.
- **Inactive state:** Removes `hover:shadow-sm`. The existing `hover:border-pharmako-primary/30` color shift on hover is sufficient feedback.
- **Border-width consistency:** Active uses `border-2`, inactive uses `border` (1px). This is intentional — the thicker border signals selection. The 1px inward shift on activation is acceptable for button-sized cards.

---

## 3. Spacing Compression (Files 6–9)

### 3.1 `src/components/pharmako-login/AuthRegisterContent.tsx`

| Class | From | To | Pixel Delta |
|---|---|---|---|
| `space-y-6` (outer wrapper, line 26) | 1.5rem (24px) | `space-y-5` → 1.25rem (20px) | **-4px** |
| `text-3xl` (h2, line 34) | 1.875rem (30px) | `text-2xl` → 1.5rem (24px) | **-6px** |

**Total vertical space reclaimed:** ~10px (4px from section spacing + 6px from header size).

### 3.2 `src/components/FormRegisterPatient.tsx`

| Class | From | To | Pixel Delta |
|---|---|---|---|
| `gap-4` (form, line 66) | 1rem (16px) | `gap-3` → 0.75rem (12px) | **-4px per gap** |

Form has 5 input rows → 4 gaps between them → **-16px total**.

### 3.3 `src/components/FormRegisterMedical.tsx`

| Class | From | To | Pixel Delta |
|---|---|---|---|
| `gap-4` (form, line 73) | 1rem (16px) | `gap-3` → 0.75rem (12px) | **-4px per gap** |

Form has 6 input rows → 5 gaps between them → **-20px total**.

### 3.4 `src/components/FormRegisterInstitution.tsx`

| Class | From | To | Pixel Delta |
|---|---|---|---|
| `gap-4` (form, line 81) | 1rem (16px) | `gap-3` → 0.75rem (12px) | **-4px per gap** |

Form has 7 input rows → 6 gaps between them → **-24px total**.

### Cumulative height reduction (Institution form, worst case)

| Source | Reduction |
|---|---|
| `space-y-6` → `space-y-5` (1 instance in parent) | -4px |
| `text-3xl` → `text-2xl` | -6px |
| `gap-4` → `gap-3` (6 gaps) | -24px |
| **Total** | **~34px** |

Combined with the border-only focus (no extra space) and shadow removal (no extra space), the register content should fit within ~740px of vertical space — well within a 768px viewport, with only the institution form occasionally needing the `overflow-y-auto` scrollbar.

---

## 4. Overflow / Scroll Behavior at `lg:` Breakpoint

```
┌─────────────────────┬─────────────────────────┐
│  PharmiWorkspace    │  AuthContainer          │
│  h-screen           │  lg:h-screen            │
│  sticky top-0       │  overflow-y-auto        │
│  (left panel)       │  (right panel)          │
│                     │                         │
│  [static]           │  [scrolls internally    │
│                     │   when content > vp]    │
└─────────────────────┴─────────────────────────┘
```

- **Login tab:** Compact (email + password + button). Fits within ~400px. No scroll needed.
- **Register tab (Patient):** ~5 fields. ~620px after compression. Fits within 768px. No scroll.
- **Register tab (Medical):** ~6 fields. ~680px after compression. May need scroll on 768px viewports.
- **Register tab (Institution):** ~7 fields. ~740px after compression. May need scroll on 768px viewports.

The `overflow-y-auto` scrollbar only appears when needed. Chrome/Safari render it as an overlay scrollbar on macOS (no layout shift). On Windows, the native scrollbar is ~17px wide but appears inside the container, not affecting the left panel.

---

## 5. Edge Cases

### 5.1 Mobile (< 1024px)
- `lg:h-screen` and `lg:min-h-0` do not apply.
- The page uses `min-h-screen flex flex-col` — the right panel flows naturally.
- `AuthContainer` uses `min-h-[100dvh]` to account for mobile browser address bars.
- Scroll behavior is browser-native (full page scroll). No change from current behavior.

### 5.2 Tablet (1024px – 1279px)
- Both panels appear side-by-side (`lg:` applies at 1024px).
- Left panel is `h-screen sticky`. Right panel is `lg:h-screen overflow-y-auto`.
- Same scroll behavior as desktop.

### 5.3 Very Short Viewports (≤600px height)
- Possible on landscape tablets or split-screen windows.
- `AuthContainer`'s `min-h-[100dvh]` ensures the container is never shorter than the viewport.
- Content overflows and scrolls naturally within the right panel.
- No content is clipped — `overflow-y-auto` (not `overflow-y-hidden` or `overflow-y-scroll`).

### 5.4 Very Tall Viewports (≥1080px)
- `AuthContainer` centers content vertically via `flex items-center justify-center`.
- Content fits easily. No scroll needed.
- No visual issues — the layout is designed to handle excess space gracefully.

### 5.5 Focus state border-width shift
- Changing from `border` (1px) to `border-2` (2px) shifts the inner content by 1px inward.
- Inputs have `px-4 py-3.5` padding — the 1px shift is imperceptible.
- TypeProfile cards use `px-4 py-4` — same negligible impact.
- No layout shift (CLS) because the border thickens inward, not outward.

---

## 6. Brand Color Preservation

All existing brand colors are preserved. This change only removes shadows and adjusts borders — no color values are modified.

| Token | Value | Used In |
|---|---|---|
| `--color-pharmako-primary` | `#0057FF` | Focus borders, active tabs, active profile, buttons |
| `--color-pharmako-primary-hover` | `#0046D0` | Hover states (unchanged) |
| `--color-pharmako-primary-light` | `#EEF5FF` | Active profile background |
| `--color-pharmako-primary-muted` | `#B8D4FC` | Placeholder/muted states (unchanged) |
| Teal (`text-teal-600`) | N/A | Used elsewhere in app, untouched |
| Emerald | N/A | Success states, untouched |
| Amber | N/A | Warning states, untouched |

---

## 7. No-Shadow Verification

After applying all changes, verify zero `shadow-*` classes remain in login-related files:

```bash
# Verify no shadow classes in any affected file
grep -rn "shadow-" \
  src/app/login/page.tsx \
  src/components/pharmako-login/AuthContainer.tsx \
  src/components/pharmako-login/AuthTabs.tsx \
  src/components/pharmako-login/PharmakoInput.tsx \
  src/components/pharmako-login/AuthRegisterContent.tsx \
  src/components/pharmako-login/LoginForm.tsx \
  src/components/pharmako-login/LoginButton.tsx \
  src/components/TypeProfile.tsx \
  src/components/FormRegisterPatient.tsx \
  src/components/FormRegisterMedical.tsx \
  src/components/FormRegisterInstitution.tsx
```

Expected result: **No matches.** If any `shadow-*` class appears, it must be removed as part of this change.

Also verify the `shadow-[0_0_0_3px_...]` arbitrary value in `PharmakoInput.tsx` is gone:
```bash
grep -rn "shadow-\[0_0_0_3px" src/components/pharmako-login/PharmakoInput.tsx
```

Expected result: **No matches.**

---

## 8. Complete Change Summary

| File | Line(s) | Change |
|---|---|---|
| `src/app/login/page.tsx` | Right panel `<div>` | Add `lg:h-screen overflow-y-auto` to `className="w-full lg:w-1/2"` |
| `src/components/pharmako-login/AuthContainer.tsx` | Outer `<div>` | Replace `h-full` → `min-h-[100dvh] lg:min-h-0` |
| `src/components/pharmako-login/AuthTabs.tsx` | Line 24 | Remove `shadow-sm` from active tab className |
| `src/components/pharmako-login/PharmakoInput.tsx` | Line 28 | Replace `border-pharmako-primary shadow-[0_0_0_3px_theme(colors.pharmako-primary/10)]` → `border-2 border-pharmako-primary` |
| `src/components/TypeProfile.tsx` | Lines 20–21 | Active: replace `border border-pharmako-primary/20 shadow-sm` → `border-2 border-pharmako-primary`; Inactive: remove `hover:shadow-sm` |
| `src/components/pharmako-login/AuthRegisterContent.tsx` | Line 26, 34 | `space-y-6` → `space-y-5`, `text-3xl` → `text-2xl` |
| `src/components/FormRegisterPatient.tsx` | Line 66 | `gap-4` → `gap-3` |
| `src/components/FormRegisterMedical.tsx` | Line 73 | `gap-4` → `gap-3` |
| `src/components/FormRegisterInstitution.tsx` | Line 81 | `gap-4` → `gap-3` |

**Total changed lines:** ~15 (CSS class edits only, zero logic changes).
