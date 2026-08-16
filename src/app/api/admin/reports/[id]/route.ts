import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ADMIN_COOKIE, readAdminEmail } from "@/lib/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const admin = await readAdminEmail(token);
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("y96_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar relatório." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ report: data });
}
