import { SettingsForm } from "@/features/medical-supplies/components";

export const metadata = {
  title: "Settings - Medical Supplies - LUCA",
  description:
    "Configure your medical supplies preferences, operations, and auto-matching.",
};

export default function MedicalSuppliesSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h2>
      </div>
      <div className="max-w-2xl">
        <SettingsForm />
      </div>
    </div>
  );
}
