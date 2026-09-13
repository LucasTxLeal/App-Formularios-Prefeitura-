import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, readAdminEmail } from "@/lib/session";
import { FORM_SCHEMAS } from "@/data/dynamicForms/registry";

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
  const schemas = Object.values(FORM_SCHEMAS);

  if (code) {
    // Nome da unidade correspondente ao código (para exibir na tela em vez do código cru)
    const { data: unidade } = await supabase
      .from("access_codes")
      .select("unidade_nome")
      .eq("code", code)
      .maybeSingle();

    // Lista combinada: busca notificações de TODOS os tipos para este código
    const results = await Promise.all(
      schemas.map(async (schema) => {
        const selectCols: string = `id, ${schema.primaryDateKey}, ${schema.primaryLabelKey}, notificador_nome, created_at`;
        const { data, error } = await supabase
          .from(schema.table)
          .select(selectCols)
          .eq("access_code", code);

        if (error) {
          console.error(`Erro ao buscar ${schema.table}:`, error);
          return [];
        }

        const rows = (data ?? []) as unknown as Record<string, unknown>[];

        return rows.map((row) => ({
          id: row.id,
          slug: schema.slug,
          codigo: schema.codigo,
          titulo: schema.titulo,
          data: row[schema.primaryDateKey],
          nomePaciente: row[schema.primaryLabelKey],
          notificadorNome: row.notificador_nome,
          createdAt: row.created_at,
        }));
      })
    );

    const combined = results.flat().sort((a, b) => {
      const dateA = a.data ? new Date(a.data as string).getTime() : 0;
      const dateB = b.data ? new Date(b.data as string).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ reports: combined, unidadeNome: unidade?.unidade_nome ?? null });
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

  const countsPerTable = await Promise.all(
    schemas.map(async (schema) => {
      const { data, error } = await supabase.from(schema.table).select("access_code");
      if (error) {
        console.error(`Erro ao contar ${schema.table}:`, error);
        return [];
      }
      return data ?? [];
    })
  );

  const countMap: Record<string, number> = {};
  for (const rows of countsPerTable) {
    for (const row of rows as { access_code: string }[]) {
      countMap[row.access_code] = (countMap[row.access_code] ?? 0) + 1;
    }
  }

  const folders = (codes ?? []).map((c) => ({
    code: c.code,
    unidade_nome: c.unidade_nome,
    active: c.active,
    total: countMap[c.code] ?? 0,
  }));

  return NextResponse.json({ folders });
}
