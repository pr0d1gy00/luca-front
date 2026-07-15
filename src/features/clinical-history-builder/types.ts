// ============================================================
// CLINICAL HISTORY BUILDER — JSON SCHEMA TYPES
// ============================================================
// El lienzo NO guarda HTML. Todo está respaldado por este árbol JSON.
// Un ClinicalHistorySchema es la raíz; contiene elementos que pueden
// ser contenedores (con children) o leaf nodes (campos directos).
// ============================================================

// ------------------------------------------------------------
// SHARED BASE
// ------------------------------------------------------------

export type BlockWidth = "full" | "2/3" | "1/2" | "1/3" | "1/4";
export type FieldSize = "sm" | "md" | "lg";

export interface BlockCondition {
  fieldId: string; // El ID del campo disparador (ej: "embarazada-toggle")
  operator: "equals" | "not-equals" | "greater-than" | "less-than";
  value: unknown; // El valor de comparación (ej: true)
}

interface BaseBlock {
  id: string;
  type: string;
  title: string;
  description?: string;
  required?: boolean;
  width?: BlockWidth;
  locked?: boolean;
  hidden?: boolean;
  conditions?: BlockCondition[];
  binding?: string;
}

// ------------------------------------------------------------
// LEAF BLOCKS — Campos directos (no tienen children)
// ------------------------------------------------------------

// --- Basic Fields ---
export interface TextShortBlock extends BaseBlock {
  type: "text-short";
  placeholder?: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
}

export interface TextParagraphBlock extends BaseBlock {
  type: "text-paragraph";
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  rows?: number;
}

export interface NumberBlock extends BaseBlock {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface DateTimeBlock extends BaseBlock {
  type: "datetime";
  includeTime?: boolean;
  includeSeconds?: boolean;
  minDate?: string; // ISO
  maxDate?: string; // ISO
}

export interface CheckboxMultipleBlock extends BaseBlock {
  type: "checkbox-multiple";
  options: SelectorOption[];
  minSelected?: number;
  maxSelected?: number;
  allowOther?: boolean;
}

export interface DropdownBlock extends BaseBlock {
  type: "dropdown";
  options: SelectorOption[];
  searchable?: boolean;
  allowClear?: boolean;
  placeholder?: string;
}

export interface RadioGroupBlock extends BaseBlock {
  type: "radio-group";
  options: SelectorOption[];
  displayStyle?: "radio" | "button-group";
}

export interface ToggleBlock extends BaseBlock {
  type: "toggle";
  defaultValue?: boolean;
  labelOn?: string;
  labelOff?: string;
}

// --- Clinical Specific Fields ---
export interface VitalSignsBlock extends BaseBlock {
  type: "vital-signs";
  fields: VitalSignsField[];
}

export type VitalSignsField = {
  key: VitalSignsKey;
  label: string;
  unit: string;
  min?: number;
  max?: number;
};

export type VitalSignsKey =
  | "systolic"
  | "diastolic"
  | "heart-rate"
  | "respiratory-rate"
  | "temperature"
  | "oxygen-saturation"
  | "weight"
  | "height"
  | "bmi";

export interface Cie10SelectorBlock extends BaseBlock {
  type: "cie10-selector";
  placeholder?: string;
  allowFreeText?: boolean;
  categories?: string[]; // Filtrar por categorías CIE-10
}

export interface FileUploadBlock extends BaseBlock {
  type: "file-upload";
  accept?: string; // mime types, ej: "image/*,.pdf"
  maxSizeMB?: number;
  maxFiles?: number;
  preview?: boolean;
}

// ------------------------------------------------------------
// CONTAINER BLOCKS — Bloques que contienen children
// ------------------------------------------------------------

export interface GridRowBlock extends BaseBlock {
  type: "grid-row";
  columns: 2 | 3 | 4;
  children: CanvasElement[];
  gap?: "none" | "sm" | "md" | "lg";
}

export interface SectionBlock extends BaseBlock {
  type: "section";
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: CanvasElement[];
  icon?: string;
}

export interface VisualSeparatorBlock extends BaseBlock {
  type: "visual-separator";
  style?: "line" | "space" | "heading";
}

export interface SectionTitleBlock extends BaseBlock {
  type: "section-title";
  level?: 1 | 2 | 3;
  icon?: string;
  alignment?: "left" | "center" | "right";
}

export interface HeaderBlock extends BaseBlock {
  type: "header";
  logoUrl?: string;
  logoPosition?: "left" | "right" | "center";
  titleText: string;
  subtitleText?: string;
  contactInfo?: string;
  showPatientData?: boolean;
  patientDataFields?: ("name" | "idNumber" | "age" | "date")[];
  style?: "simple" | "boxed" | "bordered";
}

export interface RepeaterBlock extends BaseBlock {
  type: "repeater";
  addButtonLabel?: string;
  minRows?: number;
  maxRows?: number;
  children: CanvasElement[];
}

// ------------------------------------------------------------
// SUPPORTED OPTIONS
// ------------------------------------------------------------

export interface SelectorOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

// ------------------------------------------------------------
// CANVAS ELEMENT — Union de todos los bloques posibles
// ------------------------------------------------------------

export type CanvasElement =
  | TextShortBlock
  | TextParagraphBlock
  | NumberBlock
  | DateTimeBlock
  | CheckboxMultipleBlock
  | DropdownBlock
  | RadioGroupBlock
  | ToggleBlock
  | VitalSignsBlock
  | Cie10SelectorBlock
  | FileUploadBlock
  | GridRowBlock
  | SectionBlock
  | VisualSeparatorBlock
  | SectionTitleBlock
  | HeaderBlock
  | RepeaterBlock;

// ------------------------------------------------------------
// CANVAS STATE
// ------------------------------------------------------------

export interface CanvasState {
  elements: CanvasElement[];
}

// ------------------------------------------------------------
// TOOLBOX CATEGORY
// ------------------------------------------------------------

export interface ToolboxCategory {
  id: string;
  title: string;
  blocks: ToolboxBlockDefinition[];
}

export interface ToolboxBlockDefinition {
  type: string;
  label: string;
  icon: string;
  category: string;
  defaultProps?: Partial<CanvasElement>;
  description?: string;
}

// ------------------------------------------------------------
// CLINICAL HISTORY SCHEMA — Raíz del documento
// ------------------------------------------------------------

export type TemplateStatus = "draft" | "published";

export interface ClinicalHistorySchema {
  id: string;
  name: string;
  description?: string;
  version: string;
  specialty?: string;
  status: TemplateStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  settings: ClinicalHistorySettings;
  canvas: CanvasState;
}

export interface ClinicalHistorySettings {
  showSectionNumbers?: boolean;
  showFieldNumbers?: boolean;
  requiredSymbol?: "*" | " (required)";
  submitButtonLabel?: string;
  submitButtonIcon?: string;
}

// ------------------------------------------------------------
// BUILDER UI STATE
// ------------------------------------------------------------

export type ActiveToolboxTab = "structural" | "basic" | "clinical";
export type ActivePanelTab = "properties" | "layers";

export interface BuilderUIState {
  selectedElementId: string | null;
  activeToolboxTab: ActiveToolboxTab;
  activePanelTab: ActivePanelTab;
  isDragging: boolean;
  isMobileMenuOpen: boolean;
  mobileActivePanel: "toolbox" | "canvas" | "properties" | null;
}

// ------------------------------------------------------------
// DRAG & DROP TYPES
// ------------------------------------------------------------

export interface DragItem {
  id: string;
  type: "toolbox-item" | "canvas-item";
  elementType: string;
}

export interface DropResult {
  id: string;
  parentId: string | null;
  index: number;
}

// ------------------------------------------------------------
// PROPERTY PANEL FORM STATE
// ------------------------------------------------------------

export type PropertyFormState = {
  // Common
  title: string;
  description: string;
  required: boolean;
  width: BlockWidth;
  locked: boolean;
  hidden: boolean;
} & Record<string, unknown>;

// Tipo auxiliar para extraer el type de un bloque específico
export type BlockType<E extends CanvasElement> = E["type"];

// Mapping rápido de type → nombre legible
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  "text-short": "Texto Corto",
  "text-paragraph": "Párrafo",
  number: "Número",
  datetime: "Fecha / Hora",
  "checkbox-multiple": "Checkbox Múltiple",
  dropdown: "Desplegable (Dropdown)",
  "radio-group": "Grupo de Radio",
  toggle: "Interruptor (Toggle)",
  "vital-signs": "Signos Vitales",
  "cie10-selector": "Selector CIE-10",
  "file-upload": "Subida de Archivos",
  "grid-row": "Fila de Columnas",
  section: "Sección / Acordeón",
  "visual-separator": "Separador Visual",
  "section-title": "Título de Sección",
};
