import { useState, useMemo } from "react";
import { useRoomsQuery, useAdmissionsQuery, useCreateAdmissionMutation } from "../api/useInpatient";

export function useAdmissionsManager(branchId: string) {
  const { data: roomsData = [], isLoading: isLoadingRooms } = useRoomsQuery(branchId);
  const { data: admissionsData = [], isLoading: isLoadingAdmissions } = useAdmissionsQuery(branchId);
  const createMutation = useCreateAdmissionMutation(branchId);

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Kanban Board Columns setup
  const boardColumns = useMemo(() => {
    // Structure:
    // PENDING (Waiting for bed)
    // ACTIVE (Admitted)
    // DISCHARGED
    const columns = {
      PENDING: { id: "PENDING", title: "Pendientes", items: [] as any[] },
      ACTIVE: { id: "ACTIVE", title: "Ingresados", items: [] as any[] },
      DISCHARGED: { id: "DISCHARGED", title: "Alta", items: [] as any[] },
    };

    // Enrich admissions with bed info
    const enrichedAdmissions = admissionsData.map((adm: any) => {
      // Find room and bed
      let bedDetails = null;
      let roomDetails = null;
      for (const room of roomsData) {
        const bed = room.beds?.find((b: any) => (b.id || b.uuid) === (adm.clinic_bed_id || adm.clinicBedUuid));
        if (bed) {
          bedDetails = bed;
          roomDetails = room;
          break;
        }
      }
      return {
        ...adm,
        bedNumber: bedDetails?.bed_number || bedDetails?.bedNumber || "N/A",
        roomName: roomDetails?.name || "N/A",
      };
    }).filter((adm: any) => {
      if (!searchQuery) return true;
      return (adm.patient_account_id || adm.patientUuid).toLowerCase().includes(searchQuery.toLowerCase());
    });

    enrichedAdmissions.forEach((adm: any) => {
      const status = adm.status as keyof typeof columns;
      if (columns[status]) {
        columns[status].items.push(adm);
      }
    });

    return columns;
  }, [admissionsData, roomsData, searchQuery]);

  return {
    boardColumns,
    roomsList: roomsData, // For the select dropdown in the modal
    isLoading: isLoadingRooms || isLoadingAdmissions,
    searchQuery,
    setSearchQuery,
    isNewModalOpen,
    setIsNewModalOpen,
    createAdmission: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
