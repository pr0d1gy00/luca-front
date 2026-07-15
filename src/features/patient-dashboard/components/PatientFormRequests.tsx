"use client";

import { useState } from "react";
import {
  usePatientFormRequests,
  useSubmitPatientFormRequest,
} from "@/lib/api/clinical-history/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormRenderer } from "@/features/clinical-history-builder";
import {
  FileText,
  Calendar,
  Loader2,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PatientFormRequestsProps {
  hideIfEmpty?: boolean;
}

export function PatientFormRequests({
  hideIfEmpty = false,
}: PatientFormRequestsProps) {
  const { data: requests = [], isLoading, refetch } = usePatientFormRequests();
  const submitMutation = useSubmitPatientFormRequest();

  const [selectedRequestUuid, setSelectedRequestUuid] = useState<string | null>(
    null,
  );

  // Find the selected request details
  const activeRequest =
    requests.find((r) => r.uuid === selectedRequestUuid) ?? null;

  async function onSubmitForm(values: Record<string, unknown>) {
    if (!selectedRequestUuid) return;

    try {
      await submitMutation.mutateAsync({
        uuid: selectedRequestUuid,
        data: {
          dynamic_data: values,
        },
      });

      toast.success("Formulario enviado correctamente. ¡Muchas gracias!");
      setSelectedRequestUuid(null);
      refetch();
    } catch {
      toast.error(
        "Ocurrió un error al enviar el formulario. Intenta nuevamente.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xs flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
        <span className="text-xs font-medium text-slate-500">
          Cargando solicitudes...
        </span>
      </div>
    );
  }

  // Filter pending requests
  const pendingRequests = requests.filter((r) => r.status === "pending");

  if (pendingRequests.length === 0) {
    if (hideIfEmpty) return null;

    return (
      <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
        <div className="p-4 bg-teal-50/50 text-teal-600 rounded-full">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">¡Todo al día!</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          No tienes formularios clínicos pendientes de completar. Tu médico te
          notificará si necesita que llenes alguna plantilla.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Formularios Clínicos Pendientes
          </h2>
          <p className="text-xs text-slate-500">
            Completa estos cuestionarios compartidos por tu médico antes de tu
            consulta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingRequests.map((req) => {
          const doctorName =
            req.user?.fullName ?? req.user?.full_name ?? "Médico";
          const clinicName = req.clinic?.name;
          const createdDate = req.created_at
            ? new Date(req.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Recientemente";

          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {req.form_template?.name ?? "Cuestionario de Salud"}
                  </h3>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    Pendiente
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {req.form_template?.description ??
                    "Por favor, completa esta información de manera precisa."}
                </p>

                <div className="pt-2 flex flex-col gap-1.5 border-t border-slate-50 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Solicitado por:{" "}
                      <strong className="text-slate-600 font-semibold">
                        {doctorName}
                      </strong>
                      {clinicName && ` en ${clinicName}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Recibido: {createdDate}</span>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setSelectedRequestUuid(req.uuid)}
                className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                Completar Formulario
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Filler Dialog */}
      <Dialog
        open={!!selectedRequestUuid}
        onOpenChange={(open) => !open && setSelectedRequestUuid(null)}
      >
        <DialogContent className="max-w-3xl bg-white border border-slate-100 rounded-2xl shadow-xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
          {activeRequest && (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-1">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    {activeRequest.form_template?.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Solicitado por el{" "}
                    <strong>
                      {activeRequest.user?.fullName ??
                        activeRequest.user?.full_name ??
                        "Médico"}
                    </strong>
                    {activeRequest.clinic?.name &&
                      ` en ${activeRequest.clinic.name}`}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 thin-scrollbar bg-slate-50/20">
                {activeRequest.form_template?.schema?.canvas?.elements ? (
                  <FormRenderer
                    mode="patient"
                    elements={
                      activeRequest.form_template.schema.canvas.elements
                    }
                    onSubmit={onSubmitForm}
                    isLoading={submitMutation.isPending}
                  />
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    No se puede cargar el diseño del formulario.
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
