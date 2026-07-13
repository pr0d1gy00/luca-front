import { LabRequestsList } from "@/features/labs/components/LabRequestsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pedidos de Laboratorio | LUCA Health OS",
  description: "Gestión de pedidos y órdenes de exámenes clínicos de laboratorio.",
};

export default function LaboratoriosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <LabRequestsList />
    </div>
  );
}
