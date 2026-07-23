"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
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
      <body className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 flex flex-col items-center">
          {/* Person Error Boundary Illustration */}
          <img
            src="/PharmakoPersonErrorBoundaryExtraLarge-PNG.png"
            alt="Ilustración de error"
            className="w-44 sm:w-52 h-auto object-contain mx-auto select-none pointer-events-none"
          />

          <div className="space-y-2 max-w-md">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              ¡Ups! Error crítico del sistema
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              No te preocupes, tus datos están a salvo. Ocurrió un problema al
              inicializar la aplicación y el incidente ya fue reportado a la
              central de monitoreo.
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

          <div className="flex justify-center pt-2 w-full">
            <button
              onClick={() => reset()}
              type="button"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors h-11"
            >
              <RefreshCw className="mr-2 size-4" />
              Reiniciar aplicación
            </button>
          </div>

          {/* Development Error Details Box (Only in Development) */}
          {process.env.NODE_ENV === "development" && error && (
            <div className="w-full text-left mt-4 p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 overflow-hidden">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 font-mono border-b border-slate-800 pb-2">
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                [DEV ONLY] {error.name || "Error"}: {error.message}
              </div>
              {error.stack && (
                <pre className="text-[11px] font-mono text-slate-400 leading-relaxed overflow-x-auto max-h-48 whitespace-pre-wrap pt-1">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
