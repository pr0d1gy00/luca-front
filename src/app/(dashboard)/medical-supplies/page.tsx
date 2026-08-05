import { DashboardCards } from "@/features/medical-supplies/components";

export const metadata = {
  title: "Medical Supplies Dashboard - LUCA",
  description: "Overview of your medical supplies operations and performance.",
};

export default function MedicalSuppliesDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Medical Supplies Dashboard
        </h2>
      </div>
      <div className="space-y-4">
        <DashboardCards />
      </div>
    </div>
  );
}
