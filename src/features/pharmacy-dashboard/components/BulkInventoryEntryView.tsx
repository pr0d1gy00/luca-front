"use client";

import { Upload, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/ui/file-uploader";
import { motion, AnimatePresence } from "motion/react";
import { slideInLeftVariant } from "@/app/lib/animations";
import { MedicationCombobox } from "./MedicationCombobox";
import { useBulkInventoryForm } from "../hooks/useBulkInventoryForm";

export function BulkInventoryEntryView({ 
  onBack,
  initialData,
}: { 
  onBack?: () => void;
  initialData?: any;
}) {
  const {
    form: { register, watch, setValue },
    fields,
    append,
    remove,
    handleMedicationSelect,
    onSubmit,
    isSaving,
  } = useBulkInventoryForm(initialData, onBack);

  const documents = watch("documents") || [];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-none">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? "Editar Lote / Factura" : "Carga Masiva de Lote"}
            </h2>
            <p className="text-sm text-slate-500">
              {initialData ? "Modifica los productos o documentos ingresados en este lote." : "Registra múltiples medicamentos o sube las facturas para procesarlas."}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center mb-3">
                <FileText className="w-4 h-4 mr-2 text-pharmako-care" />
                Soporte Documental (Opcional)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Adjunta fotos de facturas o documentos de recepción (se pueden subir varios).
              </p>
              <div className="bg-white p-1 rounded-xl border border-slate-200">
                <FileUploader
                  files={documents}
                  onFilesAdded={(newFiles) => {
                    const mapped = newFiles.map(f => ({ url: URL.createObjectURL(f), file: f, name: f.name }));
                    setValue("documents", [...documents, ...mapped], { shouldValidate: true });
                  }}
                  onFileRemove={(index) => {
                    setValue("documents", documents.filter((_: any, i: number) => i !== index), { shouldValidate: true });
                  }}
                  maxFiles={5}
                  className="border-dashed border-slate-300 hover:border-pharmako-care bg-slate-50 transition-colors"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Notas Adicionales
              </h3>
              <textarea
                {...register("notes")}
                className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:border-pharmako-care outline-none resize-none bg-white transition-colors"
                placeholder="Ej: Lote recibido por proveedor externo. Contiene productos frágiles."
              />
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                Productos del Lote
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  id: Math.random().toString(36).substring(7),
                  customActivePrinciple: "",
                  brandName: "",
                  laboratory: "",
                  stock: 0,
                  batchNumber: "",
                  unitPrice: 0,
                })}
                className="text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Añadir Fila
              </Button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="p-3 w-[25%]">Principio Activo (Genérico)</th>
                      <th className="p-3 w-[25%]">Marca Comercial</th>
                      <th className="p-3 w-[20%]">Laboratorio</th>
                      <th className="p-3 w-[10%]">Lote</th>
                      <th className="p-3 w-[8%]">Cant.</th>
                      <th className="p-3 w-[12%]">Precio (Bs)</th>
                      <th className="p-3 w-[5%]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <AnimatePresence initial={false}>
                      {fields.map((field, index) => {
                        const customActivePrinciple = watch(`items.${index}.customActivePrinciple`);
                        return (
                          <motion.tr 
                            key={field._key}
                            variants={slideInLeftVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <td className="p-3">
                              <MedicationCombobox
                                value={customActivePrinciple}
                                onSelect={(medication, customText) =>
                                  handleMedicationSelect(index, medication, customText)
                                }
                                className="h-9 text-xs"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                placeholder="Ej: Actron"
                                {...register(`items.${index}.brandName`)}
                                className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                placeholder="Ej: Bayer"
                                {...register(`items.${index}.laboratory`)}
                                className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                placeholder="Lote #..."
                                {...register(`items.${index}.batchNumber`)}
                                className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                min="0"
                                {...register(`items.${index}.stock`, { valueAsNumber: true })}
                                className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-pharmako-care text-slate-900 font-bold hover:bg-pharmako-care-hover h-11 px-8 rounded-xl shadow-none transition-colors duration-150"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "Procesando..." : "Guardar y Procesar Lote"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
