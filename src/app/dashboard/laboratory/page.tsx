"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TestTube,
  FileText,
  BarChart3,
  UserPlus,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateExternalLabOrderModal } from "@/features/laboratory/components/CreateExternalLabOrderModal";
import { LabSettingsModal } from "@/features/laboratory/components/LabSettingsModal";
import { useLabSettings } from "@/features/laboratory/hooks/useLabSettings";

export default function LaboratoryMainDashboardPage() {
  const [isExternalModalOpen, setIsExternalModalOpen] =
    useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const { settings } = useLabSettings();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pharmako-care-light text-pharmako-care mb-2">
            ● LUCA Laboratory OS Active Node (
            {settings?.is_24_hours
              ? "Atención 24/7"
              : `${settings?.opening_time || "07:00"} - ${settings?.closing_time || "17:00"}`}
            )
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel Principal de Laboratorio
          </h1>
          <p className="text-sm text-slate-600">
            Horarios de atención, días laborables, cotización multimoneda,
            resultados por email y analítica de reactivos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSettingsModalOpen(true)}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl h-11 px-4 text-xs font-semibold"
          >
            <Settings className="w-4 h-4 mr-2 text-slate-600" />
            Configuración y Horario
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsExternalModalOpen(true)}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl h-11 px-4 text-xs font-semibold"
          >
            <UserPlus className="w-4 h-4 mr-2 text-pharmako-care" />
            Registrar Orden Externa (&quot;Walk-in&quot;)
          </Button>

          <Link href="/dashboard/laboratory/requests">
            <Button className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl h-11 px-5">
              <TestTube className="w-4 h-4 mr-2" />
              Ver Solicitudes de Exámenes
            </Button>
          </Link>
        </div>
      </div>

      {/* Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/laboratory/requests">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none hover:border-pharmako-care transition-colors group cursor-pointer space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-pharmako-care-light text-pharmako-care">
                <TestTube className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pharmako-care transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Solicitudes y Cotización
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Cotizá peticiones en dólares, bolívares y euros. Permití que el
                paciente aparte su cupo de atención por fecha.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/laboratory/results">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none hover:border-pharmako-care transition-colors group cursor-pointer space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Resultados y Envíos por Email
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Cargá resultados e imágenes. La plataforma envía automáticamente
                la notificación por correo con el PDF adjunto.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/laboratory/analytics">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none hover:border-pharmako-care transition-colors group cursor-pointer space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Analytics y Compra de Reactivos
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Consultá los exámenes más solicitados e insumos requeridos.
                Monitoreá el ranking de pacientes más frecuentes.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* External Walk-in Order Modal */}
      <CreateExternalLabOrderModal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
      />

      {/* Settings & Working Hours Modal */}
      <LabSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
