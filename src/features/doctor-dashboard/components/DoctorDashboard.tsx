"use client";

import { DashboardSwitcher, useDashboardView } from "./DashboardSwitcher";
import { DoctorGreeting } from "./DoctorGreeting";
import { ResumenView } from "./ResumenView";
import { PatientFlowView } from "./PatientFlowView";
import { FollowUpView } from "./FollowUpView";

export function DoctorDashboard() {
  const [activeView, setActiveView] = useDashboardView();

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
    </div>
  );
}
