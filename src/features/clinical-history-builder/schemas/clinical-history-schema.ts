import type { ClinicalHistorySchema } from "../types";

// ─── 1. CONSULTA CLÍNICA GENERAL ──────────────────────────────────────────
export const generalMedicineTemplate: ClinicalHistorySchema = {
  id: "template-general-001",
  name: "Consulta Clínica General",
  documentCategory: "historia-clinica",
  description:
    "Plantilla base para atención médica general. Adaptable a cualquier especialidad.",
  version: "1.0.0",
  specialty: "medicina-general",
  status: "published",
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
        id: "sec-motivo",
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
        id: "sec-antecedentes",
        type: "section",
        title: "Antecedentes Generales",
        description: "Antecedentes clínicos relevantes",
        required: false,
        width: "full",
        locked: false,
        hidden: false,
        collapsible: true,
        defaultOpen: false,
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
            id: "text-alergias-detalles",
            type: "text-paragraph",
            title: "Detalles de Alergias",
            placeholder: "Ej: Penicilina, mariscos...",
            required: true,
            width: "full",
            conditions: [
              { fieldId: "toggle-alergias", operator: "equals", value: true },
            ],
          },
          {
            id: "toggle-cronicas",
            type: "toggle",
            title: "¿Condiciones Crónicas?",
            labelOn: "Sí",
            labelOff: "No",
            defaultValue: false,
          },
          {
            id: "text-cronicas-detalles",
            type: "text-paragraph",
            title: "Detalles de Condiciones Crónicas",
            placeholder: "Ej: Hipertensión, Diabetes Tipo II...",
            required: true,
            width: "full",
            conditions: [
              { fieldId: "toggle-cronicas", operator: "equals", value: true },
            ],
          },
        ],
      },
      {
        id: "vital-signs-1",
        type: "vital-signs",
        title: "Signos Vitales",
        description: "Medición de constantes vitales del paciente",
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
    ],
  },
};

// ─── 2. CONSULTA PEDIÁTRICA ──────────────────────────────────────────────
export const pediatricTemplate: ClinicalHistorySchema = {
  id: "template-pediatric-001",
  name: "Consulta Pediátrica",
  documentCategory: "historia-clinica",
  description:
    "Control de crecimiento, esquema de vacunas y desarrollo infantil.",
  version: "1.0.0",
  specialty: "pediatria",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    showSectionNumbers: true,
    showFieldNumbers: true,
    requiredSymbol: "*",
    submitButtonLabel: "Guardar Control Pediátrico",
    submitButtonIcon: "save",
  },
  canvas: {
    elements: [
      {
        id: "sec-tutor",
        type: "section",
        title: "Datos del Tutor / Acompañante",
        required: true,
        width: "full",
        children: [
          {
            id: "text-tutor-name",
            type: "text-short",
            title: "Nombre del Representante",
            placeholder: "Nombre y apellido",
            required: true,
            width: "1/2",
          },
          {
            id: "dropdown-parentesco",
            type: "dropdown",
            title: "Parentesco",
            required: true,
            width: "1/2",
            options: [
              { value: "madre", label: "Madre" },
              { value: "padre", label: "Padre" },
              { value: "abuelo", label: "Abuelo/a" },
              { value: "tutor-legal", label: "Tutor Legal" },
            ],
          },
        ],
      },
      {
        id: "sec-desarrollo",
        type: "section",
        title: "Desarrollo y Alimentación",
        required: false,
        width: "full",
        children: [
          {
            id: "dropdown-lactancia",
            type: "dropdown",
            title: "Tipo de Lactancia",
            required: true,
            width: "1/2",
            options: [
              { value: "exclusiva", label: "Materna Exclusiva" },
              { value: "formula", label: "Fórmula" },
              { value: "mixta", label: "Mixta / Complementaria" },
              { value: "destetado", label: "Alimentación Sólida Completa" },
            ],
          },
          {
            id: "toggle-vacunas",
            type: "toggle",
            title: "¿Esquema de vacunas completo para la edad?",
            labelOn: "Sí, al día",
            labelOff: "No, pendiente",
            defaultValue: true,
          },
          {
            id: "checkbox-vacunas-pendientes",
            type: "checkbox-multiple",
            title: "Vacunas Pendientes",
            required: true,
            width: "full",
            options: [
              {
                value: "hexavalente",
                label: "Hexavalente (Difteria, Tétanos, Tos ferina, etc.)",
              },
              { value: "neumococo", label: "Neumocócica Conjugada" },
              { value: "rotavirus", label: "Rotavirus" },
              { value: "triple-viral", label: "Triple Viral (SRP)" },
              { value: "varicela", label: "Varicela" },
            ],
            conditions: [
              { fieldId: "toggle-vacunas", operator: "equals", value: false },
            ],
          },
        ],
      },
      {
        id: "vital-signs-pediatric",
        type: "vital-signs",
        title: "Somatometría Pediátrica",
        required: true,
        width: "full",
        fields: [
          { key: "weight", label: "Peso", unit: "kg", min: 0.5, max: 80 },
          {
            key: "height",
            label: "Talla / Estatura",
            unit: "cm",
            min: 30,
            max: 180,
          },
          {
            key: "temperature",
            label: "Temperatura Corporal",
            unit: "°C",
            min: 35,
            max: 42,
          },
          {
            key: "heart-rate",
            label: "Frecuencia Cardíaca",
            unit: "lpm",
            min: 40,
            max: 200,
          },
        ],
      },
    ],
  },
};

// ─── 3. CONSULTA GINECOLÓGICA ────────────────────────────────────────────
export const gynecologyTemplate: ClinicalHistorySchema = {
  id: "template-gynecology-001",
  name: "Consulta Ginecológica",
  documentCategory: "historia-clinica",
  description: "Control ginecológico de rutina, citología y control prenatal.",
  version: "1.0.0",
  specialty: "ginecologia",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    showSectionNumbers: true,
    showFieldNumbers: true,
    requiredSymbol: "*",
    submitButtonLabel: "Guardar Ficha Ginecológica",
    submitButtonIcon: "save",
  },
  canvas: {
    elements: [
      {
        id: "sec-antecedentes-gino",
        type: "section",
        title: "Ciclo Menstrual y Anticoncepción",
        required: true,
        width: "full",
        children: [
          {
            id: "datetime-fur",
            type: "datetime",
            title: "Fecha de Última Menstruación (FUR)",
            required: true,
            width: "1/2",
          },
          {
            id: "toggle-anticonceptivos",
            type: "toggle",
            title: "¿Usa métodos anticonceptivos?",
            labelOn: "Sí",
            labelOff: "No",
            defaultValue: false,
          },
          {
            id: "dropdown-metodo",
            type: "dropdown",
            title: "Método Anticonceptivo",
            required: true,
            width: "1/2",
            options: [
              { value: "orales", label: "Anticonceptivos Orales" },
              { value: "diu", label: "DIU (Cobre/Hormonal)" },
              { value: "implante", label: "Implante Subdérmico" },
              { value: "inyectable", label: "Inyectable Mensual/Trimestral" },
              { value: "barrera", label: "Preservativo / Barrera" },
            ],
            conditions: [
              {
                fieldId: "toggle-anticonceptivos",
                operator: "equals",
                value: true,
              },
            ],
          },
        ],
      },
      {
        id: "sec-obstetricia",
        type: "section",
        title: "Antecedentes Obstétricos (G-P-A-C)",
        required: false,
        width: "full",
        children: [
          {
            id: "num-gestas",
            type: "number",
            title: "Gestas (G)",
            required: true,
            width: "1/4",
            min: 0,
          },
          {
            id: "num-partos",
            type: "number",
            title: "Partos (P)",
            required: true,
            width: "1/4",
            min: 0,
          },
          {
            id: "num-abortos",
            type: "number",
            title: "Abortos (A)",
            required: true,
            width: "1/4",
            min: 0,
          },
          {
            id: "num-cesareas",
            type: "number",
            title: "Cesáreas (C)",
            required: true,
            width: "1/4",
            min: 0,
          },
        ],
      },
    ],
  },
};

// ─── 4. TRIAJE GENERAL ───────────────────────────────────────────────────
export const triageTemplate: ClinicalHistorySchema = {
  id: "template-triage-001",
  name: "Ficha de Triaje / Admisión",
  documentCategory: "triaje",
  description:
    "Clasificación rápida de riesgo y toma de constantes vitales al ingreso.",
  version: "1.0.0",
  specialty: "triaje",
  status: "published",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    showSectionNumbers: false,
    showFieldNumbers: false,
    requiredSymbol: "*",
    submitButtonLabel: "Finalizar Clasificación de Triaje",
    submitButtonIcon: "activity",
  },
  canvas: {
    elements: [
      {
        id: "radio-triage-level",
        type: "radio-group",
        title: "Nivel de Prioridad (Manchester)",
        required: true,
        width: "full",
        displayStyle: "button-group",
        options: [
          { value: "rojo-1", label: "Nivel I (Rojo) - Emergencia Inmediata" },
          { value: "naranja-2", label: "Nivel II (Naranja) - Muy Urgente" },
          { value: "amarillo-3", label: "Nivel III (Amarillo) - Urgente" },
          { value: "verde-4", label: "Nivel IV (Verde) - Estándar / Menor" },
        ],
      },
      {
        id: "vital-signs-triage",
        type: "vital-signs",
        title: "Signos Vitales de Ingreso",
        required: true,
        width: "full",
        fields: [
          { key: "systolic", label: "Tensión Sistólica", unit: "mmHg" },
          { key: "diastolic", label: "Tensión Diastólica", unit: "mmHg" },
          { key: "heart-rate", label: "Frecuencia Cardíaca", unit: "lpm" },
          { key: "temperature", label: "Temperatura", unit: "°C" },
          { key: "oxygen-saturation", label: "Saturación O₂", unit: "%" },
        ],
      },
      {
        id: "toggle-aislamiento",
        type: "toggle",
        title: "¿Requiere medidas de aislamiento?",
        labelOn: "Sí, crítico",
        labelOff: "No necesario",
        defaultValue: false,
      },
      {
        id: "dropdown-aislamiento-tipo",
        type: "dropdown",
        title: "Tipo de Aislamiento",
        required: true,
        width: "1/2",
        options: [
          { value: "respiratorio", label: "Respiratorio / Gotitas" },
          { value: "contacto", label: "Contacto directo" },
          { value: "inverso", label: "Inverso / Protector (Inmunosuprimidos)" },
        ],
        conditions: [
          { fieldId: "toggle-aislamiento", operator: "equals", value: true },
        ],
      },
    ],
  },
};

// ─── PRESENTS INDEX ──────────────────────────────────────────────────────
export const PRESETS: Record<string, ClinicalHistorySchema> = {
  "medicina-general": generalMedicineTemplate,
  pediatria: pediatricTemplate,
  ginecologia: gynecologyTemplate,
  triaje: triageTemplate,
};

export const clinicalHistorySchema = generalMedicineTemplate;
