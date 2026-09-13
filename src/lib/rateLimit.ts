import { SupabaseClient } from "@supabase/supabase-js";

const WINDOW_MINUTES = 10;
const MAX_ATTEMPTS = 8;

/**
 * Verifica se o identificador (IP + tipo de login) já estourou o limite de
 * tentativas na janela de tempo. Retorna { blocked: true } se sim.
 *
 * Não distingue tentativa certa/errada no limite — mesmo alguém acertando o
 * código na 9ª tentativa é bloqueado, pois o objetivo é impedir varredura
 * automatizada de códigos/senhas, não "dar mais uma chance" para quem já
 * tentou várias vezes.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  loginType: "access" | "admin"
): Promise<{ blocked: boolean; retryAfterMinutes: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("identifier", identifier)
    .eq("login_type", loginType)
    .gte("created_at", windowStart);

  if (error) {
    // Se a checagem falhar por algum motivo, não bloqueia o login (evita
    // deixar todo mundo fora do sistema por causa de um erro de infra) —
    // mas registra no log do servidor para investigação.
    console.error("Erro ao checar rate limit:", error);
    return { blocked: false, retryAfterMinutes: 0 };
  }

  return {
    blocked: (count ?? 0) >= MAX_ATTEMPTS,
    retryAfterMinutes: WINDOW_MINUTES,
  };
}

/** Registra uma tentativa de login (certa ou errada) para fins de rate limit e auditoria. */
export async function recordLoginAttempt(
  supabase: SupabaseClient,
  identifier: string,
  loginType: "access" | "admin",
  success: boolean
) {
  const { error } = await supabase.from("login_attempts").insert({
    identifier,
    login_type: loginType,
    success,
  });
  if (error) console.error("Erro ao registrar tentativa de login:", error);
}
