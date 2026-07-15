"use client";

import { TemplatesDashboard } from "@/features/clinical-history-builder";
import { PatientFormRequests } from "@/features/patient-dashboard/components/PatientFormRequests";
import { useAuthStore } from "@/store/auth";

export default function ClinicalHistoryDashboardPage() {
  const { role } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {role === "patient" ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
          <PatientFormRequests />
        </div>
      ) : (
        <TemplatesDashboard />
      )}
    </div>
  );
}
