import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ACCESS_COOKIE, readAccessCode } from "@/lib/session";

// Campos que podem ser string vazia no formulário mas devem virar NULL no banco
// (evita erro de tipo em colunas date/time quando o campo fica em branco).
const NULLABLE_IF_EMPTY = [
  "data_nascimento",
  "data_atendimento",
  "data_obito",
  "hora_acidente",
  "outros_atingidos_qtd",
];

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const code = await readAccessCode(token);

  if (!code) {
    return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
  }

  try {
    const body = await request.json();

    const required = [
      "data_notificacao",
      "data_acidente",
      "nome_paciente",
      "notificador_nome",
      "notificador_funcao",
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Campo obrigatório ausente: ${field}` }, { status: 400 });
      }
    }

    const payload: Record<string, unknown> = { ...body, access_code: code };

    for (const field of NULLABLE_IF_EMPTY) {
      if (payload[field] === "") payload[field] = null;
    }

    if (payload.outros_atingidos_qtd) {
      payload.outros_atingidos_qtd = Number(payload.outros_atingidos_qtd);
    }

    if (!Array.isArray(payload.partes_corpo)) {
      payload.partes_corpo = [];
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("y96_reports")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Erro ao salvar notificação." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro inesperado ao processar requisição." }, { status: 500 });
  }
}
