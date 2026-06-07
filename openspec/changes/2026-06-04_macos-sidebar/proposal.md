# Proposal: macOS-Style Floating Sidebar

## Problem
The current sidebar is visually heavy — attached 100% to the left edge, full-height, with prominent text labels. It doesn't match the "Clean & Elevated" design language from AGENTS.md.

## Proposed Solution
A macOS/FindMy-style floating sidebar that sits detached from the left edge, shows only icons by default, and expands on interaction.

### Key Behaviors

| State | Width | Content |
|---|---|---|
| **Collapsed (default)** | ~72px | Icons only + small logo |
| **Expanded (toggle)** | ~220px | Icons + text labels + full logo |

### Visual Design
- Detached from edge: `ml-4 my-4`, rounded corners (`rounded-2xl`), soft shadow
- Frosted glass: `bg-white/80 backdrop-blur-xl` with subtle border
- Gradient background from dashboard layout continues behind it
- Logo: `/PharmakoLogoOnlyFace-PNG.png` in collapsed, full line mark when expanded
- Icons: centered, with active indicator (left border or background highlight)
- Expand button: bottom position (macOS-style), instead of top-right
- Transition: smooth width animation (framer-motion `layout` or CSS transition)

### Interaction
- **Default**: icon-only rail
- **Toggle button** at bottom: collapses/expands
- **Hover**: tooltips on icon-only state (via `title` attribute or tooltip)
- **Active state**: highlighted icon + subtle left accent bar
- **Mobile**: becomes a bottom sheet / drawer (already handled by `inDrawer` prop and `MobileDrawer`)

### Files affected
1. `src/components/Sidebar.tsx` — full rewrite of the component
2. `src/app/dashboard/layout.tsx` — sidebar wrapper may need margin adjustments
3. `src/app/lib/animations.ts` — may add new sidebar animation variants

### Non-goals
- No dark mode changes (existing CSS variables for `.dark` stay)
- No new navigation items (existing `navigationConfig` is reused)
- No backend changes

## Risks
- Expanding/collapsing width animation could cause layout shifts → use `layout` prop in motion or CSS `transition` with `grid-template-columns`
- The `inDrawer` prop (mobile) must keep working independently
- Logo must maintain aspect ratio in both collapsed/expanded states

## Open Questions
1. Should the sidebar be **always collapsed by default** on desktop, or remember the user's last state?
2. Expand mode: **hover to expand** (macOS Dock style) or **click toggle**?
3. Active indicator style: **left colored bar** or **filled background** on the icon?
