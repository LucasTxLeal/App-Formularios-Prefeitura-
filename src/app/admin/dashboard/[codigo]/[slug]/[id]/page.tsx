"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Printer, Trash2 } from "lucide-react";
import { FormSchema } from "@/data/dynamicForms/types";

type ReportData = Record<string, string | number | string[] | null>;

function fmtValue(value: string | number | string[] | null | undefined, type: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (type === "date") return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
  if (type === "time") return String(value).slice(0, 5);
  return String(value);
}

export default function RelatorioDetalhePage({
  params,
}: {
  params: Promise<{ codigo: string; slug: string; id: string }>;
}) {
  const router = useRouter();
  const { codigo, slug, id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [unidadeNome, setUnidadeNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteInProgress = useRef(false);

  async function handleDelete() {
    if (!report || !schema || deleteInProgress.current) return;
    const patient = String(report[schema.primaryLabelKey] ?? "");
    if (!window.confirm(`Excluir definitivamente esta notificação de ${schema.titulo}?\n\nPaciente: ${patient}\nProtocolo: ${id}\n\nOs dados deste registro serão apagados do banco. Esta ação não pode ser desfeita.`)) return;
    deleteInProgress.current = true;
    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/admin/reports/${slug}/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível excluir a notificação.");
      router.replace(`/admin/dashboard/${codigo}`);
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Erro de conexão ao excluir a notificação.");
      deleteInProgress.current = false;
      setDeleting(false);
    }
  }

  useEffect(() => {
    fetch(`/api/admin/reports/${slug}/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.report) setReport(data.report);
        if (data.schema) setSchema(data.schema);
        if (data.unidadeNome) setUnidadeNome(data.unidadeNome);
      })
      .finally(() => setLoading(false));
  }, [slug, id]);

  if (loading) {
    return <p className="p-10 text-center text-brand-slate-700/50">Carregando notificação...</p>;
  }

  if (!report || !schema) {
    return <p className="p-10 text-center text-brand-slate-700/50">Notificação não encontrada.</p>;
  }

  return (
    <main className="min-h-screen bg-brand-slate-100">
      <header className="no-print bg-white border-b border-brand-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
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
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            {deleting ? "Excluindo..." : "Excluir notificação"}
          </button>
        </div>
        {deleteError && <p role="alert" className="max-w-3xl mx-auto px-6 pb-4 text-sm text-red-600">{deleteError}</p>}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-card p-10 print:shadow-none print:rounded-none">
          <div className="flex items-center justify-between border-b border-brand-slate-100 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-brand-slate-100 shrink-0">
                <Image src="/logo.jpg" alt="" width={44} height={44} className="object-cover w-full h-full" />
              </div>
              <div>
                <p className="font-bold text-brand-slate-900">{schema.titulo}</p>
                <p className="text-xs text-brand-slate-700/50">Formulário {schema.codigo}</p>
              </div>
            </div>
            <div className="text-right text-xs text-brand-slate-700/50">
              <p>Protocolo</p>
              <p className="font-mono">{String(report.id).slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="mb-6 bg-brand-blue-50 border border-brand-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-blue-600">Unidade</p>
              <p className="text-sm font-bold text-brand-blue-900">
                {unidadeNome ?? String(report.access_code ?? codigo)}
              </p>
            </div>
            <p className="text-xs text-brand-blue-700/60">Código {String(report.access_code ?? codigo)}</p>
          </div>

          {schema.sections.map((section) => (
            <div className="mb-6" key={section.title}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-brand-blue-600 mb-3">
                {section.title}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
                    <p className="text-[11px] text-brand-slate-700/50">{field.label}</p>
                    <p className="text-sm font-medium text-brand-slate-900">
                      {fmtValue(report[field.key], field.type)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-center text-[11px] text-brand-slate-700/40 mt-8 pt-6 border-t border-brand-slate-100">
            Documento gerado eletronicamente em{" "}
            {report.created_at ? new Date(String(report.created_at)).toLocaleString("pt-BR") : "—"} ·
            Plataforma de Vigilância em Saúde do Trabalhador
          </p>
        </div>
      </div>
    </main>
  );
}
