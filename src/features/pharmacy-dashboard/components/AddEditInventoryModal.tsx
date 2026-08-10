"use client";

import { useState, useEffect } from "react";
import { X, Package, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { usePharmacyInventory } from "../hooks/usePharmacyInventory";
import { MedicationCombobox } from "./MedicationCombobox";
import type {
  PharmacyInventoryItem,
  SaleCondition,
} from "../types/pharmacy.types";

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
  const { createItem, updateItem, isCreating, isUpdating } =
    usePharmacyInventory();

  const [medicationId, setMedicationId] = useState<number>(1);
  const [eanCode, setEanCode] = useState<string>("");
  const [activeIngredient, setActiveIngredient] = useState<string>("");
  const [laboratory, setLaboratory] = useState<string>("");
  const [saleCondition, setSaleCondition] =
    useState<SaleCondition>("prescription");
  const [packageStock, setPackageStock] = useState<number>(10);
  const [fractionStock, setFractionStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [locationRack, setLocationRack] = useState<string>("");

  const [allowsFractioning, setAllowsFractioning] = useState<boolean>(false);
  const [unitsPerPackage, setUnitsPerPackage] = useState<number>(10);
  const [fractionUnitName, setFractionUnitName] = useState<string>("Blíster");

  const [priceUSD, setPriceUSD] = useState<number>(0);
  const [priceVES, setPriceVES] = useState<number>(0);
  const [priceEUR, setPriceEUR] = useState<number>(0);

  useEffect(() => {
    if (!itemToEdit) return;
    const timer = setTimeout(() => {
      setMedicationId(itemToEdit.medication_id || 1);
      setEanCode(itemToEdit.ean_code || "");
      setActiveIngredient(itemToEdit.active_ingredient || "");
      setLaboratory(itemToEdit.laboratory || "");
      setSaleCondition(itemToEdit.sale_condition || "prescription");
      setPackageStock(itemToEdit.package_stock || 0);
      setFractionStock(itemToEdit.fraction_stock || 0);
      setMinStockAlert(itemToEdit.min_stock_alert || 5);
      setBatchNumber(itemToEdit.batch_number || "");
      setExpirationDate(itemToEdit.expiration_date || "");
      setLocationRack(itemToEdit.location_rack || "");
      setAllowsFractioning(itemToEdit.allows_fractioning || false);
      setUnitsPerPackage(itemToEdit.units_per_package || 10);
      setFractionUnitName(itemToEdit.fraction_unit_name || "Blíster");

      if (itemToEdit.prices_manual) {
        setPriceUSD(itemToEdit.prices_manual.USD || 0);
        setPriceVES(itemToEdit.prices_manual.VES || 0);
        setPriceEUR(itemToEdit.prices_manual.EUR || 0);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [itemToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: Partial<PharmacyInventoryItem> = {
      medication_id: medicationId,
      ean_code: eanCode,
      active_ingredient: activeIngredient,
      laboratory,
      sale_condition: saleCondition,
      package_stock: packageStock,
      fraction_stock: fractionStock,
      stock: packageStock,
      min_stock_alert: minStockAlert,
      batch_number: batchNumber,
      expiration_date: expirationDate,
      location_rack: locationRack,
      allows_fractioning: allowsFractioning,
      units_per_package: unitsPerPackage,
      fraction_unit_name: fractionUnitName,
      prices_manual: {
        USD: priceUSD,
        VES: priceVES,
        EUR: priceEUR,
      },
    };

    if (itemToEdit) {
      await updateItem({ id: itemToEdit.id, payload });
    } else {
      await createItem(payload);
    }

    onClose();
  };

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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Monodroga / Principio Activo
              </label>
              <MedicationCombobox
                value={activeIngredient}
                onSelect={(medication, customText) => {
                  setActiveIngredient(customText);
                  if (medication) {
                    setMedicationId(medication.id);
                    if ((medication as any).laboratory) {
                      setLaboratory((medication as any).laboratory);
                    }
                  } else {
                    setMedicationId(0); // Assuming 0 or null represents custom
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
                value={laboratory}
                onChange={(e) => setLaboratory(e.target.value)}
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
                value={eanCode}
                onChange={(e) => setEanCode(e.target.value)}
                placeholder="7591001234567"
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Condición de Venta
              </label>
              <select
                value={saleCondition}
                onChange={(e) =>
                  setSaleCondition(e.target.value as SaleCondition)
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-pharmako-care"
              >
                <option value="prescription">Bajo Receta Médica</option>
                <option value="free">Venta Libre (OTC)</option>
                <option value="controlled">
                  Receta Archivada (Psicotrópicos)
                </option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Estantería / Ubicación
              </label>
              <Input
                type="text"
                value={locationRack}
                onChange={(e) => setLocationRack(e.target.value)}
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
                onClick={() => setAllowsFractioning(!allowsFractioning)}
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
                    value={unitsPerPackage}
                    onChange={(e) =>
                      setUnitsPerPackage(parseInt(e.target.value) || 1)
                    }
                    className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700 block mb-1">
                    Nombre de la Unidad Fraccionada
                  </label>
                  <Input
                    type="text"
                    value={fractionUnitName}
                    onChange={(e) => setFractionUnitName(e.target.value)}
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
                value={packageStock}
                onChange={(e) => setPackageStock(parseInt(e.target.value) || 0)}
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
                value={fractionStock}
                onChange={(e) =>
                  setFractionStock(parseInt(e.target.value) || 0)
                }
                className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 shadow-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                N° de Lote
              </label>
              <Input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
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
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
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
                  value={priceUSD}
                  onChange={(e) => setPriceUSD(parseFloat(e.target.value) || 0)}
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
                  value={priceVES}
                  onChange={(e) => setPriceVES(parseFloat(e.target.value) || 0)}
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
                  value={priceEUR}
                  onChange={(e) => setPriceEUR(parseFloat(e.target.value) || 0)}
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
              disabled={isCreating || isUpdating}
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
