# LUCA Design System — Skill for AI Agents

## Purpose

This skill defines LUCA's visual language and design rules. Every AI agent implementing UI components, pages, or features in LUCA must follow these guidelines to ensure visual consistency across the platform.

---

## 1. Brand Identity

**LUCA** is a Health Operating System (B2B2C) connecting Patients, Doctors, Pharmacies, and Clinics. The design must inspire **trust**, **hygiene**, and **premium technology**.

**Tagline:** Clean & Elevated.

---

## 2. Color System

### Brand Palette — `pharmako-*` tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `pharmako-primary` | `#0057FF` | Primary actions, brand elements (Doctor/Patient flows) |
| `pharmako-primary-hover` | `#0046D0` | Primary hover state |
| `pharmako-primary-light` | `#EEF5FF` | Primary tint backgrounds |
| `pharmako-primary-muted` | `#B8D4FC` | Primary muted/disabled states |
| `pharmako-care` | `#23DCE1` | Secondary/Care actions (Pharmacy/Medications flows) |
| `pharmako-care-hover` | `#12C4C9` | Care hover state |
| `pharmako-care-light` | `#EBFAF3` | Care tint backgrounds |
| `pharmako-accent` | `#A78BFA` | Accent highlights, special features |
| `pharmako-accent-light` | `#F3EEFF` | Accent tint backgrounds |
| `pharmako-success` | `#34D399` | Success states, positive indicators |
| `pharmako-success-light` | `#ECFDF5` | Success backgrounds |
| `pharmako-warning` | `#FBBF24` | Warning states, caution indicators |
| `pharmako-warning-light` | `#FFFBEB` | Warning backgrounds |
| `pharmako-danger` | `#F87171` | Error/Danger states, destructive actions |
| `pharmako-danger-light` | `#FEF2F2` | Danger backgrounds |

### Surface & Neutral Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `pharmako-surface` | `#FFFFFF` | Card backgrounds, elevated surfaces |
| `pharmako-surface-warm` | `#FAF9F7` | Warm surface variant |
| `pharmako-background` | `#F8FAFC` | App background |
| `pharmako-canvas` | `#F0F2F7` | Canvas/subtle areas |
| `pharmako-text-primary` | `#0F172A` | Primary text |
| `pharmako-text-secondary` | `#475569` | Secondary text |
| `pharmako-text-muted` | `#64748B` | Muted/placeholder text |
| `pharmako-border` | `#E2E8F0` | Standard borders |
| `pharmako-border-soft` | `#F0F1F3` | Soft borders, dividers |

### Tailwind CSS Usage

```tsx
// Primary (Doctor/Patient flows)
<div className="bg-pharmako-primary text-white hover:bg-pharmako-primary-hover" />
<div className="bg-pharmako-primary-light" />

// Care (Pharmacy/Medications flows)
<div className="bg-pharmako-care text-white hover:bg-pharmako-care-hover" />
<div className="bg-pharmako-care-light" />

// Surfaces
<div className="bg-pharmako-surface rounded-xl shadow-sm" />
<div className="bg-pharmako-background" />

// Text
<p className="text-pharmako-text-primary">Heading</p>
<p className="text-pharmako-text-secondary">Body</p>
<p className="text-pharmako-text-muted">Caption</p>

// Semantic
<div className="bg-pharmako-success-light text-pharmako-success" />
<div className="bg-pharmako-warning-light text-pharmako-warning" />
<div className="bg-pharmako-danger-light text-pharmako-danger" />
```

---

## 3. Typography

### Font Stack

```css
font-family: var(--font-sans); /* Plus Jakarta Sans (configured in globals.css) */
```

### Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400 | Captions, labels |
| `text-sm` | 14px | 400 | Secondary text |
| `text-base` | 16px | 400 | Body text |
| `text-lg` | 18px | 500 | Lead text |
| `text-xl` | 20px | 600 | Subheadings |
| `text-2xl` | 24px | 700 | Section headings |
| `text-3xl` | 30px | 700 | Page titles |

### Text Colors

```tsx
// Primary — use for headings, important content
<span className="text-pharmako-text-primary">Title</span>

// Secondary — use for body text, descriptions
<span className="text-pharmako-text-secondary">Description</span>

// Muted — use for hints, placeholders, metadata
<span className="text-pharmako-text-muted">Helper text</span>
```

---

## 4. Spacing & Radii

### Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Small inputs, tags |
| `radius-md` | 14px | Cards, buttons |
| `radius-lg` | 20px | Large cards, modals |
| `radius-xl` | 28px | Hero sections |
| `radius-2xl` | 40px | Special containers |
| `radius-pill` | 999px | Pills, badges, avatars |

### Tailwind Usage

```tsx
<button className="rounded-md">Button</button>
<Card className="rounded-lg">Card</Card>
<Modal className="rounded-xl">Modal</Modal>
<Badge className="rounded-pill">Badge</Badge>
```

### Spacing Scale

Use Tailwind's standard scale with generous padding for LUCA's "breathing" aesthetic:

```tsx
// Cards — generous padding
<div className="p-6 lg:p-8" />

// Inputs — standard padding
<input className="px-4 py-3" />

// Buttons — compact padding
<button className="px-5 py-2.5">Action</button>

// Sections — large gaps
<div className="gap-6 lg:gap-8" />
```

---

## 5. Shadows

### LUCA Shadow System

| Class | Effect | Usage |
|-------|--------|-------|
| `shadow-xs` | Subtle lift | Very light elevation |
| `shadow-sm` | Default card | Standard cards |
| `shadow-md` | Hover state | Elevated cards on hover |
| `shadow-lg` | Modals | Popovers, dialogs |
| `shadow-xl` | Special | Drawers, large overlays |

### Prohibited Styles

- ❌ No `shadow-2xl` or heavier (too heavy for healthcare)
- ❌ No brutalist offset shadows (`shadow-[4px_4px_0px_black]`)
- ❌ No harsh borders combined with shadows

### Correct Shadow Usage

```tsx
// Card default
<div className="bg-white rounded-xl shadow-sm border border-pharmako-border-soft" />

// Card hover
<div className="bg-white rounded-xl shadow-sm border border-pharmako-border-soft hover:shadow-md transition-shadow" />

// Modal/Dialog
<div className="bg-white rounded-xl shadow-lg" />
```

---

## 6. Borders

### Border Rules

```tsx
// Standard border
<div className="border border-pharmako-border" />

// Soft border (cards)
<div className="border border-pharmako-border-soft" />

// No border (clean look)
<div className="bg-white" />
```

### Prohibited

- ❌ No `border-black` or `border-2` thick borders
- ❌ No `border-slate-900`

---

## 7. Components

### Button Variants

```tsx
// Primary (brand blue) — main CTAs
<Button className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white">
  Primary Action
</Button>

// Secondary — secondary actions
<Button variant="outline" className="border-pharmako-border text-pharmako-text-primary">
  Secondary
</Button>

// Ghost — tertiary actions
<Button variant="ghost" className="text-pharmako-text-secondary">
  Ghost
</Button>

// Destructive — delete/danger
<Button variant="destructive" className="bg-pharmako-danger">
  Delete
</Button>

// Care variant (pharmacy sections)
<Button className="bg-pharmako-care hover:bg-pharmako-care-hover text-white">
  Care Action
</Button>
```

### Input Styles

```tsx
// Standard input
<Input 
  className="border-pharmako-border bg-white focus:border-pharmako-primary focus:ring-pharmako-primary/20"
  placeholder="Search..."
/>

// Search input with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pharmako-text-muted h-4 w-4" />
  <Input 
    className="pl-10 border-pharmako-border bg-white"
    placeholder="Search medications..."
  />
</div>
```

### Card Structure

```tsx
// Standard card
<div className="bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft p-6">
  <h3 className="text-lg font-semibold text-pharmako-text-primary mb-4">Title</h3>
  <p className="text-pharmako-text-secondary">Content</p>
</div>

// Card with icon header
<div className="bg-pharmako-surface rounded-xl shadow-sm border border-pharmako-border-soft">
  <div className="p-4 border-b border-pharmako-border-soft flex items-center gap-3">
    <div className="p-2 bg-pharmako-primary-light rounded-lg">
      <Icon className="h-5 w-5 text-pharmako-primary" />
    </div>
    <h3 className="font-semibold text-pharmako-text-primary">Title</h3>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Badge Styles

```tsx
// Status badges
<Badge variant="secondary" className="bg-pharmako-success-light text-pharmako-success">
  Active
</Badge>

<Badge variant="secondary" className="bg-pharmako-warning-light text-pharmako-warning">
  Pending
</Badge>

<Badge variant="secondary" className="bg-pharmako-danger-light text-pharmako-danger">
  Inactive
</Badge>

// Category badges
<Badge variant="outline" className="border-pharmako-accent text-pharmako-accent">
  Category
</Badge>
```

---

## 8. Iconography

**Library:** Lucide React

Always import from `lucide-react`:

```tsx
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ChevronRight,
  MoreVertical,
  // ... other icons
} from "lucide-react";
```

### Icon Sizing

| Context | Size |
|---------|------|
| Inline (text next to icon) | `h-4 w-4` |
| Button icon | `h-5 w-5` |
| Card header icon | `h-5 w-5` |
| Empty state icon | `h-12 w-12` |
| Hero illustration | `h-24 w-24` |

### Icon Color

```tsx
// Default (inherits text color)
<Icon className="h-5 w-5" />

// Primary
<Icon className="h-5 w-5 text-pharmako-primary" />

// Muted
<Icon className="h-5 w-5 text-pharmako-text-muted" />

// Care theme (Dashboard decorative icons, list titles, KPIs)
<Icon className="h-5 w-5 text-pharmako-care" />
```

### Dashboard Icon Color Rules

- **Dashboard Decorative Icons:** Icons inside KPI cards, section headers, and list titles must use `text-pharmako-care` (`#23DCE1`) as their base color to signify care-oriented metrics and visual landmarks.
- **Exceptions:** Icons representing direct interactive actions (e.g., table row actions, delete buttons, registry buttons) do not use `text-pharmako-care` and should use standard action colors (like `text-slate-400`, `text-blue-700`, or `text-pharmako-primary`).

---

## 9. Animations

### Tailwind Animations (Preferred)

```tsx
// Fade in
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

// Hover transitions
<button className="transition-all duration-200 hover:scale-105">

// Card hover lift
<div className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
```

### Framer Motion (Complex Animations)

Use for:
- Layout transitions
- Modal/Dialog animations
- Page transitions
- Drag and drop
- Complex list animations

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Page mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  {children}
</motion.div>

// Modal
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

### Prohibited Animations

- ❌ No `linear` easing (feels robotic)
- ❌ No `duration-1000` or longer (too slow)
- ❌ No `animate-bounce` (unprofessional)

---

## 10. Layout Patterns

### Page Structure

```tsx
// Dashboard page layout
export default function DashboardPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pharmako-text-primary">
            Page Title
          </h1>
          <p className="text-pharmako-text-secondary mt-1">
            Page description
          </p>
        </div>
        <Button className="bg-pharmako-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>Content</Card>
        <Card>Content</Card>
      </div>
    </div>
  );
}
```

### Sidebar Navigation Item

```tsx
<SidebarItem 
  icon={Pill} 
  label="Medicamentos" 
  href="/dashboard/medications"
  variant="care" // Uses pharmako-care color
/>
```

### Tab Switcher Pattern

```tsx
<Tabs defaultValue="resumen" className="space-y-6">
  <TabsList className="bg-pharmako-canvas p-1 rounded-lg">
    <TabsTrigger 
      value="resumen"
      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
    >
      Resumen
    </TabsTrigger>
    <TabsTrigger 
      value="lista"
      className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
    >
      Lista
    </TabsTrigger>
  </TabsList>
  <TabsContent value="resumen">{/* Summary content */}</TabsContent>
  <TabsContent value="lista">{/* List content */}</TabsContent>
</Tabs>
```

---

## 11. Section-Specific Theming

### Doctor/Patient Sections

Use **Primary (Blue)** theme:

```tsx
<Card className="border-l-4 border-l-pharmako-primary">
  {/* Doctor content */}
</Card>

<Button className="bg-pharmako-primary hover:bg-pharmako-primary-hover">
  Primary Action
</Button>
```

### Pharmacy/Medications Sections

Use **Care (Teal)** theme:

```tsx
<Card className="border-l-4 border-l-pharmako-care">
  {/* Pharmacy content */}
</Card>

<Button className="bg-pharmako-care hover:bg-pharmako-care-hover">
  Care Action
</Button>

<Badge className="bg-pharmako-care-light text-pharmako-care">
  Medication
</Badge>
```

### Mixed Sections

When both domains appear, use neutral base with accent highlights:

```tsx
<div className="bg-pharmako-surface">
  {/* Neutral container */}
  <div className="p-4 bg-pharmako-primary-light rounded-lg">
    {/* Doctor highlight */}
  </div>
  <div className="p-4 bg-pharmako-care-light rounded-lg">
    {/* Pharmacy highlight */}
  </div>
</div>
```

---

## 12. Responsive Design

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Responsive Patterns

```tsx
// Mobile-first grid
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Cards */}
</div>

// Stacked on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-6">
  <Sidebar />
  <MainContent />
</div>

// Text scaling
<h1 className="text-2xl lg:text-3xl font-bold">
  Responsive Title
</h1>
```

---

## 13. Dark Mode

Dark mode is supported via CSS variables. Use semantic tokens:

```tsx
// Always use semantic tokens — dark mode is automatic
<div className="bg-white dark:bg-pharmako-surface" />
<div className="text-slate-900 dark:text-pharmako-text-primary" />
```

### Manual Dark Mode Overrides

When brand colors need dark mode variants:

```tsx
<Button className="bg-pharmako-primary dark:bg-pharmako-primary-hover">
  Action
</Button>
```

---

## 14. Accessibility

### Requirements

- All interactive elements must have `:focus-visible` states
- Use `aria-label` for icon-only buttons
- Ensure color contrast meets WCAG 2.1 AA (4.5:1 for text)
- All form inputs need associated labels
- Use `role` attributes for complex components

### Focus States

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pharmako-primary focus-visible:ring-offset-2">
  Accessible Button
</button>

<Input className="focus:border-pharmako-primary focus:ring-pharmako-primary/20" />
```

---

## 15. Common Patterns

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="p-4 bg-pharmako-canvas rounded-full mb-4">
    <EmptyIcon className="h-12 w-12 text-pharmako-text-muted" />
  </div>
  <h3 className="text-lg font-semibold text-pharmako-text-primary mb-2">
    No items found
  </h3>
  <p className="text-pharmako-text-muted mb-6 max-w-sm">
    Get started by creating your first item.
  </p>
  <Button className="bg-pharmako-primary">
    <Plus className="h-4 w-4 mr-2" />
    Create Item
  </Button>
</div>
```

### Loading States

```tsx
// Skeleton loader
<div className="space-y-3">
  <Skeleton className="h-4 w-full bg-pharmako-canvas" />
  <Skeleton className="h-4 w-3/4 bg-pharmako-canvas" />
  <Skeleton className="h-4 w-1/2 bg-pharmako-canvas" />
</div>

// Button loading
<Button disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Loading...
</Button>
```

### Toast Notifications

```tsx
import { toast } from "sonner";

toast.success("Item created successfully");
toast.error("Failed to delete item");
toast.warning("Please complete all required fields");
```

---

## 16. File Organization

Follow **Feature-Based Architecture**:

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   └── types/
├── medications/
│   ├── components/
│   ├── hooks/
│   ├── schemas/
│   └── types/
├── consultations/
│   └── ...
└── ...

src/components/ui/        # Generic shadcn/ui components
src/lib/                   # Utilities, API clients
src/store/                 # Zustand stores
```

---

## 17. Checklist Before PR

- [ ] All colors use `pharmako-*` tokens
- [ ] Text colors use semantic tokens (`text-pharmako-text-*`)
- [ ] Shadows are `shadow-sm` or `shadow-md`, never heavier
- [ ] Borders use `border-pharmako-border` or `border-pharmako-border-soft`
- [ ] Border radius uses Tailwind's `rounded-*` classes
- [ ] Buttons use brand variants (`bg-pharmako-primary`, `bg-pharmako-care`)
- [ ] Cards use white backgrounds with subtle borders
- [ ] Spacing is generous (`p-6`, `gap-6`)
- [ ] Icons are from Lucide React
- [ ] Animations use `easeOut` or Tailwind defaults
- [ ] Dark mode is considered (semantic tokens)
- [ ] Accessibility: focus states, aria labels, contrast

---

## Summary: Do's and Don'ts

### ✅ DO

- Use `pharmako-*` tokens for all colors
- Use white cards with subtle shadows
- Use generous padding (p-6, gap-6)
- Use Lucide icons
- Use Plus Jakarta Sans font
- Use rounded corners (rounded-lg, rounded-xl)
- Use easeOut animations
- Use Tailwind's animate-in utilities

### ❌ DON'T

- Use `text-black` or `border-black`
- Use heavy shadows (`shadow-2xl`)
- Use neo-brutalist styles
- Use `linear` easing
- Use system fonts
- Use hard borders without softening
- Use overly long animations

---

*Last updated: 2026-06-17*
*Version: 1.0*
