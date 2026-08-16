import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ACCESS_COOKIE, createAccessToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Código inválido." }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("access_codes")
      .select("code, unidade_nome, active")
      .eq("code", code.trim())
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao validar código." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Código de acesso não encontrado ou inativo." }, { status: 401 });
    }

    const token = await createAccessToken(data.code);
    const response = NextResponse.json({ success: true, unidade: data.unidade_nome });

    response.cookies.set(ACCESS_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro inesperado." }, { status: 500 });
  }
}
