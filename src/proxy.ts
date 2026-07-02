import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Proxy / Guardián de rutas.
 *
 * - Sin cookie → login.
 * - Con cookie → /me (users primero, luego patients si 401).
 *   - 200 + is_verified = true  → next()
 *   - 200 + is_verified = false → redirect /pending-verification
 *   - 401                       → limpiar cookie y /login
 */
export async function proxy(request: NextRequest) {
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
  const payload = decodeJwt(token);
  const isPatient = !!(
    payload &&
    (payload.role === undefined ||
      (typeof payload.iss === "string" && payload.iss.includes("/patients/")))
  );

  const endpoint = isPatient
    ? `${API_BASE}/auth/patients/me`
    : `${API_BASE}/auth/users/me`;

  const userMeResponse = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  // Cualquiera de las dos sigue en 401 → token inválido
  if (userMeResponse.status === 401) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  // 200 OK → verificar is_verified
  if (userMeResponse.ok) {
    try {
      const data = (await userMeResponse.json()) as {
        is_verified?: boolean;
        isVerified?: boolean;
        user?: { is_verified?: boolean; isVerified?: boolean };
      };

      const user = data.user ? data.user : data;

      // Patients no requieren KYC → siempre verificados
      if (!isPatient) {
        const isVerified = user.is_verified ?? user.isVerified ?? false;
        if (!isVerified) {
          if (path !== "/dashboard/pending-verification") {
            return NextResponse.redirect(
              new URL("/dashboard/pending-verification", request.url),
            );
          }
        }
      }
    } catch {
      // JSON inválido → continuar
    }
  }

  // 403 para users → pending verification
  if (userMeResponse.status === 403 && !isPatient) {
    if (path !== "/dashboard/pending-verification") {
      return NextResponse.redirect(
        new URL("/dashboard/pending-verification", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
