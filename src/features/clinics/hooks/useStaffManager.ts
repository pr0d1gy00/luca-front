import { useState, useMemo } from "react";
import { useStaffQuery, useInviteStaffMutation, useUpdateStaffMutation } from "../api/useStaff";
import { useRolesQuery } from "../api/useOrganization";

export function useStaffManager(branchId: string) {
  const { data: staffData = [], isLoading: isLoadingStaff } = useStaffQuery(branchId);
  const { data: rolesData = [], isLoading: isLoadingRoles } = useRolesQuery(branchId);
  const inviteMutation = useInviteStaffMutation(branchId);
  const updateMutation = useUpdateStaffMutation(branchId);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Mapear el ID del rol a su nombre para fácil acceso
  const roleMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const role of rolesData) {
      map[role.id || role.uuid] = role.name;
    }
    return map;
  }, [rolesData]);

  // Filtrado y enriquecimiento del personal
  const filteredStaff = useMemo(() => {
    return staffData
      .map((staffItem: any) => ({
        ...staffItem,
        roleName: roleMap[staffItem.clinic_role_id || staffItem.clinicRoleUuid] || "Unknown Role",
      }))
      .filter((staffItem: any) => {
        const matchesRole = filterRole === "ALL" || (staffItem.clinic_role_id || staffItem.clinicRoleUuid) === filterRole;
        // Search by ID/UUID since we might not have user details populated offline yet
        // In a real app, user search would filter by user's full name.
        const matchesSearch =
          searchQuery === "" ||
          (staffItem.user_id || staffItem.userUuid).toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRole && matchesSearch;
      });
  }, [staffData, roleMap, filterRole, searchQuery]);

  return {
    staffList: filteredStaff,
    rolesList: rolesData,
    isLoading: isLoadingStaff || isLoadingRoles,
    searchQuery,
    setSearchQuery,
    filterRole,
    setFilterRole,
    isInviteModalOpen,
    setIsInviteModalOpen,
    inviteStaff: inviteMutation.mutate,
    isInviting: inviteMutation.isPending,
    updateStaff: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
