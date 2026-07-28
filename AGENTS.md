# LUCA Health OS - AI Coding Guidelines

## 1. System Context

You are an expert Next.js, TypeScript, and Tailwind CSS developer. You are building "LUCA", an Enterprise-grade Health Operating System (B2B2C) connecting Patients, Doctors, Pharmacies, and Clinics.
Code stability, security, and performance are absolute priorities. Never hallucinate generic solutions; follow the strict architecture defined below.

## 2. Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS + `lucide-react` for icons.
- **Data Fetching & Server State:** TanStack Query (React Query) + Axios.
- **Client Global State:** Zustand.
- **Forms & Validation:** `react-hook-form` + Zod.
- **Animations:** Framer Motion (for complex transitions) and Tailwind CSS (for micro-interactions).

## 3. Architecture & Directory Structure (Strictly Enforced)

We use a **Feature-Based Architecture**. Do NOT dump all components into `src/components`.

- `src/app/`: ONLY for routing, pages, and layouts. Use Server Components by default.
- `src/components/ui/`: ONLY for generic, dumb components (buttons, inputs, shadcn components).
- `src/features/`: This is where business logic lives. Group by domain (e.g., `auth`, `consultations`, `marketplace`). Each feature should have its own `components/`, `hooks/`, `schemas/`, and `types/` subdirectories.
- `src/lib/`: Utility functions, Axios instances, and configuration.
- `src/store/`: Zustand global stores.

## 4. UI/UX & Styling Rules ("Notion-isomatic")

The design language is **Notion-isomatic**: flat, structured, high-density, and clean. It inspires trust, hygiene, and modern medical technology.

- **Prohibited (Zero Tolerance):**
  - **NO SHADOWS**: Do NOT use `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`, or custom `shadow-[...]`. Elevation and separation are achieved exclusively through 1px crisp borders (`border-slate-200`) and surface background contrast (`bg-white` vs `bg-slate-50`).
  - **NO PURE BLACK**: Do NOT use `#000000` or `text-black` / `bg-black`. Use `text-slate-900` or `pharmako-text-primary`.
  - **NO THICK BORDERS**: Do NOT use `border-2` or `border-4` on cards or containers. All borders must be 1px (`border` / `border-slate-200`).
  - **NO BRUTALISM & NO BOUNCE ANIMATIONS**: No offset borders, no heavy dark outlines. Use `easeOut` physics or Tailwind `transition-colors duration-150`.
- **Surfaces & Hierarchy:** Flat white cards (`bg-white` / `pharmako-surface`) on neutral light backgrounds (`bg-slate-50` / `pharmako-background`).
- **Typography:** Primary text is `text-slate-900` (`#0F172A`), secondary is `text-slate-600` (`#475569`). Font is `Plus Jakarta Sans`.
- **Colors:** Primary action and brand color is `pharmako-care` (`#23DCE1` / `bg-pharmako-care`), active tint `bg-pharmako-care-light`, hover `bg-pharmako-care-hover`, success is Emerald (`#10B981`), warnings are Amber (`#F59E0B`), danger is Red (`#EF4444`).
- **Interactions:** Hover states rely on gentle background shifts (`hover:bg-slate-50`, `hover:bg-pharmako-care-hover`) without elevation changes.

## 5. Coding Conventions

- **Server Components First:** All Next.js pages and layouts must be Server Components. Only add `'use client'` at the lowest possible leaf node in the component tree (e.g., interactive buttons, forms).
- **Strict Typing:** Never use `any`. Always define explicit interfaces or use inferred Zod types (`z.infer<typeof schema>`).
- **Data Fetching:** Do NOT use `useEffect` for data fetching. Always use TanStack Query custom hooks located in the respective feature folder (e.g., `useGetPrescriptions.ts`).
- **Animations:** Use Tailwind's `transition-colors duration-150` for crisp micro-interactions. Use `framer-motion` exclusively for layout transitions, smart component mounting, or complex dialogs. Use `easeOut` physics, never `linear` or `bounce`.

## 6. Execution Command

When asked to build a component, feature, or page, output the complete TypeScript code applying all the rules above. Ensure imports are correct and assume `shadcn/ui` components are available at `@/components/ui/[component-name]`.
