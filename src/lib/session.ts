// Helpers de sessão baseados em cookies assinados com HMAC-SHA256 via Web Crypto API.
// Usamos Web Crypto (em vez do módulo "crypto" do Node) para que este arquivo
// funcione tanto em rotas de API (Node runtime) quanto no middleware (Edge Runtime).

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";

export const ACCESS_COOKIE = "stw_access_session";
export const ADMIN_COOKIE = "stw_admin_session";

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function sign(value: string) {
  const key = await getKey();
  const enc = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return `${value}.${toHex(sigBuffer)}`;
}

async function verify(signed: string | undefined | null): Promise<string | null> {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);

  const expectedSigned = await sign(value);
  const expectedSig = expectedSigned.slice(expectedSigned.lastIndexOf(".") + 1);

  if (sig.length !== expectedSig.length) return null;

  // Comparação em tempo constante
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0 ? value : null;
}

export async function createAccessToken(code: string) {
  return sign(`code:${code}:${Date.now()}`);
}

export async function readAccessCode(token: string | undefined | null): Promise<string | null> {
  const value = await verify(token);
  if (!value) return null;
  const match = value.match(/^code:(.+):(\d+)$/);
  return match ? match[1] : null;
}

export async function createAdminToken(email: string) {
  return sign(`admin:${email}:${Date.now()}`);
}

export async function readAdminEmail(token: string | undefined | null): Promise<string | null> {
  const value = await verify(token);
  if (!value) return null;
  const match = value.match(/^admin:(.+):(\d+)$/);
  return match ? match[1] : null;
}
