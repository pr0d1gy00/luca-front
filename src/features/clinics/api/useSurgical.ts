"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SurgicalOperation, SurgeryTeamMember, SupplyOrder, SupplyOrderItem } from "../types";

export function useOperationsQuery(branchId: string) {
  return useQuery({
    queryKey: ["clinic-operations", branchId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/clinics/${branchId}/operations`);
        for (const op of data) {
          const opObj: SurgicalOperation = {
            uuid: op.id,
            branchId: op.branch_id,
            patientUuid: op.patient_account_id,
            roomUuid: op.room_id,
            scheduledDate: op.scheduled_date,
            estimatedDuration: op.estimated_duration,
            status: op.status,
            createdAt: op.created_at || new Date().toISOString(),
            updatedAt: op.updated_at || new Date().toISOString(),
          };
          await db.surgicalOperations.put(opObj);
        }
        return data;
      } catch (error) {
        console.warn("[useOperationsQuery] Failed, fallback to Dexie", error);
        const ops = await db.surgicalOperations.where("branchId").equals(branchId).toArray();
        return ops.map(op => ({ ...op, id: op.uuid }));
      }
    },
    enabled: !!branchId,
  });
}

export function useScheduleOperationMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { patient_account_id: string; room_id: string; scheduled_date: string; estimated_duration: number; status: string }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const opRecord: SurgicalOperation = {
          uuid,
          branchId,
          patientUuid: payload.patient_account_id,
          roomUuid: payload.room_id,
          scheduledDate: payload.scheduled_date,
          estimatedDuration: payload.estimated_duration,
          status: payload.status as any,
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.surgicalOperations.add(opRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "surgical_operations",
          action: "create",
          data: opRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return opRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/operations`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-operations", branchId] });
      toast.success("Cirugía programada");
    },
    onError: (error: any) => {
      toast.error("Error al programar cirugía", { description: error.message });
    },
  });
}

export function useCreateSupplyOrderMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { operation_id: string; provider_type: "PHARMACY" | "LAB" | "MEDICAL_SUPPLY"; items: { itemName: string; quantity: number; notes?: string }[] }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const orderRecord: SupplyOrder = {
          uuid,
          operationUuid: payload.operation_id,
          providerType: payload.provider_type,
          status: "DRAFT",
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.supplyOrders.add(orderRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "supply_orders",
          action: "create",
          data: orderRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });

        // Add items
        for (const item of payload.items) {
          const itemRecord: SupplyOrderItem = {
            uuid: uuidv4(),
            supplyOrderUuid: uuid,
            itemName: item.itemName,
            quantity: item.quantity,
            notes: item.notes || "",
            createdAt: dateStr,
            updatedAt: dateStr,
            _syncStatus: "created",
          };
          await db.supplyOrderItems.add(itemRecord);
          await db.syncQueue.add({
            id: uuidv4(),
            entity: "supply_order_items",
            action: "create",
            data: itemRecord,
            timestamp: dateStr,
            retryCount: 0,
            maxRetries: 3,
          });
        }
        return orderRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/supply-orders`, payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      toast.success("Orden de insumos generada");
    },
    onError: (error: any) => {
      toast.error("Error al generar orden", { description: error.message });
    },
  });
}
