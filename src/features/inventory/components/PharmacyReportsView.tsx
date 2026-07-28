"use client";

import { useState } from "react";
import { Clock, ShieldAlert, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useExpirationsReport,
  useControlledBookReport,
} from "@/features/pharmacy-dashboard/hooks/usePharmacyInventory";
import type { PharmacyInventoryItem } from "@/features/pharmacy-dashboard/types/pharmacy.types";

export function PharmacyReportsView() {
  const [activeTab, setActiveTab] = useState<"expirations" | "controlled">(
    "expirations",
  );
  const [days, setDays] = useState<number>(60);

  const { data: expirations = [], isLoading: loadingExpirations } =
    useExpirationsReport(days);
  const { data: controlled = [], isLoading: loadingControlled } =
    useControlledBookReport();

  return (
    <div className="space-y-6">
      {/* Notion-style Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60">
          <button
            onClick={() => setActiveTab("expirations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-none ${
              activeTab === "expirations"
                ? "bg-white text-slate-900 border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Control de Vencimientos</span>
          </button>
          <button
            onClick={() => setActiveTab("controlled")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-none ${
              activeTab === "controlled"
                ? "bg-white text-slate-900 border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Libro Digital de Psicotrópicos</span>
          </button>
        </div>

        {activeTab === "expirations" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">
              Próximos a vencer en:
            </span>
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 60)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-pharmako-care"
            >
              <option value={30}>30 Días</option>
              <option value={60}>60 Días</option>
              <option value={90}>90 Días</option>
              <option value={180}>180 Días</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Expirations Report */}
      {activeTab === "expirations" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reporte de Control de Mermas y Vencimientos
              </h3>
              <p className="text-xs text-slate-500">
                Productos con fecha de vencimiento menor o igual a {days} días
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none text-xs rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Exportar CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-4">Producto / Monodroga</th>
                  <th className="p-4">N° Lote</th>
                  <th className="p-4">Vencimiento</th>
                  <th className="p-4">Stock Restante</th>
                  <th className="p-4">Ubicación Estante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingExpirations ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-xs text-slate-500"
                    >
                      Cargando reporte de vencimientos...
                    </td>
                  </tr>
                ) : expirations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-xs text-slate-500"
                    >
                      Excelente. No hay medicamentos próximos a vencer en el
                      periodo seleccionado.
                    </td>
                  </tr>
                ) : (
                  expirations.map((item: PharmacyInventoryItem) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-4 font-bold text-slate-900">
                        {item.medication?.name || item.active_ingredient}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        {item.batch_number || "Sin Lote"}
                      </td>
                      <td className="p-4 text-xs font-bold text-amber-700">
                        {item.expiration_date}
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-900">
                        {item.package_stock} Cajas
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {item.location_rack || "No asignada"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Controlled Books Report */}
      {activeTab === "controlled" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-none overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Libro Digital de Registro de Psicotrópicos
              </h3>
              <p className="text-xs text-slate-500">
                Medicamentos bajo condición de receta archivada / controlados
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none text-xs rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Imprimir Libro PDF
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-4">Monodroga / Principio Activo</th>
                  <th className="p-4">Laboratorio</th>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Existencia Actual</th>
                  <th className="p-4">Estado Auditado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingControlled ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-xs text-slate-500"
                    >
                      Generando Libro Digital de Psicotrópicos...
                    </td>
                  </tr>
                ) : controlled.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-xs text-slate-500"
                    >
                      No hay medicamentos registrados bajo la categoría de
                      Psicotrópicos / Controlados.
                    </td>
                  </tr>
                ) : (
                  controlled.map((item: PharmacyInventoryItem) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-4 font-bold text-slate-900">
                        {item.active_ingredient || item.medication?.name}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700">
                        {item.laboratory || "N/A"}
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {item.batch_number || "N/A"}
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-900">
                        {item.package_stock} Cajas
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700">
                          Auditado OK
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
