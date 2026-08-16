"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, Calendar, User } from "lucide-react";

interface ReportRow {
  id: string;
  nome_paciente: string;
  data_acidente: string;
  hora_acidente: string | null;
  empresa_nome: string | null;
  notificador_nome: string;
  created_at: string;
}

export default function PastaCodigoPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const router = useRouter();
  const { codigo } = use(params);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/reports?code=${codigo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reports) setReports(data.reports);
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
            <p className="font-bold text-sm">Pasta {codigo}</p>
            <p className="text-xs text-brand-slate-700/50">Notificações Y96 ordenadas por data</p>
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
                  <th className="text-left px-5 py-3 font-semibold">Data do acidente</th>
                  <th className="text-left px-5 py-3 font-semibold">Paciente</th>
                  <th className="text-left px-5 py-3 font-semibold">Empresa</th>
                  <th className="text-left px-5 py-3 font-semibold">Notificador</th>
                  <th className="text-left px-5 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => router.push(`/admin/dashboard/${codigo}/${r.id}`)}
                    className="border-t border-brand-slate-100 hover:bg-brand-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-brand-slate-700">
                        <Calendar size={14} className="text-brand-slate-700/40" />
                        {new Date(r.data_acidente + "T00:00:00").toLocaleDateString("pt-BR")}
                        {r.hora_acidente ? ` · ${r.hora_acidente.slice(0, 5)}` : ""}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-brand-slate-700/40" />
                        {r.nome_paciente}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-slate-700/70">{r.empresa_nome || "—"}</td>
                    <td className="px-5 py-3 text-brand-slate-700/70">{r.notificador_nome}</td>
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
