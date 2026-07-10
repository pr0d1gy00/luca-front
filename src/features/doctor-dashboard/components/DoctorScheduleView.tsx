"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Coffee,
  Sun,
  AlertCircle,
  CalendarDays,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import {
  useDoctorSchedulesQuery,
  useDoctorExceptionsQuery,
  useSaveDoctorSchedule,
  useDeleteDoctorSchedule,
  useSaveDoctorException,
  useDeleteDoctorException,
} from "@/features/appointments/hooks/useDoctorSchedule";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  Weekday,
  ExceptionType,
} from "@/features/offline/database/schema";

const WEEKDAYS_ORDER: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado",
  SUNDAY: "Domingo",
};

const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  VACATION: "Vacaciones (Todo el día)",
  DAY_OFF: "Día Libre / Feriado",
  CUSTOM_HOURS: "Horario Especial",
};

export function DoctorScheduleView() {
  const { user } = useAuthStore();
  const doctorUuid = user?.uuid ?? user?.id ?? "";

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"weekly" | "exceptions">("weekly");

  // Queries
  const { data: schedules = [], isLoading: loadingSchedules } =
    useDoctorSchedulesQuery(doctorUuid);
  const { data: exceptions = [], isLoading: loadingExceptions } =
    useDoctorExceptionsQuery(doctorUuid);

  // Mutations
  const saveScheduleMutation = useSaveDoctorSchedule();
  const deleteScheduleMutation = useDeleteDoctorSchedule();
  const saveExceptionMutation = useSaveDoctorException();
  const deleteExceptionMutation = useDeleteDoctorException();

  // Modal/Form States for recurrent schedule
  const [editingDay, setEditingDay] = useState<Weekday | null>(null);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(30);
  const [maxPerSlot, setMaxPerSlot] = useState(1);

  // Form States for exception
  const [showAddException, setShowAddException] = useState(false);
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionType, setExceptionType] = useState<ExceptionType>("VACATION");
  const [customStart, setCustomStart] = useState("08:00");
  const [customEnd, setCustomEnd] = useState("12:00");
  const [reason, setReason] = useState("");

  // Helpers to format HH:MM:SS to HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5);
  };

  // Save Recurrent Schedule handler
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;

    try {
      await saveScheduleMutation.mutateAsync({
        doctorUuid,
        data: {
          weekday: editingDay,
          startTime,
          endTime,
          appointmentDuration: Number(duration),
          maxPerSlot: Number(maxPerSlot),
        },
      });
      toast.success(
        `Horario del ${WEEKDAY_LABELS[editingDay]} guardado con éxito.`,
      );
      setEditingDay(null);
    } catch (err) {
      toast.error("No se pudo guardar el horario.");
    }
  };

  // Toggle Active Day Schedule handler
  const handleToggleDay = async (weekday: Weekday) => {
    const existing = schedules.find((s) => s.weekday === weekday);
    if (existing) {
      // If active, we soft-delete it (deactivate)
      try {
        await deleteScheduleMutation.mutateAsync({
          doctorUuid,
          uuid: existing.uuid,
        });
        toast.success(
          `Día ${WEEKDAY_LABELS[weekday]} configurado como no laborable.`,
        );
      } catch (err) {
        toast.error("No se pudo desactivar el horario.");
      }
    } else {
      // If not active, open editor directly
      setEditingDay(weekday);
      setStartTime("08:00");
      setEndTime("17:00");
      setDuration(30);
      setMaxPerSlot(1);
    }
  };

  // Save Exception handler
  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exceptionDate) {
      toast.warning("Por favor selecciona una fecha.");
      return;
    }

    try {
      await saveExceptionMutation.mutateAsync({
        doctorUuid,
        data: {
          exceptionDate,
          exceptionType,
          customStartTime:
            exceptionType === "CUSTOM_HOURS" ? customStart : null,
          customEndTime: exceptionType === "CUSTOM_HOURS" ? customEnd : null,
          reason: reason || null,
        },
      });
      toast.success("Excepción guardada con éxito.");
      setShowAddException(false);
      setExceptionDate("");
      setExceptionType("VACATION");
      setReason("");
    } catch (err) {
      toast.error("No se pudo registrar la excepción.");
    }
  };

  // Delete Exception handler
  const handleDeleteException = async (uuid: string) => {
    try {
      await deleteExceptionMutation.mutateAsync({
        doctorUuid,
        uuid,
      });
      toast.success("Excepción eliminada con éxito.");
    } catch (err) {
      toast.error("No se pudo eliminar la excepción.");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-pharmako-border-soft pb-4">
        <div>
          <h1 className="text-2xl font-bold text-pharmako-text-primary tracking-tight">
            Configuración de Horarios
          </h1>
          <p className="text-sm text-pharmako-text-secondary mt-1">
            Definí tu jornada semanal recurrente y programá tus vacaciones o
            días libres.
          </p>
        </div>
      </div>

      {/* Custom Tab Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "weekly"
              ? "bg-white text-pharmako-care border-b border-pharmako-care"
              : "text-pharmako-text-secondary hover:text-pharmako-text-primary"
          }`}
        >
          <Clock className="w-4 h-4" />
          Jornada Semanal
        </button>
        <button
          onClick={() => setActiveTab("exceptions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "exceptions"
              ? "bg-white text-pharmako-care border-b border-pharmako-care"
              : "text-pharmako-text-secondary hover:text-pharmako-text-primary"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Excepciones y Feriados
        </button>
      </div>

      {/* Tabs Content */}
      <div className="relative">
        {activeTab === "weekly" ? (
          <div className="space-y-6">
            {loadingSchedules ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <div className="h-6 w-6 border-2 border-pharmako-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs">Cargando tu horario...</p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-1">
                {WEEKDAYS_ORDER.map((day) => {
                  const schedule = schedules.find((s) => s.weekday === day);
                  const isActive = !!schedule;
                  const isEditing = editingDay === day;

                  return (
                    <motion.div
                      key={day}
                      layout
                      className={`bg-white rounded-xl border ${
                        isEditing
                          ? "border-pharmako-care"
                          : "border-slate-100 hover:border-slate-200/80"
                      } transition-all duration-200`}
                    >
                      {/* View Mode */}
                      {!isEditing ? (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                          <div className="flex items-center gap-4">
                            {/* Switch button */}
                            <button
                              onClick={() => handleToggleDay(day)}
                              className="text-slate-400 hover:text-pharmako-care transition-colors shrink-0"
                              title={
                                isActive ? "Desactivar día" : "Activar día"
                              }
                            >
                              {isActive ? (
                                <ToggleRight className="w-9 h-9 text-pharmako-care" />
                              ) : (
                                <ToggleLeft className="w-9 h-9 text-slate-300" />
                              )}
                            </button>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">
                                {WEEKDAY_LABELS[day]}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {isActive ? (
                                  <span className="text-xs font-semibold text-pharmako-care bg-pharmako-care/10 px-2 py-0.5 rounded-full">
                                    Laborable
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                    No laborable
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Schedule Info */}
                          {isActive && (
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-pharmako-text-secondary sm:ml-auto">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-pharmako-care/70" />
                                <span className="font-medium text-slate-800">
                                  {formatTime(schedule.startTime)} -{" "}
                                  {formatTime(schedule.endTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Coffee className="w-4 h-4 text-slate-400" />
                                <span>
                                  Turno: {schedule.appointmentDuration} min
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Sun className="w-4 h-4 text-slate-400" />
                                <span>
                                  Máx: {schedule.maxPerSlot}{" "}
                                  {schedule.maxPerSlot === 1
                                    ? "paciente"
                                    : "pacientes"}{" "}
                                  / slot
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingDay(day);
                                  setStartTime(formatTime(schedule.startTime));
                                  setEndTime(formatTime(schedule.endTime));
                                  setDuration(schedule.appointmentDuration);
                                  setMaxPerSlot(schedule.maxPerSlot);
                                }}
                                className="text-slate-500 hover:text-pharmako-primary hover:bg-slate-50"
                              >
                                <Edit className="w-4 h-4 mr-1.5" />
                                Editar
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Edit Mode Form */
                        <form
                          onSubmit={handleSaveSchedule}
                          className="p-6 space-y-6"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="w-5 h-5 text-pharmako-primary" />
                              <h3 className="font-bold text-slate-900 text-lg">
                                Configurar Horario: {WEEKDAY_LABELS[day]}
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingDay(null)}
                              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {/* Start Time */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Hora Entrada
                              </label>
                              <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                              />
                            </div>

                            {/* End Time */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Hora Salida
                              </label>
                              <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                              />
                            </div>

                            {/* Duration */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Duración de Cita (min)
                              </label>
                              <Input
                                type="number"
                                value={duration}
                                onChange={(e) =>
                                  setDuration(Number(e.target.value))
                                }
                                min="5"
                                max="240"
                                required
                                className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                              />
                            </div>

                            {/* Max Per Slot */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Pacientes por Slot
                              </label>
                              <Input
                                type="number"
                                value={maxPerSlot}
                                onChange={(e) =>
                                  setMaxPerSlot(Number(e.target.value))
                                }
                                min="1"
                                max="10"
                                required
                                className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setEditingDay(null)}
                              className="border-slate-200 text-slate-600"
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              disabled={saveScheduleMutation.isPending}
                              className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white px-5"
                            >
                              {saveScheduleMutation.isPending
                                ? "Guardando..."
                                : "Guardar horario"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Exceptions and holidays tab */
          <div className="space-y-6">
            {/* Overview Exceptions & Button to Add */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-pharmako-primary mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-bold text-slate-900 text-base">
                    Vacaciones y Excepciones
                  </h2>
                  <p className="text-xs text-pharmako-text-secondary mt-1">
                    Citas en estas fechas no estarán disponibles para reserva
                    según la regla que programes.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddException(true)}
                className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white self-start sm:self-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Programar Excepción
              </Button>
            </div>

            {/* Form Dialog for adding Exception */}
            <AnimatePresence>
              {showAddException && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-xl border border-pharmako-primary/20 shadow-sm overflow-hidden"
                >
                  <form onSubmit={handleAddException} className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 text-lg">
                        Nueva Excepción de Horario
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddException(false)}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Fecha
                        </label>
                        <Input
                          type="date"
                          value={exceptionDate}
                          onChange={(e) => setExceptionDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          required
                          className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                        />
                      </div>

                      {/* Type */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Tipo de Regla
                        </label>
                        <select
                          value={exceptionType}
                          onChange={(e) =>
                            setExceptionType(e.target.value as ExceptionType)
                          }
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                        >
                          <option value="VACATION">
                            Vacaciones (Día Libre)
                          </option>
                          <option value="DAY_OFF">
                            Feriado o Día Libre Particular
                          </option>
                          <option value="CUSTOM_HOURS">
                            Horario Especial (Salida Temprana / Entrada Tarde)
                          </option>
                        </select>
                      </div>

                      {/* Reason */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Motivo / Razón
                        </label>
                        <Input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Ej. Vacaciones de invierno, Feriado patrio"
                          className="border-slate-200 focus:border-pharmako-primary focus:ring-1 focus:ring-pharmako-primary/20"
                        />
                      </div>
                    </div>

                    {/* Conditional Custom Hours */}
                    {exceptionType === "CUSTOM_HOURS" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100"
                      >
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Hora Entrada Excepcional
                          </label>
                          <Input
                            type="time"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            required
                            className="bg-white border-slate-200 focus:border-pharmako-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Hora Salida Excepcional
                          </label>
                          <Input
                            type="time"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            required
                            className="bg-white border-slate-200 focus:border-pharmako-primary"
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAddException(false)}
                        className="border-slate-200 text-slate-600"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={saveExceptionMutation.isPending}
                        className="bg-pharmako-primary hover:bg-pharmako-primary-hover text-white px-5"
                      >
                        {saveExceptionMutation.isPending
                          ? "Registrando..."
                          : "Registrar excepción"}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Exceptions List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">
                  Excepciones Programadas
                </h3>
              </div>

              {loadingExceptions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                  <div className="h-6 w-6 border-2 border-pharmako-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs">Cargando excepciones...</p>
                </div>
              ) : exceptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <Calendar className="w-10 h-10 text-slate-300 mb-2" />
                  <h4 className="font-semibold text-slate-700">
                    Sin excepciones registradas
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    No programaste ningún feriado o vacación. Tu agenda se
                    regirá únicamente por tu jornada semanal.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100 font-bold">
                      <tr>
                        <th scope="col" className="px-6 py-4">
                          Fecha
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Tipo de Excepción
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Detalle / Horas
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Motivo
                        </th>
                        <th scope="col" className="px-6 py-4 text-right">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exceptions.map((exc) => {
                        const dateFormatted = new Date(
                          exc.exceptionDate + "T00:00:00",
                        ).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });

                        return (
                          <tr
                            key={exc.uuid}
                            className="bg-white hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-semibold text-slate-900 capitalize">
                              {dateFormatted}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="secondary"
                                className={
                                  exc.exceptionType === "VACATION"
                                    ? "bg-rose-50 text-rose-700 border-rose-100"
                                    : exc.exceptionType === "DAY_OFF"
                                      ? "bg-amber-50 text-amber-700 border-amber-100"
                                      : "bg-blue-50 text-blue-700 border-blue-100"
                                }
                              >
                                {EXCEPTION_TYPE_LABELS[exc.exceptionType]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-slate-800">
                              {exc.exceptionType === "CUSTOM_HOURS" ? (
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5 text-pharmako-primary/80" />
                                  {formatTime(exc.customStartTime ?? "")} -{" "}
                                  {formatTime(exc.customEndTime ?? "")}
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  Todo el día
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-600">
                              {exc.reason ?? (
                                <span className="text-slate-400 italic">
                                  No especificado
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteException(exc.uuid)}
                                className="text-slate-400 hover:text-pharmako-danger p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Eliminar excepción"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
