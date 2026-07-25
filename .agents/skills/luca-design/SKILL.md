---
name: luca-design
description: Guidelines and rules for implementing UI components, pages, or features in the LUCA Health Operating System using tailwind, HSL colors, and Notion-isomatic design tokens (flat surfaces, zero shadows, pharmako-care primary accent).
---

# LUCA Design System — Notion-isomatic Skill

## 1. Core Philosophy: Notion-isomatic

LUCA's design language is **Notion-isomatic**: flat, structured, high-density, and clean. It inspires **trust**, **hygiene**, and **modern medical technology**.

### Core Principles

- **Zero Shadows**: Absolutely NO box shadows (`shadow-sm`, `shadow-md`, `shadow-lg`, etc.). Elevation and separation are achieved exclusively through 1px crisp borders (`border-slate-200` / `border-pharmako-border-soft`) and surface background contrast (`bg-white` vs `bg-slate-50`).
- **Primary Brand Color**: `pharmako-care` (`#23DCE1`) is the core action and primary brand color across the entire platform (Buttons, Active Tabs, Highlights, Key Indicators).
- **Clean Surface Hierarchy**: Flat white cards (`bg-white`) on neutral light backgrounds (`bg-slate-50` / `bg-pharmako-background`).
- **Subtle Interactions**: Hover states rely on gentle background color shifts (`hover:bg-slate-50`, `hover:bg-pharmako-care-light`) rather than elevation changes.

---

## 2. Color System

### Brand & Accent Tokens — `pharmako-*`

| Token | Hex | Usage |
|-------|-----|-------|
| `pharmako-care` | `#23DCE1` | **PRIMARY Action & Brand Color** (Buttons, active states, key icons) |
| `pharmako-care-hover` | `#12C4C9` | Primary action hover state |
| `pharmako-care-light` | `#EBFAF3` | Primary tint background for badges, active items, highlights |
| `pharmako-primary` | `#0057FF` | Secondary system accent (Doctor/Patient flow highlights) |
| `pharmako-primary-light` | `#EEF5FF` | Secondary tint background |
| `pharmako-accent` | `#A78BFA` | Special feature highlights |
| `pharmako-accent-light` | `#F3EEFF` | Accent tint background |
| `pharmako-success` | `#10B981` | Positive indicators, completed states |
| `pharmako-success-light` | `#ECFDF5` | Success background tint |
| `pharmako-warning` | `#F59E0B` | Caution, pending states |
| `pharmako-warning-light` | `#FFFBEB` | Warning background tint |
| `pharmako-danger` | `#EF4444` | Errors, destructive actions |
| `pharmako-danger-light` | `#FEF2F2` | Danger background tint |

### Surface & Typography Tokens

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `pharmako-surface` | `#FFFFFF` | Cards, panels, modal dialogs |
| `pharmako-background` | `#F8FAFC` | Main app layout background |
| `pharmako-canvas` | `#F1F5F9` | Tab lists, secondary containers |
| `pharmako-text-primary` | `#0F172A` | Primary text, headings (Slate 900) |
| `pharmako-text-secondary` | `#475569` | Body text, descriptions (Slate 600) |
| `pharmako-text-muted` | `#64748B` | Labels, placeholders, metadata (Slate 500) |
| `pharmako-border` | `#E2E8F0` | Standard 1px crisp borders |
| `pharmako-border-soft` | `#F1F5F9` | Soft dividers, inner borders |

---

## 3. Strict Rules & Prohibitions

### ❌ Prohibited (Zero Tolerance)

- ❌ **NO SHADOWS**: Do NOT use `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, or custom `shadow-[...]`.
- ❌ **NO PURE BLACK**: Do NOT use `#000000` or `text-black` / `bg-black`. Use `text-slate-900` or `pharmako-text-primary`.
- ❌ **NO THICK BORDERS**: Do NOT use `border-2` or `border-4` on cards or containers. All borders must be 1px (`border` / `border-slate-200`).
- ❌ **NO BRUTALISM**: No offset borders, no heavy dark outlines.
- ❌ **NO BOUNCE ANIMATIONS**: Use `easeOut` physics or Tailwind `transition-colors duration-150` for crisp Notion-like responsiveness.

### ✅ Allowed & Recommended

- ✅ **Flat Crisp Cards**: `<div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-none">`
- ✅ **Surface Contrast**: Place white cards on a `bg-slate-50` page background.
- ✅ **Primary Action Buttons**: `<Button className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover border-none shadow-none">`
- ✅ **Secondary Outline Buttons**: `<Button variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none">`
- ✅ **Active Item Tints**: Use `bg-pharmako-care-light text-pharmako-care` for active tabs, selected items, or status tags.

---

## 4. Typography & Layout Standards

### Font Stack

```css
font-family: var(--font-sans); /* Plus Jakarta Sans */
```

### Headings & Text Hierarchy

```tsx
// Page Heading
<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Título de Página</h1>

// Section Heading
<h2 className="text-lg font-bold text-slate-900">Título de Sección</h2>

// Body & Subtitle
<p className="text-sm text-slate-600">Descripción clara en máximo dos líneas.</p>

// Small Metadata / Label
<span className="text-xs font-medium text-slate-500">Etiqueta o fecha</span>
```

---

## 5. Component Patterns (Notion-isomatic)

### Cards

```tsx
// Standard Flat Card
<div className="bg-white border border-slate-200 rounded-xl p-6 shadow-none space-y-4">
  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
    <h3 className="text-base font-bold text-slate-900">Título del Card</h3>
    <Badge className="bg-pharmako-care-light text-pharmako-care border-none">Activo</Badge>
  </div>
  <p className="text-sm text-slate-600 leading-relaxed">
    Contenido del card limpio sin sombras.
  </p>
</div>
```

### Buttons

```tsx
// Primary CTA (pharmako-care)
<button className="px-5 py-2.5 rounded-xl bg-pharmako-care text-slate-900 text-sm font-semibold hover:bg-pharmako-care-hover transition-colors shadow-none">
  Guardar Cambios
</button>

// Secondary / Ghost
<button className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-none">
  Cancelar
</button>
```

### Tab Switcher (Notion Style)

```tsx
<div className="flex bg-slate-100/80 p-1 rounded-xl gap-1">
  <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-900 border border-slate-200/60 shadow-none">
    Vista General
  </button>
  <button className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shadow-none">
    Configuración
  </button>
</div>
```

### Status Badges

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-pharmako-care-light text-pharmako-care">
  ● Publicado
</span>
```

---

## 6. Summary Checklist

When reviewing or building UI code for LUCA:
- [ ] Are all `shadow-*` classes removed? (`shadow-none`)
- [ ] Is `pharmako-care` (`#23DCE1`) used for primary CTAs and active states?
- [ ] Are card borders 1px (`border-slate-200` / `border-pharmako-border-soft`)?
- [ ] Are backgrounds flat white (`bg-white`) on neutral canvas (`bg-slate-50`)?
- [ ] Are hover effects smooth color changes rather than lifts/shadows?
