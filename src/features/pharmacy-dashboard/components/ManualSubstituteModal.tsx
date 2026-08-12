"use client";

import { Search, RefreshCw, Check, X, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PharmacyInventoryItem } from "../types/pharmacy.types";
import { useManualSubstituteForm } from "../hooks/useManualSubstituteForm";

interface ManualSubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalMedicationName: string;
  onSelectSubstitute: (item: PharmacyInventoryItem, reason: string) => void;
}

export function ManualSubstituteModal({
  isOpen,
  onClose,
  originalMedicationName,
  onSelectSubstitute,
}: ManualSubstituteModalProps) {
  const {
    form: { register, formState: { errors } },
    inventory,
    isLoading,
    selectedItem,
    handleSelectItem,
    onSubmit,
  } = useManualSubstituteForm({ onSelectSubstitute, onClose });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div 
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-none overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sustitución Manual de Medicamento
              </h2>
              <p className="text-xs text-slate-500">
                Reemplazar &quot;{originalMedicationName}&quot; por producto en
                stock
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <Input
              type="text"
              {...register("searchTerm")}
              placeholder="Buscar por monodroga, marca o laboratorio..."
              className="pl-10 h-11 border-slate-200 rounded-xl bg-white shadow-none text-sm text-slate-900 focus:border-pharmako-care"
            />
          </div>

          {/* Product List */}
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/30">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-500">
                Buscando sustitutos en inventario...
              </div>
            ) : inventory.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No se encontraron productos coincidentes
              </div>
            ) : (
              inventory.map((item: any) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-pharmako-care-light/60 border-l-4 border-pharmako-care"
                        : "hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {item.medication?.name ||
                            item.active_ingredient ||
                            "Producto sin nombre"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.laboratory ? `Lab: ${item.laboratory}` : ""} •
                          Monodroga: {item.active_ingredient || "N/A"}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-0.5">
                          Stock: {item.package_stock} cajas (
                          {item.fraction_stock} {item.fraction_unit_name}s)
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-pharmako-care text-slate-900">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {errors.selectedItemId && (
            <p className="text-xs text-red-500 font-medium">{errors.selectedItemId.message}</p>
          )}

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Motivo / Justificación del Reemplazo
            </label>
            <Input
              type="text"
              {...register("reason")}
              placeholder="Ej: Bioequivalente exacto en misma concentración."
              className="h-10 border-slate-200 rounded-xl bg-white shadow-none text-xs text-slate-900"
            />
            {errors.reason && (
              <p className="text-xs text-red-500 font-medium">{errors.reason.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedItem}
              className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-5"
            >
              Confirmar Sustitución
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
