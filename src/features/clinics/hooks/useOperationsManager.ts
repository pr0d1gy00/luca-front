import { useState, useMemo } from "react";
import { useOperationsQuery, useScheduleOperationMutation, useCreateSupplyOrderMutation } from "../api/useSurgical";
import { useRoomsQuery } from "../api/useInpatient"; // To pick surgical rooms (ORs)

export function useOperationsManager(branchId: string) {
  // Solo queremos salas quirúrgicas. Se podría filtrar por statusFilter o similar,
  // pero lo filtramos en cliente si no hay endpoint específico. Asumiremos que roomsData trae Quirófanos.
  const { data: roomsData = [], isLoading: isLoadingRooms } = useRoomsQuery(branchId);
  const { data: operationsData = [], isLoading: isLoadingOps } = useOperationsQuery(branchId);
  
  const scheduleMutation = useScheduleOperationMutation(branchId);
  const supplyMutation = useCreateSupplyOrderMutation(branchId);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Extra state for generating a supply order for a specific operation
  const [activeOperationForSupply, setActiveOperationForSupply] = useState<any>(null);

  const filteredOperations = useMemo(() => {
    return operationsData
      .map((op: any) => {
        const room = roomsData.find((r: any) => (r.id || r.uuid) === (op.room_id || op.roomUuid));
        return {
          ...op,
          roomName: room?.name || "Sala Desconocida",
        };
      })
      .filter((op: any) => {
        const matchesStatus = filterStatus === "ALL" || op.status === filterStatus;
        const matchesSearch =
          searchQuery === "" ||
          (op.patient_account_id || op.patientUuid).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a: any, b: any) => {
        // Sort by scheduled date
        const dateA = new Date(a.scheduled_date || a.scheduledDate).getTime();
        const dateB = new Date(b.scheduled_date || b.scheduledDate).getTime();
        return dateA - dateB;
      });
  }, [operationsData, roomsData, searchQuery, filterStatus]);

  return {
    operationsList: filteredOperations,
    roomsList: roomsData, // We can filter here just for ORs if we had a type
    isLoading: isLoadingRooms || isLoadingOps,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    
    isScheduleModalOpen,
    setIsScheduleModalOpen,
    scheduleOperation: scheduleMutation.mutate,
    isScheduling: scheduleMutation.isPending,
    
    activeOperationForSupply,
    setActiveOperationForSupply,
    createSupplyOrder: supplyMutation.mutate,
    isCreatingSupplyOrder: supplyMutation.isPending,
  };
}
