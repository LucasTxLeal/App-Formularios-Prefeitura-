"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, LogOut, Building2 } from "lucide-react";
import FormCard from "@/components/FormCard";
import { FORM_TYPES, FormTypeDef } from "@/data/formTypes";

export default function CentralPage() {
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<{ code: string; unidade: string | null } | null>(
    null
  );
  const [transitioning, setTransitioning] = useState<FormTypeDef | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setSessionInfo({ code: data.code, unidade: data.unidade });
        }
      });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function handleSelect(form: FormTypeDef) {
    if (!form.ativo) return;
    setTransitioning(form);
    setTimeout(() => {
      router.push(`/formulario/${form.slug}`);
    }, 380);
  }

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-brand-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-blue-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Central de Formulários</p>
              {sessionInfo && (
                <p className="text-xs text-brand-slate-700/50 flex items-center gap-1">
                  <Building2 size={12} />
                  {sessionInfo.unidade ?? `Código ${sessionInfo.code}`}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-brand-slate-700/60 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-brand-slate-900">Selecione um formulário</h1>
          <p className="text-brand-slate-700/60 mt-1">
            Escolha entre os 11 tipos de registro disponíveis para sua unidade.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {FORM_TYPES.map((form, i) => (
            <motion.div
              key={form.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <FormCard form={form} onSelect={handleSelect} />
            </motion.div>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-blue-900/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-2xl px-8 py-6 flex items-center gap-3 shadow-2xl"
            >
              <transitioning.icon className="text-brand-blue-600" size={28} />
              <span className="font-semibold text-brand-slate-900">{transitioning.titulo}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
