import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, ADMIN_COOKIE, readAccessCode, readAdminEmail } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege a central e os formularios: exige codigo de acesso valido na sessao
  if (pathname.startsWith("/central") || pathname.startsWith("/formulario")) {
    const token = request.cookies.get(ACCESS_COOKIE)?.value;
    const code = await readAccessCode(token);
    if (!code) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("expired", "1");
      return NextResponse.redirect(url);
    }
  }

  // Protege o painel administrativo (exceto a propria tela de login)
  if (pathname.startsWith("/admin/dashboard")) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const email = await readAdminEmail(token);
    if (!email) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/central/:path*", "/formulario/:path*", "/admin/dashboard/:path*"],
};
