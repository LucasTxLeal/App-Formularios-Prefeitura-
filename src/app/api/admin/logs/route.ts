import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, readAdminEmail } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const admin = await readAdminEmail(token);
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("access_logs")
    .select("id, actor_type, actor, action, resource_type, resource_id, ip, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar log de auditoria." }, { status: 500 });
  }

  const { data: codes } = await supabase.from("access_codes").select("code, unidade_nome");
  const unidadesPorCodigo: Record<string, string> = {};
  for (const c of codes ?? []) {
    unidadesPorCodigo[c.code] = c.unidade_nome;
  }

  return NextResponse.json({ logs: data, unidadesPorCodigo });
}
