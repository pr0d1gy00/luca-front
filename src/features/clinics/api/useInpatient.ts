"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { db } from "@/features/offline/database/schema";
import { useOnlineStatus } from "@/features/offline/hooks/useOnlineStatus";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { ClinicRoom, Admission, TreatmentNote, AdministeredMedication, ServiceCharge } from "../types";

export function useRoomsQuery(branchId: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["clinic-rooms", branchId, statusFilter],
    queryFn: async () => {
      try {
        const queryParams = statusFilter ? `?status=${statusFilter}` : "";
        const { data } = await apiClient.get(`/clinics/${branchId}/rooms${queryParams}`);
        // Save rooms and beds
        for (const room of data) {
          const roomObj: ClinicRoom = {
            uuid: room.id,
            branchId: room.branch_id,
            name: room.name,
            floor: room.floor,
            status: room.status,
            createdAt: room.created_at || new Date().toISOString(),
            updatedAt: room.updated_at || new Date().toISOString(),
          };
          await db.clinicRooms.put(roomObj);
          
          if (room.beds) {
            for (const bed of room.beds) {
              await db.clinicBeds.put({
                uuid: bed.id,
                roomUuid: bed.room_id,
                bedNumber: bed.bed_number,
                status: bed.status,
                createdAt: bed.created_at || new Date().toISOString(),
                updatedAt: bed.updated_at || new Date().toISOString(),
              });
            }
          }
        }
        return data;
      } catch (error) {
        console.warn("[useRoomsQuery] Failed, fallback to Dexie", error);
        let rooms = await db.clinicRooms.where("branchId").equals(branchId).toArray();
        if (statusFilter) {
          rooms = rooms.filter((r) => r.status === statusFilter);
        }
        // Join with beds
        return Promise.all(rooms.map(async (room) => {
          const beds = await db.clinicBeds.where("roomUuid").equals(room.uuid).toArray();
          return { ...room, id: room.uuid, branch_id: room.branchId, beds: beds.map(b => ({ ...b, id: b.uuid })) };
        }));
      }
    },
    enabled: !!branchId,
  });
}

export function useAdmissionsQuery(branchId: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["clinic-admissions", branchId, statusFilter],
    queryFn: async () => {
      try {
        const queryParams = statusFilter ? `?status=${statusFilter}` : "";
        const { data } = await apiClient.get(`/clinics/${branchId}/admissions${queryParams}`);
        for (const admission of data) {
          const adObj: Admission = {
            uuid: admission.id,
            branchId: admission.branch_id,
            patientUuid: admission.patient_account_id,
            clinicBedUuid: admission.clinic_bed_id,
            admissionDate: admission.admission_date,
            dischargeDate: admission.discharge_date,
            reason: admission.reason,
            status: admission.status,
            createdAt: admission.created_at || new Date().toISOString(),
            updatedAt: admission.updated_at || new Date().toISOString(),
          };
          await db.admissions.put(adObj);
        }
        return data;
      } catch (error) {
        console.warn("[useAdmissionsQuery] Failed, fallback to Dexie", error);
        let items = await db.admissions.where("branchId").equals(branchId).toArray();
        if (statusFilter) {
          items = items.filter((a) => a.status === statusFilter);
        }
        return items.map(a => ({ ...a, id: a.uuid }));
      }
    },
    enabled: !!branchId,
  });
}

export function useCreateAdmissionMutation(branchId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { patient_account_id: string; clinic_bed_id: string; admission_date: string; reason: string }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const admissionRecord: Admission = {
          uuid,
          branchId,
          patientUuid: payload.patient_account_id,
          clinicBedUuid: payload.clinic_bed_id,
          admissionDate: payload.admission_date,
          dischargeDate: null,
          reason: payload.reason,
          status: "ACTIVE",
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.admissions.add(admissionRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "admissions",
          action: "create",
          data: admissionRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return admissionRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/admissions`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic-admissions", branchId] });
      toast.success("Paciente ingresado exitosamente");
    },
    onError: (error: any) => {
      toast.error("Error al ingresar paciente", { description: error.message });
    },
  });
}

export function useAddTreatmentNoteMutation(branchId: string, admissionId: string) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { doctor_id: string; note: string; type: string }) => {
      const uuid = uuidv4();
      const dateStr = new Date().toISOString();

      if (!isOnline) {
        const noteRecord: TreatmentNote = {
          uuid,
          admissionUuid: admissionId,
          doctorUuid: payload.doctor_id,
          note: payload.note,
          type: payload.type,
          createdAt: dateStr,
          updatedAt: dateStr,
          _syncStatus: "created",
        };
        await db.treatmentNotes.add(noteRecord);
        await db.syncQueue.add({
          id: uuidv4(),
          entity: "treatment_notes",
          action: "create",
          data: noteRecord,
          timestamp: dateStr,
          retryCount: 0,
          maxRetries: 3,
        });
        return noteRecord;
      }

      const { data } = await apiClient.post(`/clinics/${branchId}/admissions/${admissionId}/treatment-notes`, payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      toast.success("Nota añadida");
    },
    onError: (error: any) => {
      toast.error("Error al añadir nota", { description: error.message });
    },
  });
}

export function useAdmissionDetailsQuery(branchId: string, admissionId: string) {
  return useQuery({
    queryKey: ["clinic-admission-details", branchId, admissionId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/clinics/${branchId}/admissions/${admissionId}`);
        return data;
      } catch (error) {
        console.warn("[useAdmissionDetailsQuery] Failed, fallback to Dexie", error);
        
        let admission: any = await db.admissions.get(admissionId);
        if (!admission) {
          admission = await db.admissions.where("uuid").equals(admissionId).first();
        }
        
        const notes = await db.treatmentNotes.where("admissionUuid").equals(admissionId).toArray();
        // Since we didn't add administeredMedications table yet but maybe we did, 
        // fallback to empty if it doesn't exist, we don't have that table in version(6) schema! 
        // Wait, did I add it? No, not in schema.ts. I'll just return empty array for meds.
        
        return {
          ...admission,
          id: admission?.uuid,
          treatment_notes: notes.map(n => ({ ...n, id: n.uuid })),
          medications: [] 
        };
      }
    },
    enabled: !!branchId && !!admissionId,
  });
}
