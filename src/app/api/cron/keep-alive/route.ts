import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Executada periodicamente pelo Vercel Cron (veja vercel.json) apenas para
// gerar uma requisição real ao banco e evitar o auto-pause do Supabase Free
// (que pausa projetos após 7 dias sem nenhuma consulta).
export async function GET(request: NextRequest) {
  // Protege a rota para que só o próprio Vercel Cron consiga chamá-la.
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("access_codes").select("code").limit(1);

    if (error) {
      console.error(error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
