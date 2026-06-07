# SDD Init: macOS-Style Sidebar Redesign

**Change**: 2026-06-04_macos-sidebar
**Status**: init → explore

## Problem Statement
The current sidebar is fixed to the left edge (100% attached), uses text labels prominently, has a collapse toggle, and lacks a floating/macOS-style appearance. The user wants:
1. A sidebar that **floats** — not 100% stuck to the edge, with rounded corners and shadow
2. **Icons by default** — visually communicative, no text until expanded
3. **Expandable** — hover or click to reveal text labels
4. **Always visible** — a persistent lateral bar
5. **PharmakoLogoOnlyFace-PNG** as the logo

## Scope
- File: `src/components/Sidebar.tsx` (main component)
- File: `src/app/dashboard/layout.tsx` (layout integration)
- Style: globals.css variables if needed
- Logo: `/PharmakoLogoOnlyFace-PNG.png` (already exists in public/)
