"use client";

import { useAuthStore } from "@/store/auth";
import { ServicesDashboardView } from "@/features/services";

export default function ServicesDashboardPage() {
  const { user, role } = useAuthStore();
  const providerUuid =
    (user as { uuid?: string; id?: string })?.uuid ||
    (user as { uuid?: string; id?: string })?.id ||
    "00000000-0000-0000-0000-000000000000";
  const providerType = role === "clinic" ? "CLINIC" : "DOCTOR";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ServicesDashboardView
        providerUuid={providerUuid}
        providerType={providerType}
      />
    </div>
  );
}
