"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
} from "lucide-react";
import {
  useAllClinicalHistorySchemas,
  useDeleteClinicalHistorySchema,
} from "@/lib/api/clinical-history/schema";
import { toast } from "sonner";

export default function TemplatesListPage() {
  const { data, isLoading } = useAllClinicalHistorySchemas();
  const deleteMutation = useDeleteClinicalHistorySchema();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const schemas = data?.schemas ?? [];

  const filtered = schemas.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty?.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta plantilla? Esta acción no se puede deshacer."))
      return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Plantilla eliminada");
    } catch {
      toast.error("Error al eliminar la plantilla");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Plantillas de Historias Clínicas
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {schemas.length} plantilla{schemas.length !== 1 ? "s" : ""}{" "}
                guardada{schemas.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/features/clinical-history/builder"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium
                         hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva plantilla
            </Link>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o especialidad..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                         placeholder-slate-400 focus:outline-none focus:ring-2
                         focus:ring-teal-500/20 focus:border-teal-400"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-white rounded-2xl border border-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {search
                ? "Sin resultados para tu búsqueda"
                : "Aún no hay plantillas"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "Intenta con otro término"
                : "Crea tu primera plantilla desde el constructor"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((schema) => (
              <TemplateCard
                key={schema.id}
                schema={schema}
                onDelete={() => handleDelete(schema.id)}
                isDeleting={deletingId === schema.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  schema,
  onDelete,
  isDeleting,
}: {
  schema: {
    id: string;
    name: string;
    description?: string;
    version: string;
    specialty?: string;
    status: "draft" | "published";
  };
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {schema.name}
            </h3>
            {schema.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {schema.description}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1">
                  <Link
                    href={`/features/clinical-history/preview/${schema.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="w-4 h-4" />
                    Vista previa
                  </Link>
                  <Link
                    href={`/features/clinical-history/builder?id=${schema.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    onClick={() => {
                      onDelete();
                      setMenuOpen(false);
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-500">
            v{schema.version}
          </span>
          {schema.specialty && (
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-xs text-teal-600">
              {schema.specialty}
            </span>
          )}
          {schema.status === "published" ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-xs text-emerald-600">
              ✓ Publicada
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-xs text-amber-600">
              Borrador
            </span>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-slate-50 flex items-center gap-2">
        <Link
          href={`/features/clinical-history/builder?id=${schema.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium
                     text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Editar
        </Link>
        <Link
          href={`/features/clinical-history/preview/${schema.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium
                     text-teal-600 hover:bg-teal-50 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Previsualizar
        </Link>
      </div>
    </div>
  );
}
