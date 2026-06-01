"use client";

import { ClipboardList } from "lucide-react";
import { QuoteItem } from "./QuoteItem";

interface Quote {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColor: string;
  medicine: string;
  timeRemaining: string;
  status: "pending" | "sent" | "reviewed";
}

interface QuotesRadarProps {
  quotes: Quote[];
}

export function QuotesRadar({ quotes }: QuotesRadarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-[#1A3626]" />
        <h2 className="text-lg font-semibold text-[#1A3626]">Radar de Cotizaciones</h2>
        <span className="ml-auto text-xs text-stone-500">{quotes.length} solicitudes</span>
      </div>

      <div className="flex flex-col">
        {quotes.map((quote) => (
          <QuoteItem key={quote.id} quote={quote} />
        ))}
      </div>
    </div>
  );
}
