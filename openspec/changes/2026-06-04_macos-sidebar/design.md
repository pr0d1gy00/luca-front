# Design: macOS-Style Floating Sidebar

## Tradeoffs Considered

| Approach | Pro | Con |
|---|---|---|
| Pure CSS `transition` for width | Simpler, no extra deps | Harder to stagger children |
| Framer Motion `animate={{width}}` | Smooth, layout animations | Slightly more code |
| **Chosen**: CSS `transition-all` + Framer Motion `layout` for logo/text | Best of both | Minimal complexity |

## Component Architecture

```
Sidebar (default export)
├── Logo section
│   ├── Image (logo)
│   └── [Expanded: Brand text "Pharmako"]
├── Navigation list
│   └── m.nav items (icon + [Expanded: label])
│       └── Active indicator bar (left)
├── Spacer (flex-1)
└── Toggle button (chevron)
    └── [Expanded: "Minimizar" / Collapsed: chevron icon]
```

## Styling Definition

### Collapsed State (~72px)
```
w-[72px]    ← fixed width
p-3         ← padding all sides
gap-4       ← between logo and nav
items-center ← center icons
```

### Expanded State (~220px)
```
w-[220px]   ← fixed width
p-4         ← more padding
gap-2       ← tighter between items
items-stretch ← labels align left
```

### Frosted Glass (both states)
```
bg-white/70
backdrop-blur-xl
border border-white/20  ← subtle glass border
shadow-lg shadow-black/5
rounded-2xl
mx-3 my-3              ← detached from edges
```

### Position in Layout
```
- floating: detached from edge (mx-3 my-3)
- h-[calc(100vh-1.5rem)]  ← full height minus the mx/my
- hidden on <lg (replaced by mobile drawer)
```

### Active Item Indicator
```
Left accent bar: 3px wide, rounded-r-full
Color: pharmako-care (#23DCE1)
Positioned via: `absolute left-0 top-1/2 -translate-y-1/2`
```

### Hover Interaction
```
- State machine:
  idle → hover (temp expand) → idle
  idle → toggle (fixed expand)
  fixed-expand → toggle → idle
  temp-expand → mouseleave → idle
- On mouse enter: set `hovered = true` → expand
- After 300ms of no hover, if not fixed, collapse
```

### Logo
```
Collapsed: w-8 h-8, centered
Expanded: w-10 h-10, with text "Pharmako" beside it
Font: Plus Jakarta Sans semibold
```

## Animation Variants

```ts
// New in animations.ts
export const sidebarFloatVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export const sidebarItemFloatVariant = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0 },
};
```
