"use client";

import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookLabSlot } from "../hooks/useLabAppointments";

interface BookLabSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteOfferId: number;
}

export function BookLabSlotModal({
  isOpen,
  onClose,
  quoteOfferId,
}: BookLabSlotModalProps) {
  const bookSlotMutation = useBookLabSlot();
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>("08:00 AM");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await bookSlotMutation.mutateAsync({
      lab_quote_offer_id: quoteOfferId,
      scheduled_date: scheduledDate,
      time_slot: timeSlot,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-none overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Reservar Cupo de Atención
              </h2>
              <p className="text-xs text-slate-500">
                Seleccionar fecha para toma de muestra / estudio
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Fecha del Cupo
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="h-11 border-slate-200 rounded-xl text-sm text-slate-900 bg-white shadow-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Horario Preferido
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                "07:30 AM",
                "08:30 AM",
                "09:30 AM",
                "10:30 AM",
                "11:30 AM",
                "02:00 PM",
              ].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors ${
                    timeSlot === slot
                      ? "bg-pharmako-care-light border-pharmako-care text-slate-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Clock className="w-3 h-3 inline mr-1 text-slate-500" />
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Notas del Paciente
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: Requiero asistencia para toma de muestra en niños."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
            />
          </div>

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
              disabled={bookSlotMutation.isPending}
              className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-5"
            >
              {bookSlotMutation.isPending ? "Reservando..." : "Confirmar Cupo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
