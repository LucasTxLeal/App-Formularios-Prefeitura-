import { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "login_access"
  | "login_admin"
  | "login_failed"
  | "view_report"
  | "submit_report"
  | "delete_report";

interface AuditEvent {
  actorType: "code" | "admin";
  actor: string;
  action: AuditAction;
  resourceType?: string; // slug do formulário (ex: "y96", "transtorno-mental")
  resourceId?: string; // id do registro, quando aplicável
  ip: string;
}

/**
 * Registra um evento no log de auditoria. Nunca lança erro — uma falha ao
 * gravar o log não deve impedir a ação principal do usuário (login, envio
 * de formulário, etc).
 */
export async function logAuditEvent(supabase: SupabaseClient, event: AuditEvent) {
  const { error } = await supabase.from("access_logs").insert({
    actor_type: event.actorType,
    actor: event.actor,
    action: event.action,
    resource_type: event.resourceType ?? null,
    resource_id: event.resourceId ?? null,
    ip: event.ip,
  });
  if (error) console.error("Erro ao registrar log de auditoria:", error);
}
