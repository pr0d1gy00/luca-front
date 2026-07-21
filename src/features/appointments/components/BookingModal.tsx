"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import Select from "react-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDoctorAvailability } from "../hooks/useAvailability";
import { useCreateAppointment } from "../hooks/useAppointments";
import { appointmentTypeLabels } from "../types";
import type { AppointmentType } from "../schemas";
import type { Slot } from "../types";

interface ClinicBranchBasic {
  id: string;
  name: string;
  address: string;
  city?: {
    id: number | string;
    name: string;
  } | null;
}

interface ClinicBasic {
  id: string;
  name: string;
  branches: ClinicBranchBasic[];
}

interface DoctorBasic {
  uuid: string;
  fullName: string;
  specialtyName: string;
  logoUrl?: string | null;
  clinics?: ClinicBasic[];
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: DoctorBasic;
  patientUuid: string;
  clinicBranchUuid?: string;
  onSuccess?: () => void;
}

const selectStyles = {
  control: (base: Record<string, unknown>, state: { isFocused: boolean }) => ({
    ...base,
    minHeight: "40px",
    height: "40px",
    borderRadius: "12px",
    borderColor: state.isFocused ? "#23dce1" : "#E2E8F0",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(35, 220, 225, 0.2)" : "none",
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    fontFamily: "var(--font-sans)",
    color: "#0F172A",
    transition: "all 0.2s",
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
    border: "1px solid #F0F1F3",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
    backgroundColor: "#FFFFFF",
  }),
  option: (
    base: Record<string, unknown>,
    state: { isSelected: boolean; isFocused: boolean },
  ) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#EBFAF3"
      : state.isFocused
        ? "#FAF9F7"
        : "transparent",
    color: state.isSelected ? "#23DCE1" : "#0F172A",
    fontSize: "14px",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#EBFAF3",
    },
  }),
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatWeekday(weekday: string): string {
  const map: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
  };
  return map[weekday] ?? weekday;
}

function normalizeSlotTime(time: string): string {
  // "08:00" → "08:00:00"
  return time.includes(":") && time.split(":").length === 2
    ? `${time}:00`
    : time;
}

export function BookingModal({
  open,
  onOpenChange,
  doctor,
  patientUuid,
  clinicBranchUuid,
  onSuccess,
}: BookingModalProps) {
  // Form state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    clinicBranchUuid ?? "",
  );
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType>("IN_PERSON");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOfflineConfirmed, setIsOfflineConfirmed] = useState(false);

  // Compute branches directly from doctor clinics
  const doctorBranches = useMemo(() => {
    if (!doctor.clinics) return [];
    const list: Array<{ id: string; name: string; clinicName: string }> = [];
    doctor.clinics.forEach((clinic) => {
      clinic.branches.forEach((branch) => {
        const cityName = branch.city?.name || "";
        list.push({
          id: branch.id,
          name: cityName
            ? `${clinic.name} - ${branch.name} (${cityName})`
            : `${clinic.name} - ${branch.name}`,
          clinicName: clinic.name,
        });
      });
    });
    return list;
  }, [doctor.clinics]);

  const showBranchSelector = !clinicBranchUuid && doctorBranches.length > 0;

  const branchOptions = useMemo(() => {
    return doctorBranches.map((b) => ({
      value: String(b.id),
      label: b.name,
    }));
  }, [doctorBranches]);

  const selectedBranchOption = useMemo(() => {
    return (
      branchOptions.find((opt) => opt.value === String(selectedBranchId)) ||
      null
    );
  }, [branchOptions, selectedBranchId]);

  // Calculate min/max date (today to +30 days)
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Fetch availability when date changes
  const { data: availability, isLoading: loadingSlots } = useDoctorAvailability(
    {
      doctorUuid: doctor.uuid,
      date: selectedDate,
      branchId: selectedBranchId || undefined,
      hasBranches: doctorBranches.length > 0,
    },
  );

  // Create mutation
  const createAppointment = useCreateAppointment();

  // Handlers
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: Slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSlot || !selectedDate || !patientUuid) return;

    try {
      const res = await createAppointment.mutateAsync({
        patientUuid,
        doctorUuid: doctor.uuid,
        clinicBranchUuid: selectedBranchId || undefined,
        date: selectedDate,
        time: selectedSlot.time,
        slotTime: normalizeSlotTime(selectedSlot.time),
        type: appointmentType,
        reason,
        notes,
      });
      setIsOfflineConfirmed(!!res?.isOffline);
      setIsConfirmed(true);
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    if (isConfirmed) {
      onSuccess?.();
    }
  };

  const isConfirmDisabled =
    !selectedSlot ||
    !selectedDate ||
    (doctorBranches.length > 0 && !selectedBranchId) ||
    createAppointment.isPending;

  // Success screen
  if (isConfirmed) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="rounded-2xl bg-white border border-pharmako-border max-w-lg sm:max-w-xl md:max-w-2xl shadow-xl p-6 lg:p-8">
          <div className="flex flex-col items-center py-6 text-center">
            {isOfflineConfirmed ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4 border border-amber-200">
                  <AlertCircle className="size-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  ¡Cita registrada sin conexión!
                </h3>
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 mb-5 text-xs sm:text-sm text-amber-900 leading-relaxed text-left font-medium">
                  TU CITA FUE REGISTRADA PERO AÚN NO ESTÁS ONLINE. SE TERMINARÁ
                  DE CONFIRMAR CUANDO ESTÉS ONLINE. CONÉCTATE LO MÁS PRONTO
                  POSIBLE, YA QUE TU CUPO PUEDE SER TOMADO POR ALGUIEN QUE SÍ
                  ESTÉ EN LÍNEA.
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
                  <CheckCircle className="size-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-pharmako-text-primary mb-2">
                  ¡Cita agendada!
                </h3>
                <p className="text-sm text-pharmako-text-secondary mb-6">
                  Tu cita con el Dr. {doctor.fullName} ha sido registrada y
                  confirmada.
                </p>
              </>
            )}
            <div className="w-full bg-slate-50/60 border border-pharmako-border-soft rounded-xl p-4 mb-6 text-left flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Calendar className="size-4 text-pharmako-care" />
                <span className="text-sm font-semibold text-pharmako-text-primary">
                  {selectedDate ? formatDate(selectedDate) : ""}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-pharmako-care" />
                <span className="text-sm font-medium text-pharmako-text-secondary">
                  {selectedSlot?.time} hs ·{" "}
                  {appointmentTypeLabels[appointmentType]}
                </span>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className={`w-full h-11 rounded-xl font-semibold transition-all duration-200 ${
                isOfflineConfirmed
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-pharmako-care hover:bg-pharmako-care/90 text-white"
              }`}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl bg-white border border-pharmako-border max-w-lg sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-6 lg:p-8 shadow-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-pharmako-text-primary text-xl font-bold">
            Agendar Cita
          </DialogTitle>
          <DialogDescription className="text-pharmako-text-secondary text-sm">
            Seleccioná fecha, hora y modalidad para tu cita con{" "}
            <span className="font-semibold text-pharmako-text-primary">
              {doctor.fullName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* ── Doctor Info ─────────────────────────────────── */}
          <div className="flex items-center gap-3.5 p-4 border border-pharmako-border-soft rounded-xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-xl bg-pharmako-care-light flex items-center justify-center shrink-0 border border-pharmako-border-soft overflow-hidden">
              {doctor.logoUrl ? (
                <img
                  src={doctor.logoUrl}
                  alt={doctor.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-pharmako-care">
                  {doctor.fullName.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-pharmako-text-primary truncate">
                {doctor.fullName}
              </p>
              <p className="text-xs text-pharmako-text-secondary font-medium">
                {doctor.specialtyName}
              </p>
            </div>
          </div>

          {/* ── Clinic Branch Selector ────────────────────────── */}
          {showBranchSelector && (
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
                Sucursal / Clínica
              </label>
              <Select
                instanceId="booking-branch-select"
                value={selectedBranchOption}
                options={branchOptions}
                onChange={(newValue) => {
                  setSelectedBranchId(newValue?.value || "");
                  setSelectedDate("");
                  setSelectedSlot(null);
                }}
                styles={selectStyles}
                isSearchable={true}
                placeholder="Selecciona una sucursal..."
              />
            </div>
          )}

          {/* ── Date Picker ─────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="size-3.5 text-pharmako-text-muted" />
              Fecha de la cita
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDate}
              max={maxDate}
              disabled={doctorBranches.length > 0 && !selectedBranchId}
              className="h-10 w-full rounded-xl border border-pharmako-border bg-white px-3 py-2 text-sm text-pharmako-text-primary transition-all outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {doctorBranches.length > 0 && !selectedBranchId ? (
              <p className="text-xs text-amber-500 font-medium">
                Seleccioná primero una sucursal para ver la disponibilidad.
              </p>
            ) : (
              selectedDate &&
              availability && (
                <p className="text-xs text-pharmako-text-secondary font-medium">
                  {formatWeekday(availability.weekday)} ·{" "}
                  {availability.isAvailable
                    ? `${availability.slots.filter((s) => s.available).length} horarios disponibles`
                    : "Sin disponibilidad"}
                </p>
              )
            )}
          </div>

          {/* ── Exception Warning / Custom Hours Notice ─────── */}
          {selectedDate && availability && availability.exception && (
            <div
              className={`flex items-start gap-3 p-3.5 border rounded-xl ${
                availability.isAvailable
                  ? "bg-blue-50/50 border-blue-100 text-blue-800"
                  : "bg-amber-50/50 border-amber-100 text-amber-800"
              }`}
            >
              <AlertCircle
                className={`size-5 shrink-0 mt-0.5 ${
                  availability.isAvailable ? "text-blue-500" : "text-amber-500"
                }`}
              />
              <div>
                <p className="text-sm font-semibold">
                  {availability.isAvailable
                    ? "Horario especial para este día"
                    : availability.exception.type === "VACATION"
                      ? "El doctor está de vacaciones"
                      : availability.exception.type === "DAY_OFF"
                        ? "Día de descanso del doctor"
                        : "No disponible"}
                </p>
                {availability.exception.reason && (
                  <p
                    className={`text-xs mt-0.5 ${
                      availability.isAvailable
                        ? "text-blue-600/90"
                        : "text-amber-600/90"
                    }`}
                  >
                    {availability.exception.reason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Time Slots ──────────────────────────────────── */}
          {selectedDate && availability && availability.isAvailable && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-pharmako-text-muted" />
                Horario disponible
              </label>

              {loadingSlots ? (
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 rounded-xl bg-slate-50 animate-pulse border border-pharmako-border-soft"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availability.slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot)}
                      className={`h-9 rounded-xl text-sm font-semibold transition-all ${
                        selectedSlot?.time === slot.time
                          ? "bg-pharmako-care text-white"
                          : slot.available
                            ? "bg-white border border-pharmako-border text-pharmako-text-secondary hover:border-pharmako-care hover:bg-pharmako-care-light"
                            : "bg-slate-50 text-pharmako-text-muted/50 border border-dashed border-slate-200/60 cursor-not-allowed"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}

              {!loadingSlots && availability.slots.length === 0 && (
                <p className="text-sm text-pharmako-text-secondary italic">
                  No hay horarios disponibles para este día.
                </p>
              )}
            </div>
          )}

          {/* ── Appointment Type ────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider">
              Modalidad de la consulta
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAppointmentType("IN_PERSON")}
                className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-semibold transition-all ${
                  appointmentType === "IN_PERSON"
                    ? "border-pharmako-care text-pharmako-care"
                    : "bg-white border-pharmako-border text-pharmako-text-secondary hover:border-slate-300"
                }`}
              >
                <MapPin className="size-4" />
                Presencial
              </button>
            </div>
          </div>

          {/* ── Reason ─────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="reason"
              className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider"
            >
              Motivo de la consulta
            </label>
            <textarea
              id="reason"
              rows={3}
              placeholder="Ej. Control de presión, seguimiento de tratamiento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-pharmako-border bg-white px-3 py-2 text-sm text-pharmako-text-primary placeholder:text-pharmako-text-muted transition-all outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 resize-none"
            />
          </div>

          {/* ── Notes ──────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notes"
              className="text-xs font-semibold text-pharmako-text-muted uppercase tracking-wider"
            >
              Notas adicionales{" "}
              <span className="text-pharmako-text-muted/60 font-normal lowercase">
                (opcional)
              </span>
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Preferencias, observaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-pharmako-border bg-white px-3 py-2 text-sm text-pharmako-text-primary placeholder:text-pharmako-text-muted transition-all outline-none focus:border-pharmako-care focus:ring-2 focus:ring-pharmako-care/20 resize-none"
            />
          </div>

          {/* Callout Notice */}
          <div className="p-4 border-t text-xs text-pharmako-text-secondary flex gap-2.5">
            <ShieldCheck className="w-4 h-4 text-pharmako-care shrink-0 mt-0.5" />
            <p>
              Este profesional de la salud está plenamente habilitado para
              emitir recetas digitales y órdenes médicas que se sincronizarán
              directamente con tu aplicación LUCA.
            </p>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-pharmako-border-soft">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-xl border-pharmako-border text-pharmako-text-secondary hover:bg-slate-50 h-11 px-5"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="rounded-xl bg-pharmako-care hover:bg-pharmako-care/90 text-white disabled:opacity-50 h-11 px-6 font-semibold animate-in fade-in zoom-in-95 duration-150"
          >
            {createAppointment.isPending ? "Agendando..." : "Confirmar Cita"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
