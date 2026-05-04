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

## 4. UI/UX & Styling Rules ("Clean & Elevated")

The design language is "Clean & Elevated". It must inspire trust, hygiene, and premium technology.

- **Prohibited:** Neo-brutalism, thick black borders, harsh offset shadows, or pure black text (`#000000`).
- **Surfaces:** Use `bg-slate-50` for app backgrounds, `bg-white` for cards.
- **Borders & Shadows:** Use extremely subtle borders (`border-slate-100` or `200`) and soft, diffused shadows (`shadow-sm`, hover `shadow-md`). Corners should be rounded (`rounded-xl` or `2xl`).
- **Typography:** Primary text is `text-slate-900`, secondary is `text-slate-500`. The project uses `Plus Jakarta Sans`.
- **Colors:** Primary action color is Teal (`bg-teal-600`, `text-teal-600`). Success is Emerald, Warnings are Amber.
- **Spacing:** Use generous padding (e.g., `p-6` or `p-8` on cards) to let the interface breathe.

## 5. Coding Conventions

- **Server Components First:** All Next.js pages and layouts must be Server Components. Only add `'use client'` at the lowest possible leaf node in the component tree (e.g., interactive buttons, forms).
- **Strict Typing:** Never use `any`. Always define explicit interfaces or use inferred Zod types (`z.infer<typeof schema>`).
- **Data Fetching:** Do NOT use `useEffect` for data fetching. Always use TanStack Query custom hooks located in the respective feature folder (e.g., `useGetPrescriptions.ts`).
- **Animations:** Use Tailwind's `animate-in fade-in slide-in-from-bottom-4` for simple micro-interactions (hovers, dropdowns). Use `framer-motion` exclusively for layout transitions, smart component mounting, or complex dialogs. Use `easeOut` physics, never `linear`.

## 6. Execution Command

When asked to build a component, feature, or page, output the complete TypeScript code applying all the rules above. Ensure imports are correct and assume `shadcn/ui` components are available at `@/components/ui/[component-name]`.
