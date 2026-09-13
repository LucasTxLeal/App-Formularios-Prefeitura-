import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente administrativo, usado SOMENTE dentro de rotas /api (server-side).
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
