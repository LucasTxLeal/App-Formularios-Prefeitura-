"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Folder, ShieldCheck, LogOut, FileText, CircleOff } from "lucide-react";

interface FolderSummary {
  code: string;
  unidade_nome: string;
  active: boolean;
  total: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<FolderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.folders) setFolders(data.folders);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen">
      <header className="bg-brand-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-blue-600 flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">Painel Administrativo</p>
              <p className="text-xs text-brand-slate-100/50">Todas as unidades cadastradas</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-brand-slate-100/70 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-slate-900 mb-1">Pastas por Unidade</h1>
        <p className="text-brand-slate-700/60 mb-8">
          Selecione uma pasta para visualizar os relatórios recebidos.
        </p>

        {loading ? (
          <p className="text-brand-slate-700/50 text-sm">Carregando...</p>
        ) : folders.length === 0 ? (
          <p className="text-brand-slate-700/50 text-sm">Nenhuma unidade cadastrada.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder, i) => (
              <motion.button
                key={folder.code}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/admin/dashboard/${folder.code}`)}
                className="text-left bg-white rounded-2xl shadow-card p-5 border border-brand-slate-100 hover:border-brand-blue-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-brand-blue-50 text-brand-blue-600 flex items-center justify-center">
                    <Folder size={22} />
                  </div>
                  {!folder.active && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500 bg-red-50 rounded-full px-2 py-0.5">
                      <CircleOff size={10} />
                      Inativo
                    </span>
                  )}
                </div>
                <p className="font-bold text-brand-slate-900 mt-3">Pasta {folder.code}</p>
                <p className="text-xs text-brand-slate-700/50 mt-0.5 line-clamp-1">
                  {folder.unidade_nome}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-sm text-brand-slate-700/70">
                  <FileText size={14} />
                  {folder.total} {folder.total === 1 ? "relatório" : "relatórios"}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
