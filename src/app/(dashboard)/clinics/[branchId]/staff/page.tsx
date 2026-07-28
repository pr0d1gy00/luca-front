"use client";

import { use, useEffect } from "react";
import { useStaffManager } from "@/features/clinics/hooks/useStaffManager";
import { StaffList } from "@/features/clinics/components/staff/StaffList";
import { InviteStaffModal } from "@/features/clinics/components/staff/InviteStaffModal";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{ branchId: string }>;
}

export default function ClinicStaffPage({ params }: PageProps) {
  // Use React 19 `use` hook to unwrap params
  const { branchId } = use(params);
  
  const manager = useStaffManager(branchId);

  if (manager.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-pharmako-care" />
        <p className="text-sm">Cargando personal...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      
      <StaffList
        staffList={manager.staffList}
        rolesList={manager.rolesList}
        searchQuery={manager.searchQuery}
        setSearchQuery={manager.setSearchQuery}
        filterRole={manager.filterRole}
        setFilterRole={manager.setFilterRole}
        onOpenInvite={() => manager.setIsInviteModalOpen(true)}
      />

      <InviteStaffModal 
        isOpen={manager.isInviteModalOpen}
        onClose={() => manager.setIsInviteModalOpen(false)}
        rolesList={manager.rolesList}
        onInvite={(data) => manager.inviteStaff(data as any)}
        isInviting={manager.isInviting}
      />

    </div>
  );
}
