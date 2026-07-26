"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Layers,
  DollarSign,
  CalendarCheck,
  Tag,
  ArrowRight,
  Clock,
  Check,
  X,
  Plus,
} from "lucide-react";
import { useProviderServicesStats } from "../hooks/useServicesStats";
import { serviceCategoryLabels } from "../schemas";
import type { ProviderService } from "../schemas";
import { ServiceManager } from "./ServiceManager";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PiBriefcaseBold } from "react-icons/pi";

interface ServicesDashboardViewProps {
  providerUuid: string;
  providerType?: "DOCTOR" | "CLINIC";
}

export function ServicesDashboardView({
  providerUuid,
  providerType = "DOCTOR",
}: ServicesDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "manage">("overview");
  const { data: stats, isLoading } = useProviderServicesStats(providerUuid);

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<Partial<ProviderService> | null>(null);
  const [selectedServiceUuid, setSelectedServiceUuid] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isStandaloneBookable, setIsStandaloneBookable] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const handleOpenAdd = () => {
    setEditingService(null);
    setSelectedServiceUuid("");
    setPrice("");
    setDurationMinutes("20");
    setIsStandaloneBookable(false);
    setCustomName("");
    setCustomDescription("");
    setIsDialogOpen(true);
    setActiveTab("manage");
  };
  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs Switcher */}
      <div className="sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex gap-4">
          <div className="p-4 rounded-full text-pharmako-care flex items-center justify-center">
            <PiBriefcaseBold className="w-6 h-6" />
          </div>
          <div className="w-full flex justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Portafolio de Servicios
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Análisis de rendimiento, tarifas promedio y gestión de la oferta
                médica.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button
                onClick={handleOpenAdd}
                className="h-10 bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold shadow-none flex items-center gap-2 rounded-xl transition-colors duration-150 border-none px-4"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Agregar Servicio</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto mt-8">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 ${
              activeTab === "overview"
                ? "bg-white text-pharmako-care border-pharmako-care border-b shadow-none"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Resumen & Métricas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manage")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold transition-all duration-150 ${
              activeTab === "manage"
                ? "bg-white text-pharmako-care border-pharmako-care border-b shadow-none"
                : "text-slate-500 hover:text-slate-800 border-transparent"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Todos los Servicios</span>
            {stats && stats.totalServices > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-slate-200/70 text-slate-700 text-[10px] rounded-full font-bold">
                {stats.totalServices}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Resumen & Métricas */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-28 bg-slate-100 rounded-xl border border-slate-200/60"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Servicios */}
                <Card className="bg-white rounded-xl p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Servicios Activos
                    </span>
                    <div className="p-2.5 bg-pharmako-care-light text-pharmako-care rounded-xl">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900">
                      {stats?.totalServices || 0}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Configurados en el catálogo
                    </p>
                  </div>
                </Card>

                {/* Precio Promedio */}
                <Card className="bg-white rounded-xl p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Precio Promedio
                    </span>
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900">
                      ${stats?.averagePrice || 0}{" "}
                      <span className="text-xs font-medium text-slate-400">
                        USD
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tarifa promedio por atención
                    </p>
                  </div>
                </Card>

                {/* Reserva Directa */}
                <Card className="bg-white rounded-xl p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Reserva Directa
                    </span>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900">
                      {stats?.standaloneBookableCount || 0}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Habilitados sin consulta previa
                    </p>
                  </div>
                </Card>

                {/* Categorías Cubiertas */}
                <Card className="bg-white rounded-xl p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Categorías Cubiertas
                    </span>
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                      <Tag className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-slate-900">
                      {stats?.totalCategories || 0}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Áreas médicas configuradas
                    </p>
                  </div>
                </Card>
              </div>

              {/* Middle Section: Categorías + Vista Previa */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Desglose por Categoría */}
                <Card className="lg:col-span-5 bg-white rounded-xl shadow-none">
                  <CardHeader className="p-6 pb-4 border-b border-slate-100">
                    <CardTitle className="text-base font-bold text-slate-900">
                      Distribución por Categoría
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500">
                      Porcentaje y tarifas promedio según el tipo de servicio.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {stats?.categoryBreakdown &&
                    stats.categoryBreakdown.length > 0 ? (
                      stats.categoryBreakdown.map((item) => (
                        <div key={item.category} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">
                              {serviceCategoryLabels[item.category] ||
                                item.category}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">
                                {item.count} serv.
                              </span>
                              <span className="font-bold text-slate-900">
                                ${item.averagePrice} USD prom.
                              </span>
                            </div>
                          </div>
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pharmako-care rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(item.percentage, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No hay suficientes datos de categorías aún.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Vista Previa de Servicios Destacados */}
                <Card className="lg:col-span-7 bg-white  rounded-xl shadow-none flex flex-col justify-between">
                  <div>
                    <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          Servicios Destacados
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Vista previa de los principales servicios en tu
                          catálogo.
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab("manage")}
                        className="text-xs text-pharmako-care font-semibold hover:bg-pharmako-care-light flex items-center gap-1 shadow-none rounded-lg"
                      >
                        <span>Ver todos ({stats?.totalServices || 0})</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardHeader>

                    <CardContent className="p-6 divide-y divide-slate-100">
                      {stats?.previewServices &&
                      stats.previewServices.length > 0 ? (
                        stats.previewServices.map((svc) => (
                          <div
                            key={svc.uuid}
                            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">
                                  {svc.name}
                                </span>
                                <Badge className="bg-slate-100 text-slate-600 border-none rounded-md px-2 py-0.5 text-[10px]">
                                  {serviceCategoryLabels[svc.category] ||
                                    svc.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  {svc.durationMinutes} min
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {svc.isStandaloneBookable ? (
                                    <span className="text-emerald-600 flex items-center gap-0.5 font-medium">
                                      <Check className="h-3 w-3" /> Agenda
                                      directa
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 flex items-center gap-0.5">
                                      <X className="h-3 w-3" /> Con consulta
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-900">
                                ${svc.price} USD
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <p className="text-xs text-slate-500">
                            Aún no agregaste servicios a tu catálogo.
                          </p>
                          <Button
                            onClick={() => setActiveTab("manage")}
                            className="mt-3 h-9 bg-pharmako-care hover:bg-pharmako-care-hover text-white text-xs font-semibold rounded-xl border-none shadow-none px-4"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Agregar primer servicio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 2: Todos los Servicios (CRUD) */}
      {activeTab === "manage" && (
        <ServiceManager
          providerUuid={providerUuid}
          providerType={providerType}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingService={editingService}
          setEditingService={setEditingService}
          selectedServiceUuid={selectedServiceUuid}
          setSelectedServiceUuid={setSelectedServiceUuid}
          price={price}
          setPrice={setPrice}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          isStandaloneBookable={isStandaloneBookable}
          setIsStandaloneBookable={setIsStandaloneBookable}
          customName={customName}
          setCustomName={setCustomName}
          customDescription={customDescription}
          setCustomDescription={setCustomDescription}
          handleOpenAdd={handleOpenAdd}
        />
      )}
    </div>
  );
}
