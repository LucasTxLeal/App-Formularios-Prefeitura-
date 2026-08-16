import { createBrowserClient } from "@supabase/ssr";

// Cliente publico (anon key) - usado apenas para casos sem dado sensivel.
// As operacoes de escrita/leitura de formularios passam pelas API routes
// do servidor, que usam a service role key.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
