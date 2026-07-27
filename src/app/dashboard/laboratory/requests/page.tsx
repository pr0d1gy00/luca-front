"use client";

import { useState } from "react";
import { DollarSign, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLabRequests } from "@/features/laboratory/hooks/useLabQuotes";
import { LabQuoterModal } from "@/features/laboratory/components/LabQuoterModal";
import { BookLabSlotModal } from "@/features/laboratory/components/BookLabSlotModal";

interface LabRequestRecord {
  id: number;
  created_at: string;
  patient?: { first_name?: string; last_name?: string };
  exams_list?: Array<string | { name: string }>;
  is_external?: boolean;
}

export function LaboratoryRequestsPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useLabRequests(page);

  const [selectedRequest, setSelectedRequest] =
    useState<LabRequestRecord | null>(null);
  const [isQuoterOpen, setIsQuoterOpen] = useState<boolean>(false);
  const [isBookSlotOpen, setIsBookSlotOpen] = useState<boolean>(false);
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);

  const requests: LabRequestRecord[] = data?.data || [];
  const pagination = {
    currentPage: data?.current_page || 1,
    lastPage: data?.last_page || 1,
    total: data?.total || 0,
  };

  const handleOpenQuoter = (req: LabRequestRecord) => {
    setSelectedRequest(req);
    setIsQuoterOpen(true);
  };

  const handleOpenBookSlot = (offerId: number) => {
    setSelectedOfferId(offerId);
    setIsBookSlotOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Solicitudes de Exámenes de Laboratorio
          </h1>
          <p className="text-sm text-slate-600">
            Recepción de órdenes médicas, cotización multimoneda y reserva de
            cupos por fecha.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">N° Solicitud / Fecha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Exámenes Solicitados</th>
                <th className="p-4">Origen</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    Cargando solicitudes de laboratorio...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    No hay solicitudes pendientes de atención.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        Solicitud #{req.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(req.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 text-xs">
                      {req.patient?.first_name
                        ? `${req.patient.first_name} ${req.patient.last_name}`
                        : "Paciente LUCA"}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {req.exams_list
                        ?.map((e) => (typeof e === "string" ? e : e.name))
                        .join(", ") || "Estudio adjunto"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          req.is_external
                            ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                            : "bg-blue-50 text-blue-700 border border-blue-200/60"
                        }`}
                      >
                        {req.is_external
                          ? "● Walk-in (Externo)"
                          : "● Plataforma LUCA"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleOpenQuoter(req)}
                        className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl text-xs px-3"
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        Cotizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenBookSlot(req.id)}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50 shadow-none rounded-xl text-xs px-3"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        Apartar Cupo
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
          <div>
            Página {pagination.currentPage} de {pagination.lastPage} (
            {pagination.total} solicitudes)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="border-slate-200 bg-white text-slate-700 shadow-none rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-200 bg-white text-slate-700 shadow-none rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedRequest && isQuoterOpen && (
        <LabQuoterModal
          isOpen={isQuoterOpen}
          onClose={() => {
            setIsQuoterOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}

      {selectedOfferId && isBookSlotOpen && (
        <BookLabSlotModal
          isOpen={isBookSlotOpen}
          onClose={() => {
            setIsBookSlotOpen(false);
            setSelectedOfferId(null);
          }}
          quoteOfferId={selectedOfferId}
        />
      )}
    </div>
  );
}

export default LaboratoryRequestsPage;
