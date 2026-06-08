# Init: Pharmacy Dashboard Redesign

**Change ID:** pharmacy-dashboard-redesign
**Created:** 2026-06-08
**Status:** init
**Mode:** interactive
**Artifact store:** openspec + engram

## Scope
Redesign `src/features/pharmacy-dashboard/` to match the Notion-isomatic style and pattern established by the patient and doctor dashboards.

## Context
- Patient and doctor dashboards have been redesigned with clean Notion-isomatic aesthetic
- Pharmacy dashboard still uses old LUCA color tokens, shadow-sm on all cards, inline data
- Header is self-contained (greeting + CTA) — should follow sidebar-only pattern
