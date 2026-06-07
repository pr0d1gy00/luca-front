# Spec: macOS-Style Floating Sidebar

## Decisions (from proposal)

| Question | Decision |
|---|---|
| Default state | Collapsed (icon-only). Remember preference via localStorage |
| Expand trigger | Both: **hover** expands temporarily, **click toggle** at bottom fixes expanded state |
| Active indicator | Left accent bar (thin vertical line, primary color) |

## Acceptance Criteria

1. **Floating layout**: Sidebar is detached from left edge (`mx-3 my-3`), with rounded corners (`rounded-2xl`), frosted glass background, and soft shadow.
2. **Collapsed state** (~72px): Shows only icons, small logo (`PharmakoLogoOnlyFace-PNG`), no text labels.
3. **Expanded state** (~220px): Shows icons + text labels, full logo/brand name.
4. **Hover expand**: Moving mouse over the sidebar expands it temporarily. Leaving the sidebar collapses it back (unless toggled fixed).
5. **Click toggle**: Button at bottom of sidebar toggles fixed expanded/collapsed. When fixed, hover does not collapse.
6. **Active indicator**: Left accent bar (2-3px wide) on the active nav item. Teal (`#23DCE1` / `pharmako-care`).
7. **Persistence**: Collapsed/expanded state saved to `localStorage` key `sidebar-expanded`.
8. **Logo**: Uses `/PharmakoLogoOnlyFace-PNG.png`. In collapsed mode ~32px, in expanded ~40px with text "Pharmako" beside it.
9. **Mobile (`inDrawer` prop)**: Full-width drawer, no floating, no collapse toggle, no hover.
10. **Navigation**: Reuses existing `navigationConfig` from `@/config/navigation`.
11. **Animation**: Smooth width transitions (CSS `transition-all duration-300` or framer-motion `layout`).
