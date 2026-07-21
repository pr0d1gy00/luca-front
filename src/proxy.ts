import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const API_BASE = process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

/**
 * Middleware / Guardián de rutas.
 *
 * - Sin cookie → login.
 * - Con cookie → /me (users primero, luego patients si 401).
 *   - 200 + is_verified = true  → next()
 *   - 200 + is_verified = false → redirect /pending-verification
 *   - 401                       → limpiar cookie y /login
 */
export async function proxy(request: NextRequest) {
  console.log("=== PROXY TRIGGERED ===", request.nextUrl.pathname);

  const path = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  // ── Rutas públicas (sin auth requerida) ─────────────────────
  const PUBLIC_ROUTES = ["/", "/login", "/doctors", "/pharmacies", "/clinics"];

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(route + "/"),
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ── Sin token (rutas privadas) ────────────────────────────────
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Con token → verificar con /me ───────────────────────────
  try {
    const userMeResponse = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Cookie: `${AUTH_COOKIE}=${token}`,
        Accept: "application/json",
      },
    });

    // 401 → token inválido o vencido
    if (userMeResponse.status === 401) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(AUTH_COOKIE);
      return response;
    }

    // 200 OK → verificar is_verified
    if (userMeResponse.ok) {
      const data = (await userMeResponse.json()) as {
        user?: {
          role?: string;
          isVerified?: boolean;
          is_verified?: boolean;
        };
      };

      const user = data.user;
      if (user) {
        const isPatient = user.role === "patient";
        const isVerified = user.isVerified ?? user.is_verified ?? false;

        // Si no es paciente y no está verificado, redirigir a pending-verification (excepto a perfil para cargar docs)
        if (!isPatient && !isVerified) {
          if (
            path !== "/dashboard/pending-verification" &&
            path !== "/dashboard/profile"
          ) {
            return NextResponse.redirect(
              new URL("/dashboard/pending-verification", request.url),
            );
          }
        }
      }
    }

    // 403 para users → pending verification
    if (userMeResponse.status === 403) {
      try {
        const data = (await userMeResponse.json()) as {
          user?: { role?: string };
        };
        if (data.user?.role !== "patient") {
          if (
            path !== "/dashboard/pending-verification" &&
            path !== "/dashboard/profile"
          ) {
            return NextResponse.redirect(
              new URL("/dashboard/pending-verification", request.url),
            );
          }
        }
      } catch {
        // En caso de que no tenga JSON body
        if (
          path !== "/dashboard/pending-verification" &&
          path !== "/dashboard/profile"
        ) {
          return NextResponse.redirect(
            new URL("/dashboard/pending-verification", request.url),
          );
        }
      }
    }
  } catch (err) {
    console.error("[Proxy] Network/Verification error:", err);
    // En caso de error de red con el backend, por seguridad lo mandamos a login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon-.*|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
};

export const proxyConfig = config;
