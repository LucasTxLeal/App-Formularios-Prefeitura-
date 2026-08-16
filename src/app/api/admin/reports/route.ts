import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, readAdminEmail } from "@/lib/session";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return readAdminEmail(token);
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    // Lista todas as notificações Y96 de um código específico, ordenadas por data
    const { data, error } = await supabase
      .from("y96_reports")
      .select("id, nome_paciente, data_acidente, hora_acidente, empresa_nome, notificador_nome, created_at")
      .eq("access_code", code)
      .order("data_acidente", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao buscar relatórios." }, { status: 500 });
    }

    return NextResponse.json({ reports: data });
  }

  // Sem "code": retorna as pastas (um resumo por código de acesso)
  const { data: codes, error: codesError } = await supabase
    .from("access_codes")
    .select("code, unidade_nome, active")
    .order("code", { ascending: true });

  if (codesError) {
    console.error(codesError);
    return NextResponse.json({ error: "Erro ao buscar unidades." }, { status: 500 });
  }

  const { data: counts, error: countsError } = await supabase
    .from("y96_reports")
    .select("access_code");

  if (countsError) {
    console.error(countsError);
    return NextResponse.json({ error: "Erro ao contar relatórios." }, { status: 500 });
  }

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.access_code] = (countMap[row.access_code] ?? 0) + 1;
  }

  const folders = (codes ?? []).map((c) => ({
    code: c.code,
    unidade_nome: c.unidade_nome,
    active: c.active,
    total: countMap[c.code] ?? 0,
  }));

  return NextResponse.json({ folders });
}
