import { NextRequest } from "next/server";

/**
 * Extrai o IP do cliente a partir dos cabeçalhos de proxy (a Vercel injeta
 * x-forwarded-for automaticamente). Usado para rate limiting e log de acesso.
 */
export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
