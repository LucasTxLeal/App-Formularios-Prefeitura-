import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, readAdminEmail } from "@/lib/session";
import { getFormSchema } from "@/data/dynamicForms/registry";
import { getClientIp } from "@/lib/request";
import { logAuditEvent } from "@/lib/auditLog";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const admin = await readAdminEmail(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const origin = request.headers.get("origin");
  if ((origin && origin !== request.nextUrl.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  const { slug, id } = await params;
  const schema = getFormSchema(slug);
  if (!schema) return NextResponse.json({ error: "Formulário desconhecido." }, { status: 404 });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Identificador inválido." }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.from(schema.table).delete().eq("id", id).select("id").maybeSingle();
    if (error) {
      console.error("Erro ao excluir notificação:", error);
      return NextResponse.json({ error: "Não foi possível excluir a notificação." }, { status: 500 });
    }
    if (!data) return NextResponse.json({ error: "Notificação não encontrada ou já excluída." }, { status: 404 });

    // Uma falha no log não altera o resultado de uma exclusão já concluída.
    try {
      await logAuditEvent(supabase, { actorType: "admin", actor: admin, action: "delete_report", resourceType: slug, resourceId: id, ip: getClientIp(request) });
    } catch (error) {
      console.error("Erro ao registrar exclusão na auditoria:", error);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir notificação:", error);
    return NextResponse.json({ error: "Não foi possível excluir a notificação." }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const admin = await readAdminEmail(token);
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const schema = getFormSchema(slug);
  if (!schema) {
    return NextResponse.json({ error: "Formulário desconhecido." }, { status: 404 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(schema.table)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar notificação." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Notificação não encontrada." }, { status: 404 });
  }

  let unidadeNome: string | null = null;
  const accessCode = (data as Record<string, unknown>).access_code;
  if (typeof accessCode === "string") {
    const { data: unidade } = await supabase
      .from("access_codes")
      .select("unidade_nome")
      .eq("code", accessCode)
      .maybeSingle();
    unidadeNome = unidade?.unidade_nome ?? null;
  }

  await logAuditEvent(supabase, {
    actorType: "admin",
    actor: admin,
    action: "view_report",
    resourceType: slug,
    resourceId: id,
    ip: getClientIp(request),
  });

  return NextResponse.json({ report: data, schema, unidadeNome });
}
