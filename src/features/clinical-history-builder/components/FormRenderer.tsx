"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  CanvasElement,
  TextShortBlock,
  TextParagraphBlock,
  NumberBlock,
  DateTimeBlock,
  DropdownBlock,
  CheckboxMultipleBlock,
  ToggleBlock,
  VitalSignsBlock,
  Cie10SelectorBlock,
  FileUploadBlock,
  GridRowBlock,
  SectionBlock,
  RadioGroupBlock,
  BlockCondition,
  HeaderBlock,
  RepeaterBlock,
  SignatureBlock,
  ComputedFieldBlock,
  ScaleBlock,
  RichTextBlock,
} from "../types";
import { cn } from "@/lib/utils";
import { Cie10Selector } from "./Cie10Selector";
import {
  User,
  Fingerprint,
  Calendar,
  CalendarDays,
  Building2,
  Info,
  Plus,
  Trash2,
} from "lucide-react";

// ─── Block-level Zod schemas ────────────────────────────────
function buildZodSchema(element: CanvasElement): z.ZodType<unknown> {
  switch (element.type) {
    case "text-short":
      return element.required
        ? z
            .string()
            .min(1, "Este campo es obligatorio")
            .max(element.maxLength ?? 500)
        : z
            .string()
            .max(element.maxLength ?? 500)
            .optional();
    case "text-paragraph":
      return element.required
        ? z
            .string()
            .min(1)
            .max(element.maxLength ?? 2000)
        : z
            .string()
            .max(element.maxLength ?? 2000)
            .optional();
    case "number":
      return element.required
        ? z
            .number()
            .min(element.min ?? 0)
            .max(element.max ?? Infinity)
        : z.number().optional();
    case "datetime":
      return element.required
        ? z.string().datetime({ message: "Fecha inválida" })
        : z.string().datetime().optional().or(z.literal(""));
    case "dropdown":
      return element.required
        ? z.string().min(1, "Selecciona una opción")
        : z.string().optional();
    case "checkbox-multiple":
      return element.required
        ? z.array(z.string()).min(1, "Selecciona al menos una opción")
        : z.array(z.string()).optional();
    case "toggle":
      return z.boolean();
    case "radio-group":
      return element.required
        ? z.string().min(1, "Selecciona una opción")
        : z.string().optional();
    case "vital-signs":
      return z.record(z.number()).optional();
    case "cie10-selector":
      return element.required
        ? z.string().min(1, "Selecciona un diagnóstico")
        : z.string().optional();
    case "file-upload":
      return z.array(z.instanceof(File)).optional();
    case "repeater":
      return element.required
        ? z
            .array(z.record(z.unknown()))
            .min(
              (element as RepeaterBlock).minRows ?? 1,
              `Debe ingresar al menos ${(element as RepeaterBlock).minRows ?? 1} registro(s)`,
            )
        : z.array(z.record(z.unknown())).optional();
    case "signature":
      return element.required
        ? z.string().min(1, "Firma requerida")
        : z.string().optional();
    case "computed-field":
      return z.union([z.string(), z.number()]).optional();
    case "scale":
      return element.required
        ? z.number({ required_error: "Seleccione un valor en la escala" })
        : z.number().optional();
    case "rich-text":
      return z.unknown().optional();
    default:
      return z.unknown().optional();
  }
}

// ─── Build a combined form schema from canvas elements ───────
function buildFormSchema(
  elements: CanvasElement[],
): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {};

  for (const el of elements) {
    // Top-level fields
    if (
      !["grid-row", "section", "visual-separator", "section-title"].includes(
        el.type,
      )
    ) {
      shape[el.id] = buildZodSchema(el);
    }

    // Nested children
    if ("children" in el && el.children && el.type !== "repeater") {
      for (const child of el.children) {
        if (child.type === "grid-row") {
          // Grid columns: each child inside grid contributes
          for (const colChild of child.children) {
            shape[colChild.id] = buildZodSchema(colChild);
          }
        } else {
          shape[child.id] = buildZodSchema(child);
        }
      }
    }
  }

  return z.object(shape);
}

// type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

// ─── Field Renderers ────────────────────────────────────────
function TextShortField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: TextShortBlock;
  value?: string;
  onChange: (v: string) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <div className="flex items-center w-full">
      {element.prefix && (
        <span className="text-sm text-slate-500 mr-1.5 shrink-0">
          {element.prefix}
        </span>
      )}
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={element.placeholder}
        maxLength={element.maxLength}
        readOnly={isPatient}
        className={cn(
          "w-full px-3 py-2 rounded-xl border text-sm transition-all duration-200",
          isPatient
            ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default shadow-none focus:outline-none"
            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
        )}
      />
      {element.suffix && (
        <span className="text-sm text-slate-500 ml-1.5 shrink-0">
          {element.suffix}
        </span>
      )}
    </div>
  );
}

function TextParagraphField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: TextParagraphBlock;
  value?: string;
  onChange: (v: string) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={element.placeholder}
      rows={element.rows ?? 3}
      maxLength={element.maxLength}
      readOnly={isPatient}
      className={cn(
        "w-full px-3 py-2 rounded-xl border text-sm resize-none transition-all duration-200",
        isPatient
          ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default shadow-none focus:outline-none"
          : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
      )}
    />
  );
}

function NumberField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: NumberBlock;
  value?: number;
  onChange: (v: number) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={element.min}
        max={element.max}
        step={element.step}
        placeholder={element.placeholder}
        readOnly={isPatient}
        className={cn(
          "w-full px-3 py-2 rounded-xl border text-sm transition-all duration-200",
          isPatient
            ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default shadow-none focus:outline-none"
            : "bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
        )}
      />
      {element.unit && (
        <span className="text-sm text-slate-500 font-medium shrink-0">
          {element.unit}
        </span>
      )}
    </div>
  );
}

function DateTimeField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: DateTimeBlock;
  value?: string;
  onChange: (v: string) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  const inputType = element.includeTime ? "datetime-local" : "date";
  return (
    <input
      type={inputType}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      min={element.minDate}
      max={element.maxDate}
      readOnly={isPatient}
      className={cn(
        "w-full px-3 py-2 rounded-xl border text-sm transition-all duration-200",
        isPatient
          ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default shadow-none focus:outline-none"
          : "bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
      )}
    />
  );
}

function DropdownField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: DropdownBlock;
  value?: string;
  onChange: (v: string) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={isPatient}
      className={cn(
        "w-full px-3 py-2 rounded-xl border text-sm transition-all duration-200 appearance-none bg-no-repeat bg-[right_12px_center]",
        isPatient
          ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default opacity-100"
          : "bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundSize: "20px 20px",
      }}
    >
      <option value="">{element.placeholder ?? "Seleccionar..."}</option>
      {element.options.map((opt) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function CheckboxMultipleField({
  element,
  value = [],
  onChange,
  mode = "doctor",
}: {
  element: CheckboxMultipleBlock;
  value?: string[];
  onChange: (v: string[]) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  function toggle(optValue: string) {
    if (isPatient) return;
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  }

  return (
    <div className="space-y-2">
      {element.options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex items-center gap-2",
            isPatient ? "cursor-default" : "cursor-pointer",
          )}
          onClick={(e) => {
            e.preventDefault();
            toggle(opt.value);
          }}
        >
          <div
            className={cn(
              "w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0",
              value.includes(opt.value)
                ? isPatient
                  ? "bg-slate-400 border-pharmako-care"
                  : "bg-pharmako-care border-pharmako-care"
                : "border-slate-300",
              !isPatient && "hover:border-slate-400",
            )}
          >
            {value.includes(opt.value) && (
              <svg
                className="w-2.5 h-2.5 text-white"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              isPatient ? "text-slate-600" : "text-slate-700",
            )}
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function ToggleField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: ToggleBlock;
  value?: boolean;
  onChange: (v: boolean) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => !isPatient && onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          value
            ? isPatient
              ? "bg-slate-400"
              : "bg-pharmako-care"
            : "bg-slate-200",
          isPatient ? "cursor-default" : "cursor-pointer",
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform",
            value ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      <span
        className={cn(
          "text-sm",
          isPatient ? "text-slate-500" : "text-slate-600",
        )}
      >
        {value ? (element.labelOn ?? "Sí") : (element.labelOff ?? "No")}
      </span>
    </div>
  );
}

function RadioGroupField({
  element,
  value,
  onChange,
  mode = "doctor",
}: {
  element: RadioGroupBlock;
  value?: string;
  onChange: (v: string) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  return (
    <div className="space-y-2">
      {element.options.map((opt) => (
        <label
          key={opt.value}
          className={cn(
            "flex items-center gap-2.5",
            isPatient ? "cursor-default" : "cursor-pointer",
          )}
          onClick={(e) => {
            e.preventDefault();
            if (!isPatient) onChange(opt.value);
          }}
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center flex-shrink-0",
              value === opt.value
                ? isPatient
                  ? "border-pharmako-care bg-pharmako-care"
                  : "border-pharmako-care bg-pharmako-care"
                : "border-slate-300",
              !isPatient && "hover:border-pharmako-care",
            )}
          >
            {value === opt.value && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              isPatient ? "text-slate-600" : "text-slate-700",
            )}
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function VitalSignsField({
  element,
  values = {},
  onChange,
  mode = "doctor",
}: {
  element: VitalSignsBlock;
  values: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  function updateField(key: string, val: number) {
    if (isPatient) return;
    onChange({ ...values, [key]: val });
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {element.fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1">
          <label className="block text-xs font-medium text-slate-600">
            {field.label}
            <span className="text-slate-400 ml-1">({field.unit})</span>
          </label>
          <input
            type="number"
            value={values[field.key] ?? ""}
            onChange={(e) =>
              updateField(field.key, parseFloat(e.target.value) || 0)
            }
            min={field.min}
            max={field.max}
            readOnly={isPatient}
            className={cn(
              "w-full px-3 py-2 rounded-xl border text-sm transition-all duration-200",
              isPatient
                ? "bg-slate-50/30 border-slate-200/80 text-slate-800 cursor-default shadow-none focus:outline-none"
                : "bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-pharmako-care/20 focus:border-pharmako-care",
            )}
          />
          {(field.min !== undefined || field.max !== undefined) && (
            <p className="text-[10px] text-slate-400">
              {field.min !== undefined ? `mín ${field.min}` : ""}
              {field.min !== undefined && field.max !== undefined ? " · " : ""}
              {field.max !== undefined ? `máx ${field.max}` : ""}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function Cie10Field({
  element,
  value,
  onChange,
  disabled = false,
}: {
  element: Cie10SelectorBlock;
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Cie10Selector
      element={element}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

function FileUploadField({
  element,
  files,
  onChange,
  mode = "doctor",
}: {
  element: FileUploadBlock;
  files: File[];
  onChange: (v: File[]) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (isPatient) return;
    const selected = Array.from(e.target.files ?? []);
    onChange(selected);
  }

  return (
    <div className="space-y-2">
      {!isPatient ? (
        <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-pharmako-care transition-colors">
          <span className="text-sm text-slate-400">📎</span>
          <span className="text-xs text-slate-400 mt-1">
            Arrastra archivos o haz clic para seleccionar
          </span>
          <input
            type="file"
            accept={element.accept}
            multiple={element.maxFiles > 1}
            onChange={handleFiles}
            className="hidden"
          />
        </label>
      ) : files.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 text-xs">
          <span>📎</span>
          <span className="italic font-light">Sin archivos adjuntos</span>
        </div>
      ) : null}

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600"
            >
              <span>📎</span>
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-slate-400">
                {(f.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Width utility ─────────────────────────────────────────
const WIDTH_CLASSES: Record<string, string> = {
  full: "col-span-12",
  "2/3": "col-span-8",
  "1/2": "col-span-6",
  "1/3": "col-span-4",
  "1/4": "col-span-3",
};

function FieldWrapper({
  element,
  children,
}: {
  element: CanvasElement;
  children: React.ReactNode;
}) {
  const colSpan = WIDTH_CLASSES[element.width ?? "full"] ?? "col-span-12";

  return (
    <div className={cn("flex flex-col gap-1.5", colSpan)}>
      <label className="flex items-center gap-1">
        <span className="text-sm font-medium text-slate-700">
          {element.title}
        </span>
        {element.required && (
          <span className="text-xs text-pharmako-care font-medium">*</span>
        )}
      </label>
      {element.description && (
        <p className="text-xs text-slate-400">{element.description}</p>
      )}
      {children}
    </div>
  );
}

function evaluateConditions(
  conditions: BlockCondition[] | undefined,
  watch: (id: string) => unknown,
): boolean {
  if (!conditions || conditions.length === 0) return true;

  for (const cond of conditions) {
    const triggerValue = watch(cond.fieldId);

    switch (cond.operator) {
      case "equals":
        if (triggerValue !== cond.value) return false;
        break;
      case "not-equals":
        if (triggerValue === cond.value) return false;
        break;
      case "greater-than":
        if (typeof triggerValue !== "number" || triggerValue <= cond.value)
          return false;
        break;
      case "less-than":
        if (typeof triggerValue !== "number" || triggerValue >= cond.value)
          return false;
        break;
      default:
        break;
    }
  }

  return true;
}

function SectionFieldWrapper({
  element,
  control,
  watch,
  setValue,
  mode,
}: {
  element: SectionBlock;
  control: ReturnType<typeof useForm>["control"];
  watch: ReturnType<typeof useForm>["watch"];
  setValue: ReturnType<typeof useForm>["setValue"];
  mode?: "doctor" | "patient" | "pdf";
}) {
  const [open, setOpen] = useState(element.defaultOpen ?? true);
  return (
    <div className="rounded-xl border border-slate-100 bg-white col-span-12">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {element.title}
          </span>
          {element.required && (
            <span className="text-xs text-pharmako-care">*</span>
          )}
        </div>
        <span className="text-slate-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {element.children?.map((child) => (
            <CanvasElementRenderer
              key={child.id}
              element={child}
              control={control}
              watch={watch}
              setValue={setValue}
              mode={mode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RepeaterField({
  element,
  value = [],
  onChange,
  mode = "doctor",
}: {
  element: RepeaterBlock;
  value?: Record<string, string | number | boolean>[];
  onChange: (v: Record<string, string | number | boolean>[]) => void;
  mode?: "doctor" | "patient" | "pdf";
}) {
  const isPatient = mode === "patient";
  const isPdf = mode === "pdf";
  const columns = useMemo(() => element.children || [], [element.children]);

  const addRow = () => {
    if (element.maxRows && value.length >= element.maxRows) return;
    const newRow = columns.reduce(
      (acc: Record<string, string | number | boolean>, col: CanvasElement) => {
        acc[col.id] = col.type === "toggle" ? false : "";
        return acc;
      },
      {} as Record<string, string | number | boolean>,
    );
    onChange([...value, newRow]);
  };

  const removeRow = (idx: number) => {
    if (element.minRows && value.length <= element.minRows) return;
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleCellChange = (
    rowIdx: number,
    colId: string,
    cellVal: string | number | boolean,
  ) => {
    const updated = value.map((row, rIdx) => {
      if (rIdx !== rowIdx) return row;
      return { ...row, [colId]: cellVal };
    });
    onChange(updated);
  };

  // Populate initial rows matching minRows if empty
  useEffect(() => {
    const min = element.minRows ?? 0;
    if (value.length < min) {
      const initialRows = Array.from({ length: min - value.length }).map(() =>
        columns.reduce(
          (
            acc: Record<string, string | number | boolean>,
            col: CanvasElement,
          ) => {
            acc[col.id] = col.type === "toggle" ? false : "";
            return acc;
          },
          {} as Record<string, string | number | boolean>,
        ),
      );
      onChange([...value, ...initialRows]);
    }
  }, [value, columns, element.minRows, onChange]);

  if (columns.length === 0) {
    return (
      <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
        Este repetidor no tiene columnas configuradas.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[500px] border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {(
                columns as (CanvasElement & {
                  title?: string;
                  required?: boolean;
                })[]
              ).map((col) => (
                <th key={col.id} className="px-4 py-3 text-left">
                  <div className="flex items-center gap-1">
                    {col.title}
                    {col.required && (
                      <span className="text-pharmako-care">*</span>
                    )}
                  </div>
                </th>
              ))}
              {!isPatient && !isPdf && <th className="w-12 px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {value.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-slate-50/40 transition-colors"
              >
                {(
                  columns as (CanvasElement & {
                    title?: string;
                    required?: boolean;
                  })[]
                ).map((col) => {
                  const cellValue = row[col.id];
                  return (
                    <td key={col.id} className="px-4 py-2">
                      {col.type === "toggle" ? (
                        <input
                          type="checkbox"
                          checked={!!cellValue}
                          disabled={isPatient}
                          onChange={(e) =>
                            handleCellChange(rowIdx, col.id, e.target.checked)
                          }
                          className="rounded border-slate-300 text-pharmako-care focus:ring-pharmako-care"
                        />
                      ) : col.type === "datetime" ? (
                        <input
                          type="date"
                          value={typeof cellValue === "string" ? cellValue : ""}
                          disabled={isPatient}
                          onChange={(e) =>
                            handleCellChange(rowIdx, col.id, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-pharmako-care bg-white"
                        />
                      ) : col.type === "number" ? (
                        <input
                          type="number"
                          value={typeof cellValue === "number" ? cellValue : ""}
                          disabled={isPatient}
                          onChange={(e) =>
                            handleCellChange(
                              rowIdx,
                              col.id,
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-pharmako-care bg-white"
                        />
                      ) : (
                        <input
                          type="text"
                          value={typeof cellValue === "string" ? cellValue : ""}
                          disabled={isPatient}
                          onChange={(e) =>
                            handleCellChange(rowIdx, col.id, e.target.value)
                          }
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-pharmako-care bg-white"
                        />
                      )}
                    </td>
                  );
                })}
                {!isPatient && !isPdf && (
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      disabled={
                        element.minRows && value.length <= element.minRows
                      }
                      onClick={() => removeRow(rowIdx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isPatient && !isPdf && (
        <button
          type="button"
          disabled={element.maxRows && value.length >= element.maxRows}
          onClick={addRow}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     text-pharmako-care bg-pharmako-care-light hover:bg-pharmako-care-light/80 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          {element.addButtonLabel || "Agregar Fila"}
        </button>
      )}
    </div>
  );
}

// ─── Canvas element renderer ─────────────────────────────────
function CanvasElementRenderer({
  element,
  control,
  watch,
  setValue,
  mode = "doctor",
}: {
  element: CanvasElement;
  control: ReturnType<typeof useForm>["control"];
  watch: ReturnType<typeof useForm>["watch"];
  setValue: ReturnType<typeof useForm>["setValue"];
  mode?: "doctor" | "patient" | "pdf";
}) {
  if (element.hidden) return null;

  // Evaluar condiciones dinámicas de visualización
  const isVisible = evaluateConditions(element.conditions, watch);
  if (!isVisible) return null;

  const value = watch(element.id);
  const isReadOnly = mode === "pdf";

  if (isReadOnly && element.type !== "header") {
    return (
      <FieldWrapper element={element}>
        <ReadOnlyField element={element} value={value} mode={mode} />
      </FieldWrapper>
    );
  }

  switch (element.type) {
    case "text-short":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <TextShortField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "text-paragraph":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <TextParagraphField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "number":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <NumberField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "datetime":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <DateTimeField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "dropdown":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <DropdownField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "checkbox-multiple":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <CheckboxMultipleField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "toggle":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <ToggleField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "radio-group":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <RadioGroupField
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "vital-signs":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <VitalSignsField
                element={element}
                values={value ?? {}}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "cie10-selector":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <Cie10Field
                element={element}
                value={value}
                onChange={(v) => setValue(element.id, v)}
                disabled={mode === "patient"}
              />
            )}
          />
        </FieldWrapper>
      );

    case "header": {
      const headerEl = element as HeaderBlock;
      return (
        <div
          className={cn(
            "col-span-12 p-6 rounded-2xl border transition-all duration-200",
            headerEl.style === "boxed"
              ? "bg-gradient-to-br from-slate-50 to-white border-slate-100 shadow-sm"
              : headerEl.style === "bordered"
                ? "bg-white border-2 border-slate-100 shadow-sm"
                : "bg-white border-slate-100/80 shadow-sm",
          )}
        >
          <div
            className={cn(
              "flex flex-col sm:flex-row items-center gap-6",
              headerEl.logoPosition === "right"
                ? "sm:flex-row-reverse"
                : headerEl.logoPosition === "center"
                  ? "sm:flex-col text-center"
                  : "",
            )}
          >
            {headerEl.logoUrl && (
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center border border-slate-100 overflow-hidden shrink-0 shadow-sm p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headerEl.logoUrl}
                  alt="Logo Clínica"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center gap-2 mb-1",
                  headerEl.logoPosition === "center" ? "justify-center" : "",
                )}
              >
                <Building2 className="w-4 h-4 text-pharmako-care shrink-0 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ficha Médica Profesional
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight tracking-tight">
                {headerEl.titleText || "Clínica San Lucas"}
              </h2>
              {headerEl.subtitleText && (
                <p className="text-sm font-semibold text-pharmako-care mt-1">
                  {headerEl.subtitleText}
                </p>
              )}
              {headerEl.contactInfo && (
                <div
                  className={cn(
                    "text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100/80 whitespace-pre-line leading-relaxed flex items-start gap-2",
                    headerEl.logoPosition === "center" ? "justify-center" : "",
                  )}
                >
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="flex-1">{headerEl.contactInfo}</span>
                </div>
              )}
            </div>
          </div>

          {headerEl.showPatientData && (
            <div className="mt-6 pt-5 border-t border-dashed border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {headerEl.patientDataFields?.includes("name") && (
                <div className="bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100/80 transition-colors flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Paciente
                    </span>
                    <span className="font-semibold text-sm text-slate-800 truncate block">
                      Juan Pérez
                    </span>
                  </div>
                </div>
              )}
              {headerEl.patientDataFields?.includes("idNumber") && (
                <div className="bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100/80 transition-colors flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0 shadow-sm">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Identificación / DNI
                    </span>
                    <span className="font-semibold text-sm text-slate-800 truncate block">
                      12.345.678
                    </span>
                  </div>
                </div>
              )}
              {headerEl.patientDataFields?.includes("age") && (
                <div className="bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100/80 transition-colors flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0 shadow-sm">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Edad
                    </span>
                    <span className="font-semibold text-sm text-slate-800 truncate block">
                      35 años
                    </span>
                  </div>
                </div>
              )}
              {headerEl.patientDataFields?.includes("date") && (
                <div className="bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100/80 transition-colors flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0 shadow-sm">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Fecha de Consulta
                    </span>
                    <span className="font-semibold text-sm text-slate-800 truncate block">
                      {new Date().toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    case "file-upload":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={() => (
              <FileUploadField
                element={element}
                files={value ?? []}
                onChange={(v) => setValue(element.id, v)}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "grid-row": {
      const gapSize: Record<string, string> = {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
      };
      const gridEl = element as GridRowBlock;
      return (
        <div
          className={cn(
            "grid grid-cols-1",
            gapSize[gridEl.gap ?? "md"],
            gridEl.columns === 2
              ? "sm:grid-cols-2"
              : gridEl.columns === 3
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4",
          )}
        >
          {gridEl.children.map((child) => (
            <CanvasElementRenderer
              key={child.id}
              element={child}
              control={control}
              watch={watch}
              setValue={setValue}
              mode={mode}
            />
          ))}
        </div>
      );
    }

    case "repeater":
      return (
        <FieldWrapper element={element}>
          <Controller
            name={element.id}
            control={control}
            render={({ field: { value, onChange } }) => (
              <RepeaterField
                element={element}
                value={value}
                onChange={onChange}
                mode={mode}
              />
            )}
          />
        </FieldWrapper>
      );

    case "section":
      return (
        <SectionFieldWrapper
          element={element as SectionBlock}
          control={control}
          watch={watch}
          setValue={setValue}
          mode={mode}
        />
      );

    case "section-title":
      return (
        <h2
          className={cn(
            "text-slate-800 font-semibold",
            element.level === 1
              ? "text-xl"
              : element.level === 2
                ? "text-lg"
                : "text-base",
          )}
        >
          {element.title}
        </h2>
      );

    case "visual-separator":
      return (
        <div
          className={
            element.style === "space" ? "h-8" : "h-px bg-slate-100 my-2"
          }
        />
      );

    case "signature": {
      const sigEl = element as SignatureBlock;
      return (
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="h-20 border-b-2 border-slate-300 flex items-end pb-2">
            <span className="text-sm text-slate-400 italic">
              {sigEl.signerLabel ?? "Firma"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {sigEl.includeName && <span>Nombre: ___________________</span>}
            {sigEl.includeDate && <span>Fecha: ____/____/________</span>}
            {sigEl.includeLicense && <span>Matrícula: _______________</span>}
          </div>
        </div>
      );
    }

    case "computed-field": {
      const compEl = element as ComputedFieldBlock;
      return (
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <span className="text-lg font-bold text-amber-600">ƒ</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700">
              {compEl.formula === "bmi"
                ? "IMC (Índice de Masa Corporal)"
                : compEl.formula === "age-from-dob"
                  ? "Edad calculada"
                  : compEl.formula === "weeks-of-pregnancy"
                    ? "Semanas de embarazo"
                    : "Campo calculado"}
            </p>
            <p className="text-xs text-amber-500">
              Valor calculado automáticamente
              {compEl.unit ? ` (${compEl.unit})` : ""}
            </p>
          </div>
          <div className="px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-sm text-amber-600 font-mono">
            —
          </div>
        </div>
      );
    }

    case "scale": {
      const scaleEl = element as ScaleBlock;
      const range = Array.from(
        { length: (scaleEl.max ?? 10) - (scaleEl.min ?? 0) + 1 },
        (_, i) => (scaleEl.min ?? 0) + i,
      );
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            {range.map((n) => (
              <button
                key={n}
                type="button"
                className="flex-1 h-10 rounded-lg border border-slate-200 bg-white hover:bg-pharmako-care hover:text-white hover:border-pharmako-care text-sm text-slate-600 transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
          {scaleEl.labels && (
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>{scaleEl.labels[scaleEl.min ?? 0]}</span>
              <span>{scaleEl.labels[scaleEl.max ?? 10]}</span>
            </div>
          )}
        </div>
      );
    }

    case "rich-text": {
      const rtEl = element as RichTextBlock;
      return (
        <div
          className={cn(
            "prose prose-sm max-w-none p-4 rounded-xl border",
            rtEl.editable
              ? "bg-white border-slate-200"
              : "bg-blue-50 border-blue-100",
          )}
          dangerouslySetInnerHTML={{ __html: rtEl.content ?? "" }}
        />
      );
    }

    default:
      return null;
  }
}

// ─── MAIN FORM RENDERER ──────────────────────────────────────
interface FormRendererProps {
  elements: CanvasElement[];
  onSubmit?: (values: Record<string, unknown>) => void;
  isLoading?: boolean;
  mode?: "doctor" | "patient" | "pdf";
  defaultValues?: Record<string, unknown>;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export function FormRenderer({
  elements,
  onSubmit,
  isLoading,
  mode = "doctor",
  defaultValues = {},
  onValuesChange,
}: FormRendererProps) {
  const schema = buildFormSchema(elements);
  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const values = watch();
  const onValuesChangeRef = useRef(onValuesChange);
  onValuesChangeRef.current = onValuesChange;

  const lastValuesRef = useRef<string>("");

  useEffect(() => {
    const serialized = JSON.stringify(values);
    if (serialized !== lastValuesRef.current) {
      lastValuesRef.current = serialized;
      onValuesChangeRef.current?.(values);
    }
  }, [values]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit ?? (() => {}))}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {elements.map((element) => (
          <CanvasElementRenderer
            key={element.id}
            element={element}
            control={control}
            watch={watch}
            setValue={setValue}
            mode={mode}
          />
        ))}
      </div>

      {onSubmit && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-pharmako-care text-white text-sm font-medium
                       hover:bg-pharmako-care-hover disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoading ? "Guardando..." : "Guardar Historia Clínica"}
          </button>
        </div>
      )}
    </form>
  );
}

// ─── READ ONLY FIELD RENDERER ───────────────────────────────
function ReadOnlyField({
  element,
  value,
  mode,
}: {
  element: CanvasElement;
  value: unknown;
  mode: "patient" | "pdf";
}) {
  const isPatient = mode === "patient";

  switch (element.type) {
    case "text-short":
    case "text-paragraph":
    case "datetime": {
      const strVal = value as string | undefined;
      return (
        <p
          className={cn(
            "text-sm text-slate-800 pb-1 leading-relaxed min-h-[24px]",
            isPatient
              ? "bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100"
              : "border-b border-slate-100",
          )}
        >
          {strVal || (
            <span className="text-slate-400 font-light italic">
              Sin registrar
            </span>
          )}
        </p>
      );
    }

    case "number": {
      const numEl = element as NumberBlock;
      return (
        <p
          className={cn(
            "text-sm text-slate-800 pb-1 leading-relaxed min-h-[24px]",
            isPatient
              ? "bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100"
              : "border-b border-slate-100",
          )}
        >
          {value !== undefined && value !== "" ? (
            `${value} ${numEl.unit ?? ""}`
          ) : (
            <span className="text-slate-400 font-light italic">
              Sin registrar
            </span>
          )}
        </p>
      );
    }

    case "dropdown": {
      const dropEl = element as DropdownBlock;
      const selectedLabel = dropEl.options.find(
        (o) => o.value === value,
      )?.label;
      return (
        <p
          className={cn(
            "text-sm text-slate-800 pb-1 leading-relaxed min-h-[24px]",
            isPatient
              ? "bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100"
              : "border-b border-slate-100",
          )}
        >
          {selectedLabel || (
            <span className="text-slate-400 font-light italic">
              Sin seleccionar
            </span>
          )}
        </p>
      );
    }

    case "checkbox-multiple": {
      const checkEl = element as CheckboxMultipleBlock;
      const selectedVals = (value as string[]) ?? [];
      const selectedLabels = checkEl.options
        .filter((o) => selectedVals.includes(o.value))
        .map((o) => o.label);

      if (selectedLabels.length === 0) {
        return (
          <p className="text-sm text-slate-400 font-light italic">
            Ninguno seleccionado
          </p>
        );
      }

      return (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedLabels.map((lbl, idx) => (
            <span
              key={idx}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium border",
                isPatient
                  ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-700",
              )}
            >
              ✓ {lbl}
            </span>
          ))}
        </div>
      );
    }

    case "radio-group": {
      const radioEl = element as RadioGroupBlock;
      const selectedLabel = radioEl.options.find(
        (o) => o.value === value,
      )?.label;
      return (
        <p
          className={cn(
            "text-sm text-slate-800 pb-1 leading-relaxed min-h-[24px]",
            isPatient
              ? "bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100"
              : "border-b border-slate-100",
          )}
        >
          {selectedLabel || (
            <span className="text-slate-400 font-light italic">
              Sin seleccionar
            </span>
          )}
        </p>
      );
    }

    case "toggle": {
      const toggleEl = element as ToggleBlock;
      const displayVal = value
        ? (toggleEl.labelOn ?? "Sí")
        : (toggleEl.labelOff ?? "No");
      return (
        <span
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
            value
              ? "bg-pharmako-care-light border-pharmako-care/20 text-pharmako-care"
              : "bg-slate-100 border-slate-200 text-slate-500",
          )}
        >
          {displayVal}
        </span>
      );
    }

    case "vital-signs": {
      const vitalEl = element as VitalSignsBlock;
      const vals = (value as Record<string, number>) ?? {};
      const presentFields = vitalEl.fields.filter(
        (f) => vals[f.key] !== undefined,
      );

      if (presentFields.length === 0) {
        return (
          <p className="text-sm text-slate-400 font-light italic">
            Sin signos vitales registrados
          </p>
        );
      }

      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {vitalEl.fields.map((field) => {
            const val = vals[field.key];
            if (val === undefined) return null;
            return (
              <div
                key={field.key}
                className={cn(
                  "p-3 rounded-xl border shadow-sm",
                  isPatient
                    ? "bg-emerald-50/30 border-emerald-100"
                    : "bg-slate-50 border-slate-100",
                )}
              >
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {field.label}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {val}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    {field.unit}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    case "cie10-selector": {
      return (
        <div className="pt-1">
          {value ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pharmako-care-light border border-pharmako-care/20 text-xs font-semibold text-pharmako-care">
              🩺 {value}
            </span>
          ) : (
            <p className="text-sm text-slate-400 font-light italic">
              Sin diagnóstico registrado
            </p>
          )}
        </div>
      );
    }

    case "file-upload": {
      const filesList = (value as File[]) ?? [];
      if (filesList.length === 0) {
        return (
          <p className="text-sm text-slate-400 font-light italic">
            Sin archivos adjuntos
          </p>
        );
      }
      return (
        <div className="space-y-1.5 pt-1">
          {filesList.map((f, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-150 text-xs text-slate-600"
            >
              <span>📎</span>
              <span className="font-medium truncate max-w-xs">{f.name}</span>
              <span className="text-slate-400">
                ({(f.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}
