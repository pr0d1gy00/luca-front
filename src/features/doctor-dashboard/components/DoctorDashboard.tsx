"use client";

import { DashboardSwitcher, useDashboardView } from "./DashboardSwitcher";
import { DoctorGreeting } from "./DoctorGreeting";
import { ResumenView } from "./ResumenView";
import { PatientFlowView } from "./PatientFlowView";
import { FollowUpView } from "./FollowUpView";

export function DoctorDashboard() {
  const [activeView, setActiveView] = useDashboardView();

  return (
    <div className="space-y-6">
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
