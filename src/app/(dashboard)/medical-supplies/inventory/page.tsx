import {
  InventoryTable,
  InventoryItemForm,
} from "@/features/medical-supplies/components";

export const metadata = {
  title: "Inventory - Medical Supplies - LUCA",
  description: "Manage your medical supplies inventory.",
};

export default function MedicalSuppliesInventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Inventory
        </h2>
        <div className="flex items-center space-x-2">
          <InventoryItemForm />
        </div>
      </div>
      <div className="space-y-4">
        <InventoryTable />
      </div>
    </div>
  );
}
