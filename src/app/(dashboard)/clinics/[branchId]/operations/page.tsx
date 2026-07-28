"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { useOperationsManager } from "@/features/clinics/hooks/useOperationsManager";
import { OperationsList } from "@/features/clinics/components/surgical/OperationsList";
import { ScheduleOperationModal } from "@/features/clinics/components/surgical/ScheduleOperationModal";
import { SupplyOrderModal } from "@/features/clinics/components/surgical/SupplyOrderModal";

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default function SurgicalOperationsPage({ params }: PageProps) {
  // Use React 19 `use` hook to unwrap params
  const { branchId } = use(params);
  
  const manager = useOperationsManager(branchId);

  if (manager.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-pharmako-care" />
        <p className="text-sm">Cargando agenda quirúrgica...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300">
      
      <OperationsList
        operationsList={manager.operationsList}
        searchQuery={manager.searchQuery}
        setSearchQuery={manager.setSearchQuery}
        filterStatus={manager.filterStatus}
        setFilterStatus={manager.setFilterStatus}
        onOpenSchedule={() => manager.setIsScheduleModalOpen(true)}
        onOpenSupplyOrder={(op) => manager.setActiveOperationForSupply(op)}
      />

      <ScheduleOperationModal
        isOpen={manager.isScheduleModalOpen}
        onClose={() => manager.setIsScheduleModalOpen(false)}
        roomsList={manager.roomsList}
        onSchedule={(data) => manager.scheduleOperation(data as any)}
        isScheduling={manager.isScheduling}
      />

      {manager.activeOperationForSupply && (
        <SupplyOrderModal
          isOpen={!!manager.activeOperationForSupply}
          onClose={() => manager.setActiveOperationForSupply(null)}
          operation={manager.activeOperationForSupply}
          onCreate={(data) => manager.createSupplyOrder(data as any)}
          isCreating={manager.isCreatingSupplyOrder}
        />
      )}

    </div>
  );
}
