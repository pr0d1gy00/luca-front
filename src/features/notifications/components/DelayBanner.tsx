"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/features/offline/database/schema";

interface ActiveDelay {
  doctorUuid: string;
  doctorName: string;
  delayMinutes: number;
  updatedAt: string;
}

interface DelayBannerProps {
  doctorUuid?: string;
  doctorName?: string;
}

export function DelayBanner({ doctorUuid, doctorName }: DelayBannerProps) {
  const [delay, setDelay] = useState<ActiveDelay | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Leer el retraso directamente de Dexie
    const checkDelays = async () => {
      try {
        if (doctorUuid) {
          const res = await db.activeDelays.get(doctorUuid);
          if (res) {
            setDelay(res);
          } else {
            setDelay(null);
          }
        } else {
          // Tomar la primera demora activa registrada en Dexie para el dashboard del paciente
          const allDelays = await db.activeDelays.toArray();
          if (allDelays.length > 0) {
            setDelay(allDelays[0]);
          } else {
            setDelay(null);
          }
        }
      } catch (err) {
        console.error("Error reading delays from Dexie", err);
        setDelay(null);
      }
    };

    checkDelays();

    // Polling corto para simular avisos en tiempo real
    const interval = setInterval(checkDelays, 3000);
    return () => clearInterval(interval);
  }, [doctorUuid]);

  // Si no hay demora, o no es visible, no renderizar
  if (!delay || delay.delayMinutes <= 0 || !isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3.5 shadow-sm max-w-4xl mx-auto">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
          <Clock className="h-5 w-5 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 flex items-center gap-1.5 font-sans">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Demora Estimada en tu Cita
          </h4>
          <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
            Tu consulta programada con el <strong>{doctorName || delay.doctorName}</strong> podría sufrir un retraso aproximado de <strong>{delay.delayMinutes} minutos</strong> ya que el profesional se encuentra realizando un procedimiento clínico extra. Lamentamos los inconvenientes.
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
          className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100/50 rounded-lg flex-shrink-0 -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
