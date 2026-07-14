"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  Activity, 
  Info,
  Calendar,
  Layers
} from "lucide-react";
import { 
  useGlobalServices, 
  useProviderServices, 
  useSaveProviderService, 
  useDeleteProviderService 
} from "../hooks/useServices";
import { serviceCategoryLabels } from "../schemas";
import type { ProviderService, Service } from "../schemas";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface ServiceManagerProps {
  providerUuid: string;
  providerType: "DOCTOR" | "CLINIC";
}

export function ServiceManager({ providerUuid, providerType }: ServiceManagerProps) {
  const { data: globalServices = [], isLoading: loadingGlobal } = useGlobalServices();
  const { data: providerServices = [], isLoading: loadingProvider } = useProviderServices(providerUuid);
  const saveMutation = useSaveProviderService(providerUuid);
  const deleteMutation = useDeleteProviderService(providerUuid);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ProviderService> | null>(null);

  // Form states
  const [selectedServiceUuid, setSelectedServiceUuid] = useState("");
  const [price, setPrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [isStandaloneBookable, setIsStandaloneBookable] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const handleOpenAdd = () => {
    setEditingService(null);
    setSelectedServiceUuid("");
    setPrice("");
    setDurationMinutes("20");
    setIsStandaloneBookable(false);
    setCustomName("");
    setCustomDescription("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (pSvc: ProviderService) => {
    setEditingService(pSvc);
    setSelectedServiceUuid(pSvc.serviceUuid);
    setPrice(pSvc.price.toString());
    setDurationMinutes(pSvc.durationMinutes.toString());
    setIsStandaloneBookable(pSvc.isStandaloneBookable);
    setCustomName(pSvc.customName || "");
    setCustomDescription(pSvc.customDescription || "");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceUuid || !price || !durationMinutes) return;

    await saveMutation.mutateAsync({
      uuid: editingService?.uuid,
      serviceUuid: selectedServiceUuid,
      price: parseFloat(price),
      durationMinutes: parseInt(durationMinutes, 10),
      isStandaloneBookable,
      isActive: editingService ? (editingService.isActive ?? true) : true,
      customName: customName || undefined,
      customDescription: customDescription || undefined,
      providerType,
    });

    setIsDialogOpen(false);
  };

  const handleDelete = async (uuid: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este servicio de tu oferta?")) {
      await deleteMutation.mutateAsync(uuid);
    }
  };

  const getGlobalService = (serviceUuid: string): Service | undefined => {
    return globalServices.find((s) => s.uuid === serviceUuid);
  };

  const isLoading = loadingGlobal || loadingProvider;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Portafolio de Servicios Médicos
          </h2>
          <p className="text-slate-500 mt-1">
            Administrá los servicios, precios, tiempos de consulta y disponibilidad para reserva directa.
          </p>
        </div>
        <Button 
          onClick={handleOpenAdd} 
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 rounded-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Servicio</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-slate-100 rounded-2xl border border-slate-100" />
          ))}
        </div>
      ) : providerServices.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-full mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <CardTitle className="text-slate-900 font-medium">No ofrecés servicios aún</CardTitle>
            <CardDescription className="max-w-md mt-2 text-slate-500">
              Agregá procedimientos, exámenes o consultas especializadas de nuestro catálogo para cargarlos a tus pacientes o permitir reservas online.
            </CardDescription>
            <Button onClick={handleOpenAdd} className="mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
              Configurar primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerServices.map((pSvc) => {
            const baseSvc = getGlobalService(pSvc.serviceUuid);
            const displayName = pSvc.customName || baseSvc?.name || "Servicio no especificado";
            const displayDesc = pSvc.customDescription || baseSvc?.description;
            const category = baseSvc?.category || "OTHER";

            return (
              <Card 
                key={pSvc.uuid} 
                className="bg-white hover:shadow-md transition-all duration-200 border border-slate-100 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <Badge className="bg-slate-100 text-slate-700 font-normal hover:bg-slate-100 border-none rounded-lg">
                        {serviceCategoryLabels[category]}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(pSvc)}
                          className="h-8 w-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(pSvc.uuid)}
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 mt-3 leading-snug">
                      {displayName}
                    </CardTitle>
                    {displayDesc && (
                      <CardDescription className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                        {displayDesc}
                      </CardDescription>
                    )}
                  </CardHeader>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium text-slate-900">
                      <DollarSign className="h-4 w-4 text-teal-600" />
                      <span className="text-base font-bold">{pSvc.price} USD</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{pSvc.durationMinutes} min</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Reservable Standalone</span>
                    <Badge 
                      className={`font-normal border-none rounded-lg px-2 py-0.5 flex items-center gap-1 ${
                        pSvc.isStandaloneBookable 
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {pSvc.isStandaloneBookable ? (
                        <>
                          <Check className="h-3 w-3" /> Sí
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> No
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Agregar/Editar Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl bg-white border border-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingService ? "Editar Configuración de Servicio" : "Agregar Servicio al Portafolio"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-1">
              Definí el precio, la duración estimada de atención y el comportamiento en la agenda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 my-4">
            {/* Selección de Servicio Base */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Servicio Base (Catálogo)</label>
              {editingService ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium">
                  {getGlobalService(selectedServiceUuid)?.name || "Servicio seleccionado"}
                </div>
              ) : (
                <Select value={selectedServiceUuid} onValueChange={setSelectedServiceUuid}>
                  <SelectTrigger className="w-full rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Seleccioná un servicio maestro" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-100 rounded-xl shadow-lg max-h-[200px]">
                    {globalServices.map((gSvc) => (
                      <SelectItem 
                        key={gSvc.uuid} 
                        value={gSvc.uuid}
                        className="hover:bg-slate-50 rounded-lg text-slate-800"
                      >
                        {gSvc.name} ({serviceCategoryLabels[gSvc.category]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Nombre Personalizado (Opcional) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <span>Nombre en el Portafolio</span>
                <span className="text-xs text-slate-400">(Opcional)</span>
              </label>
              <Input
                placeholder="Ej: Ecocardiograma Doppler Color"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            {/* Dos columnas: Precio y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Precio (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Duración (Minutos)</label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción Personalizada */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <span>Instrucciones / Descripción propia</span>
                <span className="text-xs text-slate-400">(Opcional)</span>
              </label>
              <Textarea
                placeholder="Instrucciones previas al paciente (ej: venir en ayunas, traer estudios anteriores...)"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 min-h-[80px]"
              />
            </div>

            {/* Standalone Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-teal-50/40 rounded-xl border border-teal-100/50 mt-2">
              <input
                id="standalone-checkbox"
                type="checkbox"
                checked={isStandaloneBookable}
                onChange={(e) => setIsStandaloneBookable(e.target.checked)}
                className="mt-1 h-4 w-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
              />
              <div className="flex flex-col">
                <label htmlFor="standalone-checkbox" className="text-sm font-semibold text-slate-900 cursor-pointer">
                  Permitir agendamiento directo
                </label>
                <span className="text-xs text-slate-500 mt-0.5 leading-normal">
                  Los pacientes podrán agendar este servicio directamente desde el portal (ej: ir por un eco o toma de muestras) sin requerir una consulta médica previa.
                </span>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? "Guardando..." : "Guardar Servicio"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
