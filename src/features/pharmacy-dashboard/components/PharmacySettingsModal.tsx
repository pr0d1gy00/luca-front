"use client";

import { useState, useEffect } from "react";
import { Settings, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePharmacySettings } from "../hooks/usePharmacySettings";

interface PharmacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PharmacySettingsModal({
  isOpen,
  onClose,
}: PharmacySettingsModalProps) {
  const { settings, isLoading, updateSettings, isUpdating } =
    usePharmacySettings();
  const [autoQuoting, setAutoQuoting] = useState<boolean>(false);
  const [allowPartial, setAllowPartial] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>("USD");
  const [customTerms, setCustomTerms] = useState<string>("");

  useEffect(() => {
    if (!settings) return;
    const timer = setTimeout(() => {
      setAutoQuoting(settings.auto_quoting_enabled);
      setAllowPartial(settings.allow_partial_quotes);
      setCurrency(settings.default_currency || "USD");
      setCustomTerms(settings.custom_terms || "");
    }, 0);
    return () => clearTimeout(timer);
  }, [settings]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      auto_quoting_enabled: autoQuoting,
      allow_partial_quotes: allowPartial,
      default_currency: currency,
      custom_terms: customTerms,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-none overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuración de Farmacia
              </h2>
              <p className="text-xs text-slate-500">
                Preferencias de cotización e inventario
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Option: Cotización Automática vs Manual */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-bold text-slate-900 block">
                  Cotización Automática
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Responde automáticamente con coincidencia exacta de inventario
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoQuoting(!autoQuoting)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoQuoting ? "bg-pharmako-care" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoQuoting ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {!autoQuoting && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Modo Manual activo: La farmacia revisará y cotizará cada
                  receta individualmente.
                </span>
              </div>
            )}
          </div>

          {/* Option: Moneda por Defecto */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Moneda Principal de Preferencia
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:border-pharmako-care transition-colors"
            >
              <option value="USD">Dólares ($ USD)</option>
              <option value="VES">Bolívares (Bs. VES)</option>
              <option value="EUR">Euros (€ EUR)</option>
              <option value="COP">Pesos Colombianos ($ COP)</option>
            </select>
          </div>

          {/* Option: Términos / Comentarios */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Términos o Nota de Despacho
            </label>
            <textarea
              value={customTerms}
              onChange={(e) => setCustomTerms(e.target.value)}
              rows={3}
              placeholder="Ej: Entregas a domicilio disponibles en un radio de 5km."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-pharmako-care transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              disabled={isUpdating || isLoading}
              className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-5"
            >
              {isUpdating ? "Guardando..." : "Guardar Preferencias"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
