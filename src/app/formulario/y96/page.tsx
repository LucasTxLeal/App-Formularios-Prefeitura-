"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HardHat, CheckCircle2, Loader2, AlertCircle, Home } from "lucide-react";
import { SelectField, TextField, CheckboxGroupField } from "@/components/FormFields";
import {
  OPCOES_SEXO,
  OPCOES_GESTANTE,
  OPCOES_RACA_COR,
  OPCOES_ESCOLARIDADE,
  OPCOES_SITUACAO_MERCADO_TRABALHO,
  OPCOES_LOCAL_ACIDENTE,
  OPCOES_SIM_NAO_NA_IGNORADO,
  OPCOES_SIM_NAO_IGNORADO,
  OPCOES_TIPO_ACIDENTE,
  OPCOES_PARTES_CORPO,
  OPCOES_REGIME_TRATAMENTO,
  OPCOES_EVOLUCAO_CASO,
} from "@/data/y96Options";

const initialForm = {
  // Dados Gerais
  data_notificacao: "",
  data_acidente: "",
  nome_paciente: "",
  data_nascimento: "",
  sexo: "",
  gestante: "",
  raca_cor: "",
  escolaridade: "",
  cartao_sus: "",
  nome_mae: "",
  municipio_residencia: "",
  logradouro: "",
  numero_endereco: "",
  complemento: "",
  bairro: "",
  ocupacao: "",

  // Dados do Trabalho
  situacao_mercado_trabalho: "",
  local_acidente: "",
  tempo_trabalho_ocupacao: "",

  // Dados da Empresa Contratante
  empresa_cnpj_cpf: "",
  empresa_nome: "",
  empresa_cnae: "",
  empresa_endereco: "",
  empresa_bairro: "",
  empresa_municipio: "",
  empresa_numero: "",
  empresa_uf: "",
  empresa_terceirizada: "",
  empresa_principal_cnae: "",
  empresa_principal_cnpj: "",
  empresa_principal_nome: "",

  // Dados do Acidente
  hora_acidente: "",
  horas_apos_jornada: "",
  municipio_ocorrencia: "",
  cid10_causa: "",
  tipo_acidente: "",
  outros_atingidos: "",
  outros_atingidos_qtd: "",
  atendimento_medico: "",
  data_atendimento: "",
  municipio_atendimento: "",
  unidade_saude: "",
  diagnostico_cid10: "",
  regime_tratamento: "",
  evolucao_caso: "",
  data_obito: "",
  cat_emitida: "",

  // Notificação
  notificador_nome: "",
  notificador_funcao: "",
};

export default function Y96Page() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [partesCorpo, setPartesCorpo] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set<K extends keyof typeof initialForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, partes_corpo: partesCorpo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Não foi possível enviar a notificação.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setSubmitting(false);
    }
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
            <p className="font-bold text-sm leading-tight">Y96 · Acidente de Trabalho</p>
            <p className="text-xs text-brand-slate-700/50">
              Notificação SINAN — CID-10 Capítulo XX (V01 a Y98)
            </p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-brand-slate-700/60 bg-brand-blue-50 border border-brand-blue-100 rounded-xl px-4 py-3 leading-relaxed"
        >
          <strong>Definição de caso:</strong> todo caso de acidente de trabalho por causas não
          naturais (acidentes e violências, CID-10 V01 a Y98), ocorrido no ambiente de trabalho,
          no exercício da função (Típico) ou no trajeto entre residência e trabalho (Trajeto),
          que provoque lesão corporal, perturbação funcional, incapacidade ou morte.
        </motion.p>

        {/* 1. Dados Gerais */}
        <Section n={1} title="Dados Gerais">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Data da notificação" type="date" required value={form.data_notificacao} onChange={(v) => set("data_notificacao", v)} />
            <TextField label="Data do acidente" type="date" required value={form.data_acidente} onChange={(v) => set("data_acidente", v)} />
            <div className="sm:col-span-2">
              <TextField label="Nome do paciente" required value={form.nome_paciente} onChange={(v) => set("nome_paciente", v)} />
            </div>
            <TextField label="Data de nascimento" type="date" value={form.data_nascimento} onChange={(v) => set("data_nascimento", v)} />
            <SelectField label="Sexo" value={form.sexo} onChange={(v) => set("sexo", v)} options={OPCOES_SEXO} />
            <SelectField label="Gestante" value={form.gestante} onChange={(v) => set("gestante", v)} options={OPCOES_GESTANTE} />
            <SelectField label="Raça/Cor" value={form.raca_cor} onChange={(v) => set("raca_cor", v)} options={OPCOES_RACA_COR} />
            <div className="sm:col-span-2">
              <SelectField label="Escolaridade" value={form.escolaridade} onChange={(v) => set("escolaridade", v)} options={OPCOES_ESCOLARIDADE} />
            </div>
            <TextField label="Número do Cartão SUS" value={form.cartao_sus} onChange={(v) => set("cartao_sus", v)} />
            <TextField label="Nome da mãe" value={form.nome_mae} onChange={(v) => set("nome_mae", v)} />
            <TextField label="Município de residência" value={form.municipio_residencia} onChange={(v) => set("municipio_residencia", v)} />
            <TextField label="Logradouro" value={form.logradouro} onChange={(v) => set("logradouro", v)} />
            <TextField label="Número" value={form.numero_endereco} onChange={(v) => set("numero_endereco", v)} />
            <TextField label="Complemento" value={form.complemento} onChange={(v) => set("complemento", v)} />
            <TextField label="Bairro" value={form.bairro} onChange={(v) => set("bairro", v)} />
            <TextField label="Ocupação" value={form.ocupacao} onChange={(v) => set("ocupacao", v)} />
          </div>
        </Section>

        {/* 2. Dados do Trabalho */}
        <Section n={2} title="Dados do Trabalho">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <SelectField label="Situação no mercado de trabalho" value={form.situacao_mercado_trabalho} onChange={(v) => set("situacao_mercado_trabalho", v)} options={OPCOES_SITUACAO_MERCADO_TRABALHO} />
            </div>
            <SelectField label="Local onde ocorreu o acidente" value={form.local_acidente} onChange={(v) => set("local_acidente", v)} options={OPCOES_LOCAL_ACIDENTE} />
            <TextField label="Tempo de trabalho na ocupação" placeholder="Ex: 2 anos" value={form.tempo_trabalho_ocupacao} onChange={(v) => set("tempo_trabalho_ocupacao", v)} />
          </div>
        </Section>

        {/* 3. Dados da Empresa Contratante */}
        <Section n={3} title="Dados da Empresa Contratante">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Registro/CNPJ ou CPF" value={form.empresa_cnpj_cpf} onChange={(v) => set("empresa_cnpj_cpf", v)} />
            <TextField label="Nome da empresa ou empregador" value={form.empresa_nome} onChange={(v) => set("empresa_nome", v)} />
            <TextField label="Atividade econômica – CNAE" value={form.empresa_cnae} onChange={(v) => set("empresa_cnae", v)} />
            <TextField label="Endereço" value={form.empresa_endereco} onChange={(v) => set("empresa_endereco", v)} />
            <TextField label="Bairro" value={form.empresa_bairro} onChange={(v) => set("empresa_bairro", v)} />
            <TextField label="Município" value={form.empresa_municipio} onChange={(v) => set("empresa_municipio", v)} />
            <TextField label="Número" value={form.empresa_numero} onChange={(v) => set("empresa_numero", v)} />
            <TextField label="UF" maxLength={2} placeholder="Ex: RS" value={form.empresa_uf} onChange={(v) => set("empresa_uf", v.toUpperCase())} />
            <SelectField label="O empregador é empresa terceirizada?" value={form.empresa_terceirizada} onChange={(v) => set("empresa_terceirizada", v)} options={OPCOES_SIM_NAO_NA_IGNORADO} />
            <TextField label="Se terceirizada, CNAE da empresa principal" value={form.empresa_principal_cnae} onChange={(v) => set("empresa_principal_cnae", v)} />
            <TextField label="CNPJ da empresa principal" value={form.empresa_principal_cnpj} onChange={(v) => set("empresa_principal_cnpj", v)} />
            <TextField label="Nome da empresa principal" value={form.empresa_principal_nome} onChange={(v) => set("empresa_principal_nome", v)} />
          </div>
        </Section>

        {/* 4. Dados do Acidente */}
        <Section n={4} title="Dados do Acidente">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Hora do acidente" type="time" value={form.hora_acidente} onChange={(v) => set("hora_acidente", v)} />
            <TextField label="Horas após o início da jornada" placeholder="Ex: 3h30" value={form.horas_apos_jornada} onChange={(v) => set("horas_apos_jornada", v)} />
            <TextField label="Município de ocorrência do acidente" value={form.municipio_ocorrencia} onChange={(v) => set("municipio_ocorrencia", v)} />
            <TextField label="Código da causa do acidente – CID-10 (V01 a Y98)" value={form.cid10_causa} onChange={(v) => set("cid10_causa", v)} />
            <SelectField label="Tipo de acidente" value={form.tipo_acidente} onChange={(v) => set("tipo_acidente", v)} options={OPCOES_TIPO_ACIDENTE} />
            <SelectField label="Houve outros trabalhadores atingidos?" value={form.outros_atingidos} onChange={(v) => set("outros_atingidos", v)} options={OPCOES_SIM_NAO_IGNORADO} />
            {form.outros_atingidos === "Sim" && (
              <TextField label="Se sim, quantos?" type="number" value={form.outros_atingidos_qtd} onChange={(v) => set("outros_atingidos_qtd", v)} />
            )}
            <SelectField label="Ocorreu atendimento médico?" value={form.atendimento_medico} onChange={(v) => set("atendimento_medico", v)} options={OPCOES_SIM_NAO_IGNORADO} />
            <TextField label="Data do atendimento" type="date" value={form.data_atendimento} onChange={(v) => set("data_atendimento", v)} />
            <TextField label="Município do atendimento" value={form.municipio_atendimento} onChange={(v) => set("municipio_atendimento", v)} />
            <TextField label="Nome da Unidade de Saúde de atendimento" value={form.unidade_saude} onChange={(v) => set("unidade_saude", v)} />

            <CheckboxGroupField label="Partes do corpo atingidas" values={partesCorpo} onChange={setPartesCorpo} options={OPCOES_PARTES_CORPO} />

            <TextField label="Diagnóstico da lesão – CID-10" value={form.diagnostico_cid10} onChange={(v) => set("diagnostico_cid10", v)} />
            <SelectField label="Regime de tratamento" value={form.regime_tratamento} onChange={(v) => set("regime_tratamento", v)} options={OPCOES_REGIME_TRATAMENTO} />
            <div className="sm:col-span-2">
              <SelectField label="Evolução do caso" value={form.evolucao_caso} onChange={(v) => set("evolucao_caso", v)} options={OPCOES_EVOLUCAO_CASO} />
            </div>
            {(form.evolucao_caso === "Óbito por acidente de trabalho grave" || form.evolucao_caso === "Óbito por outras causas") && (
              <TextField label="Se óbito, data do óbito" type="date" value={form.data_obito} onChange={(v) => set("data_obito", v)} />
            )}
            <SelectField label="Foi emitida a Comunicação de Acidente no Trabalho (CAT)?" value={form.cat_emitida} onChange={(v) => set("cat_emitida", v)} options={OPCOES_SIM_NAO_NA_IGNORADO} />
          </div>
        </Section>

        {/* 5. Notificação (sem assinatura em canvas — apenas texto) */}
        <Section n={5} title="Notificador">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Notificador / Nome" required value={form.notificador_nome} onChange={(v) => set("notificador_nome", v)} />
            <TextField label="Função" required value={form.notificador_funcao} onChange={(v) => set("notificador_funcao", v)} />
          </div>
        </Section>

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
          {submitting ? "Enviando notificação..." : "Enviar Notificação Y96"}
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
              <h3 className="font-bold text-lg text-brand-slate-900">Notificação enviada!</h3>
              <p className="text-brand-slate-700/60 text-sm mt-1.5">
                A ficha Y96 foi registrada com sucesso e vinculada à sua unidade.
              </p>
              <button
                onClick={() => router.push("/central")}
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

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: n * 0.04 }}
      className="bg-white rounded-2xl shadow-card p-6"
    >
      <h2 className="font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-brand-blue-600 text-white text-xs flex items-center justify-center">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}
