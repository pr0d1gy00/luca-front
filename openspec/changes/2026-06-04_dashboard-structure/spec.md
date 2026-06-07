# Spec: Dashboard Structure Redesign

## Decisions (from proposal Q&A)

| Question | Decision |
|---|---|
| Layout approach | **Multiple layouts** — doctor switches between Morning Briefing, Patient Flow, and Contextual Minimal via tabs |
| Próximo Paciente | **Show medical alerts** (diabetes, allergies, last visit, critical results) |
| Acciones Requeridas | **Interactive checklist** — mark actions as completed with a click |

## Acceptance Criteria

1. **Layout switcher**: Three pill-style tabs at the top of the dashboard area: "Resumen", "Flujo Pacientes", "Seguimiento". Tabs persist in `localStorage`.
2. **Resumen (Morning Briefing)**: Briefing section + Próximo Paciente + Acciones Requeridas (checklist) + Agenda + Quick Actions
3. **Flujo Pacientes**: Patients waiting → Current consultation → Post-consultation
4. **Seguimiento (Contextual Minimal)**: Smart summary card + single focus item + compact quick actions
5. **Próximo Paciente card**: Shows name, time, type, and medical alerts (allergies, chronic conditions, last visit note, critical lab flag)
6. **Acciones Requeridas checklist**: Items from critical notifications + pending tasks. Click to toggle completed state with strikethrough + fade animation
7. **All layouts**: Use same glass cards, light blue accents, Notion-style visual language
8. **Responsive**: Same masonry grid adapts to each layout
