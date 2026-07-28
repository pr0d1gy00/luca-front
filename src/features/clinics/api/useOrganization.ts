"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ClinicDepartment, ClinicRole } from "../types";

export function useDepartmentsQuery(branchId: string) {
  return useQuery({
    queryKey: ["clinic-departments", branchId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/clinics/${branchId}/departments`);
        // Sync to Dexie
        for (const dept of data) {
          const deptObj = {
            uuid: dept.id,
            branchId: dept.branch_id,
            name: dept.name,
            description: dept.description,
            isActive: dept.is_active,
            createdAt: dept.created_at || new Date().toISOString(),
            updatedAt: dept.updated_at || new Date().toISOString(),
          };
          await db.clinicDepartments.put(deptObj);
        }
        return data;
      } catch (error) {
        console.warn("[useDepartmentsQuery] Failed, fallback to Dexie", error);
        return await db.clinicDepartments.where("branchId").equals(branchId).toArray();
      }
    },
    enabled: !!branchId,
  });
}

export function useCreateDepartmentMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const deptRecord: ClinicDepartment = {
          uuid,
          branchId,
          name: payload.name,
          description: payload.description || "",
          isActive: true,
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.clinicDepartments.add(deptRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "clinic_departments",
          action: "create",
          data: deptRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return deptRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/departments`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-departments", branchId] });
      toast.success("Departamento creado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al crear departamento", { description: error.message });
    },
  });
}

export function useRolesQuery(branchId: string) {
  return useQuery({
    queryKey: ["clinic-roles", branchId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/clinics/${branchId}/roles`);
        for (const role of data) {
          const roleObj: ClinicRole = {
            uuid: role.id,
            branchId: role.branch_id,
            name: role.name,
            permissions: role.permissions,
            createdAt: role.created_at || new Date().toISOString(),
            updatedAt: role.updated_at || new Date().toISOString(),
          };
          await db.clinicRoles.put(roleObj);
        }
        return data;
      } catch (error) {
        console.warn("[useRolesQuery] Failed, fallback to Dexie", error);
        return await db.clinicRoles.where("branchId").equals(branchId).toArray();
      }
    },
    enabled: !!branchId,
  });
}

export function useCreateRoleMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; permissions: string[] }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();
      const permsObj = payload.permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {});

      if (!isOnline) {
        const roleRecord: ClinicRole = {
          uuid,
          branchId,
          name: payload.name,
          permissions: permsObj,
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.clinicRoles.add(roleRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "clinic_roles",
          action: "create",
          data: roleRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return roleRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/roles`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-roles", branchId] });
      toast.success("Rol creado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al crear rol", { description: error.message });
    },
  });
}
