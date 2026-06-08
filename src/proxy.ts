// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Definimos qué rutas son públicas (no requieren sesión)
const publicRoutes = [
  "/login",
  "/register",
  "/dashboard",
  "/",
  "/clinical-history",
  "/clinical-history/builder",
  "/clinical-history/preview/template-001",
];

export function proxy(request: NextRequest) {
  // 2. Extraemos la ruta que el usuario intenta visitar
  const path = request.nextUrl.pathname;

  // Exclude clinical-history routes from auth check
  if (path.startsWith("/clinical-history")) {
    return NextResponse.next();
  }

  // Exclude all dashboard sub-routes during development (no backend auth yet)
  if (path.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);

  // 3. Buscamos el "Pase de Entrada" (El token de sesión en las cookies)
  // Nota: Cuando hagas el login en el frontend, debes guardar el token en una cookie llamada 'luca_session'
  const token = request.cookies.get("luca_session")?.value;

  // 4. REGLA A: Si intenta ir a una ruta privada (ej. /dashboard) y NO tiene token
  if (!isPublicRoute && !token) {
    // Lo pateamos de vuelta al login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. REGLA B: Si ya tiene token e intenta ir al /login o /register
  if (isPublicRoute && token) {
    // Lo enviamos directo a su zona de trabajo, no tiene sentido que vea el login de nuevo
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si todo está bien, lo dejamos pasar
  return NextResponse.next();
}

// 6. Configuración: Le decimos a Next.js en qué rutas debe ejecutar este guardián
// Excluimos las rutas de archivos estáticos (imágenes, css, js) para no perder rendimiento
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
