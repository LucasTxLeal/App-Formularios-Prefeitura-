import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/session";
import { getClientIp } from "@/lib/request";
import { checkRateLimit, recordLoginAttempt } from "@/lib/rateLimit";
import { logAuditEvent } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  const serviceClient = createServiceClient();
  const ip = getClientIp(request);

  try {
    const { blocked, retryAfterMinutes } = await checkRateLimit(serviceClient, ip, "admin");
    if (blocked) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${retryAfterMinutes} minutos.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }

    const authClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      await recordLoginAttempt(serviceClient, ip, "admin", false);
      await logAuditEvent(serviceClient, { actorType: "admin", actor: email || "?", action: "login_failed", ip });
      return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }

    await recordLoginAttempt(serviceClient, ip, "admin", true);
    await logAuditEvent(serviceClient, {
      actorType: "admin",
      actor: data.user.email ?? email,
      action: "login_admin",
      ip,
    });

    const token = await createAdminToken(data.user.email ?? email);
    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
