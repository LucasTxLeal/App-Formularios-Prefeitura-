import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { ACCESS_COOKIE, readAccessCode } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const code = await readAccessCode(token);

  if (!code) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("access_codes")
    .select("code, unidade_nome")
    .eq("code", code)
    .maybeSingle();

  return NextResponse.json({
    authenticated: true,
    code,
    unidade: data?.unidade_nome ?? null,
  });
}
