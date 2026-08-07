"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Settings, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePharmacySettings } from "@/features/pharmacy-dashboard/hooks/usePharmacySettings";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet map to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

export function PharmacySettingsView() {
  const { settings, location, isLoading, updateSettings, isUpdating } = usePharmacySettings();

  const [autoQuoting, setAutoQuoting] = useState<boolean>(false);
  const [is24Hours, setIs24Hours] = useState<boolean>(false);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [currency, setCurrency] = useState<string>("USD");

  useEffect(() => {
    if (!settings) return;
    setAutoQuoting(settings.auto_quoting_enabled);
    setIs24Hours(settings.is_24_hours || false);
    setRadiusKm(Number(settings.delivery_radius_km) || 5);
    setCurrency(settings.default_currency || "USD");
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        auto_quoting_enabled: autoQuoting,
        is_24_hours: is24Hours,
        delivery_radius_km: radiusKm,
        default_currency: currency,
      });
      toast.success("Configuración de operatividad guardada exitosamente");
    } catch (error: any) {
      const errorData = error?.response?.data;
      const errorMsg = errorData?.message || errorData?.detail || errorData?.error || "Ocurrió un error al guardar la configuración";
      toast.error(errorMsg);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Cargando configuraciones...</div>;
  }

  // Safe fallback if location not set
  const lat = location?.latitude ? Number(location.latitude) : 10.4806; // Default to Caracas
  const lng = location?.longitude ? Number(location.longitude) : -66.9036;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6">
        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Settings className="h-5 w-5 text-pharmako-care" /> Configuración de Farmacia
        </h3>
        <p className="text-xs text-slate-500">Gestiona las preferencias de cotización, horario y cobertura.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Operatividad */}
        <div className="bg-white border-t border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Operatividad y Respuestas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 24 Horas */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 block">Abierto 24 Horas</label>
                <button
                  type="button"
                  onClick={() => setIs24Hours(!is24Hours)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is24Hours ? "bg-pharmako-care" : "bg-slate-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is24Hours ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Al activar esto, tu farmacia aparecerá disponible para pacientes a cualquier hora.
              </p>
            </div>

            {/* Cotización Automática */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-900 block">Cotización Automática</label>
                <button
                  type="button"
                  onClick={() => setAutoQuoting(!autoQuoting)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoQuoting ? "bg-pharmako-care" : "bg-slate-300"
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoQuoting ? "translate-x-6" : "translate-x-1"
                      }`}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                El sistema usará tu inventario para responder automáticamente a las solicitudes.
              </p>
              {!autoQuoting && (
                <div className="flex items-center gap-2 mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                  <ShieldAlert className="w-3 h-3 shrink-0" />
                  <span>Modo Manual: Debes cotizar cada receta a mano.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zona de Cobertura */}
        <div className="bg-white border-t border-slate-200 p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-pharmako-care" />
            Zona de Cobertura (Delivery)
          </h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-900 block mb-2">
                  Radio de Entrega: <span className="text-pharmako-care text-lg">{radiusKm} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="0.5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="w-full accent-pharmako-care"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Define la distancia máxima a la redonda en la cual estás dispuesto a realizar entregas a domicilio.
                </p>
              </div>
            </div>

            <div className="w-full md:w-2/3 h-64 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative z-0">
              <MapContainer center={[lat, lng]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} />
                <Circle
                  center={[lat, lng]}
                  pathOptions={{ fillColor: '#23DCE1', color: '#1BAEBB', fillOpacity: 0.2, weight: 1 }}
                  radius={radiusKm * 1000} // radius in meters
                />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Guardar */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isUpdating}
            className="bg-pharmako-care text-white hover:bg-pharmako-care-hover font-bold shadow-none rounded-xl px-8 h-12"
          >
            {isUpdating ? "Guardando..." : (
              <span className="flex items-center gap-2"><Save className="w-5 h-5" /> Guardar Cambios</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
