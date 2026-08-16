"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (searchParams.get("expired")) {
      setError("Sua sessão expirou. Informe o código novamente.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código inválido.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }

      router.push("/central");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue-900 via-brand-blue-700 to-brand-green-600 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-card overflow-hidden"
      >
        <div className="bg-brand-blue-900 px-8 py-8 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-green-500 flex items-center justify-center"
          >
            <ShieldCheck className="text-white" size={32} />
          </motion.div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            Segurança do Trabalho
          </h1>
          <p className="text-brand-blue-100 text-sm mt-1">
            Plataforma Municipal de Relatórios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8">
          <label
            htmlFor="code"
            className="block text-sm font-medium text-brand-slate-700 mb-2"
          >
            Código de acesso da unidade
          </label>

          <motion.input
            ref={inputRef}
            id="code"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            maxLength={6}
            animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 rounded-xl border-2 border-brand-slate-100 focus:border-brand-blue-500 focus:outline-none focus:ring-4 focus:ring-brand-blue-100 transition-all"
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mt-3 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2"
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading || code.length < 4}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 disabled:bg-brand-slate-100 disabled:text-brand-slate-700/40 text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Acessar plataforma
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-brand-slate-700/50 mt-6">
            É administrador?{" "}
            <a href="/admin/login" className="text-brand-blue-600 font-medium hover:underline">
              Acesse o painel central
            </a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
