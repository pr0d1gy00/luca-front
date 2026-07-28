"use client";

import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { operationSchema, OperationFormData } from "../../schemas";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomsList: any[];
  onSchedule: (data: OperationFormData) => void;
  isScheduling: boolean;
}

export function ScheduleOperationModal({ isOpen, onClose, roomsList, onSchedule, isScheduling }: ScheduleOperationModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useReactHookForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: {
      status: "SCHEDULED",
    }
  });

  const onSubmit = (data: OperationFormData) => {
    onSchedule(data);
    reset();
    onClose();
  };

  // Asumimos que los rooms de tipo "QUIRÓFANO" o similar pueden filtrarse,
  // por ahora mostramos todos
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Programar Cirugía</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Patient UUID</label>
            <Input 
              {...register("patient_account_id")} 
              placeholder="Ej: f47ac10b-..."
              className="border-slate-200 focus-visible:ring-pharmako-care"
            />
            {errors.patient_account_id && <span className="text-xs text-red-500">{errors.patient_account_id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Sala (Quirófano)</label>
            <Select onValueChange={(val) => setValue("room_id", val)}>
              <SelectTrigger className="border-slate-200 focus:ring-pharmako-care">
                <SelectValue placeholder="Seleccionar Quirófano" />
              </SelectTrigger>
              <SelectContent>
                {roomsList.map((r) => (
                  <SelectItem key={r.id || r.uuid} value={r.id || r.uuid}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.room_id && <span className="text-xs text-red-500">{errors.room_id.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Fecha/Hora</label>
              <Input 
                type="datetime-local"
                {...register("scheduled_date")} 
                className="border-slate-200 focus-visible:ring-pharmako-care"
              />
              {errors.scheduled_date && <span className="text-xs text-red-500">{errors.scheduled_date.message}</span>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Duración (min)</label>
              <Input 
                type="number"
                {...register("estimated_duration", { valueAsNumber: true })} 
                className="border-slate-200 focus-visible:ring-pharmako-care"
              />
              {errors.estimated_duration && <span className="text-xs text-red-500">{errors.estimated_duration.message}</span>}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isScheduling}
              className="bg-pharmako-care text-white hover:bg-[#1dbec3] border border-transparent"
            >
              {isScheduling ? "Guardando..." : "Programar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
