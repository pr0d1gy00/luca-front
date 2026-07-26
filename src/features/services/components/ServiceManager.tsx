"use client";

import React, { useMemo } from "react";
import Select from "react-select";
import {
  Trash2,
  Edit3,
  Clock,
  DollarSign,
  Check,
  X,
  Layers,
} from "lucide-react";
import {
  useGlobalServices,
  useProviderServices,
  useSaveProviderService,
  useDeleteProviderService,
} from "../hooks/useServices";
import { serviceCategoryLabels } from "../schemas";
import type { ProviderService, Service } from "../schemas";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface ServiceManagerProps {
  providerUuid: string;
  providerType: "DOCTOR" | "CLINIC";
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingService: Partial<ProviderService> | null;
  setEditingService: (service: Partial<ProviderService> | null) => void;
  selectedServiceUuid: string;
  setSelectedServiceUuid: (uuid: string) => void;
  price: string;
  setPrice: (price: string) => void;
  durationMinutes: string;
  setDurationMinutes: (minutes: string) => void;
  isStandaloneBookable: boolean;
  setIsStandaloneBookable: (standalone: boolean) => void;
  customName: string;
  setCustomName: (name: string) => void;
  customDescription: string;
  setCustomDescription: (desc: string) => void;
  handleOpenAdd: () => void;
}

const customSelectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: "42px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#23dce1" : "#E2E8F0",
    boxShadow: "none",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "var(--font-sans)",
    color: "#0F172A",
    "&:hover": {
      borderColor: state.isFocused ? "#23dce1" : "#cbd5e1",
    },
  }),
  valueContainer: (base: Record<string, unknown>) => ({
    ...base,
    padding: "0 12px",
  }),
  input: (base: Record<string, unknown>) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: "#0F172A",
  }),
  singleValue: (base: Record<string, unknown>) => ({
    ...base,
    color: "#0F172A",
    fontWeight: 500,
  }),
  placeholder: (base: Record<string, unknown>) => ({
    ...base,
    color: "#64748B",
  }),
  menu: (base: Record<string, unknown>) => ({
    ...base,
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
    zIndex: 99999,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  }),
  menuList: (base: Record<string, unknown>) => ({
    ...base,
    maxHeight: "220px",
    padding: "4px",
  }),
  menuPortal: (base: Record<string, unknown>) => ({
    ...base,
    zIndex: 99999,
  }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#EBFAF3"
      : state.isFocused
        ? "#F8FAFC"
        : "#FFFFFF",
    color: state.isSelected ? "#0F172A" : "#334155",
    fontWeight: state.isSelected ? 600 : 400,
    fontSize: "14px",
    cursor: "pointer",
    borderRadius: "8px",
    margin: "2px 0",
  }),
};

export function ServiceManager({
  providerUuid,
  providerType,
  isDialogOpen,
  setIsDialogOpen,
  editingService,
  setEditingService,
  selectedServiceUuid,
  setSelectedServiceUuid,
  price,
  setPrice,
  durationMinutes,
  setDurationMinutes,
  isStandaloneBookable,
  setIsStandaloneBookable,
  customName,
  setCustomName,
  customDescription,
  setCustomDescription,
  handleOpenAdd,
}: ServiceManagerProps) {
  const { data: globalServices = [], isLoading: loadingGlobal } =
    useGlobalServices();
  const { data: providerServices = [], isLoading: loadingProvider } =
    useProviderServices(providerUuid);
  const saveMutation = useSaveProviderService(providerUuid);
  const deleteMutation = useDeleteProviderService(providerUuid);

  // Opciones formateadas para react-select
  const selectOptions = useMemo(() => {
    return globalServices.map((gSvc) => ({
      value: gSvc.uuid,
      label: `${gSvc.name} (${serviceCategoryLabels[gSvc.category] || gSvc.category})`,
      service: gSvc,
    }));
  }, [globalServices]);

  const selectedOption = useMemo(() => {
    return (
      selectOptions.find((opt) => opt.value === selectedServiceUuid) || null
    );
  }, [selectOptions, selectedServiceUuid]);

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
    if (
      confirm(
        "¿Estás seguro de que deseas eliminar este servicio de tu oferta?",
      )
    ) {
      await deleteMutation.mutateAsync(uuid);
    }
  };

  const getGlobalService = (serviceUuid: string): Service | undefined => {
    return globalServices.find((s) => s.uuid === serviceUuid);
  };

  const isLoading = loadingGlobal || loadingProvider;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 bg-slate-100/80 rounded-xl border border-slate-200/60"
            />
          ))}
        </div>
      ) : providerServices.length === 0 ? (
        <Card className="border-dashed border border-slate-200 bg-slate-50/50 rounded-xl shadow-none">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-pharmako-care-light text-pharmako-care rounded-full mb-4">
              <Layers className="h-8 w-8" />
            </div>
            <CardTitle className="text-slate-900 font-bold text-base">
              No ofrecés servicios aún
            </CardTitle>
            <CardDescription className="max-w-md mt-2 text-slate-500 text-sm">
              Agregá procedimientos, exámenes o consultas especializadas de
              nuestro catálogo para cargarlos a tus pacientes o permitir
              reservas online.
            </CardDescription>
            <Button
              onClick={handleOpenAdd}
              className="mt-6 h-10 bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold rounded-xl border-none shadow-none px-5"
            >
              Configurar primer servicio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providerServices.map((pSvc) => {
            const baseSvc = getGlobalService(pSvc.serviceUuid);
            const displayName =
              pSvc.customName || baseSvc?.name || "Servicio no especificado";
            const displayDesc = pSvc.customDescription || baseSvc?.description;
            const category = baseSvc?.category || "OTHER";

            return (
              <Card
                key={pSvc.uuid}
                className="bg-white hover:border-slate-300 transition-colors duration-150 rounded-xl flex flex-col justify-between overflow-hidden shadow-none"
              >
                <div>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <Badge className="bg-slate-100 text-slate-700 font-medium hover:bg-slate-100 border-none rounded-md px-2.5 py-1 text-xs">
                        {serviceCategoryLabels[category] || category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(pSvc)}
                          className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shadow-none"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pSvc.uuid)}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shadow-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 mt-3 leading-snug">
                      {displayName}
                    </CardTitle>
                    {displayDesc && (
                      <CardDescription className="text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {displayDesc}
                      </CardDescription>
                    )}
                  </CardHeader>
                </div>

                <div className="px-6 pb-5 pt-4 border-t border-slate-100 bg-slate-50/40">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <div className="flex items-center gap-1 font-bold text-slate-900">
                      <DollarSign className="h-4 w-4 text-pharmako-care" />
                      <span className="text-base">{pSvc.price} USD</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{pSvc.durationMinutes} min</span>
                    </div>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Agendamiento directo
                    </span>
                    <Badge
                      className={`font-medium border-none rounded-md px-2 py-0.5 text-xs flex items-center gap-1 ${
                        pSvc.isStandaloneBookable
                          ? "bg-pharmako-care-light text-pharmako-care hover:bg-pharmako-care-light"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {pSvc.isStandaloneBookable ? (
                        <>
                          <Check className="h-3 w-3" /> Habilitado
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> Deshabilitado
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

      {/* Backdrop manual con blur — no interfiere con el focus trap de Radix */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md"
          onClick={() => setIsDialogOpen(false)}
        />
      )}

      {/* Agregar/Editar Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={false}>
        <DialogContent
          className="sm:max-w-[500px] rounded-xl bg-white border border-slate-200 p-6 shadow-none z-50"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingService
                ? "Editar Configuración de Servicio"
                : "Agregar Servicio al Portafolio"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Definí el precio, la duración estimada de atención y el
              comportamiento en la agenda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 my-2">
            {/* Selección de Servicio Base con react-select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Servicio Base (Catálogo)
              </label>
              {editingService ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium">
                  {getGlobalService(selectedServiceUuid)?.name ||
                    "Servicio seleccionado"}
                </div>
              ) : (
                <Select
                  classNamePrefix="react-select"
                  options={selectOptions}
                  value={selectedOption}
                  onChange={(option) => {
                    if (option) {
                      setSelectedServiceUuid(option.value);
                      if (!price && option.service.basePrice) {
                        setPrice(option.service.basePrice.toString());
                      }
                    } else {
                      setSelectedServiceUuid("");
                    }
                  }}
                  placeholder="Buscá o seleccioná un servicio del catálogo maestro..."
                  styles={customSelectStyles}
                  isSearchable
                  isClearable
                  isLoading={loadingGlobal}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : undefined
                  }
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  noOptionsMessage={() =>
                    loadingGlobal
                      ? "Cargando catálogo..."
                      : "No se encontraron servicios"
                  }
                />
              )}
            </div>

            {/* Nombre Personalizado (Opcional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Nombre en el Portafolio</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Opcional)
                </span>
              </label>
              <Input
                placeholder="Ej: Ecocardiograma Doppler Color"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-pharmako-care focus:ring-pharmako-care text-sm"
              />
            </div>

            {/* Dos columnas: Precio y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Precio (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7 rounded-xl border-slate-200 focus:border-pharmako-care focus:ring-pharmako-care text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Duración (Minutos)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="1"
                    placeholder="30"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="rounded-xl border-slate-200 focus:border-pharmako-care focus:ring-pharmako-care text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Descripción Personalizada */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <span>Instrucciones / Descripción propia</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  (Opcional)
                </span>
              </label>
              <Textarea
                placeholder="Instrucciones previas al paciente (ej: venir en ayunas, traer estudios anteriores...)"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                className="rounded-xl border-slate-200 focus:border-pharmako-care focus:ring-pharmako-care min-h-[80px] text-sm"
              />
            </div>

            {/* Standalone Checkbox */}
            <div className="flex items-start gap-3 p-3.5 bg-pharmako-care-light/30 rounded-xl border border-slate-200 mt-2">
              <input
                id="standalone-checkbox"
                type="checkbox"
                checked={isStandaloneBookable}
                onChange={(e) => setIsStandaloneBookable(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-pharmako-care focus:ring-pharmako-care border-slate-300"
              />
              <div className="flex flex-col">
                <label
                  htmlFor="standalone-checkbox"
                  className="text-xs font-semibold text-slate-900 cursor-pointer"
                >
                  Permitir agendamiento directo
                </label>
                <span className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Los pacientes podrán agendar este servicio directamente desde
                  el portal sin requerir una consulta previa.
                </span>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 shadow-none text-xs font-medium px-4"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-10 bg-pharmako-care hover:bg-pharmako-care-hover text-white font-semibold rounded-xl shadow-none text-xs border-none px-5"
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
