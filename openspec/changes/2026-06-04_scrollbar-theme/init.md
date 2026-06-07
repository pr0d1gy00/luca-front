# SDD Init: Adaptive Browser Scrollbar

**Change**: 2026-06-04_scrollbar-theme
**Status**: init → explore

## Problem
The custom scrollbar uses hardcoded oklch color values. It doesn't adapt when the user switches to dark mode. The browser's native scrollbar also doesn't match the interface theme.

## Requirements
- Scrollbar thumb color should adapt to light/dark mode
- Use CSS custom properties (variables) that change with `:root` / `.dark`
- Keep the thin, rounded, Notion-style appearance
- Support both webkit (Chrome/Safari/Edge) and Firefox

## Current State
```css
::-webkit-scrollbar-thumb {
  background: oklch(0.82 0 0 / 0.6);
}
.dark ::-webkit-scrollbar-thumb {
  background: oklch(0.4 0 0 / 0.5);
}
```

## Proposed Solution
Move scrollbar colors to CSS custom properties so they automatically adapt to theme changes. Use variables defined in `:root` and `.dark` blocks.

```css
:root {
  --scrollbar-thumb: oklch(0.82 0 0 / 0.6);
  --scrollbar-thumb-hover: oklch(0.75 0 0 / 0.7);
}
.dark {
  --scrollbar-thumb: oklch(0.4 0 0 / 0.5);
  --scrollbar-thumb-hover: oklch(0.5 0 0 / 0.6);
}
```

## Acceptance Criteria
1. Scrollbar thumb is light gray in light mode, dark gray in dark mode
2. No hardcoded oklch values in ::-webkit-scrollbar rules
3. Firefox `scrollbar-color` also uses variables
4. No regression on thin-scrollbar utility class
