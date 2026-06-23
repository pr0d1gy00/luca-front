import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth_token";
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

  // ── Sin token ────────────────────────────────────────────────
  if (!token) {
    const isLoginPage = path === "/login" || path === "/";
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Con token → verificar con /me ───────────────────────────
  // Intentamos users/me primero; si es 401, probamos patients/me.
  let isPatient = false;
  let userMeResponse = await fetch(`${API_BASE}/auth/users/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  // 401 del ecosystem users → probar patients
  if (userMeResponse.status === 401) {
    userMeResponse = await fetch(`${API_BASE}/auth/patients/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    isPatient = true;
  }

  // Cualquiera de las dos sigue en 401 → token inválido
  if (userMeResponse.status === 401) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  // 200 OK → verificar is_verified
  if (userMeResponse.ok) {
    try {
      const user = (await userMeResponse.json()) as {
        is_verified?: boolean;
      };

      // Patients no requieren KYC → siempre verificados
      if (!isPatient) {
        const isVerified = user.is_verified ?? false;
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
