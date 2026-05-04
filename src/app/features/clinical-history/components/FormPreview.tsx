// FormPreview.tsx
import { Template } from "../types/index";

export function FormPreview({ template }: { template: Template }) {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto shadow">
      <h1 className="text-2xl font-bold mb-6">{template.name}</h1>

      {template.groups.map((group) => (
        <div key={group.id} className="mb-6">
          <h2 className="font-semibold border-b mb-3">{group.name}</h2>

          <div className="grid grid-cols-12 gap-4">
            {group.fields.map((field) => (
              <div key={field.id} className="col-span-12">
                <label className="text-sm font-medium">{field.label}</label>

                {field.type === "short_text" && (
                  <input className="w-full border p-2" />
                )}

                {field.type === "long_text" && (
                  <textarea className="w-full border p-2" />
                )}

                {field.type === "number" && (
                  <input type="number" className="w-full border p-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
