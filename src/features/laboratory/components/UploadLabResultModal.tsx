"use client";

import { useState } from "react";
import {
  UploadCloud,
  FileText,
  Mail,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUploadLabResult } from "../hooks/useUploadLabResult";
import type { LabResultAttachment } from "../types/laboratory.types";

interface UploadLabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: number;
  patientId?: number;
  patientName?: string;
}

export function UploadLabResultModal({
  isOpen,
  onClose,
  requestId,
  patientId,
  patientName = "Paciente LUCA",
}: UploadLabResultModalProps) {
  const uploadMutation = useUploadLabResult();

  const [fileUrl, setFileUrl] = useState<string>(
    "https://storage.luca.health/results/reporte_ejemplo.pdf",
  );
  const [notes, setNotes] = useState<string>(
    "Valores dentro de los rangos normales de referencia.",
  );
  const [attachments, setAttachments] = useState<LabResultAttachment[]>([
    {
      file_name: "Informe_Laboratorio.pdf",
      file_url: "https://storage.luca.health/results/reporte_ejemplo.pdf",
    },
  ]);
  const [newAttachmentName, setNewAttachmentName] = useState<string>("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState<string>("");

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (newAttachmentName && newAttachmentUrl) {
      setAttachments((prev) => [
        ...prev,
        { file_name: newAttachmentName, file_url: newAttachmentUrl },
      ]);
      setNewAttachmentName("");
      setNewAttachmentUrl("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await uploadMutation.mutateAsync({
      lab_request_id: requestId,
      patient_id: patientId,
      file_url: fileUrl,
      result_json: {
        estado: "Procesado Exitosamente",
        laboratorio: "Sede Principal",
      },
      attachments_json: attachments,
      notes,
      performed_at: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-none my-8 overflow-hidden space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-pharmako-care-light text-pharmako-care">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cargar Resultados de Laboratorio
              </h2>
              <p className="text-xs text-slate-500">Paciente: {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Automatic Email Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/60 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block">
                Envío Automático de Correo Electrónico:
              </span>
              Al publicar los resultados, el paciente recibirá una notificación
              con la plantilla HTML oficial y el archivo PDF adjunto listo para
              descargar.
            </div>
          </div>

          {/* Main PDF Report File */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              URL o Archivo PDF de Resultados Principal
            </label>
            <Input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://storage.luca.health/..."
              className="h-10 border-slate-200 rounded-xl text-xs text-slate-900 bg-white shadow-none"
            />
          </div>

          {/* Additional Attachments / Images */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-900 block">
              Adjuntar Imágenes o Archivos Adicionales (Ecografías / Placas)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="Nombre del adjunto (ej: Ecografía.png)"
                className="h-9 border-slate-200 rounded-lg text-xs bg-white shadow-none text-slate-900"
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newAttachmentUrl}
                  onChange={(e) => setNewAttachmentUrl(e.target.value)}
                  placeholder="URL del archivo"
                  className="h-9 border-slate-200 rounded-lg text-xs bg-white shadow-none text-slate-900"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  className="border-slate-200 bg-white rounded-lg px-3 shadow-none text-xs"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold">{att.file_name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {att.file_url}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Observaciones del Bioanalista / Médico
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Escribí aquí las observaciones del estudio..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-pharmako-care"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-none rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending}
              className="bg-pharmako-care text-slate-900 font-semibold hover:bg-pharmako-care-hover shadow-none rounded-xl px-6"
            >
              <FileText className="w-4 h-4 mr-2" />
              {uploadMutation.isPending
                ? "Publicando..."
                : "Publicar y Enviar por Email"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
