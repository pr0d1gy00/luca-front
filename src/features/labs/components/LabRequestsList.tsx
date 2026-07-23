"use client";

import { useState } from "react";
import {
  useLabRequests,
  useDeleteLabRequest,
  useUpdateLabRequest,
} from "../hooks/useLabRequests";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { LabRequestModal } from "./LabRequestModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import {
  Search,
  Plus,
  Dna,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
} from "lucide-react";
import { toast } from "sonner";
import type { LabRequest } from "@/features/offline/database/schema";

export function LabRequestsList() {
  // Pagination state
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useLabRequests(undefined, page, perPage);
  const labRequests = data?.data ?? [];
  const pagination = data?.pagination;

  const { data: patients = [] } = usePatients();
  const deleteMutation = useDeleteLabRequest();
  const updateMutation = useUpdateLabRequest();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "COMPLETED"
  >("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LabRequest | null>(null);

  const getPatientData = (patientUuid: string) => {
    const p = patients.find((x) => x.uuid === patientUuid);
    return p
      ? { name: `${p.firstName} ${p.lastName}`, nationalId: p.nationalId }
      : { name: "Paciente Desconocido", nationalId: "N/A" };
  };

  const handleEdit = (req: LabRequest) => {
    setEditingRequest(req);
    setIsModalOpen(true);
  };

  const handleDelete = async (uuid: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este pedido de laboratorio?",
      )
    ) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(uuid);
      toast.success("Pedido de laboratorio eliminado.");
    } catch {
      toast.error("Error al eliminar el pedido.");
    }
  };

  const handleToggleStatus = async (req: LabRequest) => {
    try {
      await updateMutation.mutateAsync({
        uuid: req.uuid,
        isCompleted: !req.isCompleted,
      });
      toast.success(
        `Pedido marcado como ${!req.isCompleted ? "completado" : "pendiente"}.`,
      );
    } catch {
      toast.error("Error al actualizar el estado.");
    }
  };

  const filteredRequests = labRequests.filter((req) => {
    // 1. Soft delete filter
    if (req.deletedAt) return false;

    // 2. Patient search
    const patient = getPatientData(req.patientUuid);
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.nationalId.includes(search) ||
      (req.examsList || []).some((e) =>
        e.toLowerCase().includes(search.toLowerCase()),
      );

    // 3. Status filter
    if (statusFilter === "PENDING" && req.isCompleted) return false;
    if (statusFilter === "COMPLETED" && !req.isCompleted) return false;

    return matchesSearch;
  });

  const formatDateString = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <div className="bg-phamako-care/10 text-pharmako-care rounded-xl p-2.5">
              <Dna className="w-6 h-6" />
            </div>
            Pedidos de Laboratorio
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generá y gestioná las órdenes de exámenes clínicos de tus pacientes.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingRequest(null);
            setIsModalOpen(true);
          }}
          className="bg-pharmako-care hover:bg-pharmako-care-hover text-white rounded-xl font-bold flex items-center gap-2 h-12"
        >
          <Plus className="w-5 h-5" /> Emitir Examen
        </Button>
      </div>

      {/* Filters card */}
      <div className="bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por paciente o examen..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-10 pl-9 pr-3 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600/20"
          />
        </div>

        {/* Status filters */}
        <div className="flex">
          <button
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
            className={`px-4 py-1.5 text-sm font-bold transition-all ${statusFilter === "ALL"
              ? "bg-white border-b border-pharmako-care text-pharmako-care"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            Todos
          </button>
          <button
            onClick={() => {
              setStatusFilter("PENDING");
              setPage(1);
            }}
            className={`px-4 py-1.5 text-sm font-bold transition-all ${statusFilter === "PENDING"
              ? "bg-white border-b border-pharmako-care text-pharmako-care"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => {
              setStatusFilter("COMPLETED");
              setPage(1);
            }}
            className={`px-4 py-1.5 text-sm font-bold transition-all ${statusFilter === "COMPLETED"
              ? "bg-white border-b border-pharmako-care text-pharmako-care"
              : "text-slate-500 hover:text-slate-800"
              }`}
          >
            Completados
          </button>
        </div>
      </div>

      {/* Main requests table card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-sm text-slate-400">
            Cargando pedidos...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-450">
            <Dna className="w-10 h-10 mx-auto mb-3 opacity-20 text-slate-500" />
            No se encontraron pedidos de laboratorio
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-200 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Fecha de Orden
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Exámenes Solicitados
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sincronización
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => {
                  const patient = getPatientData(req.patient.uuid);
                  return (
                    <tr
                      key={req.uuid}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Patient */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {patient.name}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                          DNI: {patient.nationalId}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {formatDateString(req.createdAt || req.updatedAt)}
                      </td>

                      {/* Exams list */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {(req.examsList || []).slice(0, 3).map((exam, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="bg-slate-50 border-slate-200 text-slate-700 text-[10px] rounded-md py-0.5"
                            >
                              {exam}
                            </Badge>
                          ))}
                          {(req.examsList || []).length > 3 && (
                            <span className="text-[10px] font-bold text-slate-450 self-center ml-1">
                              +{req.examsList.length - 3} más
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(req)}
                          className="inline-flex focus:outline-none focus:ring-2 focus:ring-teal-500/20 rounded-xl"
                        >
                          {req.isCompleted ? (
                            <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Completado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pendiente
                            </Badge>
                          )}
                        </button>
                      </td>

                      {/* Sync Status */}
                      <td className="px-6 py-4 text-center">
                        {req._syncStatus === "synced" ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100">
                            <Cloud className="w-3.5 h-3.5" /> Sincronizado
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-100">
                            <CloudOff className="w-3.5 h-3.5" /> Pendiente
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(req)}
                            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Editar pedido"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(req.uuid)}
                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standardized Pagination */}
      {pagination && pagination.lastPage > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          perPage={pagination.perPage}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          onPageChange={(newPage) => setPage(newPage)}
          variant="care"
        />
      )}

      <LabRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRequest(null);
        }}
        existingRequest={editingRequest}
      />
    </div>
  );
}
