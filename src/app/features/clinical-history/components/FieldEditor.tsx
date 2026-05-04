import { FormField } from "../types/index";

export function FieldEditor({
  field,
  onChange,
}: {
  field?: FormField;
  onChange: (key: string, value: string | boolean) => void;
}) {
  if (!field) return <p>Selecciona un campo</p>;

  return (
    <div className="space-y-4">
      {!field ? (
        <p className="text-sm text-slate-400">Selecciona un campo</p>
      ) : (
        <>
          <div>
            <label className="text-xs text-slate-500">Label</label>
            <input
              className="w-full border rounded-lg p-2 mt-1"
              value={field.label}
              onChange={(e) => onChange("label", e.target.value)}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange("required", e.target.checked)}
            />
            Requerido
          </label>
        </>
      )}
    </div>
  );
}
