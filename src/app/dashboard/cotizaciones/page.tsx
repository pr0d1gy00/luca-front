"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Stethoscope, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuoteRequests } from "@/features/pharmacy-dashboard/hooks/usePharmacyQuotes";
import { PrescriptionQuoterModal } from "@/features/pharmacy-dashboard/components/PrescriptionQuoterModal";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PiInvoice } from "react-icons/pi";

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

export default function CotizacionesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isLoading } = useQuoteRequests({
    page,
    status: status || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });
  const [selectedQuote, setSelectedQuote] = useState<any | null>(null);

  const quotes = data?.data?.data || data?.data || [];
  const meta = data?.data?.meta || data?.meta || null;
  const isEmpty = quotes.length === 0;

  const totalPages = meta?.last_page || 1;
  const totalItems = meta?.total || quotes.length;
  const perPage = meta?.per_page || 15;
  const from = meta?.from || 1;
  const to = meta?.to || quotes.length;

  return (
    <motion.div
      variants={staggerChildrenVariant}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8"
    >
      <motion.div variants={fadeUpVariant} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <PiInvoice className="h-8 w-8 text-pharmako-care" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Cotizaciones
          </h1>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl">
          Visualiza las recetas emitidas por médicos cercanos a tu ubicación. Haz clic en "Cotizar" para enviar tu oferta de precios y disponibilidad al paciente.
        </p>
      </motion.div>

      {/* Filter Bar */}
      <motion.div variants={fadeUpVariant} className="bg-white flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">Estado</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care transition-all bg-white"
          >
            <option value="">Todos los estados</option>
            <option value="OPEN">Abiertas</option>
            <option value="CLOSED">Cerradas</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">Fecha desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care transition-all bg-white text-slate-900"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-500">Fecha hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="h-10 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care transition-all bg-white text-slate-900"
          />
        </div>

        {(status || startDate || endDate) && (
          <Button
            variant="ghost"
            onClick={() => {
              setStatus("");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="h-10 text-slate-500 hover:text-slate-700"
          >
            Limpiar
          </Button>
        )}
      </motion.div>

      <motion.div
        variants={fadeUpVariant}
        className="bg-white rounded-2xl p-6 flex flex-col gap-4"
      >

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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotes.map((quote: any) => {
                const hasOffered = quote.offers && quote.offers.length > 0;
                return (
                  <motion.div
                    key={quote.id}
                    variants={fadeUpVariant}
                    onClick={() => setSelectedQuote(quote)}
                    className={`group relative border p-5 rounded-xl cursor-pointer transition-colors duration-150 flex flex-col gap-4 ${
                      hasOffered
                        ? "bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${
                          hasOffered 
                            ? "bg-emerald-100 border-emerald-200" 
                            : "bg-indigo-50 border-indigo-100"
                        }`}>
                          {quote.patient?.avatar_url ? (
                            <img 
                              src={quote.patient.avatar_url} 
                              alt={`${quote.patient?.first_name} ${quote.patient?.last_name}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className={`text-sm font-semibold ${hasOffered ? "text-emerald-700" : "text-indigo-700"}`}>
                              {quote.patient?.first_name?.charAt(0) || "P"}
                              {quote.patient?.last_name?.charAt(0) || ""}
                            </span>
                          )}
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
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                        ID: {quote.uuid.slice(0, 8)}
                      </span>
                      <span className={`text-sm font-medium group-hover:underline ${hasOffered ? "text-emerald-600" : "text-pharmako-care"}`}>
                        {hasOffered ? "Ver / Editar" : "Cotizar ahora"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 mt-2 border-t border-slate-100">
                <Pagination
                  currentPage={page}
                  lastPage={totalPages}
                  onPageChange={setPage}
                  total={totalItems}
                  perPage={perPage}
                  from={from}
                  to={to}
                  variant="care"
                />
              </div>
            )}
          </>
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
    </motion.div>
  );
}
