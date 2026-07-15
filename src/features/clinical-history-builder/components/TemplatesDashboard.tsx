"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Activity,
  Layers,
  CheckCircle,
  TrendingUp,
  Share2,
} from "lucide-react";
import {
  useAllClinicalHistorySchemas,
  useDeleteClinicalHistorySchema,
} from "@/lib/api/clinical-history/schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ShareTemplateModal } from "./ShareTemplateModal";

export function TemplatesDashboard() {
  const { data, isLoading } = useAllClinicalHistorySchemas();
  const deleteMutation = useDeleteClinicalHistorySchema();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareTemplateUuid, setShareTemplateUuid] = useState<string | null>(
    null,
  );
  const [shareTemplateName, setShareTemplateName] = useState("");

  const schemas = data?.schemas ?? [];

  const filtered = schemas.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty?.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── KPIs Clínicos Dinámicos ─────────────────────────────
  const totalTemplates = schemas.length;
  const publishedTemplates = schemas.filter(
    (s) => s.status === "published",
  ).length;
  const draftTemplates = schemas.filter((s) => s.status === "draft").length;

  // Agrupamiento por Especialidad
  const specialties = schemas.map((s) => s.specialty || "General");
  const specialtyCounts = specialties.reduce(
    (acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const uniqueSpecialties = Object.keys(specialtyCounts).length;

  // Estadísticas clínicas simuladas de valor para el médico (Historias Clínicas Llenadas)
  // En producción, esto se cruzaría con el número de registros en `clinical_history_records`
  const mockTotalRecordsFilled = totalTemplates * 24; // Simulado
  const mockMonthlyGrowth = "+12% este mes";

  // Ranking de diagnósticos CIE-10 más frecuentes registrados (simulado)
  const mockTopDiagnoses = [
    {
      code: "I10",
      name: "Hipertensión esencial (primaria)",
      count: 42,
      percentage: 70,
    },
    {
      code: "E11.9",
      name: "Diabetes mellitus tipo 2 sin complicaciones",
      count: 28,
      percentage: 46,
    },
    {
      code: "J06.9",
      name: "Infección aguda de las vías respiratorias superiores",
      count: 19,
      percentage: 31,
    },
  ];

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta plantilla? Esta acción no se puede deshacer."))
      return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Plantilla eliminada correctamente");
    } catch {
      toast.error("Error al eliminar la plantilla");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Historias Clínicas y Plantillas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Diseñá y gestioná las fichas clínicas especializadas para tu
            consultorio.
          </p>
        </div>
        <Link
          href="/clinical-history/builder"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pharmako-care text-white text-sm font-semibold
                     hover:bg-pharmako-care-hover transition-colors shadow-sm self-start sm:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          Nueva Plantilla
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Total Plantillas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Modelos Clínicos
            </span>
            <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {totalTemplates}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              Plantillas activas creadas
            </span>
          </div>
        </div>

        {/* KPI 2: Publicadas vs Borradores */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Estado de Modelos
            </span>
            <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {publishedTemplates}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              {draftTemplates} en borrador / edición
            </span>
          </div>
        </div>

        {/* KPI 3: Registros Clínicos Llenados */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Fichas Completadas
            </span>
            <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {mockTotalRecordsFilled}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-2 inline-block">
              {mockMonthlyGrowth}
            </span>
          </div>
        </div>

        {/* KPI 4: Especialidades Cubiertas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              Especialidades Activas
            </span>
            <div className="bg-pharmako-care-light rounded-lg p-2 text-pharmako-care">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {uniqueSpecialties}
            </span>
            <span className="block text-xs text-slate-400 mt-1">
              Áreas de atención configuradas
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Diagnoses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Plantillas List Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-pharmako-care-light rounded-xl p-2.5 text-pharmako-care shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Mis Plantillas Clínicas
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Buscar, editar o duplicar tus formatos personalizados
                </p>
              </div>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-pharmako-care transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plantilla o especialidad..."
                className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20"
              />
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            {isLoading ? (
              <div className="space-y-3 py-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-slate-50 border border-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <span className="text-2xl mb-2">📋</span>
                <p className="text-xs font-semibold">
                  No se encontraron plantillas de historia clínica
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Plantilla
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Especialidad
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((schema) => (
                    <tr
                      key={schema.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <span className="block text-xs font-bold text-slate-900">
                            {schema.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                            {schema.description || "Sin descripción"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-slate-50 border-slate-200 text-slate-500 font-bold rounded-full"
                        >
                          {schema.specialty?.replace("-", " ") || "General"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full border",
                            schema.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100",
                          )}
                        >
                          {schema.status === "published"
                            ? "Publicado"
                            : "Borrador"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          {schema.status === "published" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShareTemplateUuid(schema.id);
                                setShareTemplateName(schema.name);
                              }}
                              className="h-8 w-8 p-0 rounded-lg text-teal-600 hover:bg-slate-100 hover:text-teal-700"
                              title="Compartir con Paciente"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Link
                            href={`/clinical-history/preview/${schema.id}`}
                            target="_blank"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/clinical-history/builder?id=${schema.id}`}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schema.id)}
                            disabled={deletingId === schema.id}
                            className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-slate-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Col 3: Diagnósticos CIE-10 Frecuentes */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              Prevalencia CIE-10 Registrada
            </span>
            <span className="text-[10px] font-semibold text-pharmako-care bg-pharmako-care-light px-2 py-0.5 rounded-full">
              Frecuencia
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Diagnósticos más asignados utilizando tus plantillas personalizadas
            de historia clínica:
          </p>

          <div className="space-y-4 my-auto">
            {mockTopDiagnoses.map((diag, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] mr-1.5 font-mono">
                      {diag.code}
                    </span>
                    <span
                      className="font-medium text-slate-700 truncate inline-block max-w-[170px]"
                      title={diag.name}
                    >
                      {diag.name}
                    </span>
                  </div>
                  <span className="text-slate-450 font-bold shrink-0">
                    {diag.count} casos
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-pharmako-care h-full rounded-full transition-all"
                    style={{ width: `${diag.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 leading-normal">
              La automatización de códigos CIE-10 en tus plantillas reduce en un{" "}
              <strong>35%</strong> el tiempo de documentación de la consulta.
            </p>
          </div>
        </div>
      </div>

      {shareTemplateUuid && (
        <ShareTemplateModal
          isOpen={!!shareTemplateUuid}
          onClose={() => setShareTemplateUuid(null)}
          templateUuid={shareTemplateUuid}
          templateName={shareTemplateName}
        />
      )}
    </div>
  );
}
