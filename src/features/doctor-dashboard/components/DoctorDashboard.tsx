"use client";

import { DashboardSwitcher, useDashboardView } from "./DashboardSwitcher";
import { DoctorGreeting } from "./DoctorGreeting";
import { ResumenView } from "./ResumenView";
import { PatientFlowView } from "./PatientFlowView";
import { FollowUpView } from "./FollowUpView";
import { ServicesDashboardView } from "@/features/services";
import { useAuthStore } from "@/store/auth";

export function DoctorDashboard() {
  const [activeView, setActiveView] = useDashboardView();
  const { user, role } = useAuthStore();
  const providerUuid =
    (user as { uuid?: string; id?: string })?.uuid ||
    (user as { uuid?: string; id?: string })?.id ||
    "00000000-0000-0000-0000-000000000000";
  const providerType = role === "clinic" ? "CLINIC" : "DOCTOR";

  return (
    <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <DoctorGreeting />

      {/* View Switcher */}
      <DashboardSwitcher activeView={activeView} onChange={setActiveView} />

      {/* Active View */}
      {activeView === "resumen" && <ResumenView />}
      {activeView === "flujo" && <PatientFlowView />}
      {activeView === "seguimiento" && <FollowUpView />}
      {activeView === "servicios" && (
        <ServicesDashboardView
          providerUuid={providerUuid}
          providerType={providerType}
        />
      )}
    </div>
  );
}
