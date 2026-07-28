"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ClinicStaff } from "../types";

export function useStaffQuery(branchId: string) {
  return useQuery({
    queryKey: ["clinic-staff", branchId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/clinics/${branchId}/staff`);
        for (const staff of data) {
          const staffObj: ClinicStaff = {
            uuid: staff.id,
            branchId: staff.branch_id,
            userUuid: staff.user_id,
            clinicRoleUuid: staff.clinic_role_id,
            status: staff.status,
            createdAt: staff.created_at || new Date().toISOString(),
            updatedAt: staff.updated_at || new Date().toISOString(),
          };
          await db.clinicStaff.put(staffObj);
        }
        return data;
      } catch (error) {
        console.warn("[useStaffQuery] Failed, fallback to Dexie", error);
        return await db.clinicStaff.where("branchId").equals(branchId).toArray();
      }
    },
    enabled: !!branchId,
  });
}

export function useInviteStaffMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { user_id: string; clinic_role_id: string; status: "PENDING" | "ACTIVE" | "INACTIVE" }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const staffRecord: ClinicStaff = {
          uuid,
          branchId,
          userUuid: payload.user_id,
          clinicRoleUuid: payload.clinic_role_id,
          status: payload.status,
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.clinicStaff.add(staffRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "clinic_staff",
          action: "create",
          data: staffRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return staffRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/staff`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-staff", branchId] });
      toast.success("Personal asignado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al asignar personal", { description: error.message });
    },
  });
}

export function useUpdateStaffMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; clinic_role_id?: string; status?: "PENDING" | "ACTIVE" | "INACTIVE" }) => {
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const existing = await db.clinicStaff.get(payload.id);
        if (!existing) throw new Error("Staff no encontrado en BD local");

        const updatedRecord: ClinicStaff = {
          ...existing,
          clinicRoleUuid: payload.clinic_role_id || existing.clinicRoleUuid,
          status: payload.status || existing.status,
          updatedAt: dateStr,
          _syncStatus: existing._syncStatus === "created" ? "created" : "updated",
        };

        await db.clinicStaff.put(updatedRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "clinic_staff",
          action: "update",
          data: updatedRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return updatedRecord;
      }

      const { data } = await apiClient.put(`/clinics/${branchId}/staff/${payload.id}`, {
        clinic_role_id: payload.clinic_role_id,
        status: payload.status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-staff", branchId] });
      toast.success("Personal actualizado");
    },
    onError: (error: any) => {
      toast.error("Error al actualizar personal", { description: error.message });
    },
  });
}
