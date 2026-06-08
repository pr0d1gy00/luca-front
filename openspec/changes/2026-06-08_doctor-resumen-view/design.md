# Design: Doctor ResumenView

## Component Tree
```
ResumenView
├── KpiCards (from useDoctorKPIs)
├── Grid 2-col
│   ├── NextPatientCard (from useDoctorNextPatient)
│   └── ActionChecklist (from useDoctorActions)
└── Grid 2-col
    ├── DailyAgenda (from useDoctorAgenda)
    └── QuickActions (existing)
```

## Changes from Current
- Import `KpiCards` instead of inline KPI div
- Remove `Users` icon import (no longer needed in this file)
- Remove `totalPatients` calculation
- 3-section structure instead of 4
