import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ACCESS_COOKIE, createAccessToken } from "@/lib/session";
import { getClientIp } from "@/lib/request";
import { checkRateLimit, recordLoginAttempt } from "@/lib/rateLimit";
import { logAuditEvent } from "@/lib/auditLog";

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const ip = getClientIp(request);

  try {
    const { blocked, retryAfterMinutes } = await checkRateLimit(supabase, ip, "access");
    if (blocked) {
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${retryAfterMinutes} minutos.` },
        { status: 429 }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("access_codes")
      .select("code, unidade_nome, active")
      .ilike("code", code.trim())
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao validar código." }, { status: 500 });
    }

    if (!data) {
      await recordLoginAttempt(supabase, ip, "access", false);
      await logAuditEvent(supabase, { actorType: "code", actor: code.trim() || "?", action: "login_failed", ip });
      return NextResponse.json({ error: "Código de acesso não encontrado ou inativo." }, { status: 401 });
    }

    await recordLoginAttempt(supabase, ip, "access", true);
    await logAuditEvent(supabase, { actorType: "code", actor: data.code, action: "login_access", ip });

    const token = await createAccessToken(data.code);
    const response = NextResponse.json({ success: true, unidade: data.unidade_nome });

    response.cookies.set(ACCESS_COOKIE, token, {
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
