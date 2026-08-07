"use client";

import { useState } from "react";
import { Building, MapPin, Phone, CheckSquare, Square, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteOffersTabProps {
  offers: any[];
  onCheckout: (offer: any, selectedItemIds: number[]) => void;
}

export function QuoteOffersTab({ offers, onCheckout }: QuoteOffersTabProps) {
  // Estado para llevar track de qué items están seleccionados por cada oferta
  // Estructura: { [offerId]: Set<itemId> }
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<number>>>(
    () => {
      const initial: Record<string, Set<number>> = {};
      offers.forEach((offer) => {
        const itemArray = offer.quote_offer_items || offer.quoteOfferItems || [];
        const itemIds = itemArray.map((item: any) => item.id);
        initial[offer.id] = new Set(itemIds);
      });
      return initial;
    }
  );

  const toggleItem = (offerId: string, itemId: number) => {
    setSelectedItems((prev) => {
      const currentSet = new Set(prev[offerId]);
      if (currentSet.has(itemId)) {
        currentSet.delete(itemId);
      } else {
        currentSet.add(itemId);
      }
      return { ...prev, [offerId]: currentSet };
    });
  };

  const calculateTotal = (offer: any) => {
    const itemIds = selectedItems[offer.id] || new Set();
    let total = 0;
    const itemArray = offer.quote_offer_items || offer.quoteOfferItems || [];
    itemArray.forEach((item: any) => {
      if (itemIds.has(item.id)) {
        // En QuoteOfferItem el precio unitario podría estar en prices_manual.
        // Si no está desglosado, usaremos un precio promediado falso o simplemente 0 si no hay.
        // Asumiendo que el backend nos devuelve 'prices_manual' o al menos el total
        let unitPrice = 0;
        if (item.prices_manual && item.prices_manual[offer.currency || "USD"]) {
           unitPrice = Number(item.prices_manual[offer.currency || "USD"]);
        }
        total += unitPrice * (item.quantity || 1);
      }
    });
    
    // Si la suma es 0 (porque no hay desgloses), fallamos graciosamente al precio de la oferta
    if (total === 0 && itemIds.size === itemArray.length) {
       return Number(offer.price);
    }
    return total;
  };

  if (!offers || offers.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
        <p className="text-sm">Aún sin cotizaciones de farmacia.</p>
        <p className="text-xs mt-1 text-slate-400">
          Envía esta receta a cotizar en el Marketplace para recibir presupuestos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => {
        const pharmacy = offer.pharmacy || {};
        const items = offer.quote_offer_items || offer.quoteOfferItems || [];
        const currentSelected = selectedItems[offer.id] || new Set();
        const totalCalculated = calculateTotal(offer);
        const isFullSelection = currentSelected.size === items.length;

        return (
          <div
            key={offer.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm"
          >
            {/* Header de Farmacia */}
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-pharmako-care-light/20 flex items-center justify-center shrink-0">
                  <Building className="h-5 w-5 text-pharmako-care" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">
                    {pharmacy.commercialName || pharmacy.commercial_name || "Farmacia"}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {pharmacy.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {pharmacy.phone}
                      </span>
                    )}
                    {pharmacy.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {pharmacy.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Total Seleccionado
                </p>
                <p className="text-lg font-black text-pharmako-success">
                  {totalCalculated.toFixed(2)} {offer.currency || "USD"}
                </p>
              </div>
            </div>

            {/* Lista de Medicamentos */}
            <div className="space-y-2 mb-5">
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Selecciona los medicamentos que deseas comprar aquí:
              </p>
              {items.map((item: any) => {
                const isSelected = currentSelected.has(item.id);
                let unitPrice = 0;
                if (item.prices_manual && item.prices_manual[offer.currency || "USD"]) {
                  unitPrice = Number(item.prices_manual[offer.currency || "USD"]);
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(offer.id, item.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-pharmako-care/5 border-pharmako-care/40"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button type="button" className="text-pharmako-care">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5" />
                        ) : (
                          <Square className="h-5 w-5 text-slate-300" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold ${isSelected ? "text-slate-800" : "text-slate-500"}`}>
                          {item.custom_product_name || item.prescription_item?.medication?.active_principle || item.prescription_item?.medication?.commercial_name || "Medicamento"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Cant: {item.quantity || 1} x {unitPrice.toFixed(2)} {offer.currency}
                        </p>
                        {item.is_substituted && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1 w-fit font-medium">
                            <Info className="h-3 w-3" />
                            Sustituido: {item.substitution_reason || "Alternativa farmacéutica"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`font-bold text-sm ${isSelected ? "text-slate-700" : "text-slate-400"}`}>
                      {(unitPrice * (item.quantity || 1)).toFixed(2)} {offer.currency}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-slate-100">
              <p className="text-xs text-slate-500 max-w-[200px]">
                {offer.comments ? `"${offer.comments}"` : "Cotización oficial de la farmacia."}
              </p>
              <Button
                disabled={currentSelected.size === 0}
                onClick={() => onCheckout(offer, Array.from(currentSelected))}
                className="bg-pharmako-care hover:bg-pharmako-care-hover text-white shadow-none font-bold"
              >
                {isFullSelection ? "Reservar Presupuesto Completo" : "Reservar Selección"}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
