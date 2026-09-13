"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ScrollText, LogIn, Eye, FileUp, ShieldAlert } from "lucide-react";
import { FORM_TYPES } from "@/data/formTypes";

interface LogRow {
  id: string;
  actor_type: "code" | "admin";
  actor: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: typeof LogIn }> = {
  login_access: { label: "Login (código de acesso)", icon: LogIn },
  login_admin: { label: "Login (administrador)", icon: LogIn },
  login_failed: { label: "Tentativa de login falhou", icon: ShieldAlert },
  view_report: { label: "Visualizou notificação", icon: Eye },
  submit_report: { label: "Enviou notificação", icon: FileUp },
};

function formTitulo(slug: string | null) {
  if (!slug) return "—";
  return FORM_TYPES.find((f) => f.slug === slug)?.titulo ?? slug;
}

export default function LogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [unidadesPorCodigo, setUnidadesPorCodigo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
        if (data.unidadesPorCodigo) setUnidadesPorCodigo(data.unidadesPorCodigo);
      })
      .finally(() => setLoading(false));
  }, []);

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
          <div className="w-9 h-9 rounded-lg bg-brand-blue-600 flex items-center justify-center">
            <ScrollText className="text-white" size={18} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Log de Auditoria</p>
            <p className="text-xs text-brand-slate-700/50">Últimos 300 eventos registrados</p>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-brand-slate-700/50 text-sm">Carregando...</p>
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center text-brand-slate-700/50">
            Nenhum evento registrado ainda.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-slate-50 text-brand-slate-700/60 text-xs uppercase">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Quando</th>
                  <th className="text-left px-5 py-3 font-semibold">Evento</th>
                  <th className="text-left px-5 py-3 font-semibold">Quem</th>
                  <th className="text-left px-5 py-3 font-semibold">Notificação</th>
                  <th className="text-left px-5 py-3 font-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const meta = ACTION_LABELS[log.action] ?? { label: log.action, icon: ScrollText };
                  const Icon = meta.icon;
                  const isFailure = log.action === "login_failed";
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i, 20) * 0.015 }}
                      className="border-t border-brand-slate-100"
                    >
                      <td className="px-5 py-3 whitespace-nowrap text-brand-slate-700/70">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ${
                            isFailure
                              ? "bg-red-50 text-red-600"
                              : "bg-brand-blue-50 text-brand-blue-700"
                          }`}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-medium text-brand-slate-900">
                          {log.actor_type === "code" ? unidadesPorCodigo[log.actor] ?? log.actor : log.actor}
                        </span>
                        <span className="text-brand-slate-700/40 text-xs ml-1">
                          ({log.actor_type === "admin" ? "admin" : `código ${log.actor}`})
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brand-slate-700/70">{formTitulo(log.resource_type)}</td>
                      <td className="px-5 py-3 text-brand-slate-700/50 font-mono text-xs">{log.ip}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
