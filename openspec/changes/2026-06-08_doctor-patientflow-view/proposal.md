# Proposal: Doctor PatientFlowView Redesign

## Problem
The kanban view works but has subtle visual issues:
- Column headers use `border-slate-50` (invisible border)
- Empty states are basic text
- Post-consulta column shows only checklist — could show completed count + summary
- No visual indicator of flow direction

## Solution
- Fix header borders: `border-slate-100` for visibility
- Add completed patients summary in column 3
- Add flow arrows between columns on desktop
- Better empty states with icons
- Add patient count badges to each column header
