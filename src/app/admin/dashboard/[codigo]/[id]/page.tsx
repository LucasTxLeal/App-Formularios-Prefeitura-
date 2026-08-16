"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";

interface FullReport {
  id: string;
  access_code: string;
  data_notificacao: string;
  data_acidente: string;
  nome_paciente: string;
  data_nascimento: string | null;
  sexo: string | null;
  gestante: string | null;
  raca_cor: string | null;
  escolaridade: string | null;
  cartao_sus: string | null;
  nome_mae: string | null;
  municipio_residencia: string | null;
  logradouro: string | null;
  numero_endereco: string | null;
  complemento: string | null;
  bairro: string | null;
  ocupacao: string | null;
  situacao_mercado_trabalho: string | null;
  local_acidente: string | null;
  tempo_trabalho_ocupacao: string | null;
  empresa_cnpj_cpf: string | null;
  empresa_nome: string | null;
  empresa_cnae: string | null;
  empresa_endereco: string | null;
  empresa_bairro: string | null;
  empresa_municipio: string | null;
  empresa_numero: string | null;
  empresa_uf: string | null;
  empresa_terceirizada: string | null;
  empresa_principal_cnae: string | null;
  empresa_principal_cnpj: string | null;
  empresa_principal_nome: string | null;
  hora_acidente: string | null;
  horas_apos_jornada: string | null;
  municipio_ocorrencia: string | null;
  cid10_causa: string | null;
  tipo_acidente: string | null;
  outros_atingidos: string | null;
  outros_atingidos_qtd: number | null;
  atendimento_medico: string | null;
  data_atendimento: string | null;
  municipio_atendimento: string | null;
  unidade_saude: string | null;
  partes_corpo: string[] | null;
  diagnostico_cid10: string | null;
  regime_tratamento: string | null;
  evolucao_caso: string | null;
  data_obito: string | null;
  cat_emitida: string | null;
  notificador_nome: string;
  notificador_funcao: string;
  created_at: string;
}

function fmtDate(v: string | null | undefined) {
  if (!v) return "—";
  return new Date(v + "T00:00:00").toLocaleDateString("pt-BR");
}

function fmt(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

export default function RelatorioDetalhePage({
  params,
}: {
  params: Promise<{ codigo: string; id: string }>;
}) {
  const router = useRouter();
  const { codigo, id } = use(params);
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/reports/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="p-10 text-center text-brand-slate-700/50">Carregando notificação...</p>;
  }

  if (!report) {
    return <p className="p-10 text-center text-brand-slate-700/50">Notificação não encontrada.</p>;
  }

  return (
    <main className="min-h-screen bg-brand-slate-100">
      <header className="no-print bg-white border-b border-brand-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/admin/dashboard/${codigo}`)}
            className="flex items-center gap-2 text-sm text-brand-slate-700/70 hover:text-brand-blue-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar à lista
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Printer size={16} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-card p-10 print:shadow-none print:rounded-none">
          <div className="flex items-center justify-between border-b border-brand-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-blue-600 flex items-center justify-center">
                <ShieldCheck className="text-white" size={22} />
              </div>
              <div>
                <p className="font-bold text-brand-slate-900">Notificação de Acidente de Trabalho</p>
                <p className="text-xs text-brand-slate-700/50">Formulário Y96 · Código {report.access_code}</p>
              </div>
            </div>
            <div className="text-right text-xs text-brand-slate-700/50">
              <p>Protocolo</p>
              <p className="font-mono">{report.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <ReportSection title="1. Dados Gerais">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data da notificação" value={fmtDate(report.data_notificacao)} />
              <Field label="Data do acidente" value={fmtDate(report.data_acidente)} />
            </div>
            <Field label="Nome do paciente" value={fmt(report.nome_paciente)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data de nascimento" value={fmtDate(report.data_nascimento)} />
              <Field label="Sexo" value={fmt(report.sexo)} />
              <Field label="Gestante" value={fmt(report.gestante)} />
              <Field label="Raça/Cor" value={fmt(report.raca_cor)} />
            </div>
            <Field label="Escolaridade" value={fmt(report.escolaridade)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número do Cartão SUS" value={fmt(report.cartao_sus)} />
              <Field label="Nome da mãe" value={fmt(report.nome_mae)} />
            </div>
            <Field label="Município de residência" value={fmt(report.municipio_residencia)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Logradouro" value={fmt(report.logradouro)} />
              <Field label="Número" value={fmt(report.numero_endereco)} />
              <Field label="Complemento" value={fmt(report.complemento)} />
              <Field label="Bairro" value={fmt(report.bairro)} />
            </div>
            <Field label="Ocupação" value={fmt(report.ocupacao)} />
          </ReportSection>

          <ReportSection title="2. Dados do Trabalho">
            <Field label="Situação no mercado de trabalho" value={fmt(report.situacao_mercado_trabalho)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Local onde ocorreu o acidente" value={fmt(report.local_acidente)} />
              <Field label="Tempo de trabalho na ocupação" value={fmt(report.tempo_trabalho_ocupacao)} />
            </div>
          </ReportSection>

          <ReportSection title="3. Dados da Empresa Contratante">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Registro/CNPJ ou CPF" value={fmt(report.empresa_cnpj_cpf)} />
              <Field label="Nome da empresa ou empregador" value={fmt(report.empresa_nome)} />
              <Field label="Atividade econômica – CNAE" value={fmt(report.empresa_cnae)} />
              <Field label="Endereço" value={fmt(report.empresa_endereco)} />
              <Field label="Bairro" value={fmt(report.empresa_bairro)} />
              <Field label="Município" value={fmt(report.empresa_municipio)} />
              <Field label="Número" value={fmt(report.empresa_numero)} />
              <Field label="UF" value={fmt(report.empresa_uf)} />
            </div>
            <Field label="O empregador é empresa terceirizada?" value={fmt(report.empresa_terceirizada)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="CNAE da empresa principal" value={fmt(report.empresa_principal_cnae)} />
              <Field label="CNPJ da empresa principal" value={fmt(report.empresa_principal_cnpj)} />
            </div>
            <Field label="Nome da empresa principal" value={fmt(report.empresa_principal_nome)} />
          </ReportSection>

          <ReportSection title="4. Dados do Acidente">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hora do acidente" value={fmt(report.hora_acidente?.slice(0, 5))} />
              <Field label="Horas após o início da jornada" value={fmt(report.horas_apos_jornada)} />
            </div>
            <Field label="Município de ocorrência do acidente" value={fmt(report.municipio_ocorrencia)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="CID-10 causa (V01 a Y98)" value={fmt(report.cid10_causa)} />
              <Field label="Tipo de acidente" value={fmt(report.tipo_acidente)} />
              <Field label="Houve outros trabalhadores atingidos?" value={fmt(report.outros_atingidos)} />
              <Field label="Quantos" value={fmt(report.outros_atingidos_qtd)} />
              <Field label="Ocorreu atendimento médico?" value={fmt(report.atendimento_medico)} />
              <Field label="Data do atendimento" value={fmtDate(report.data_atendimento)} />
            </div>
            <Field label="Município do atendimento" value={fmt(report.municipio_atendimento)} />
            <Field label="Unidade de Saúde de atendimento" value={fmt(report.unidade_saude)} />
            <Field
              label="Partes do corpo atingidas"
              value={report.partes_corpo && report.partes_corpo.length > 0 ? report.partes_corpo.join(", ") : "—"}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Diagnóstico da lesão – CID-10" value={fmt(report.diagnostico_cid10)} />
              <Field label="Regime de tratamento" value={fmt(report.regime_tratamento)} />
            </div>
            <Field label="Evolução do caso" value={fmt(report.evolucao_caso)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Data do óbito (se aplicável)" value={fmtDate(report.data_obito)} />
              <Field label="Foi emitida a CAT?" value={fmt(report.cat_emitida)} />
            </div>
          </ReportSection>

          <ReportSection title="5. Notificador">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Notificador / Nome" value={fmt(report.notificador_nome)} />
              <Field label="Função" value={fmt(report.notificador_funcao)} />
            </div>
          </ReportSection>

          <p className="text-center text-[11px] text-brand-slate-700/40 mt-8 pt-6 border-t border-brand-slate-100">
            Documento gerado eletronicamente em{" "}
            {new Date(report.created_at).toLocaleString("pt-BR")} · Plataforma de Segurança do Trabalho
          </p>
        </div>
      </div>
    </main>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brand-blue-600 mb-3">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-brand-slate-700/50">{label}</p>
      <p className="text-sm font-medium text-brand-slate-900">{value}</p>
    </div>
  );
}
