# Design: Doctor PatientFlowView

## 3-Column Layout

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 🕐 En Espera [3]│→│ 🩺 Activa  [1]  │→│ ✅ Post [5]     │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ María López     │  │ Carlos Fuentes  │  │ Completadas: 5  │
│ 09:00 Control   │  │ 09:30 Cardio    │  │                 │
│                 │  │                 │  │ 📋 Checklist     │
│ Ana Torres      │  │ 📋 HC           │  │ □ Labs pendiente│
│ 10:00 Derma     │  │ 🧪 Labs         │  │ □ Receta firmar │
│                 │  │ 💊 Receta       │  │                 │
│ Pedro Jiménez   │  │ 📅 Seguimiento  │  │                 │
│ 10:30 Revisión  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```
