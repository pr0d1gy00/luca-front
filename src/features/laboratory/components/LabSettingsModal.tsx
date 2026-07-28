"use client";

import { useState, useEffect } from "react";
import { Settings, X, Clock, Calendar, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLabSettings } from "../hooks/useLabSettings";

interface LabSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Lun" },
  { id: "tuesday", label: "Mar" },
  { id: "wednesday", label: "Mié" },
  { id: "thursday", label: "Jue" },
  { id: "friday", label: "Vie" },
  { id: "saturday", label: "Sáb" },
  { id: "sunday", label: "Dom" },
];

export function LabSettingsModal({ isOpen, onClose }: LabSettingsModalProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useLabSettings();

  const [dailyMaxSlots, setDailyMaxSlots] = useState<number>(20);
  const [autoQuoting, setAutoQuoting] = useState<boolean>(false);
  const [currency, setCurrency] = useState<string>("USD");
  const [instructions, setInstructions] = useState<string>("");

  // Schedule & 24h State
  const [is24Hours, setIs24Hours] = useState<boolean>(false);
  const [openingTime, setOpeningTime] = useState<string>("07:00");
  const [closingTime, setClosingTime] = useState<string>("17:00");
  const [workingDays, setWorkingDays] = useState<string[]>([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ]);

  useEffect(() => {
    if (!settings) return;
    const timer = setTimeout(() => {
      setDailyMaxSlots(settings.daily_max_slots || 20);
      setAutoQuoting(settings.auto_quoting_enabled || false);
      setCurrency(settings.default_currency || "USD");
      setInstructions(settings.instructions_for_patient || "");
      setIs24Hours(settings.is_24_hours || false);
      setOpeningTime(settings.opening_time || "07:00");
      setClosingTime(settings.closing_time || "17:00");
      setWorkingDays(
        settings.working_days || [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ],
      );
    }, 0);
    return () => clearTimeout(timer);
  }, [settings]);

  if (!isOpen) return null;

  const toggleDay = (dayId: string) => {
    setWorkingDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      daily_max_slots: dailyMaxSlots,
      auto_quoting_enabled: autoQuoting,
      default_currency: currency,
      instructions_for_patient: instructions,
      is_24_hours: is24Hours,
      opening_time: openingTime,
      closing_time: closingTime,
      working_days: workingDays,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-none my-8 overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuración de Laboratorio
              </h2>
              <p className="text-xs text-slate-500">
                Horarios de atención, días laborables y logística de cupos
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
          {/* Operating Hours & 24h Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pharmako-care" />
                <div>
                  <label className="text-sm font-bold text-slate-900 block">
                    Atención 24 Horas (24/7)
                  </label>
                  <p className="text-xs text-slate-500">
                    El laboratorio realiza tomas de muestra y atención 24h
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIs24Hours(!is24Hours)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  is24Hours ? "bg-pharmako-care" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    is24Hours ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Days of Week Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Días Laborables</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = workingDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border shadow-none ${
                        isSelected
                          ? "bg-pharmako-care text-slate-900 border-pharmako-care"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours Range if not 24h */}
            {!is24Hours && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Hora de Apertura
                  </label>
                  <Input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="h-10 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Hora de Cierre
                  </label>
                  <Input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="h-10 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Daily Max Slots Capacity */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <label className="text-xs font-bold text-slate-900 block">
              Límite Máximo de Cupos Diarios
            </label>
            <p className="text-xs text-slate-500">
              Capacidad máxima de tomas de muestra agendadas por día
            </p>
            <Input
              type="number"
              min="1"
              value={dailyMaxSlots}
              onChange={(e) => setDailyMaxSlots(parseInt(e.target.value) || 1)}
              className="h-10 border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-none max-w-xs"
            />
          </div>

          {/* Auto Quoting & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Moneda de Referencia
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:border-pharmako-care"
              >
                <option value="USD">Dólares ($ USD)</option>
                <option value="VES">Bolívares (Bs. VES)</option>
                <option value="EUR">Euros (€ EUR)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Cotización Automática
              </label>
              <button
                type="button"
                onClick={() => setAutoQuoting(!autoQuoting)}
                className={`w-full h-10 px-4 rounded-xl text-xs font-bold border transition-colors flex items-center justify-between ${
                  autoQuoting
                    ? "bg-pharmako-care-light border-pharmako-care text-slate-900"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <span>
                  {autoQuoting
                    ? "Cotización Auto Activa"
                    : "Modo Cotizador Manual"}
                </span>
                {autoQuoting && (
                  <ShieldAlert className="w-4 h-4 text-pharmako-care" />
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Instrucciones Generales de Ayuno / Muestra
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Ej: Se requiere ayuno estricto de 8 a 12 horas para pruebas metabólicas."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
            />
          </div>

          {/* Actions */}
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
