# Tasks: macOS-Style Floating Sidebar

## Implementation Tasks

- [ ] **1. Add animation variants** — Add `sidebarFloatVariant` and `sidebarItemFloatVariant` to `src/app/lib/animations.ts`
- [ ] **2. Rewrite Sidebar.tsx** — Full component rewrite with:
  - Floating frosted-glass container
  - Collapsed/expanded states with localStorage persistence
  - Hover-to-expand + click-to-toggle interaction
  - Active indicator bar (left accent)
  - PharmakoLogoOnlyFace-PNG logo
  - Proper `inDrawer` prop handling (mobile)
- [ ] **3. Adjust dashboard layout** — Update `src/app/dashboard/layout.tsx` to accommodate the floating sidebar (remove old fixed positioning, adjust main content padding)
- [ ] **4. Verify build** — `npm run build` passes with no errors
