"use client";

import { useState } from "react";
import { useForm as useReactHookForm, useFieldArray } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

interface SupplyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: any;
  onCreate: (data: any) => void;
  isCreating: boolean;
}

export function SupplyOrderModal({ isOpen, onClose, operation, onCreate, isCreating }: SupplyOrderModalProps) {
  const { register, control, handleSubmit, setValue, reset, formState: { errors } } = useReactHookForm({
    defaultValues: {
      provider_type: "PHARMACY",
      items: [{ itemName: "", quantity: 1, notes: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const onSubmit = (data: any) => {
    onCreate({
      operation_id: operation.id || operation.uuid,
      provider_type: data.provider_type,
      items: data.items,
    });
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white border border-slate-200 shadow-none">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Pedido de Insumos (Recipe)
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Cirugía de Pte: {operation?.patient_account_id?.split("-")[0] || operation?.patientUuid?.split("-")[0]}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Destino del Pedido</label>
            <Select onValueChange={(val) => setValue("provider_type", val)} defaultValue="PHARMACY">
              <SelectTrigger className="border-slate-200 focus:ring-pharmako-care">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHARMACY">Farmacia Interna</SelectItem>
                <SelectItem value="LAB">Laboratorio Central</SelectItem>
                <SelectItem value="MEDICAL_SUPPLY">Casa de Insumos Médicos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">Artículos solicitados</label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ itemName: "", quantity: 1, notes: "" })} className="h-7 text-xs border-slate-200">
                <Plus className="w-3 h-3 mr-1" />
                Añadir
              </Button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start bg-slate-50 p-2 border border-slate-100 rounded">
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="Nombre del insumo / medicamento" 
                      {...register(`items.${index}.itemName` as const, { required: true })}
                      className="h-8 text-sm border-slate-200 focus-visible:ring-pharmako-care"
                    />
                    <Input 
                      placeholder="Notas (opcional)" 
                      {...register(`items.${index}.notes` as const)}
                      className="h-8 text-sm border-slate-200 focus-visible:ring-pharmako-care"
                    />
                  </div>
                  <Input 
                    type="number" 
                    placeholder="Cant." 
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true, required: true, min: 1 })}
                    className="h-8 w-20 text-sm border-slate-200 focus-visible:ring-pharmako-care"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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
              disabled={isCreating || fields.length === 0}
              className="bg-pharmako-care text-white hover:bg-[#1dbec3] border border-transparent"
            >
              {isCreating ? "Enviando..." : "Emitir Pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
