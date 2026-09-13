"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar, User } from "lucide-react";

interface ReportRow {
  id: string;
  slug: string;
  codigo: string;
  titulo: string;
  data: string | null;
  nomePaciente: string | null;
  notificadorNome: string | null;
  createdAt: string;
}

export default function PastaCodigoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const router = useRouter();
  const { codigo } = use(params);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [unidadeNome, setUnidadeNome] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/reports?code=${codigo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reports) setReports(data.reports);
        if (data.unidadeNome) setUnidadeNome(data.unidadeNome);
      })
      .finally(() => setLoading(false));
  }, [codigo]);

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-brand-slate-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="w-9 h-9 rounded-lg hover:bg-brand-slate-100 flex items-center justify-center text-brand-slate-700/70 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="font-bold text-sm">{unidadeNome ?? `Pasta ${codigo}`}</p>
            <p className="text-xs text-brand-slate-700/50">
              Código {codigo} · Todas as notificações, ordenadas por data
            </p>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-brand-slate-700/50 text-sm">Carregando...</p>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center text-brand-slate-700/50">
            Nenhuma notificação recebida para este código ainda.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-slate-50 text-brand-slate-700/60 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Tipo</th>
                  <th className="text-left px-5 py-3 font-semibold">Data</th>
                  <th className="text-left px-5 py-3 font-semibold">Paciente</th>
                  <th className="text-left px-5 py-3 font-semibold">Notificador</th>
                  <th className="text-left px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <motion.tr
                    key={`${r.slug}-${r.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => router.push(`/admin/dashboard/${codigo}/${r.slug}/${r.id}`)}
                    className="border-t border-brand-slate-100 hover:bg-brand-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center text-[10px] font-bold tracking-wide text-brand-blue-600 bg-brand-blue-50 rounded-full px-2 py-0.5">
                        {r.codigo}
                      </span>
                      <p className="text-xs text-brand-slate-700/60 mt-0.5">{r.titulo}</p>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-brand-slate-700">
                        <Calendar size={14} className="text-brand-slate-700/40" />
                        {r.data ? new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-brand-slate-700/40" />
                        {r.nomePaciente || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-slate-700/70">{r.notificadorNome || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-brand-blue-600 font-medium text-xs">
                        <FileText size={14} />
                        Ver notificação
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
