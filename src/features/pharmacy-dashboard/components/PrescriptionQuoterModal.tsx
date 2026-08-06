"use client";

import { useState } from "react";
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
import { ManualSubstituteModal } from "./ManualSubstituteModal";
import {
  useCreateQuoteOffer,
  useUpdateQuoteOffer,
  useUpsellSuggestions,
} from "../hooks/usePharmacyQuotes";
import type {
  QuoteOfferItemPayload,
  PharmacyInventoryItem,
  UpsellRuleSuggestion,
} from "../types/pharmacy.types";

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
  const createOfferMutation = useCreateQuoteOffer();
  const updateOfferMutation = useUpdateQuoteOffer();

  const activeIngredients =
    quoteRequest?.prescription?.items
      ?.map((i: any) => i.medication?.name || "")
      .filter(Boolean) || [];
  const { data: upsellSuggestions = [] } =
    useUpsellSuggestions(activeIngredients);

  const [items, setItems] = useState<
    Array<
      QuoteOfferItemPayload & {
        tempId: string;
        availabilityStatus: "available" | "substitute";
        originalName: string;
      }
    >
  >(() => {
    if (existingOffer && existingOffer.quote_offer_items) {
      return existingOffer.quote_offer_items.map((offerItem: any, idx: number) => {
        const originalItem = quoteRequest?.prescription?.items?.find(
          (i: any) => i.id === offerItem.prescription_item_id
        );
        
        let medName = `Medicamento #${idx + 1}`;
        if (originalItem?.medication) {
          const commName = originalItem.medication.commercial_name;
          const actPrinc = originalItem.medication.active_principle;
          medName = commName && actPrinc
            ? `${commName} (${actPrinc})`
            : (commName || actPrinc || `Medicamento #${idx + 1}`);
        }

        return {
          tempId: `existing-${idx}`,
          prescription_item_id: offerItem.prescription_item_id,
          originalName: medName,
          custom_product_name: offerItem.custom_product_name || "",
          availabilityStatus: offerItem.is_substituted ? "substitute" : "available",
          is_substituted: offerItem.is_substituted,
          substituted_inventory_id: offerItem.substituted_inventory_id,
          substitution_reason: offerItem.substitution_reason,
          sell_format: offerItem.sell_format,
          quantity: offerItem.quantity,
          prices_manual: offerItem.prices_manual || { USD: 0, VES: 0, EUR: 0 },
          notes: offerItem.notes || "",
        };
      });
    }

    const initialItems =
      quoteRequest?.prescription?.items?.map((item: any, idx: number) => {
        const commName = item.medication?.commercial_name;
        const actPrinc = item.medication?.active_principle;
        const medName = commName && actPrinc
          ? `${commName} (${actPrinc})`
          : (commName || actPrinc || `Medicamento #${idx + 1}`);

        return {
          tempId: `presc-${idx}`,
          prescription_item_id: item.id,
          originalName: medName,
          custom_product_name: item.medication?.commercial_name || item.medication?.active_principle || "",
          availabilityStatus: "available" as const,
          is_substituted: false,
          sell_format: "package" as const,
          quantity: 1,
          prices_manual: { USD: 0, VES: 0, EUR: 0 },
          notes: "",
        };
      }) || [];

    return initialItems.length > 0
      ? initialItems
      : [
        {
          tempId: "adhoc-0",
          originalName: "Ítem Ad-Hoc",
          custom_product_name: "",
          availabilityStatus: "available" as const,
          is_substituted: false,
          sell_format: "package" as const,
          quantity: 1,
          prices_manual: { USD: 0, VES: 0, EUR: 0 },
          notes: "",
        },
      ];
  });

  const [substitutingItemIndex, setSubstitutingItemIndex] = useState<
    number | null
  >(null);
  const [comments, setComments] = useState<string>(existingOffer?.comments || "");

  if (!isOpen) return null;

  const handleSetAvailabilityStatus = (
    index: number,
    status: "available" | "substitute",
  ) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        if (status === "available") {
          return {
            ...it,
            availabilityStatus: "available",
            is_substituted: false,
            substituted_inventory_id: undefined,
            substitution_reason: undefined,
            custom_product_name: it.originalName,
          };
        } else {
          return {
            ...it,
            availabilityStatus: "substitute",
            is_substituted: true,
            substitution_reason:
              it.substitution_reason ||
              "Sin stock de marca original, se ofrece alternativa libre/equivalente",
          };
        }
      }),
    );
  };

  const handleUpdatePrice = (
    index: number,
    currency: string,
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          prices_manual: {
            ...item.prices_manual,
            [currency]: value,
          },
        };
      }),
    );
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes } : item)),
    );
  };

  const handleUpdateQuantity = (index: number, qty: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, qty) } : item,
      ),
    );
  };

  const handleToggleFormat = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            sell_format:
              item.sell_format === "package" ? "fraction" : "package",
          }
          : item,
      ),
    );
  };

  const handleAddAdHocItem = () => {
    setItems((prev) => [
      ...prev,
      {
        tempId: `adhoc-${Date.now()}`,
        originalName: "Producto Libre / Ad-Hoc",
        custom_product_name: "",
        availabilityStatus: "available",
        is_substituted: false,
        sell_format: "package",
        quantity: 1,
        prices_manual: { USD: 0, VES: 0, EUR: 0 },
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUpsellToOffer = (suggestion: UpsellRuleSuggestion) => {
    setItems((prev) => [
      ...prev,
      {
        tempId: `upsell-${Date.now()}`,
        pharmacy_inventory_id: suggestion.recommended_inventory_id,
        originalName:
          suggestion.recommended_inventory?.medication?.name || "Producto OTC",
        custom_product_name:
          suggestion.recommended_inventory?.medication?.name ||
          "Producto OTC Sugerido",
        availabilityStatus: "available",
        is_substituted: false,
        sell_format: "package",
        quantity: 1,
        prices_manual: suggestion.recommended_inventory?.prices_manual || {
          USD: 5,
          VES: 25,
          EUR: 4,
        },
        notes: `Sugerencia OTC: ${suggestion.recommendation_reason}`,
      },
    ]);
  };

  const handleSelectSubstitute = (
    index: number,
    subItem: PharmacyInventoryItem,
    reason: string,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            availabilityStatus: "substitute",
            is_substituted: true,
            substituted_inventory_id: subItem.id,
            substitution_reason: reason,
            custom_product_name:
              subItem.medication?.name ||
              subItem.active_ingredient ||
              item.custom_product_name,
            prices_manual: subItem.prices_manual || item.prices_manual,
            notes: item.notes || `Sustituto de inventario: ${reason}`,
          }
          : item,
      ),
    );
  };

  const calculateTotalUSD = () => {
    return items.reduce(
      (sum, it) => sum + (it.prices_manual?.USD || 0) * it.quantity,
      0,
    );
  };

  const calculateTotalVES = () => {
    return items.reduce(
      (sum, it) => sum + (it.prices_manual?.VES || 0) * it.quantity,
      0,
    );
  };

  const calculateTotalEUR = () => {
    return items.reduce(
      (sum, it) => sum + (it.prices_manual?.EUR || 0) * it.quantity,
      0,
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalUSD = calculateTotalUSD();

    const payload = {
      total_price_base: totalUSD,
      currency: "USD",
      comments,
      items: items.map((item) => ({
        prescription_item_id: item.prescription_item_id,
        pharmacy_inventory_id: item.pharmacy_inventory_id,
        custom_product_name: item.custom_product_name,
        is_substituted: item.is_substituted,
        substituted_inventory_id: item.substituted_inventory_id,
        substitution_reason: item.substitution_reason,
        sell_format: item.sell_format,
        quantity: item.quantity,
        prices_manual: item.prices_manual,
        notes: item.notes,
      })),
    };

    if (existingOffer) {
      await updateOfferMutation.mutateAsync({
        requestId: quoteRequest.id,
        offerId: existingOffer.id,
        payload,
      });
    } else {
      await createOfferMutation.mutateAsync({
        requestId: quoteRequest.id,
        payload,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-none flex flex-col max-h-[90vh] overflow-hidden">
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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
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
                      onClick={() => handleAddUpsellToOffer(sug)}
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
                  onClick={handleAddAdHocItem}
                  className="border-slate-200 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 shadow-none text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar Ítem Libre / Ad-Hoc
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const isAvailable =
                    item.availabilityStatus === "available" &&
                    !item.is_substituted;

                  return (
                    <div
                      key={item.tempId}
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
                            {item.originalName}
                          </div>
                        </div>

                        {/* Interactive Buttons: [Lo tengo] vs [No lo tengo / Sustituir] */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleSetAvailabilityStatus(index, "available")
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
                              handleSetAvailabilityStatus(index, "substitute")
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border shadow-none ${item.is_substituted
                              ? "bg-amber-500 text-white border-amber-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                              }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                            No lo tengo (Ofrecer Sustituto)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
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
                              {item.is_substituted
                                ? "Nombre del Producto Sustituto (Escribir o Buscar en Inventario)"
                                : "Producto a Entregar"}
                            </label>
                            {item.is_substituted && (
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
                            value={item.custom_product_name}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, idx) =>
                                  idx === index
                                    ? {
                                      ...it,
                                      custom_product_name: e.target.value,
                                    }
                                    : it,
                                ),
                              )
                            }
                            placeholder={
                              item.is_substituted
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
                          <button
                            type="button"
                            onClick={() => handleToggleFormat(index)}
                            className={`w-full h-10 px-3 rounded-xl text-xs font-bold border transition-colors ${item.sell_format === "package"
                              ? "bg-slate-100 border-slate-200 text-slate-700"
                              : "bg-pharmako-care-light border-pharmako-care/40 text-pharmako-care"
                              }`}
                          >
                            {item.sell_format === "package"
                              ? "Caja Completa"
                              : "Blíster / Unidad"}
                          </button>
                        </div>
                      </div>

                      {/* Substitution reason text field */}
                      {item.is_substituted && (
                        <div className="space-y-1 pt-1">
                          <label className="text-[11px] font-semibold text-amber-800 block">
                            Motivo / Razón de la Sustitución (Visible para el
                            paciente)
                          </label>
                          <Input
                            type="text"
                            value={item.substitution_reason || ""}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it, idx) =>
                                  idx === index
                                    ? {
                                      ...it,
                                      substitution_reason: e.target.value,
                                    }
                                    : it,
                                ),
                              )
                            }
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
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(
                                index,
                                parseInt(e.target.value) || 1,
                              )
                            }
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
                            value={item.prices_manual?.USD || 0}
                            onChange={(e) =>
                              handleUpdatePrice(
                                index,
                                "USD",
                                parseFloat(e.target.value) || 0,
                              )
                            }
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
                            value={item.prices_manual?.VES || 0}
                            onChange={(e) =>
                              handleUpdatePrice(
                                index,
                                "VES",
                                parseFloat(e.target.value) || 0,
                              )
                            }
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
                            value={item.prices_manual?.EUR || 0}
                            onChange={(e) =>
                              handleUpdatePrice(
                                index,
                                "EUR",
                                parseFloat(e.target.value) || 0,
                              )
                            }
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
                          value={item.notes || ""}
                          onChange={(e) =>
                            handleUpdateNotes(index, e.target.value)
                          }
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
                value={comments}
                onChange={(e) => setComments(e.target.value)}
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
                  <span className="text-xl font-bold text-slate-900">${calculateTotalUSD().toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">VES</span>
                  <span className="text-xl font-bold text-slate-900">Bs. {calculateTotalVES().toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400">EUR</span>
                  <span className="text-xl font-bold text-slate-900">€ {calculateTotalEUR().toFixed(2)}</span>
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
                disabled={createOfferMutation.isPending || updateOfferMutation.isPending || items.length === 0}
                className="bg-pharmako-care hover:bg-pharmako-care-hover text-white rounded-xl px-6"
              >
                {createOfferMutation.isPending || updateOfferMutation.isPending
                  ? "Procesando..."
                  : existingOffer 
                    ? "Actualizar Oferta"
                    : "Enviar Cotización"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Manual Substitute Modal */}
      {substitutingItemIndex !== null && (
        <ManualSubstituteModal
          isOpen={substitutingItemIndex !== null}
          onClose={() => setSubstitutingItemIndex(null)}
          originalMedicationName={
            items[substitutingItemIndex]?.originalName || "Medicamento"
          }
          onSelectSubstitute={(subItem, reason) =>
            handleSelectSubstitute(substitutingItemIndex, subItem, reason)
          }
        />
      )}
    </div>
  );
}
