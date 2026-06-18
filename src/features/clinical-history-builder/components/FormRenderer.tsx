"use client";

import { useState } from "react";
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
} from "../types";
import { cn } from "@/lib/utils";
import { Cie10Selector } from "./Cie10Selector";

// ─── Block-level Zod schemas ────────────────────────────────
function buildZodSchema(element: CanvasElement): z.ZodType<unknown> {
  const base = element.required
    ? z.string().min(1, "Este campo es obligatorio")
    : z.string().optional();

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
    default:
      return z.any().optional();
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
    if ("children" in el && el.children) {
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

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

// ─── Field Renderers ────────────────────────────────────────
function TextShortField({
  element,
  value,
  onChange,
}: {
  element: TextShortBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {element.prefix && (
        <span className="text-sm text-slate-500">{element.prefix}</span>
      )}
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={element.placeholder}
        maxLength={element.maxLength}
        className={cn(
          "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900",
          "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700",
        )}
      />
      {element.suffix && (
        <span className="text-sm text-slate-500">{element.suffix}</span>
      )}
    </div>
  );
}

function TextParagraphField({
  element,
  value,
  onChange,
}: {
  element: TextParagraphBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={element.placeholder}
      rows={element.rows ?? 3}
      maxLength={element.maxLength}
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 resize-none",
        "placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700",
      )}
    />
  );
}

function NumberField({
  element,
  value,
  onChange,
}: {
  element: NumberBlock;
  value?: number;
  onChange: (v: number) => void;
}) {
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
        className={cn(
          "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700",
        )}
      />
      {element.unit && (
        <span className="text-sm text-slate-500 font-medium">
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
}: {
  element: DateTimeBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  const inputType = element.includeTime ? "datetime-local" : "date";
  return (
    <input
      type={inputType}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      min={element.minDate}
      max={element.maxDate}
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900",
        "focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700",
      )}
    />
  );
}

function DropdownField({
  element,
  value,
  onChange,
}: {
  element: DropdownBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700",
      )}
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
}: {
  element: CheckboxMultipleBlock;
  value?: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(optValue: string) {
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
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className={cn(
              "w-4 h-4 rounded border transition-colors flex items-center justify-center flex-shrink-0",
              value.includes(opt.value)
                ? "bg-blue-700 border-blue-700"
                : "border-slate-300 hover:border-slate-400",
            )}
            onClick={() => toggle(opt.value)}
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
          <span className="text-sm text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function ToggleField({
  element,
  value,
  onChange,
}: {
  element: ToggleBlock;
  value?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors",
          value ? "bg-blue-700" : "bg-slate-200",
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform",
            value ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
      <span className="text-sm text-slate-600">
        {value ? (element.labelOn ?? "Sí") : (element.labelOff ?? "No")}
      </span>
    </div>
  );
}

function RadioGroupField({
  element,
  value,
  onChange,
}: {
  element: RadioGroupBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {element.options.map((opt) => (
        <label
          key={opt.value}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors flex items-center justify-center flex-shrink-0",
              value === opt.value
                ? "border-blue-700 bg-blue-700"
                : "border-slate-300 hover:border-slate-400",
            )}
            onClick={() => onChange(opt.value)}
          >
            {value === opt.value && (
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
          <span className="text-sm text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function VitalSignsField({
  element,
  values = {},
  onChange,
}: {
  element: VitalSignsBlock;
  values: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}) {
  function updateField(key: string, val: number) {
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
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
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
}: {
  element: Cie10SelectorBlock;
  value?: string;
  onChange: (v: string) => void;
}) {
  return <Cie10Selector element={element} value={value} onChange={onChange} />;
}

function FileUploadField({
  element,
  files,
  onChange,
}: {
  element: FileUploadBlock;
  files: File[];
  onChange: (v: File[]) => void;
}) {
  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    onChange(selected);
  }

  return (
    <div className="space-y-2">
      <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-blue-700 transition-colors">
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
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-600"
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
          <span className="text-xs text-blue-700 font-medium">*</span>
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
}: {
  element: SectionBlock;
  control: ReturnType<typeof useForm>["control"];
  watch: ReturnType<typeof useForm>["watch"];
  setValue: ReturnType<typeof useForm>["setValue"];
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
          {element.required && <span className="text-xs text-blue-700">*</span>}
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
            />
          ))}
        </div>
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
}: {
  element: CanvasElement;
  control: ReturnType<typeof useForm>["control"];
  watch: ReturnType<typeof useForm>["watch"];
  setValue: ReturnType<typeof useForm>["setValue"];
}) {
  if (element.hidden) return null;

  // Evaluar condiciones dinámicas de visualización
  const isVisible = evaluateConditions(element.conditions, watch);
  if (!isVisible) return null;

  const value = watch(element.id);

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
              />
            )}
          />
        </FieldWrapper>
      );

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
              />
            )}
          />
        </FieldWrapper>
      );

    case "grid-row": {
      const gridCols: Record<number, string> = {
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
      };
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
            "flex flex-col gap-4",
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
            />
          ))}
        </div>
      );
    }

    case "section":
      return (
        <SectionFieldWrapper
          element={element as SectionBlock}
          control={control}
          watch={watch}
          setValue={setValue}
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

    default:
      return null;
  }
}

// ─── MAIN FORM RENDERER ──────────────────────────────────────
interface FormRendererProps {
  elements: CanvasElement[];
  onSubmit?: (values: Record<string, unknown>) => void;
  isLoading?: boolean;
}

export function FormRenderer({
  elements,
  onSubmit,
  isLoading,
}: FormRendererProps) {
  const schema = buildFormSchema(elements);
  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

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
          />
        ))}
      </div>

      {onSubmit && (
        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-700 text-white text-sm font-medium
                       hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoading ? "Guardando..." : "Guardar Historia Clínica"}
          </button>
        </div>
      )}
    </form>
  );
}
