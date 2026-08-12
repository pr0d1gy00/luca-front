"use client";

import { useEffect } from "react";
import { X, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { MedicationCombobox } from "./MedicationCombobox";
import { useInventoryForm } from "../hooks/useInventoryForm";
import type { PharmacyInventoryItem, SaleCondition } from "../types/pharmacy.types";

interface AddEditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: PharmacyInventoryItem | null;
}

export function AddEditInventoryModal({
  isOpen,
  onClose,
  itemToEdit,
}: AddEditInventoryModalProps) {
  const { form, onSubmit, isSubmitting } = useInventoryForm(itemToEdit, onClose);
  const { register, watch, setValue } = form;

  const allowsFractioning = watch("allowsFractioning");
  const activeIngredient = watch("activeIngredient");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <motion.div 
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-none my-8 overflow-hidden space-y-0"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {itemToEdit
                  ? "Editar Producto en Inventario"
                  : "Registrar Producto en Inventario"}
              </h2>
              <p className="text-xs text-slate-500">
                Gestión de stock, fraccionamiento y precios
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

        {/* Content Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Monodroga / Principio Activo
              </label>
              <MedicationCombobox
                value={activeIngredient}
                onSelect={(medication, customText) => {
                  setValue("activeIngredient", customText);
                  if (medication) {
                    setValue("medicationId", (medication as any).id);
                    if ((medication as any).laboratory) {
                      setValue("laboratory", (medication as any).laboratory);
                    }
                  } else {
                    setValue("medicationId", 0);
                  }
                }}
                placeholder="Ej: Acetaminofén / Ibuprofeno"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Laboratorio Fabricante
              </label>
              <Input
                type="text"
                {...register("laboratory")}
                placeholder="Ej: Bayer, Pfizer, Genfar"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Código EAN/GTIN
              </label>
              <Input
                type="text"
                {...register("eanCode")}
                placeholder="7591001234567"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Condición de Venta
              </label>
              <select
                {...register("saleCondition")}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-pharmako-care"
              >
                <option value="prescription">Bajo Receta Médica</option>
                <option value="free">Venta Libre (OTC)</option>
                <option value="controlled">Receta Archivada (Psicotrópicos)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Estantería / Ubicación
              </label>
              <Input
                type="text"
                {...register("locationRack")}
                placeholder="Ej: Pasillo A3 - Estante 2"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
          </div>

          {/* Fractioning Settings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  ¿Permite Venta Detallada / Fraccionada?
                </label>
                <p className="text-[11px] text-slate-500">
                  Permite vender unidades sueltas o blísteres además de cajas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setValue("allowsFractioning", !allowsFractioning)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowsFractioning ? "bg-pharmako-care" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    allowsFractioning ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {allowsFractioning && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    Unidades por Caja
                  </label>
                  <Input
                    type="number"
                    min="1"
                    {...register("unitsPerPackage", { valueAsNumber: true })}
                    className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    Nombre de la Unidad Fraccionada
                  </label>
                  <Input
                    type="text"
                    {...register("fractionUnitName")}
                    placeholder="Ej: Blíster, Comprimido, Ampolla"
                    className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stock & Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stock Cajas
              </label>
              <Input
                type="number"
                min="0"
                {...register("packageStock", { valueAsNumber: true })}
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Stock Fraccionado
              </label>
              <Input
                type="number"
                min="0"
                {...register("fractionStock", { valueAsNumber: true })}
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                N° de Lote
              </label>
              <Input
                type="text"
                {...register("batchNumber")}
                placeholder="LOT-2026-X"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Vencimiento
              </label>
              <Input
                type="date"
                {...register("expirationDate")}
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
          </div>

          {/* Multi-Currency Price Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-pharmako-care" />
              <span>Precios Manuales Multimoneda</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Precio $ USD
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("prices.USD", { valueAsNumber: true })}
                  className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Precio Bs. VES
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("prices.VES", { valueAsNumber: true })}
                  className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Precio € EUR
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("prices.EUR", { valueAsNumber: true })}
                  className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                />
              </div>
            </div>
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
              disabled={isSubmitting}
              className="bg-pharmako-care text-slate-900 font-bold hover:bg-pharmako-care-hover shadow-none transition-colors duration-150"
            >
              {itemToEdit ? "Guardar Cambios" : "Registrar Producto"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
    )}
  </AnimatePresence>
  );
}
