"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { fadeUpVariant, staggerChildrenVariant } from "@/app/lib/animations";
import { Stethoscope, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
      <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4 items-end pb-2">
        <div className="flex flex-col gap-1.5 w-full sm:w-48">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Estado</label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="appearance-none h-10 pl-3 pr-8 w-full border border-slate-200 rounded-lg bg-white text-[13px] font-medium text-slate-700 outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care/50 transition-all cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="OPEN">Abiertas (Pendientes)</option>
              <option value="CLOSED">Cerradas</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="h-10 px-3 w-full border border-slate-200 rounded-lg bg-white text-[13px] font-medium text-slate-700 outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care/50 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="h-10 px-3 w-full border border-slate-200 rounded-lg bg-white text-[13px] font-medium text-slate-700 outline-none focus:border-pharmako-care focus:ring-1 focus:ring-pharmako-care/50 transition-all"
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
            className="h-10 text-[13px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg px-4"
          >
            Limpiar filtros
          </Button>
        )}
      </motion.div>

      <motion.div
        variants={fadeUpVariant}
        className="flex flex-col gap-4"
      >
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-pharmako-care border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-slate-500">Buscando recetas cercanas...</p>
          </div>
        ) : isEmpty ? (
          <div className="bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center py-12">
            <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
              <Stethoscope className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No hay solicitudes de cotización.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Las recetas de pacientes cercanos aparecerán aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotes.map((quote: any) => {
                const hasOffered = quote.offers && quote.offers.length > 0;
                return (
                  <motion.div
                    key={quote.id}
                    variants={fadeUpVariant}
                    onClick={() => setSelectedQuote(quote)}
                    className="group relative bg-white border border-slate-200 p-5 rounded-xl cursor-pointer hover:border-pharmako-care/50 hover:bg-slate-50/50 transition-all duration-200 flex flex-col justify-between min-h-[160px]"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 bg-slate-50">
                            {quote.patient?.avatar_url ? (
                              <img
                                src={quote.patient.avatar_url}
                                alt={`${quote.patient?.first_name} ${quote.patient?.last_name}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-500">
                                {quote.patient?.first_name?.charAt(0) || "P"}
                                {quote.patient?.last_name?.charAt(0) || ""}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-pharmako-care transition-colors tracking-tight">
                              {quote.patient?.first_name} {quote.patient?.last_name}
                            </h3>
                            <span className="text-xs font-medium text-slate-500">
                              {timeAgo(quote.created_at)}
                            </span>
                          </div>
                        </div>
                        {hasOffered && (
                          <span className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Enviada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {quote.prescription?.items?.length || 0} medicamentos
                        </span>
                        {quote.status === "CLOSED" && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200/60">
                            Cerrada
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <span className="text-[10px] text-slate-400 font-mono font-medium flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        ID: {quote.uuid.slice(0, 8)}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-600 group-hover:text-pharmako-care transition-colors flex items-center gap-1">
                        {hasOffered ? "Ver detalles" : "Cotizar ahora"}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 mt-4">
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
