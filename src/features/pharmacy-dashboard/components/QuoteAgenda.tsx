"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Stethoscope } from "lucide-react";
import { useQuoteRequests } from "../hooks/usePharmacyQuotes";
import { PrescriptionQuoterModal } from "./PrescriptionQuoterModal";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "hace unos segundos";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
}

export function QuoteAgenda({ limit }: { limit?: number }) {
  const { data, isLoading } = useQuoteRequests({ page: 1 });
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  const allQuotes = data?.data?.data || data?.data || [];
  const quotes = limit ? allQuotes.slice(0, limit) : allQuotes;
  const isEmpty = quotes.length === 0;

  return (
    <>
      <motion.div
        variants={fadeUpVariant}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 mb-8"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="bg-pharmako-care-light rounded-lg p-1.5">
              <Stethoscope className="w-4 h-4 text-pharmako-care" />
            </div>
            Cotizaciones Pendientes
          </h3>
          {limit && (
            <Link
              href="/dashboard/cotizaciones"
              className="text-sm font-medium text-pharmako-care hover:underline flex items-center gap-1"
            >
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-sm text-slate-500">
            Buscando recetas cercanas...
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <Stethoscope className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">
              No hay solicitudes de cotización cerca tuyo en este momento.
            </p>
          </div>
        ) : (
          <motion.div
            variants={staggerChildrenVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {quotes.map((quote: any) => {
              const hasOffered = quote.offers && quote.offers.length > 0;
              return (
                <motion.div
                  key={quote.id}
                  variants={fadeUpVariant}
                  onClick={() => setSelectedQuote(quote)}
                  className={`group relative border p-4 rounded-xl cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                    hasOffered
                      ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      hasOffered 
                        ? "bg-emerald-100 border-emerald-200" 
                        : "bg-indigo-50 border-indigo-100"
                    }`}>
                      <span className={`text-sm font-semibold ${hasOffered ? "text-emerald-700" : "text-indigo-700"}`}>
                        {quote.patient?.first_name?.charAt(0) || "P"}
                        {quote.patient?.last_name?.charAt(0) || ""}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold transition-colors ${
                        hasOffered ? "text-emerald-900 group-hover:text-emerald-700" : "text-slate-900 group-hover:text-pharmako-care"
                      }`}>
                        Paciente: {quote.patient?.first_name} {quote.patient?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{quote.prescription?.items?.length || 0} medicamentos</span>
                        <span>•</span>
                        <span>
                          {timeAgo(quote.created_at)}
                        </span>
                        {hasOffered && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-medium">Enviada</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium group-hover:underline ${hasOffered ? "text-emerald-600" : "text-pharmako-care"}`}>
                    {hasOffered ? "Ver / Editar" : "Cotizar"}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {selectedQuote && (
        <PrescriptionQuoterModal
          isOpen={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          quoteRequest={selectedQuote}
          existingOffer={selectedQuote.offers?.[0]}
        />
      )}
    </>
  );
}
