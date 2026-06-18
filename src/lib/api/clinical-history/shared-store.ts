import type { ClinicalHistorySchema } from "@/features/clinical-history-builder/types";
import { PRESETS } from "@/features/clinical-history-builder/schemas/clinical-history-schema";

// ─── Shared in-memory store ─────────────────────────────────
// Singleton Map shared between all API route modules.
// In production, replace with a database connection (PostgreSQL, etc.)
// ──────────────────────────────────────────────────────────────
const store = new Map<string, ClinicalHistorySchema>();

export function getSchemas() {
  return store;
}

export function getSchema(id: string) {
  return store.get(id);
}

export function setSchema(id: string, schema: ClinicalHistorySchema) {
  store.set(id, schema);
}

export function deleteSchema(id: string) {
  store.delete(id);
}

// ─── Seed sample data on module load ─────────────────────────
const sampleSchema: ClinicalHistorySchema = {
  id: "template-001",
  name: "Consulta Clínica General",
  description:
    "Plantilla base para atención médica general. Adaptable a cualquier especialidad.",
  version: "1.0.0",
  specialty: "medicina-general",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    showSectionNumbers: true,
    showFieldNumbers: true,
    requiredSymbol: "*",
    submitButtonLabel: "Guardar Historia Clínica",
    submitButtonIcon: "save",
  },
  canvas: {
    elements: [
      {
        id: "section-motivo",
        type: "section",
        title: "Motivo de Consulta",
        description: "Describe el motivo principal de la visita",
        required: true,
        width: "full",
        locked: false,
        hidden: false,
        collapsible: true,
        defaultOpen: true,
        children: [
          {
            id: "textarea-motivo",
            type: "text-paragraph",
            title: "Descripción del Motivo",
            placeholder: "Paciente refiere...",
            required: true,
            width: "full",
            rows: 3,
          },
        ],
      },
      {
        id: "section-antecedentes",
        type: "section",
        title: "Antecedentes",
        description: "Historia clínica y antecedentes relevantes",
        required: false,
        width: "full",
        locked: false,
        hidden: false,
        collapsible: true,
        defaultOpen: false,
        children: [
          {
            id: "grid-antecedentes",
            type: "grid-row",
            title: "",
            columns: 2,
            gap: "md",
            children: [
              {
                id: "toggle-alergias",
                type: "toggle",
                title: "¿Alergias conocidas?",
                labelOn: "Sí",
                labelOff: "No",
                defaultValue: false,
              },
              {
                id: "toggle-medicamentos",
                type: "toggle",
                title: "¿Medicamentos actuales?",
                labelOn: "Sí",
                labelOff: "No",
                defaultValue: false,
              },
            ],
          },
        ],
      },
      {
        id: "vital-signs-1",
        type: "vital-signs",
        title: "Signos Vitales",
        description: "Medición de signos vitales del paciente",
        required: true,
        width: "full",
        locked: false,
        hidden: false,
        fields: [
          {
            key: "systolic",
            label: "Presión Sistólica",
            unit: "mmHg",
            min: 60,
            max: 200,
          },
          {
            key: "diastolic",
            label: "Presión Diastólica",
            unit: "mmHg",
            min: 40,
            max: 130,
          },
          {
            key: "heart-rate",
            label: "Frecuencia Cardíaca",
            unit: "lpm",
            min: 30,
            max: 220,
          },
          {
            key: "temperature",
            label: "Temperatura",
            unit: "°C",
            min: 35,
            max: 42,
          },
          {
            key: "oxygen-saturation",
            label: "Saturación O₂",
            unit: "%",
            min: 70,
            max: 100,
          },
          { key: "weight", label: "Peso", unit: "kg", min: 1, max: 300 },
          { key: "height", label: "Talla", unit: "cm", min: 30, max: 250 },
        ],
      },
      {
        id: "cie10-1",
        type: "cie10-selector",
        title: "Diagnóstico Principal",
        placeholder: "Buscar código CIE-10...",
        required: true,
        width: "full",
        locked: false,
        hidden: false,
        allowFreeText: true,
      },
      {
        id: "file-upload-1",
        type: "file-upload",
        title: "Archivos Adjuntos",
        description: "Adjunta exámenes, imágenes o documentos relevantes",
        required: false,
        width: "full",
        locked: false,
        hidden: false,
        accept: "image/*,.pdf,.doc,.docx",
        maxSizeMB: 10,
        maxFiles: 5,
        preview: true,
      },
    ],
  },
};

// Initialize store with seed data
store.set("template-001", sampleSchema);
Object.values(PRESETS).forEach((schema) => {
  store.set(schema.id, schema);
});
