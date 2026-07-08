# 🧠 Flujo de desarrollo LUCA — Paso a paso

> Este es el proceso que uso para cada feature. Seguilo en orden.

> ⚠️ **Source of truth de estilos:** este flujo referencia la skill **`luca-design`**
> (en `.agents/skills/luca-design/SKILL.md`). Si este documento y la skill divergen,
> **mandan los tokens y reglas de la skill**. Si actualizás este workflow, sincronizá
> con la skill — no al revés.

---

## 1. Entender el contexto (codegraph)

**Antes de escribir una línea de código**, entendé qué existe:

```
codegraph_context → "¿cómo funciona X? ¿qué archivos están relacionados?"
```

Ejemplo: `"consultation form and how medications are selected"`

Esto te devuelve:
- Entry points (funciones/componentes principales)
- Related symbols (imports, dependencias)
- Código de los símbolos clave

**Nunca abras archivos manualmente sin pasar por codegraph primero.**

---

## 2. Iniciar el SDD

Todo feature no-trivial lleva SDD. Creá la carpeta:

```
mkdir -p openspec/changes/YYYY-MM-DD_nombre-del-cambio
```

### Archivos del SDD (en orden):

| # | Archivo | Qué va |
|---|---------|--------|
| 1 | `init.md` | Scope, contexto, goals |
| 2 | `explore.md` | Qué encontraste (deuda técnica, qué existe, qué falta) |
| 3 | `proposal.md` | Qué vas a hacer, layout, componentes |
| 4 | `spec.md` | Criterios de aceptación (AC1, AC2...) |
| 5 | `design.md` | Token mapping, component tree, data flow |
| 6 | `tasks.md` | Checklist `- [ ]` con cada tarea (para trackear progreso) |

---

## 3. Estructura de feature

Siempre seguí este patrón:

```
src/features/tu-feature/
├── types/
│   └── index.ts            ← Interfaces y tipos del dominio
├── hooks/
│   ├── useTuDato1.ts       ← Hooks de datos (mock → TanStack Query)
│   └── useTuDato2.ts
├── components/
│   ├── TuComponente1.tsx   ← Componentes visuales
│   ├── TuComponente2.tsx
│   └── TuDashboard.tsx     ← Composición root
└── index.ts                ← Barrel export
```

---

## 4. Sistema de diseño (obligatorio)

> **Referencia canónica:** `.agents/skills/luca-design/SKILL.md` (sección 2 — Color System,
> sección 6 — Borders, sección 7 — Components, sección 8 — Iconography).

### Tokens — secciones por dominio

LUCA separa los flujos en dos paletas. Usá la correcta para el contexto.

**Doctor / Patient → Primary (azul)**

| Elemento | Token |
|----------|-------|
| Botones primarios | `bg-pharmako-primary text-white hover:bg-pharmako-primary-hover` |
| Links | `text-pharmako-primary hover:text-pharmako-primary-hover` |
| Tinte íconos (cards) | `bg-pharmako-primary-light` |
| Íconos de acción directa | `text-pharmako-primary` |
| Border lateral de cards Doctor | `border-l-4 border-l-pharmako-primary` |

**Pharmacy / Medications → Care (teal)**

| Elemento | Token |
|----------|-------|
| Botones Care | `bg-pharmako-care text-white hover:bg-pharmako-care-hover` |
| Badge de categoría/rol | `bg-pharmako-care-light text-pharmako-care` |
| Tinte íconos (cards) | `bg-pharmako-care-light` |
| Border lateral de cards Pharmacy | `border-l-4 border-l-pharmako-care` |

**Decorative (KPIs, headers, listas) — `text-pharmako-care`**
(regla 8 de la skill: íconos dentro de KPI cards, section headers y list titles usan teal,
independientemente del dominio — son landmarks visuales, no acciones interactivas).

### Tokens — surfaces y textos (Notion-isomatic)

| Elemento | Token |
|----------|-------|
| Fondo de app | `bg-pharmako-background` |
| Fondo de cards | `bg-pharmako-surface` |
| Surface cálida (opcional) | `bg-pharmako-surface-warm` |
| Canvas / áreas sutiles | `bg-pharmako-canvas` |
| Bordes de cards | `border-pharmako-border-soft` |
| Bordes estándar | `border-pharmako-border` |
| Títulos / texto primario | `text-pharmako-text-primary` |
| Texto secundario | `text-pharmako-text-secondary` |
| Texto muted / placeholder | `text-pharmako-text-muted` |

### Tokens — semánticos

| Estado | Token |
|--------|-------|
| Éxito / Estable / Completado | `bg-pharmako-success-light text-pharmako-success` |
| Warning / Pendiente | `bg-pharmako-warning-light text-pharmako-warning` |
| Danger / Error / Cancelado | `bg-pharmako-danger-light text-pharmako-danger` |
| Accent | `bg-pharmako-accent-light text-pharmako-accent` |

### Tokens — focus / interactive

```tsx
// Inputs y botones (regla 14 — accessibility)
focus:border-pharmako-primary focus:ring-2 focus:ring-pharmako-primary focus:ring-offset-2

// Button icon-only
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pharmako-primary focus-visible:ring-offset-2
```

### Sombras (regla 5)

| Permitido | Uso |
|-----------|-----|
| `shadow-xs` | Lift muy sutil |
| `shadow-sm` | Cards por default |
| `shadow-md` | Cards en hover |
| `shadow-lg` | Modals / popovers |
| `shadow-xl` | Drawers / overlays grandes |

**Prohibido:** `shadow-2xl` y más pesadas, `shadow-[4px_4px_0px_black]` y variantes
neo-brutalistas, sombras combinadas con bordes negros gruesos.

### Prohibido (resumen)

- ❌ `shadow-2xl` o más pesadas, `shadow-[…]`, sombras neo-brutalistas (regla 5)
- ❌ `border-black`, `border-2` gruesos, `border-slate-900` (regla 6)
- ❌ `luca-primary`, `luca-muted`, `luca-accent`, `luca-surface` (legacy, no existen en la skill)
- ❌ `backdrop-blur` (regla 9)
- ❌ `react-icons` — **solo** `lucide-react` (regla 8)
- ❌ `ease-linear` — siempre `easeOut` (regla 9)
- ❌ `duration-1000` o más lentas (regla 9)
- ❌ `animate-bounce` (regla 9)
- ❌ **Tokens crudos sin prefijo `pharmako-*`**: `text-slate-*`, `bg-slate-*`, `bg-emerald-*`, `bg-amber-*`, `bg-rose-*`, `bg-teal-*`, `bg-blue-*`, `border-slate-*` en el feature code. Toda superficie, texto, borde y estado semántico debe pasar por los tokens de la skill.

---

## 5. Estructura de un componente

> **Card Doctor/Patient** (Primary azul) — ejemplo alineado a `luca-design` sección 7:

```tsx
"use client";

import { motion } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { IconName } from "lucide-react";
import { cn } from "@/lib/utils";

export function MiComponente() {
  return (
    <motion.div
      variants={fadeUpVariant}
      initial="hidden"
      animate="visible"
      className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-6"
    >
      {/* Icon wrapper — Doctor flow: tinte primary */}
      <div className="bg-pharmako-primary-light rounded-xl p-3">
        <IconName className="h-5 w-5 text-pharmako-primary" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-pharmako-text-primary">Título</h3>
      <p className="text-sm text-pharmako-text-secondary">Descripción</p>
    </motion.div>
  );
}
```

> **Card Pharmacy/Medications** (Care teal) — mismo shell, distinto acento:

```tsx
<div className="bg-pharmako-surface rounded-xl border border-pharmako-border-soft p-6">
  <div className="bg-pharmako-care-light rounded-xl p-3">
    <IconName className="h-5 w-5 text-pharmako-care" />
  </div>
  <h3 className="text-lg font-semibold text-pharmako-text-primary">Título</h3>
  <p className="text-sm text-pharmako-text-secondary">Descripción</p>
</div>
```

> **Decorative KPI icon** (regla 8) — siempre `text-pharmako-care`, sin importar dominio:

```tsx
<div className="bg-pharmako-canvas rounded-xl p-3">
  <KpiIcon className="h-5 w-5 text-pharmako-care" />
</div>
```

---

## 6. Hook de datos (mock pattern)

```typescript
import type { MiTipo } from "../types";

export function useMiHook(): MiTipo[] {
  return [
    { id: "1", label: "Dato 1", value: 10 },
    { id: "2", label: "Dato 2", value: 20 },
  ];
}
```

Siempre tipado, siempre exportado, siempre datos realistas.

---

## 7. Dashboard page wiring

En `src/app/dashboard/page.tsx`:

```tsx
import { MiDashboard } from "@/features/mi-feature";

// Dentro del componente:
if (role === "mi-rol") {
  return <MiDashboard />;
}
```

---

## 8. Proxy (auth middleware)

Si creás rutas nuevas bajo `/dashboard/*`, el proxy ya las permite (agregamos `startsWith("/dashboard")`). Si creás rutas fuera de `/dashboard`, agregalas en `publicRoutes` o con un `startsWith`.

---

## 9. Verificaciones antes de commitear

> Los chequeos de estilo se alinean con la skill `luca-design` (sección 17 — Checklist Before PR).
> Si todo devuelve vacío, el feature cumple el design system.

```bash
# TypeScript
npx tsc --noEmit --pretty 2>&1 | grep "mi-feature"

# Lint
npx eslint src/features/mi-feature/ --quiet

# ── Tokens legacy `luca-*` (DEBE devolver vacío)
grep -rE "\b(luca-(primary|muted|accent|surface))\b" src/features/mi-feature/

# ── Tokens crudos sin prefijo pharmako (DEBE devolver vacío).
# Cubren slate, emerald, amber, rose, teal, blue — toda la paleta cruda.
grep -rE "\b(text|bg|border)-(slate|emerald|amber|rose|teal|blue)-(50|100|200|300|400|500|600|700|800|900)\b" src/features/mi-feature/

# ── Sombras prohibidas (DEBE devolver vacío).
# Solo shadow-xs/sm/md/lg/xl están permitidas (regla 5 de la skill).
grep -rE "\bshadow-(2xl|inner|none|\[)" src/features/mi-feature/

# ── backdrop-blur (DEBE devolver vacío)
grep -r "backdrop-blur" src/features/mi-feature/

# ── Icon libraries prohibidas (DEBE devolver vacío) — solo lucide-react
grep -rE "from ['\"](react-icons|@iconify|@mui/icons-material)" src/features/mi-feature/

# ── Animaciones prohibidas (DEBEN devolver vacío)
grep -rE "(ease-linear|duration-1[0-9]{3}|animate-bounce)" src/features/mi-feature/
```

**Si los siete greps devuelven vacío + `tsc` y `eslint` limpios → feature cumple `luca-design`.**

---

## 10. Commits atómicos

Un commit = una unidad de trabajo:

```
feat(mi-feature): add types and data hooks
refactor(mi-feature): redesign components to Notion-isomatic
fix(mi-feature): correct layout width
```

Commits en español para features, inglés para fixes técnicos.

---

## 11. Guardar en Engram

Después de cada cambio significativo:

```
mem_save → type: "decision" | "architecture" | "bugfix"
mem_save → topic_key: "sdd/mi-feature/proposal"
```

---

## Orden de operaciones resumido

```
codegraph_context  →  SDD (init/explore/proposal/spec/design/tasks)
       ↓
types/index.ts  →  hooks/  →  components/  →  index.ts
       ↓
DashboardPage wiring  →  proxy check
       ↓
tsc + eslint + grep pharmako/shadow/icons  →  commit  →  push  →  engram
```
