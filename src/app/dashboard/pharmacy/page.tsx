"use client";

import Link from "next/link";
import {
  Package,
  FileText,
  Settings,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePharmacySettings } from "@/features/pharmacy-dashboard/hooks/usePharmacySettings";

export default function PharmacyMainDashboardPage() {
  const { settings } = usePharmacySettings();

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Greetings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-none flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pharmako-care-light text-pharmako-care mb-2">
            ● Pharmako OS Active Node
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Panel Principal de Farmacia
          </h1>
          <p className="text-sm text-slate-600">
            Control integral de recetas recibidas, cotización multimoneda e
            inventario fraccionado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/pharmacy/settings">
            <Button
              variant="outline"
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl h-11 px-4 text-xs font-semibold"
            >
              <Settings className="w-4 h-4 mr-2 text-slate-600" />
              Configuración (
              {settings?.auto_quoting_enabled ? "Automática" : "Manual"})
            </Button>
          </Link>

          <Link href="/dashboard/pharmacy/quotes">
            <Button className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl h-11 px-5">
              <DollarSign className="w-4 h-4 mr-2" />
              Ver Solicitudes de Cotización
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Modo Cotizador
            </span>
            <div className="p-2 rounded-lg bg-pharmako-care-light text-pharmako-care">
              <Settings className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {settings?.auto_quoting_enabled ? "Automático" : "Manual Asistido"}
          </div>
          <p className="text-xs text-slate-500">
            {settings?.auto_quoting_enabled
              ? "Respuesta automática por stock"
              : "Revisión e ingreso de precios manual"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Cotización Multimoneda
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            USD / VES / EUR
          </div>
          <p className="text-xs text-slate-500">
            Ingreso directo sin cálculo de conversión
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Venta Detallada
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Caja vs Blíster
          </div>
          <p className="text-xs text-slate-500">
            Fraccionamiento y unidades sueltas
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-none space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Descuento de Stock
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Diferido a Compra
          </div>
          <p className="text-xs text-slate-500">
            Stock descontado al pagar cliente
          </p>
        </div>
      </div>

      {/* Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/pharmacy/quotes">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none hover:border-pharmako-care transition-colors group cursor-pointer space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-pharmako-care-light text-pharmako-care">
                <FileText className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-pharmako-care transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Bandeja de Cotización de Recetas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Recibí solicitudes de pacientes, cotizá con o sin inventario
                previo (ad-hoc), seleccioná sustitutos manuales y agregá
                sugerencias de upselling.
              </p>
            </div>
            <div className="text-xs font-semibold text-pharmako-care flex items-center gap-1 pt-2">
              <span>Ir a Solicitudes de Cotización</span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/pharmacy/inventory">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-none hover:border-pharmako-care transition-colors group cursor-pointer space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Package className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Gestión de Inventario y Reportes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                Administrá el catálogo con fraccionamiento por blíster,
                monitoreá alertas de vencimiento (30/60/90 días) y consultá el
                Libro Digital de Psicotrópicos.
              </p>
            </div>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 pt-2">
              <span>Ir a Inventario y Reportes</span>
            </div>
          </div>
        </Link>
      </div>

    </div>
  );
}
