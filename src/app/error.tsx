"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logErrorToService } from "@/lib/telemetry";
import Link from "next/link";
import Image from "next/image";

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
  console.log(process.env.NODE_ENV);
  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center space-y-6 ">
      <Image
        width={800}
        height={800}
        src="/PharmakoPersonErrorBoundaryExtraLarge-PNG.png"
        alt="Ilustración de error"
        className="w-200 sm:w-200 h-auto object-contain mx-auto select-none pointer-events-none"
      />

      <div className="space-y-2 max-w-md ">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          ¡Ups! Algo no salió como esperábamos
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          No te preocupes, tus datos e información están resguardados. Ocurrió
          un inconveniente técnico al cargar esta vista y ya lo estamos
          revisando.
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

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
        <Button
          onClick={() => reset()}
          className="bg-pharmako-care hover:bg-pharmako-care-hover text-white font-medium rounded-xl px-5 py-2.5 h-11"
        >
          <RefreshCw className="mr-2 size-4" />
          Reintentar carga
        </Button>

        <Button
          variant="outline"
          asChild
          className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-5 py-2.5 h-11"
        >
          <Link href="/dashboard">
            <Home className="mr-2 size-4" />
            Ir al Dashboard
          </Link>
        </Button>
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
  );
}
