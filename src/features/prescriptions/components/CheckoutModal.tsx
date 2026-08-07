"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api/client";

interface CheckoutModalProps {
  offer: Record<string, unknown> | null;
  selectedItems: number[] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CheckoutModal({
  offer,
  selectedItems,
  open,
  onOpenChange,
  onSuccess,
}: CheckoutModalProps) {
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offer) return null;

  // Calculamos el total con base en lo seleccionado, o usamos el total de la oferta
  let displayTotal = Number(offer.price);
  if (selectedItems && selectedItems.length > 0 && offer.quoteOfferItems) {
    let partialTotal = 0;
    (offer.quoteOfferItems as any[]).forEach((item: any) => {
      if (selectedItems.includes(item.id)) {
        let unitPrice = 0;
        if (item.prices_manual && item.prices_manual[offer.currency as string || "USD"]) {
          unitPrice = Number(item.prices_manual[offer.currency as string || "USD"]);
        }
        partialTotal += unitPrice * (item.quantity || 1);
      }
    });
    if (partialTotal > 0) {
      displayTotal = partialTotal;
    }
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload: any = { currency };
      if (selectedItems && selectedItems.length > 0) {
        payload.selected_items = selectedItems;
      }

      await apiClient.post(`/quote-offers/${offer.id}/checkout`, payload);

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error("Error al confirmar reserva:", err);
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-pharmako-primary" />
            Confirmar Reserva
          </DialogTitle>
          <DialogDescription className="text-slate-600 mt-2">
            Estás a punto de confirmar tu pedido con la farmacia{" "}
            <span className="font-semibold text-slate-800">
              {String((offer.pharmacy as Record<string, unknown>)?.commercialName || (offer.pharmacy as Record<string, unknown>)?.commercial_name || "Farmacia")}
            </span>
            . No se te cobrará ahora, pagarás directamente al recibir tus medicamentos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
            <span className="text-slate-600 text-sm font-medium">
              Total a pagar en farmacia:
            </span>
            <span className="text-lg font-bold text-pharmako-primary">
              {displayTotal.toFixed(2)} {String(offer.currency || "USD")}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block">
              ¿En qué moneda prefieres pagar en la farmacia?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["USD", "VES", "EUR"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`py-2 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                    currency === c
                      ? "bg-pharmako-primary text-white border-pharmako-primary shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="rounded-lg text-slate-600"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-lg bg-pharmako-primary hover:bg-pharmako-primary-hover text-white flex items-center gap-2"
          >
            {loading ? (
              "Procesando..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar Reserva
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
