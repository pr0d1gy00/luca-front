"use client";

import { useState } from "react";
import { DollarSign, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateLabQuote } from "../hooks/useLabQuotes";
import type { LabExamDetail } from "../types/laboratory.types";

interface LabQuoterModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: number;
    patient?: { first_name?: string; last_name?: string };
    exams_list?: Array<string | { name: string }>;
  };
}

export function LabQuoterModal({
  isOpen,
  onClose,
  request,
}: LabQuoterModalProps) {
  const createQuoteMutation = useCreateLabQuote();

  const [items, setItems] = useState<LabExamDetail[]>(() => {
    const rawList = request?.exams_list || [];
    if (rawList.length > 0) {
      return rawList.map((item) => ({
        exam_name: typeof item === "string" ? item : item.name || "Examen",
        price_usd: 0,
        notes: "Ayuno recomendado",
      }));
    }
    return [{ exam_name: "Examen de Laboratorio", price_usd: 0, notes: "" }];
  });

  const [priceVES, setPriceVES] = useState<number>(0);
  const [priceEUR, setPriceEUR] = useState<number>(0);
  const [comments, setComments] = useState<string>("");

  if (!isOpen) return null;

  const handleUpdateItemPrice = (index: number, price: number) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, price_usd: price } : it)),
    );
  };

  const handleUpdateItemNotes = (index: number, notes: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, notes } : it)),
    );
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { exam_name: "Estudio Adicional", price_usd: 0, notes: "" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalUSD = () => {
    return items.reduce((acc, item) => acc + (item.price_usd || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalUSD = calculateTotalUSD();

    await createQuoteMutation.mutateAsync({
      requestId: request.id,
      payload: {
        provider_profile_id: 1,
        total_price_base: totalUSD,
        currency: "USD",
        prices_manual: {
          USD: totalUSD,
          VES: priceVES,
          EUR: priceEUR,
        },
        items_detail: items,
        comments,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-none my-8 overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cotizador de Exámenes de Laboratorio
              </h2>
              <p className="text-xs text-slate-500">
                Paciente: {request?.patient?.first_name}{" "}
                {request?.patient?.last_name} (Solicitud #{request.id})
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Items breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Exámenes a Cotizar ({items.length})
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="border-slate-200 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 shadow-none text-slate-700"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Agregar Examen Ad-Hoc
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Input
                      type="text"
                      value={item.exam_name}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it, i) =>
                            i === index
                              ? { ...it, exam_name: e.target.value }
                              : it,
                          ),
                        )
                      }
                      className="h-10 border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-white shadow-none"
                    />
                    <div className="w-36 shrink-0">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price_usd || 0}
                        onChange={(e) =>
                          handleUpdateItemPrice(
                            index,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="Precio $ USD"
                        className="h-10 border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-white shadow-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Input
                    type="text"
                    value={item.notes || ""}
                    onChange={(e) =>
                      handleUpdateItemNotes(index, e.target.value)
                    }
                    placeholder="Instrucciones o preparación (ej: Ayuno 8 a 12 horas)"
                    className="h-8 border-slate-200 rounded-lg text-xs text-slate-700 bg-white shadow-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Multi-currency summary inputs */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-pharmako-care" />
              <span>Equivalencia Multimoneda Manual</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Total USD ($)
                </label>
                <Input
                  type="number"
                  disabled
                  value={calculateTotalUSD().toFixed(2)}
                  className="h-9 border-slate-200 rounded-lg text-xs font-bold text-slate-900 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Total VES (Bs.)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceVES}
                  onChange={(e) => setPriceVES(parseFloat(e.target.value) || 0)}
                  className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Total EUR (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={priceEUR}
                  onChange={(e) => setPriceEUR(parseFloat(e.target.value) || 0)}
                  className="h-9 border-slate-200 rounded-lg text-xs shadow-none text-slate-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Observaciones / Horarios de Toma de Muestra
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={2}
              placeholder="Ej: Toma de muestra disponible de Lunes a Viernes de 7:00 a 11:00 AM."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <div className="text-xs text-slate-500">
                Monto Total Presupuestado:
              </div>
              <div className="text-xl font-bold text-slate-900">
                ${calculateTotalUSD().toFixed(2)} USD
              </div>
            </div>

            <div className="flex items-center gap-3">
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
                disabled={createQuoteMutation.isPending}
                className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-6"
              >
                {createQuoteMutation.isPending
                  ? "Enviando..."
                  : "Enviar Cotización de Examen"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
