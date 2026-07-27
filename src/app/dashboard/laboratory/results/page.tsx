"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  Download,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLabResults } from "@/features/laboratory/hooks/useLabResults";
import { UploadLabResultModal } from "@/features/laboratory/components/UploadLabResultModal";
import type { LabResultRecord } from "@/features/laboratory/types/laboratory.types";

export function LaboratoryResultsPage() {
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useLabResults(page);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const results: LabResultRecord[] = data?.data || [];
  const pagination = {
    currentPage: data?.current_page || 1,
    lastPage: data?.last_page || 1,
    total: data?.total || 0,
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Resultados de Laboratorio
          </h1>
          <p className="text-sm text-slate-600">
            Carga de análisis, adjuntos (PDFs/Imágenes) y seguimiento de
            notificaciones enviadas por email.
          </p>
        </div>

        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl h-11 px-5"
        >
          <UploadCloud className="w-4 h-4 mr-2" />
          Cargar Nuevo Resultado
        </Button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-4">ID / Fecha de Estudio</th>
                <th className="p-4">Paciente</th>
                <th className="p-4">Observaciones / Adjuntos</th>
                <th className="p-4">Notificación Email</th>
                <th className="p-4 text-right">Documento PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    Cargando resultados de laboratorio...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-slate-500"
                  >
                    No hay resultados cargados recientemente.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-slate-900">
                        Resultado #{res.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {res.performed_at
                          ? new Date(res.performed_at).toLocaleDateString()
                          : "Procesado"}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800 text-xs">
                      {res.patient?.first_name
                        ? `${res.patient.first_name} ${res.patient.last_name}`
                        : "Paciente LUCA"}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>{res.notes || "Estudio completado"}</div>
                      {res.attachments_json &&
                        res.attachments_json.length > 0 && (
                          <div className="text-[11px] text-blue-600 font-semibold mt-1">
                            📎 {res.attachments_json.length} adjuntos cargados
                          </div>
                        )}
                    </td>
                    <td className="p-4">
                      {res.email_sent_at ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <Mail className="w-3.5 h-3.5" /> Enviado por Email
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                          Pendiente Email
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {res.file_url ? (
                        <a
                          href={res.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 text-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Descargar PDF
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin archivo
                        </span>
                      )}
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
            {pagination.total} resultados)
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

      <UploadLabResultModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

export default LaboratoryResultsPage;
