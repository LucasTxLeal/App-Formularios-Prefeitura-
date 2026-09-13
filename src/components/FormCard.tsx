"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { FormTypeDef } from "@/data/formTypes";

interface FormCardProps {
  form: FormTypeDef;
  onSelect: (form: FormTypeDef) => void;
}

export default function FormCard({ form, onSelect }: FormCardProps) {
  const Icon = form.icon;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(form)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative flex h-full min-h-[224px] w-full min-w-0 flex-col items-center gap-3 rounded-2xl px-4 pb-5 pt-7 text-center border bg-white shadow-card transition-colors ${
        form.ativo
          ? "border-brand-slate-100 hover:border-brand-blue-500"
          : "border-brand-slate-100 opacity-60 cursor-not-allowed"
      }`}
    >
      <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wide text-brand-blue-500 bg-brand-blue-50 rounded-full px-2 py-0.5">
        {form.codigo}
      </span>

      {form.iconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- SVG vetorial, não precisa do otimizador de imagem
        <img
          src={form.iconSrc}
          alt={form.titulo}
          width={64}
          height={64}
          className={`w-16 h-16 shrink-0 ${form.ativo ? "" : "grayscale opacity-70"}`}
        />
      ) : (
        <div
          className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center ${
            form.ativo
              ? "bg-brand-blue-50 text-brand-blue-600 group-hover:bg-brand-blue-600 group-hover:text-white"
              : "bg-brand-slate-100 text-brand-slate-700/40"
          } transition-colors`}
        >
          {form.ativo && Icon ? <Icon size={26} /> : <Lock size={22} />}
        </div>
      )}

      <div className="w-full min-w-0">
        <p className="flex min-h-10 items-center justify-center font-semibold text-sm text-brand-slate-900">{form.titulo}</p>
        <p className="text-xs text-brand-slate-700/50 mt-1">{form.descricao}</p>
      </div>

      {!form.ativo && (
        <span className="text-[10px] uppercase font-semibold text-brand-slate-700/40">
          Em breve
        </span>
      )}
    </motion.button>
  );
}
