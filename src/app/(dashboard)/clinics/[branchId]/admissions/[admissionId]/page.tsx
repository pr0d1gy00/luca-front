"use client";

import { use } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAdmissionDetailsQuery } from "@/features/clinics/api/useInpatient";
import { TreatmentNotesTimeline } from "@/features/clinics/components/admissions/TreatmentNotesTimeline";
import { MedicationSchedule } from "@/features/clinics/components/admissions/MedicationSchedule";

interface PageProps {
  params: Promise<{ branchId: string; admissionId: string }>;
}

export default function AdmissionDetailsPage({ params }: PageProps) {
  // Use React 19 `use` hook to unwrap params
  const { branchId, admissionId } = use(params);
  
  const { data: admission, isLoading } = useAdmissionDetailsQuery(branchId, admissionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-pharmako-care" />
        <p className="text-sm">Cargando detalles de admisión...</p>
      </div>
    );
  }

  if (!admission) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Link href={`/clinics/${branchId}/admissions`} className="text-pharmako-care text-sm hover:underline flex items-center mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver a Hospitalización
        </Link>
        <div className="p-8 text-center text-red-500 border border-red-200 rounded bg-red-50">
          Admisión no encontrada.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      
      <Link href={`/clinics/${branchId}/admissions`} className="text-slate-500 text-sm hover:text-pharmako-care flex items-center mb-6 transition-colors w-max">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver a Hospitalización
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Detalle de Ingreso: {admission.patient_account_id || admission.patientUuid?.split("-")[0]}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Motivo: {admission.reason || "Sin especificar"}
          </p>
        </div>
        <div className="px-3 py-1 bg-slate-100 text-slate-700 font-medium text-sm rounded border border-slate-200">
          Estado: {admission.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-md shadow-none">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-3">Notas de Evolución</h3>
            <TreatmentNotesTimeline notes={admission.treatment_notes || []} />
          </div>
        </div>

        {/* RIGHT COLUMN: Medications & Info */}
        <div className="space-y-6">
          <div className="bg-white p-5 border border-slate-200 rounded-md shadow-none">
            <h3 className="text-lg font-medium text-slate-900 mb-4 border-b border-slate-100 pb-3">Medicamentos Programados</h3>
            <MedicationSchedule medications={admission.medications || []} />
          </div>

          <div className="bg-white p-5 border border-slate-200 rounded-md shadow-none">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Información de Ingreso</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">ID Cama</span>
                <span className="font-medium text-slate-900 truncate max-w-[150px]">{admission.clinic_bed_id || admission.clinicBedUuid}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Fecha Ingreso</span>
                <span className="font-medium text-slate-900">{new Date(admission.admission_date || admission.admissionDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
