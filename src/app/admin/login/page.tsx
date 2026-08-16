"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, KeyRound, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível autenticar.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Erro de conexão.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-slate-900 via-brand-blue-900 to-brand-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-card overflow-hidden"
      >
        <div className="bg-brand-slate-900 px-8 py-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-blue-600 flex items-center justify-center">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-white text-xl font-bold">Painel Administrativo</h1>
          <p className="text-brand-slate-100/70 text-sm mt-1">Acesso restrito à coordenação</p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate-700/40" size={16} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-slate-100 focus:border-brand-blue-500 focus:outline-none focus:ring-4 focus:ring-brand-blue-100 text-sm"
                placeholder="admin@prefeitura.gov.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-slate-700/40" size={16} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-slate-100 focus:border-brand-blue-500 focus:outline-none focus:ring-4 focus:ring-brand-blue-100 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Entrar <ArrowRight size={16} /></>}
          </motion.button>

          <p className="text-center text-xs text-brand-slate-700/50">
            <a href="/" className="text-brand-blue-600 hover:underline">
              Voltar ao acesso por código
            </a>
          </p>
        </form>
      </motion.div>
    </main>
  );
}
