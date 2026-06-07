# SDD Init: Dashboard Structure Redesign

**Change**: 2026-06-04_dashboard-structure  
**Status**: init → explore

## Problem Statement
The current dashboard shows generic KPI cards, an agenda, quick actions, and notifications. It's visually pleasant but not genuinely useful for a doctor's workflow. The user wants a structure that actively helps the doctor work better — not just decorate data.

## Scope
- `src/features/doctor-dashboard/` — full restructuring of components and layout
- `src/features/doctor-dashboard/hooks/` — optionally extend mock data
- `src/features/doctor-dashboard/types/` — extend if needed

## Constraints
- Keep the Notion-style visual language (clean, light blue accents, glass cards)
- Keep the masonry-like responsive grid
- The sidebar with search/notifications/profile stays
- Mock data for now (real API comes later)
