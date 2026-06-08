# 🧠 Flujo de desarrollo LUCA — Paso a paso

> Este es el proceso que uso para cada feature. Seguilo en orden.

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

### Colores

| Elemento | Token |
|----------|-------|
| Íconos | `text-pharmako-care` |
| Fondos de íconos | `bg-pharmako-care-light` |
| Botones primarios | `bg-blue-700 text-white hover:bg-blue-800` |
| Links | `text-blue-700 hover:text-blue-800` |
| Bordes de cards | `border-slate-200` |
| Fondo de cards | `bg-white` |
| Títulos | `text-slate-900` |
| Texto secundario | `text-slate-500` |
| Texto muted | `text-slate-400` |
| Éxito/Estable | `bg-emerald-50 text-emerald-600` |
| Alerta/Warning | `bg-amber-50 text-amber-600` |
| Badge de rol | `bg-pharmako-care-light text-pharmako-care` |

### Prohibido
- ❌ `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- ❌ `luca-primary`, `luca-muted`, `luca-accent`, `luca-surface`
- ❌ `backdrop-blur`
- ❌ `react-icons` (solo `lucide-react`)

---

## 5. Estructura de un componente

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
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      {/* Icon wrapper */}
      <div className="bg-pharmako-care-light rounded-xl p-3">
        <IconName className="w-5 h-5 text-pharmako-care" />
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-slate-900">Título</h3>
      <p className="text-sm text-slate-500">Descripción</p>
    </motion.div>
  );
}
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

```bash
# TypeScript
npx tsc --noEmit --pretty 2>&1 | grep "mi-feature"

# Lint
npx eslint src/features/mi-feature/ --quiet

# Sombras (DEBE devolver vacío)
grep -r "shadow-" src/features/mi-feature/

# Luca tokens (DEBE devolver vacío)
grep -r "luca-" src/features/mi-feature/
```

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
tsc + eslint + grep shadow/luca  →  commit  →  push  →  engram
```
