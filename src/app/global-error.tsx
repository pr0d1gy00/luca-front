"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { logErrorToService } from "@/lib/telemetry";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logErrorToService(error, {
      boundaryName: "NextGlobalRootError",
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto size-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="size-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Error crítico del sistema
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No se pudo inicializar la aplicación. El incidente fue reportado
              automáticamente a la central de monitoreo de LUCA.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-400 pt-1">
                Ref ID:{" "}
                <span className="select-all text-slate-700 font-semibold">
                  {error.digest}
                </span>
              </p>
            )}
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
            >
              <RefreshCw className="mr-2 size-4" />
              Reiniciar aplicación
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
