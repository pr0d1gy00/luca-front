"use client";

import { useState } from "react";
import { DollarSign, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteRequests } from "@/features/pharmacy-dashboard/hooks/usePharmacyQuotes";
import { PrescriptionQuoterModal } from "@/features/pharmacy-dashboard/components/PrescriptionQuoterModal";
import { PharmacySettingsModal } from "@/features/pharmacy-dashboard/components/PharmacySettingsModal";

interface QuoteRequestRecord {
  id: number;
  created_at: string;
  patient_account?: { name: string };
  prescription?: {
    items?: Array<{
      id: number;
      medication?: { name: string };
      instructions?: string;
    }>;
  };
}

export default function PharmacyQuotesPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useQuoteRequests(page);

  const [selectedRequest, setSelectedRequest] =
    useState<QuoteRequestRecord | null>(null);
  const [isQuoterOpen, setIsQuoterOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const quoteRequests: QuoteRequestRecord[] = data?.data || [];
  const pagination = {
    currentPage: data?.current_page || 1,
    lastPage: data?.last_page || 1,
    total: data?.total || 0,
  };

  const handleOpenQuoter = (req: QuoteRequestRecord) => {
    setSelectedRequest(req);
    setIsQuoterOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Solicitudes de Cotización de Recetas
          </h1>
          <p className="text-sm text-slate-600">
            Recepción de recetas de pacientes, cotización manual/ad-hoc,
            sustitución bioequivalente y precios multimoneda.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsSettingsOpen(true)}
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl h-11 px-4 text-xs font-semibold"
        >
          <Settings className="w-4 h-4 mr-2 text-slate-600" />
          Configuración Cotizador
        </Button>
      </div>

      {/* Requests List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">N° Solicitud / Fecha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Medicamentos Prescritos</th>
                <th className="p-4">Estado Solicitud</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    Cargando solicitudes de cotización...
                  </td>
                </tr>
              ) : quoteRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    No hay solicitudes de cotización pendientes de atención.
                  </td>
                </tr>
              ) : (
                quoteRequests.map((req) => (
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
                      {req.patient_account?.name || "Paciente LUCA"}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      {req.prescription?.items
                        ?.map((i) => i.medication?.name)
                        .filter(Boolean)
                        .join(", ") || "Receta adjunta"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                        ● Pendiente Cotización
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenQuoter(req)}
                        className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl text-xs px-4"
                      >
                        <DollarSign className="w-3.5 h-3.5 mr-1" />
                        Cotizar Receta
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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

      {/* Quoter Modal */}
      {selectedRequest && isQuoterOpen && (
        <PrescriptionQuoterModal
          isOpen={isQuoterOpen}
          onClose={() => {
            setIsQuoterOpen(false);
            setSelectedRequest(null);
          }}
          quoteRequest={selectedRequest}
        />
      )}

      {/* Settings Modal */}
      <PharmacySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
