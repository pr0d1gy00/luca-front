"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteItem {
  id: string;
  patientName: string;
  patientInitials: string;
  patientColor: string;
  medicine: string;
  timeRemaining: string;
  status: "pending" | "sent" | "reviewed";
}

interface QuoteItemProps {
  quote: QuoteItem;
}

export function QuoteItem({ quote }: QuoteItemProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-stone-100 last:border-0">
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-[#1A3626] ${quote.patientColor}`}
      >
        {quote.patientInitials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-900 truncate">{quote.patientName}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            {quote.medicine}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-stone-500">
            <Clock className="w-3 h-3" />
            {quote.timeRemaining}
          </span>
        </div>
      </div>

      {/* Action button */}
      {quote.status === "pending" && (
        <Button
          size="sm"
          className="bg-[#1A3626] hover:bg-[#1A3626]/90 text-white rounded-lg h-8 px-3 text-xs font-medium"
        >
          Enviar Oferta
        </Button>
      )}
      {quote.status === "sent" && (
        <Button
          size="sm"
          variant="outline"
          className="border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg h-8 px-3 text-xs font-medium"
        >
          Revisada
        </Button>
      )}
      {quote.status === "reviewed" && (
        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
          Enviada
        </span>
      )}
    </div>
  );
}
