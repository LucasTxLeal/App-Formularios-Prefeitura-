import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ACCESS_COOKIE, readAccessCode } from "@/lib/session";
import { getFormSchema, getSchemaMeta } from "@/data/dynamicForms";
import { getClientIp } from "@/lib/request";
import { logAuditEvent } from "@/lib/auditLog";

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const schema = getFormSchema(slug);
  if (!schema) {
    return NextResponse.json({ error: "Formulário desconhecido." }, { status: 404 });
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const code = await readAccessCode(token);

  if (!code) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requiredKeys, dateKeys, timeKeys, numberKeys, arrayKeys } = getSchemaMeta(schema);

    for (const field of requiredKeys) {
      if (!body[field]) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${field}` }, { status: 400 });
      }
    }

    const payload: Record<string, unknown> = { access_code: code };

    for (const section of schema.sections) {
      for (const field of section.fields) {
        const value = body[field.key];

        if (arrayKeys.includes(field.key)) {
          payload[field.key] = Array.isArray(value) ? value : [];
        } else if (numberKeys.includes(field.key)) {
          payload[field.key] = value === "" || value === undefined || value === null ? null : Number(value);
        } else if (dateKeys.includes(field.key) || timeKeys.includes(field.key)) {
          payload[field.key] = value === "" || value === undefined ? null : value;
        } else {
          payload[field.key] = value === undefined ? null : value;
        }
      }
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(schema.table)
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao salvar notificação." }, { status: 500 });
    }

    await logAuditEvent(supabase, {
      actorType: "code",
      actor: code,
      action: "submit_report",
      resourceType: slug,
      resourceId: data.id,
      ip: getClientIp(request),
    });

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro inesperado ao processar requisição." }, { status: 500 });
  }
}
