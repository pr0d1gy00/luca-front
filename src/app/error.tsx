"use client";

import { useEffect } from "react";
import { AlertOctagon, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logErrorToService } from "@/lib/telemetry";
import Link from "next/link";

export default function GlobalRouteSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry / monitoring telemetry
    logErrorToService(error, {
      boundaryName: "NextAppSegmentError",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="mx-auto size-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <AlertOctagon className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Algo salió mal en este módulo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Hemos registrado el inconveniente. Podés intentar recargar el módulo
            o volver a la vista principal.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 pt-1">
              Código de referencia:{" "}
              <span className="select-all text-slate-600 dark:text-slate-300 font-semibold">
                {error.digest}
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
          >
            <RefreshCw className="mr-2 size-4" />
            Reintentar carga
          </Button>

          <Button
            variant="outline"
            asChild
            className="border-slate-200 dark:border-slate-800"
          >
            <Link href="/dashboard">
              <Home className="mr-2 size-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-slate-900 text-rose-400 rounded-xl text-xs font-mono text-left overflow-x-auto border border-slate-800 space-y-1">
            <div className="font-semibold">
              {error.name}: {error.message}
            </div>
            {error.stack && (
              <pre className="text-slate-400 whitespace-pre-wrap text-[11px] leading-relaxed">
                {error.stack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
