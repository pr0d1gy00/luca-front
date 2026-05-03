# LUCA Brand Palette

Semantic design tokens for the LUCA Earth/Green Fluid UI Palette.

## Token Reference

| Token (CSS custom property) | Hex Value | Tailwind Utility Prefix | Usage |
|---|---|---|---|
| `--color-luca-primary` | `#163422` | `bg-luca-primary`, `text-luca-primary` | Primary buttons, dark panels, header text |
| `--color-luca-primary-hover` | `#2D4B37` | `bg-luca-primary-hover`, `text-luca-primary-hover` | Secondary headings, sidebar active state, icons |
| `--color-luca-accent` | `#D97B51` | `bg-luca-accent`, `text-luca-accent`, `border-luca-accent`, `ring-luca-accent` | CTAs, links, active tab indicator, focus rings |
| `--color-luca-surface` | `#f5f3ee` | `bg-luca-surface` | Main app background, sidebar background |
| `--color-luca-surface-light` | `#F9F7F2` | `bg-luca-surface-light` | Card/container surfaces |
| `--color-luca-surface-dark` | `#E8DED1` | `text-luca-surface-dark` | Text on dark brand backgrounds |
| `--color-luca-fg-on-primary` | `#FAEFE2` | `bg-luca-fg-on-primary`, `text-luca-fg-on-primary` | Foreground on dark primary hover/active states |
| `--color-luca-muted` | `#868686` | `text-luca-muted` | Subtitles, secondary labels |
| `--color-luca-muted-dark` | `#414742` | `text-luca-muted-dark` | Sidebar navigation labels |
| `--color-luca-gradient-start` | `#e1ecdd` | `from-luca-gradient-start` | Dashboard gradient origin (sage green) |
| `--color-luca-gradient-mid` | `#f5f3ee` | `via-luca-gradient-mid` | Dashboard gradient midpoint (warm beige) |
| `--color-luca-gradient-end` | `#d6c0b3` | `to-luca-gradient-end` | Dashboard gradient terminus (dusty rose beige) |

## Tailwind v4 Usage

Tokens are declared in `src/app/globals.css` inside the `@theme inline` block. Tailwind v4 auto-generates all standard utility variants:

- **Background**: `bg-luca-primary`, `bg-luca-surface`, etc.
- **Text**: `text-luca-accent`, `text-luca-muted`, etc.
- **Border**: `border-luca-accent`
- **Ring**: `ring-luca-accent`
- **Gradient stops**: `from-luca-gradient-start`, `via-luca-gradient-mid`, `to-luca-gradient-end`
- **Hover variants**: `hover:bg-luca-primary`, `hover:text-luca-fg-on-primary`, etc.

## Design Rules

- Use `shadow-md` maximum for business component elevation (never `shadow-xl`).
- Use `text-5xl` maximum for heading sizes (never `text-7xl`).
- Always use semantic tokens (`bg-luca-primary`) instead of raw hex (`bg-[#163422]`).
- shadcn UI tokens (`--primary`, `--accent`, `--muted`) remain neutral-gray for generic UI components and should NOT be mixed with LUCA brand tokens.

## Intentionally Unmapped Colors

Some components contain colors outside the LUCA Earth/Green palette. These remain as raw hex values intentionally:

| File | Hex | Reason |
|---|---|---|
| `InputLogin.tsx` | `#e4e2dd` | Input background — no LUCA token defined |
| `InputLogin.tsx` | `#838580` | Placeholder text — no LUCA token defined |
| `TypeProfile.tsx` | `#ebbda8` | Skin tone — outside LUCA palette |
| `TypeProfile.tsx` | `#f1d8b9` | Skin tone hover — outside LUCA palette |
| `TypeProfile.tsx` | `#E07A5F` | Terracotta icon — outside LUCA palette |

These should be addressed in a follow-up change when the palette is extended.
