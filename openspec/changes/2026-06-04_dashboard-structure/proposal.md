# Proposal: Dashboard that Actually Helps the Doctor

## Current State
The dashboard shows:
- 3 KPI cards (patients today, recipes, pending appointments)
- Daily agenda list (7 appointments)
- 3 quick action buttons (new consult, labs, messages)
- 2 notification alerts (critical lab, missed appointment)
- 4 mini-stats (next appointments, active recipes, new patients, pending)

This is a **data dashboard** — it displays information. It's not a **work dashboard** — it doesn't help the doctor decide what to do next.

## Proposed Approach: Workflow-Centered Dashboard

Instead of asking "what data can we show?", ask **"what does the doctor need to know and do right now?"**

### Core Principle: Next Action Clarity
Every element on the dashboard should help answer one of three questions:
1. **What needs my attention NOW?** (alerts, next patient, critical results)
2. **What's happening today?** (schedule, team activity)
3. **Where should I go next?** (navigation, pending tasks)

## Proposal: Three Dashboard Concepts

### Option A — "Morning Briefing" (Recommended)
The dashboard as a daily briefing screen — what the doctor sees first thing and refers to between patients.

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│  ⏰ Handoff / Briefing Section                       │
│  ┌──────────────────────┐ ┌────────────────────────┐│
│  │ Total pacientes hoy  │ │ Próximo paciente       ││
│  │ 18 — 3 nuevos        │ │ 🟡 Ana Martínez 11:00 ││
│  │ 2 ausentes           │ │ · motivo: control     ││
│  └──────────────────────┘ │ · alerta: diabetes    ││
│                           └────────────────────────┘│
│  ┌───────────────────────────────────────────────────┤
│  │  ⚠️ Acciones Requeridas                          ││
│  │  · 🧪 Resultado crítico — Roberto Suárez         ││
│  │  · 📞 Carmen Vega — no asistió, llamar           ││
│  │  · 📋 3 recetas por firmar                       ││
│  └───────────────────────────────────────────────────┤
│  ┌────────────────────────┬─────────────────────────┐│
│  │ 📅 Agenda Hoy          │ 🚀 Acciones Rápidas    ││
│  │ 09:30 ✅ María García  │ ┌─────┬─────┬─────┐   ││
│  │ 10:15 🟡 Carlos López  │ │Nva  │Lab  │Recet│   ││
│  │ 11:00 ⏳ Ana Martínez  │ │Cons │Pend │     │   ││
│  │ 11:45 ⏳ Pedro Rdz     │ └─────┴─────┴─────┘   ││
│  │ 14:00 ⏳ Sofía Hdz     └─────────────────────────┘│
│  └───────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

**Key innovation**: "Próximo paciente" card + "Acciones Requeridas" section. The doctor knows exactly who's next and what needs action.

### Option B — "Patient Flow" Layout
Organized around the patient journey through the clinic.

**Sections:**
1. **Patients waiting** — who's checked in, wait times
2. **Current consultation** — quick actions for the active patient
3. **Post-consultation** — pending prescriptions, lab orders, follow-ups

### Option C — "Contextual" Layout
A minimal dashboard that shows less, but intelligently surfaces what matters based on context (time of day, patient load, etc.)

**Sections:**
1. **Smart summary** — contextual: "Good morning, you have 4 patients waiting"
2. **Single focus card** — the one thing they should do next
3. **Quick actions** — compact row

## Recommendation: Option A

The "Morning Briefing" approach is the most useful because:
1. **Próximo Paciente** card is the most actionable item a doctor can have — it prepares them for the next consultation
2. **Acciones Requeridas** surfaces what needs attention without the doctor having to hunt for it
3. The **agenda** is still there for reference, but it's secondary to action items
4. KPIs are consolidated into a briefing row, not standalone cards

## Key UX Decisions to Make

1. **¿"Próximo Paciente" debería mostrar alertas médicas del paciente?** (diabetes, alergias, etc.)
2. **¿Las "Acciones Requeridas" deben poder marcarse como completadas?** (checklist interactivo)
3. **¿El briefing de inicio de día debería tener hora del día?** ("Buenos días, Dr. — 4 pacientes esperando")

## Non-Goals
- No real-time data (mock data stays)
- No patient list / search (that's in the sidebar or /patients)
- No charts or graphs (keep Notion-style minimal)
