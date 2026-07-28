"use client";

import { useForm } from "react-query-form"; // Or whatever form solution you use, using RHF:
import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteStaffSchema, InviteStaffFormData } from "../../schemas";

// UI Components (Shadcn assumptions)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  rolesList: any[];
  onInvite: (data: InviteStaffFormData) => void;
  isInviting: boolean;
}

export function InviteStaffModal({ isOpen, onClose, rolesList, onInvite, isInviting }: InviteStaffModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useReactHookForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      status: "PENDING",
    },
  });

  const onSubmit = (data: InviteStaffFormData) => {
    onInvite(data);
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Invitar Médico / Personal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">User UUID (temporal por ahora)</label>
            <Input 
              {...register("user_id")} 
              placeholder="Ej: e58ed763-928c-4155-bee9-fdbaaadc15f3"
              className="border-slate-200 focus-visible:ring-pharmako-care"
            />
            {errors.user_id && <span className="text-xs text-red-500">{errors.user_id.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Rol en la Clínica</label>
            <Select onValueChange={(val) => setValue("clinic_role_id", val)}>
              <SelectTrigger className="border-slate-200 focus:ring-pharmako-care">
                <SelectValue placeholder="Seleccionar un rol" />
              </SelectTrigger>
              <SelectContent>
                {rolesList.map((r) => (
                  <SelectItem key={r.id || r.uuid} value={r.id || r.uuid}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clinic_role_id && <span className="text-xs text-red-500">{errors.clinic_role_id.message}</span>}
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
              disabled={isInviting}
              className="bg-pharmako-care text-white hover:bg-[#1dbec3] border border-transparent"
            >
              {isInviting ? "Invitando..." : "Invitar Personal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
