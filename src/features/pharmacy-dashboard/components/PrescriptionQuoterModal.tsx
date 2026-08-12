"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  X,
  Check,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { fadeUpVariant } from "@/app/lib/animations";
import { useQuoterForm } from "../hooks/useQuoterForm";
import { useUpsellSuggestions } from "../hooks/usePharmacyQuotes";
import type { PharmacyInventoryItem } from "../types/pharmacy.types";

interface PrescriptionQuoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteRequest: any;
  existingOffer?: any;
}

export function PrescriptionQuoterModal({
  isOpen,
  onClose,
  quoteRequest,
  existingOffer,
}: PrescriptionQuoterModalProps) {
  const { form, items, watchedItems, totals, handlers, onSubmit, isSubmitting } = useQuoterForm(quoteRequest, existingOffer, onClose);
  const { register, watch } = form;
  const comments = watch("comments");

  const activeIngredients =
    quoteRequest?.prescription?.items
      ?.map((i: any) => i.medication?.name || "")
      .filter(Boolean) || [];
  const { data: upsellSuggestions = [] } = useUpsellSuggestions(activeIngredients);

  const [substitutingItemIndex, setSubstitutingItemIndex] = useState<number | null>(null);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 sm:p-6"
        >
          <motion.div
            variants={fadeUpVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-none flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cotizador Interactivo de Recetas
              </h2>
              <p className="text-xs text-slate-500">
                Marcar disponibilidad, escribir o buscar sustitutos libres y
                notas
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

        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Patient & Doctor Context */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Card */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-none">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {quoteRequest?.patient?.avatar_url ? (
                    <img src={quoteRequest.patient.avatar_url} alt="Paciente" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-600 font-semibold">{quoteRequest?.patient?.first_name?.charAt(0) || "P"}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Paciente</span>
                  <span className="text-sm font-bold text-slate-900">{quoteRequest?.patient?.first_name} {quoteRequest?.patient?.last_name}</span>
                  <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    {quoteRequest?.patient?.gender === 'MALE' ? 'Masculino' : quoteRequest?.patient?.gender === 'FEMALE' ? 'Femenino' : 'No especificado'}
                    {quoteRequest?.patient?.blood_type && ` • Sangre: ${quoteRequest.patient.blood_type.replace('_POSITIVE', '+').replace('_NEGATIVE', '-')}`}
                  </span>
                </div>
              </div>

              {/* Doctor Card */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-none">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                  {quoteRequest?.prescription?.user?.logo_url ? (
                    <img src={quoteRequest.prescription.user.logo_url} alt="Doctor" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-600 font-semibold">{quoteRequest?.prescription?.user?.full_name?.charAt(0) || "D"}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Médico Tratante</span>
                  <span className="text-sm font-bold text-slate-900 line-clamp-1" title={quoteRequest?.prescription?.user?.full_name}>
                    {quoteRequest?.prescription?.user?.full_name || "Médico no especificado"}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                    {quoteRequest?.prescription?.user?.role === 'DOCTOR' ? 'Especialista' : 'Profesional'}
                    {quoteRequest?.prescription?.user?.phone && ` • ${quoteRequest.prescription.user.phone}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Upsell Banner Suggestions */}
            {upsellSuggestions.length > 0 && (
              <div className="p-4 rounded-xl bg-pharmako-care-light/50 border border-pharmako-care/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-pharmako-care" />
                  <span>Sugerencias de Upselling Asistido (Productos OTC):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {upsellSuggestions.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() => handlers.handleAddUpsellToOffer(sug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 hover:border-pharmako-care hover:bg-slate-50 transition-colors shadow-none"
                    >
                      <Plus className="w-3.5 h-3.5 text-pharmako-care" />
                      <span>
                        {sug.recommended_inventory?.medication?.name ||
                          "Producto OTC"}{" "}
                        ({sug.recommendation_reason})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items Quoted */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ítems de la Receta ({items.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlers.handleAddAdHocItem}
                  className="border-slate-200 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 shadow-none text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar Ítem Libre / Ad-Hoc
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((field, index) => {
                  const watchedItem = watchedItems?.[index] || field;
                  const isAvailable =
                    watchedItem.availabilityStatus === "available" &&
                    !watchedItem.is_substituted;

                  return (
                    <div
                      key={field.id}
                      className={`p-4 rounded-xl border transition-colors shadow-none space-y-3 ${isAvailable
                        ? "bg-white border-slate-200"
                        : "bg-amber-50/40 border-amber-200"
                        }`}
                    >
                      {/* Prescribed Item Header & Interactive Availability Toggle */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="text-xs text-slate-500 font-medium">
                            Prescrito originalmente:
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {watchedItem.originalName}
                          </div>
                        </div>

                        {/* Interactive Buttons: [Lo tengo] vs [No lo tengo / Sustituir] */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handlers.handleSetAvailabilityStatus(index, "available")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-none ${isAvailable
                              ? "bg-emerald-500 text-white border-emerald-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            <Check className="w-3.5 h-3.5 inline mr-1" />
                            Disponible Exacto
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handlers.handleSetAvailabilityStatus(index, "substitute")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-none ${watchedItem.is_substituted
                              ? "bg-amber-500 text-white border-amber-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                            No lo tengo (Ofrecer Sustituto)
                          </button>

                          <button
                            type="button"
                            onClick={() => form.setValue("items", form.getValues("items").filter((_, i) => i !== index))}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Product Name offered & Format */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-600 block">
                              {watchedItem.is_substituted
                                ? "Nombre del Producto Sustituto (Escribir o Buscar en Inventario)"
                                : "Producto a Entregar"}
                            </label>
                            {watchedItem.is_substituted && (
                              <button
                                type="button"
                                onClick={() => setSubstitutingItemIndex(index)}
                                className="text-[11px] font-bold text-pharmako-care hover:underline flex items-center gap-1"
                              >
                                <Search className="w-3 h-3" />
                                <span>Buscar en Catálogo</span>
                              </button>
                            )}
                          </div>

                          <Input
                            type="text"
                            {...register(`items.${index}.custom_product_name` as const)}
                            placeholder={
                              watchedItem.is_substituted
                                ? "Escribí el nombre del producto equivalente libremente..."
                                : "Nombre del producto..."
                            }
                            className="h-10 border-slate-200 rounded-xl text-xs font-semibold text-slate-900 shadow-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                            Formato Venta
                          </label>
                          <select
                            {...register(`items.${index}.sell_format` as const)}
                            className={`w-full h-10 px-3 rounded-xl text-xs font-bold border transition-colors ${watchedItem.sell_format === "package"
                              ? "bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-pharmako-care-light border-pharmako-care/40 text-pharmako-care"
                              }`}
                          >
                            <option value="package">Caja Completa</option>
                            <option value="fraction">Blíster / Unidad</option>
                          </select>
                        </div>
                      </div>

                      {/* Substitution reason text field */}
                      {watchedItem.is_substituted && (
                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-semibold text-amber-800 block">
                            Motivo / Razón de la Sustitución (Visible para el
                            paciente)
                          </label>
                          <Input
                            type="text"
                            {...register(`items.${index}.substitution_reason` as const)}
                            placeholder="Ej: Sin stock de la marca prescripta, se ofrece genérico bioequivalente."
                            className="h-9 border-amber-200 rounded-lg text-xs bg-amber-50/50 text-amber-900 shadow-none"
                          />
                        </div>
                      )}

                      {/* Multi-currency inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Cantidad
                          </label>
                          <Input
                            type="number"
                            min="1"
                            {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                            className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Precio $ USD
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.prices_manual.USD` as const, { valueAsNumber: true })}
                            className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Precio Bs. VES
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.prices_manual.VES` as const, { valueAsNumber: true })}
                            className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-slate-500 block mb-1">
                            Precio € EUR
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.prices_manual.EUR` as const, { valueAsNumber: true })}
                            className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      {/* Specific Item Note */}
                      <div className="pt-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                          <label className="text-[11px] font-semibold text-slate-600">
                            Nota u Aclaración para este ítem
                          </label>
                        </div>
                        <Input
                          type="text"
                          {...register(`items.${index}.notes` as const)}
                          placeholder="Ej: Tomar 1 cápsula cada 8 horas con las comidas."
                          className="h-8 border-slate-200 rounded-lg text-xs text-slate-800 bg-white shadow-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* General Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Comentarios Generales de la Oferta
              </label>
              <textarea
                {...register("comments")}
                rows={2}
                placeholder="Ej: Todos los medicamentos están disponibles para retiro inmediato en mostrador."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
              />
            </div>

          </div>

          {/* Total & Submit */}
          <div className="flex items-center justify-between p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Total Presupuestado
              </div>
              <div className="flex items-end gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">USD</span>
                  <span className="text-xl font-bold text-slate-900">${totals.USD.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">VES</span>
                  <span className="text-xl font-bold text-slate-900">Bs. {totals.VES.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">EUR</span>
                  <span className="text-xl font-bold text-slate-900">€ {totals.EUR.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl h-11"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="bg-pharmako-care hover:bg-pharmako-care-hover text-white rounded-xl px-6"
              >
                {isSubmitting
                  ? "Procesando..."
                  : existingOffer 
                    ? "Actualizar Oferta"
                    : "Enviar Cotización"
                }
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
    )}
  </AnimatePresence>
  );
}
