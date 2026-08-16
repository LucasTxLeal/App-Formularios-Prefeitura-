"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  HardHat,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Home,
} from "lucide-react";
import SignatureCanvas, { SignatureCanvasHandle } from "@/components/SignatureCanvas";

const initialForm = {
  unidade_setor: "",
  data_ocorrido: "",
  horario_ocorrido: "",
  profissional_responsavel: "",
  trabalhador_nome: "",
  trabalhador_cargo: "",
  descricao_acidente: "",
  acoes_imediatas: "",
};

export default function AcidenteTrabalhoPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sigTrabalhador = useRef<SignatureCanvasHandle>(null);
  const sigProfissional = useRef<SignatureCanvasHandle>(null);

  function updateField<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (sigTrabalhador.current?.isEmpty()) {
      setError("A assinatura do trabalhador/declarante é obrigatória.");
      return;
    }
    if (sigProfissional.current?.isEmpty()) {
      setError("A assinatura do profissional de segurança é obrigatória.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assinatura_trabalhador: sigTrabalhador.current?.toDataURL(),
          assinatura_profissional: sigProfissional.current?.toDataURL(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível enviar o relatório.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
      setSubmitting(false);
    }
  }

  function resetAndReturn() {
    router.push("/central");
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="bg-white border-b border-brand-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/central")}
            className="w-9 h-9 rounded-lg hover:bg-brand-slate-100 flex items-center justify-center text-brand-slate-700/70 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-lg bg-brand-blue-600 flex items-center justify-center">
            <HardHat className="text-white" size={18} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">C1 · Relato de Acidente de Trabalho</p>
            <p className="text-xs text-brand-slate-700/50">Preencha todos os campos com atenção</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Bloco 1: Dados gerais */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card p-6"
        >
          <h2 className="font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue-600 text-white text-xs flex items-center justify-center">
              1
            </span>
            Dados Gerais
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Unidade da Prefeitura / Setor
              </label>
              <input
                required
                value={form.unidade_setor}
                onChange={(e) => updateField("unidade_setor", e.target.value)}
                placeholder="Ex: Secretaria de Obras - Almoxarifado"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Data do ocorrido
              </label>
              <input
                required
                type="date"
                value={form.data_ocorrido}
                onChange={(e) => updateField("data_ocorrido", e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Horário do ocorrido
              </label>
              <input
                required
                type="time"
                value={form.horario_ocorrido}
                onChange={(e) => updateField("horario_ocorrido", e.target.value)}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Nome do profissional de segurança responsável
              </label>
              <input
                required
                value={form.profissional_responsavel}
                onChange={(e) => updateField("profissional_responsavel", e.target.value)}
                placeholder="Nome completo"
                className="input"
              />
            </div>
          </div>
        </motion.section>

        {/* Bloco 2: Detalhamento */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-card p-6"
        >
          <h2 className="font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue-600 text-white text-xs flex items-center justify-center">
              2
            </span>
            Detalhamento do Acidente
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Nome do trabalhador envolvido
              </label>
              <input
                required
                value={form.trabalhador_nome}
                onChange={(e) => updateField("trabalhador_nome", e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Cargo do trabalhador
              </label>
              <input
                required
                value={form.trabalhador_cargo}
                onChange={(e) => updateField("trabalhador_cargo", e.target.value)}
                className="input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Descrição detalhada do acidente / relato do trabalhador
              </label>
              <textarea
                required
                rows={5}
                value={form.descricao_acidente}
                onChange={(e) => updateField("descricao_acidente", e.target.value)}
                placeholder="Descreva como o acidente ocorreu, local, circunstâncias e consequências..."
                className="input resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
                Ações imediatas tomadas
              </label>
              <textarea
                required
                rows={4}
                value={form.acoes_imediatas}
                onChange={(e) => updateField("acoes_imediatas", e.target.value)}
                placeholder="Descreva os primeiros socorros, afastamento, comunicações realizadas..."
                className="input resize-none"
              />
            </div>
          </div>
        </motion.section>

        {/* Bloco 3: Assinaturas */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-card p-6"
        >
          <h2 className="font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue-600 text-white text-xs flex items-center justify-center">
              3
            </span>
            Assinaturas
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            <SignatureCanvas ref={sigTrabalhador} label="Assinatura do Declarante / Trabalhador" />
            <SignatureCanvas
              ref={sigProfissional}
              label="Assinatura e Carimbo do Profissional de Segurança"
            />
          </div>
        </motion.section>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-green-500 hover:bg-brand-green-600 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors shadow-card"
        >
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {submitting ? "Enviando relatório..." : "Enviar Relatório"}
        </motion.button>
      </form>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-blue-900/80 backdrop-blur-sm flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring" }}
                className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-green-500/10 flex items-center justify-center"
              >
                <CheckCircle2 className="text-brand-green-500" size={36} />
              </motion.div>
              <h3 className="font-bold text-lg text-brand-slate-900">Relatório enviado!</h3>
              <p className="text-brand-slate-700/60 text-sm mt-1.5">
                O relato de acidente foi registrado com sucesso e vinculado à sua unidade.
              </p>
              <button
                onClick={resetAndReturn}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <Home size={16} />
                Voltar à Central
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem;
          transition: all 0.15s ease;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </main>
  );
}
