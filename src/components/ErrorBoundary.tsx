"use client";

import React, { Component, ReactNode } from "react";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  LifeBuoy,
} from "lucide-react";
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
  showTechnicalDetails: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    showTechnicalDetails: false,
  };

  public static getDerivedStateFromError(
    error: Error,
  ): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Send error telemetry to external monitoring service (Sentry, etc.)
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
      showTechnicalDetails: false,
    });
  };

  public toggleDetails = () => {
    this.setState((prev) => ({
      showTechnicalDetails: !prev.showTechnicalDetails,
    }));
  };

  public render() {
    if (this.state.hasError) {
      const { error } = this.state;
      const { fallback, name, showDetails } = this.props;

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
        <div className="w-full min-h-[280px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 text-center">
            {/* Header Icon */}
            <div className="mx-auto size-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-6" />
            </div>

            {/* Main Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Se produjo un problema insospechado
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {name
                  ? `El módulo "${name}" no pudo cargarse correctamente.`
                  : "Ocurrió un error inesperado al procesar esta sección."}{" "}
                El equipo técnico ya fue notificado automáticamente.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={this.handleReset}
                variant="default"
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-medium"
              >
                <RefreshCw className="mr-2 size-4" />
                Reintentar
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                Recargar página
              </Button>
            </div>

            {/* Collapsible Technical Details for Debugging */}
            {(showDetails || process.env.NODE_ENV === "development") &&
              error && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
                  <button
                    onClick={this.toggleDetails}
                    type="button"
                    className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <LifeBuoy className="size-3.5" />
                      Detalles técnicos para diagnóstico
                    </span>
                    {this.state.showTechnicalDetails ? (
                      <ChevronUp className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </button>

                  {this.state.showTechnicalDetails && (
                    <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto space-y-2 max-h-48 border border-slate-800">
                      <div className="font-semibold text-rose-400">
                        {error.name}: {error.message}
                      </div>
                      {error.stack && (
                        <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-400">
                          {error.stack}
                        </pre>
                      )}
                    </div>
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
