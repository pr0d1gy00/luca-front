"use client";

import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema, AdmissionFormData } from "../../schemas";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomsList: any[];
  onCreate: (data: AdmissionFormData) => void;
  isCreating: boolean;
}

export function NewAdmissionModal({ isOpen, onClose, roomsList, onCreate, isCreating }: NewAdmissionModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useReactHookForm<AdmissionFormData>({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = (data: AdmissionFormData) => {
    onCreate(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Nueva Admisión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Patient UUID (Temporal)</label>
            <Input 
              {...register("patient_account_id")} 
              placeholder="Ej: a1b2c3d4-..."
              className="border-slate-200 focus-visible:ring-pharmako-care"
            />
            {errors.patient_account_id && <span className="text-xs text-red-500">{errors.patient_account_id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Habitación y Cama</label>
            <Select onValueChange={(val) => setValue("clinic_bed_id", val)}>
              <SelectTrigger className="border-slate-200 focus:ring-pharmako-care">
                <SelectValue placeholder="Seleccionar cama disponible" />
              </SelectTrigger>
              <SelectContent>
                {roomsList.map((room) => (
                  <SelectGroup key={room.id || room.uuid}>
                    <SelectLabel>{room.name}</SelectLabel>
                    {(room.beds || []).map((bed: any) => (
                      <SelectItem 
                        key={bed.id || bed.uuid} 
                        value={bed.id || bed.uuid}
                        disabled={bed.status !== "AVAILABLE"}
                      >
                        Cama {bed.bed_number || bed.bedNumber} ({bed.status})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {errors.clinic_bed_id && <span className="text-xs text-red-500">{errors.clinic_bed_id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Motivo de Admisión</label>
            <Textarea
              {...register("reason")}
              placeholder="Describa el motivo..."
              className="border-slate-200 focus-visible:ring-pharmako-care min-h-[80px]"
            />
            {errors.reason && <span className="text-xs text-red-500">{errors.reason.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fecha de Admisión</label>
            <Input 
              type="datetime-local"
              {...register("admission_date")} 
              className="border-slate-200 focus-visible:ring-pharmako-care"
            />
            {errors.admission_date && <span className="text-xs text-red-500">{errors.admission_date.message}</span>}
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
              disabled={isCreating}
              className="bg-pharmako-care text-white hover:bg-[#1dbec3] border border-transparent"
            >
              {isCreating ? "Ingresando..." : "Ingresar Paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
