"use client";

import { useState, useEffect } from "react";
import { Upload, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUploader } from "@/components/ui/file-uploader";
import {
  useCreateBatchMutation,
  useUploadDocumentsMutation,
} from "@/features/inventory/hooks/useInventoryMutations";
import { useAuthStore } from "@/store/auth";
import { BulkInventoryUpload } from "@/features/inventory/schemas";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { slideInLeftVariant } from "@/app/lib/animations";
import { MedicationCombobox } from "./MedicationCombobox";
import type { Medication } from "@/features/medications/schemas";

interface BulkEntryItem {
  id: string;
  uuid?: string;
  medicationId?: string;
  customActivePrinciple: string;
  brandName: string;
  laboratory: string;
  stock: number;
  batchNumber: string;
  unitPrice: number;
}

export function BulkInventoryEntryView({ 
  onBack,
  initialData,
}: { 
  onBack?: () => void;
  initialData?: any;
}) {
  const { user } = useAuthStore();
  const providerId = user?.id || "provider-id-fallback";

  const createBatchMutation = useCreateBatchMutation();
  const uploadDocumentsMutation = useUploadDocumentsMutation();
  // Using any to avoid strict typing errors since we just need the PUT request
  const updateBatchMutation = (require("../hooks/usePharmacyBatches") as any).useUpdateBatchMutation();

  const [documents, setDocuments] = useState<Array<{ url: string; file?: File; name?: string }>>([]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<BulkEntryItem[]>([
    {
      id: "1",
      customActivePrinciple: "",
      brandName: "",
      laboratory: "",
      stock: 0,
      batchNumber: "",
      unitPrice: 0,
    },
  ]);

  useEffect(() => {
    if (initialData) {
      setNotes(initialData.notes || "");
      if (initialData.document_urls) {
        setDocuments(initialData.document_urls.map((url: string) => ({ url, name: "Documento adjunto" })));
      }
      if (initialData.items && initialData.items.length > 0) {
        setItems(initialData.items.map((item: any, index: number) => ({
          id: item.id?.toString() || index.toString(),
          uuid: item.uuid,
          medicationId: item.medication?.uuid,
          customActivePrinciple: item.active_ingredient || "",
          brandName: item.laboratory || item.medication?.commercial_name || "",
          laboratory: item.laboratory || "",
          stock: item.stock || 0,
          batchNumber: item.batch_number || "",
          unitPrice: Number(item.unit_price || 0),
        })));
      }
    }
  }, [initialData]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substring(7),
        customActivePrinciple: "",
        brandName: "",
        laboratory: "",
        stock: 0,
        batchNumber: "",
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof BulkEntryItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleMedicationSelect = (id: string, medication: Medication | null, customText: string) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              customActivePrinciple: customText,
              medicationId: medication?.uuid || undefined,
              brandName: (medication as any)?.commercial_name || (medication as any)?.commercialName || "",
              laboratory: (medication as any)?.laboratory || "",
            }
          : item
      )
    );
  };

  const handleSaveBatch = async () => {
    if (items.length === 0) {
      toast.error("Debes agregar al menos un medicamento.");
      return;
    }

    try {
      let uploadedUrls: string[] = [];

      // 1. Upload files first if they exist
      const rawFiles = documents.map(d => d.file).filter(Boolean) as File[];
      if (rawFiles.length > 0) {
        uploadedUrls = await uploadDocumentsMutation.mutateAsync(rawFiles);
      }

      // 2. Prepare payload
      const payload: any = {
        batch: {
          providerId,
          documentUrls: uploadedUrls.length > 0 ? uploadedUrls : (initialData?.document_urls || undefined),
          notes,
        },
        items: items.map((i) => ({
          uuid: i.uuid || undefined,
          providerId,
          medicationId: i.medicationId || undefined,
          customActivePrinciple: i.customActivePrinciple || undefined,
          brandName: i.brandName || undefined,
          laboratory: i.laboratory || undefined,
          stock: i.stock,
          minStockAlert: 10,
          batchNumber: i.batchNumber || undefined,
          unitPrice: i.unitPrice || 0,
          isTaxExempt: false,
          isActive: true,
        })),
      };

      if (initialData && initialData.uuid) {
        // Mode: Edit
        // Extract documentUrls into top level as update endpoint expects
        const editPayload = {
          notes: payload.batch.notes,
          documentUrls: payload.batch.documentUrls,
          items: payload.items,
        };
        await updateBatchMutation.mutateAsync({ uuid: initialData.uuid, data: editPayload });
      } else {
        // Mode: Create
        await createBatchMutation.mutateAsync(payload);
      }
      
      // Cleanup on success
      if (onBack) onBack();
    } catch (error) {
      // Error is handled by mutations
    }
  };

  const isSaving = uploadDocumentsMutation.isPending || createBatchMutation.isPending || (updateBatchMutation?.isPending ?? false);

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
                  setDocuments([...documents, ...mapped]);
                }}
                onFileRemove={(index) => {
                  setDocuments(documents.filter((_, i) => i !== index));
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
              className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:border-pharmako-care outline-none resize-none bg-white transition-colors"
              placeholder="Ej: Lote recibido por proveedor externo. Contiene productos frágiles."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">
              Productos del Lote
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddItem}
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
                    {items.map((item) => (
                      <motion.tr 
                        key={item.id}
                        variants={slideInLeftVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <td className="p-3">
                          <MedicationCombobox
                            value={item.customActivePrinciple}
                            onSelect={(medication, customText) =>
                              handleMedicationSelect(item.id, medication, customText)
                            }
                            className="h-9 text-xs"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Ej: Actron"
                            value={item.brandName}
                            onChange={(e) =>
                              handleItemChange(item.id, "brandName", e.target.value)
                            }
                            className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Ej: Bayer"
                            value={item.laboratory}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "laboratory",
                                e.target.value
                              )
                            }
                            className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            placeholder="Lote #..."
                            value={item.batchNumber}
                            onChange={(e) =>
                              handleItemChange(item.id, "batchNumber", e.target.value)
                            }
                            className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "stock",
                                Number(e.target.value)
                              )
                            }
                            className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                          />
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "unitPrice",
                                Number(e.target.value)
                              )
                            }
                            className="h-9 text-xs border-slate-200 focus:border-pharmako-care shadow-none transition-colors"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length === 1}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end">
          <Button
            onClick={handleSaveBatch}
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
      </div>
    </div>
  );
}
