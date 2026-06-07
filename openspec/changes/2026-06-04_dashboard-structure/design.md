# Design: Dashboard Structure Redesign

## Component Architecture

```
DoctorDashboard
├── DashboardSwitcher (3 pill tabs: Resumen | Flujo | Seguimiento)
├── ResumenView           ← default
│   ├── BriefingRow (patients today, next patient card)
│   │   └── NextPatientCard (name + alerts)
│   ├── ActionChecklist (interactive, local state)
│   ├── DailyAgenda (existing, refined)
│   └── QuickActions (existing)
├── PatientFlowView
│   ├── WaitingPatients (compact list)
│   ├── CurrentConsultation (active patient card)
│   └── PostConsultation (pending: rx, labs, follow-ups)
└── FollowUpView
    ├── SmartSummary (contextual greeting + count)
    ├── NextPatientCard (compact)
    ├── ActionChecklist (compact)
    └── QuickActions (existing, compact)
```

## Data Types (extend existing)

```ts
// New types
interface NextPatient {
  name: string;
  time: string;
  type: string;
  reason: string;
  alerts: PatientAlert[];
}

interface PatientAlert {
  type: "allergy" | "chronic" | "critical-lab" | "last-visit";
  label: string;
}

interface ActionItem {
  id: string;
  label: string;
  type: "lab" | "call" | "prescription" | "follow-up";
  patientName: string;
  completed: boolean;
}
```

## Layout Details

### DashboardSwitcher
```
[ Resumen ]  [ Flujo Pacientes ]  [ Seguimiento ]
  ↑ glass pill, active: bg-blue-50 text-blue-600
```

### ResumenView grid
```
Row 1: [BriefingRow: total 18 | next patient with alerts]  (2 col)
Row 2: [ActionChecklist] [Agenda]     (1col + 2col)
Row 3: [QuickActions row]             (full width)
```

### PatientFlowView grid
```
[Waiting: compact list] [Current: patient card] [Post: pending items]
        1col                    1col                   1col
```

### FollowUpView grid
```
[Smart summary + next patient]  [Actions + Quick actions]
        2col                           1col
```
