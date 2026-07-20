/**
 * LUCA Health OS - Error Telemetry & Logging Service
 * Abstraction layer to dispatch client & server side errors to monitoring services
 * (e.g., Sentry, LogRocket, Datadog, Bugsnag, GlitchTip).
 */

export interface ErrorContext {
  componentStack?: string;
  boundaryName?: string;
  user?: {
    id?: string;
    role?: string;
  };
  [key: string]: unknown;
}

/**
 * Sends caught exceptions to external telemetry services.
 */
export function logErrorToService(
  error: Error,
  context: ErrorContext = {},
): void {
  // 1. Log locally in development for fast debugging
  if (
    process.env.NODE_NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_DEBUG === "true"
  ) {
    console.group(
      `🚨 [LUCA Telemetry] Error captured in ${context.boundaryName || "ErrorBoundary"}`,
    );
    console.error("Error:", error);
    if (context.componentStack) {
      console.error("Component Stack:", context.componentStack);
    }
    if (Object.keys(context).length > 0) {
      console.dir("Extra Context:", context);
    }
    console.groupEnd();
  }

  // 2. Production Service Integration (Sentry, LogRocket, Datadog, etc.)
  // Replace / uncomment when Sentry or your SDK is installed:
  /*
  if (typeof window !== "undefined" && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
      tags: {
        boundary: context.boundaryName || "unknown",
      },
    });
  }
  */

  // Optional: Custom HTTP endpoint if using an in-house logger
  /*
  if (process.env.NODE_ENV === "production") {
    fetch("/api/telemetry/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Ignore background telemetry errors
    });
  }
  */
}
