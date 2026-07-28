"use client";

import { use } from "react";
import { useAdmissionsManager } from "@/features/clinics/hooks/useAdmissionsManager";
import { AdmissionsBoard } from "@/features/clinics/components/admissions/AdmissionsBoard";
import { NewAdmissionModal } from "@/features/clinics/components/admissions/NewAdmissionModal";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default function AdmissionsPage({ params }: PageProps) {
  // Use React 19 `use` hook to unwrap params
  const { branchId } = use(params);
  
  const manager = useAdmissionsManager(branchId);

  if (manager.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-pharmako-care" />
        <p className="text-sm">Cargando admisiones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-300 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <AdmissionsBoard
        boardColumns={manager.boardColumns}
        searchQuery={manager.searchQuery}
        setSearchQuery={manager.setSearchQuery}
        onOpenNew={() => manager.setIsNewModalOpen(true)}
      />

      <NewAdmissionModal
        isOpen={manager.isNewModalOpen}
        onClose={() => manager.setIsNewModalOpen(false)}
        roomsList={manager.roomsList}
        onCreate={(data) => manager.createAdmission(data as any)}
        isCreating={manager.isCreating}
      />
    </div>
  );
}
