"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Scissors, Calendar, User, Package } from "lucide-react";
import { useOperationsManager } from "@/features/clinics/hooks/useOperationsManager";

interface PageProps {
  params: Promise<{ branchId: string; operationId: string }>;
}

export default function OperationDetailsPage({ params }: PageProps) {
  // Use React 19 `use` hook to unwrap params
  const { branchId, operationId } = use(params);
  
  // In a real app we'd have a specific hook for a single operation. 
  // For now, reuse manager and find it.
  const { operationsList, isLoading } = useOperationsManager(branchId);
  const operation = operationsList.find((op) => (op.id || op.uuid) === operationId);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando...</div>;

  if (!operation) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Link href={`/clinics/${branchId}/operations`} className="text-pharmako-care text-sm hover:underline flex items-center mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Agenda Quirúrgica
        </Link>
        <div className="p-8 text-center text-red-500 border border-red-200 rounded bg-red-50">
          Cirugía no encontrada.
        </div>
      </div>
    );
  }

  const dateStr = operation.scheduled_date || operation.scheduledDate;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      
      <Link href={`/clinics/${branchId}/operations`} className="text-slate-500 text-sm hover:text-pharmako-care flex items-center mb-6 transition-colors w-max">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver a Agenda Quirúrgica
      </Link>

      <div className="bg-white p-6 border border-slate-200 rounded-lg shadow-none">
        <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Cirugía Programada
              </h2>
              <p className="text-sm text-slate-500 mt-1">ID: {operation.id || operation.uuid}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 font-medium text-sm rounded border border-blue-200">
            {operation.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <div className="flex items-center text-slate-500 text-xs mb-1">
              <User className="w-4 h-4 mr-1.5" /> Paciente
            </div>
            <p className="font-medium text-slate-900">Pte {operation.patient_account_id?.split("-")[0] || operation.patientUuid?.split("-")[0]}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-slate-500 text-xs mb-1">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Quirófano
            </div>
            <p className="font-medium text-slate-900">{operation.roomName}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-slate-500 text-xs mb-1">
              <Calendar className="w-4 h-4 mr-1.5" /> Fecha y Hora
            </div>
            <p className="font-medium text-slate-900">{new Date(dateStr).toLocaleString()}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-slate-500 text-xs mb-1">
              <Package className="w-4 h-4 mr-1.5" /> Insumos Solicitados
            </div>
            <p className="font-medium text-slate-900">-</p>
          </div>
        </div>
      </div>
    </div>
  );
}
