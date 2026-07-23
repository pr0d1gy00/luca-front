"use client";

import React, { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logErrorToService } from "@/lib/telemetry";

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Name of the module or component wrapped (useful for telemetry tagging) */
  name?: string;
  /** Custom fallback UI or render function */
  fallback?:
    ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  /** Custom callback executed when error boundary resets */
  onReset?: () => void;
  /** Force showing technical stack trace details */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(
    error: Error,
  ): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Send error telemetry to external monitoring service
    logErrorToService(error, {
      boundaryName: this.props.name || "GenericErrorBoundary",
      componentStack: errorInfo.componentStack,
    });
  }

  public handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const { fallback, name } = this.props;

      if (fallback) {
        if (typeof fallback === "function") {
          return fallback({
            error: error || new Error("Error desconocido"),
            reset: this.handleReset,
          });
        }
        return fallback;
      }

      return (
        <div className="w-full flex items-center justify-center p-4 sm:p-6 min-h-[400px]">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-center flex flex-col items-center">
            {/* Person Error Boundary Illustration */}
            <img
              src="/PharmakoPersonErrorBoundaryExtraLarge-PNG.png"
              alt="Ilustración de error"
              className="w-44 sm:w-52 h-auto object-contain mx-auto select-none pointer-events-none"
            />

            {/* Friendly Main Info */}
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                ¡Ups! Algo no salió como esperábamos
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {name
                  ? `Ocurrió un inconveniente al cargar el módulo "${name}".`
                  : "No te preocupes, tu información está resguardada. Tuvimos un inconveniente técnico inesperado en esta sección."}{" "}
                Ya notificamos a nuestro equipo para resolverlo.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
              <Button
                onClick={this.handleReset}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl px-5 py-2.5 h-11"
              >
                <RefreshCw className="mr-2 size-4" />
                Reintentar
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl px-5 py-2.5 h-11"
              >
                Recargar página
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
        </div>
      );
    }

    return this.props.children;
  }
}
