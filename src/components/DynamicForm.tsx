"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle, Home, LayoutGrid } from "lucide-react";
import { FormSchema } from "@/data/dynamicForms/types";
import { FORM_TYPES } from "@/data/formTypes";
import { SelectField, TextField, TextAreaField, CheckboxGroupField } from "@/components/FormFields";

type FormState = Record<string, string | string[]>;

function buildInitialState(schema: FormSchema): FormState {
  const state: FormState = {};
  for (const section of schema.sections) {
    for (const field of section.fields) {
      state[field.key] = field.type === "checkbox-group" ? [] : "";
    }
  }
  return state;
}

export default function DynamicForm({ schema }: { schema: FormSchema }) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => buildInitialState(schema));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(key: string, value: string | string[]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleFieldEnter(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing || e.ctrlKey || e.altKey || e.metaKey) return;

    const target = e.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

    e.preventDefault();
    if (e.repeat) return;

    const fields = Array.from(e.currentTarget.querySelectorAll<HTMLElement>(
      'input, select, textarea, button[type="submit"]'
    )).filter((field) =>
      !field.matches(':disabled, [type="hidden"], [tabindex="-1"]') && field.getClientRects().length > 0
    );
    const index = fields.indexOf(target);
    if (index < 0) return;
    fields[index + (e.shiftKey ? -1 : 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/reports/${schema.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/central")}
              className="w-9 h-9 rounded-lg hover:bg-brand-slate-100 flex items-center justify-center text-brand-slate-700/70 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-slate-100 shrink-0 flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- pode ser SVG vetorial */}
              <img
                src={FORM_TYPES.find((f) => f.slug === schema.slug)?.iconSrc || "/logo.jpg"}
                alt=""
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">
                {schema.codigo} · {schema.titulo}
              </p>
              <p className="text-xs text-brand-slate-700/50">Notificação SINAN</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/central")}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-brand-blue-600 hover:text-brand-blue-700 bg-brand-blue-50 hover:bg-brand-blue-100 rounded-lg px-3 py-2 transition-colors shrink-0"
          >
            <LayoutGrid size={14} />
            Voltar ao menu principal
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} onKeyDown={handleFieldEnter} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-brand-slate-700/60 bg-brand-blue-50 border border-brand-blue-100 rounded-xl px-4 py-3 leading-relaxed"
        >
          <strong>Definição de caso:</strong> {schema.definicaoCaso}
        </motion.p>

        {schema.sections.map((section, sIdx) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIdx * 0.04 }}
            className="bg-white rounded-2xl shadow-card p-6"
          >
            <h2 className="font-bold text-brand-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-blue-600 text-white text-xs flex items-center justify-center">
                {sIdx + 1}
              </span>
              {section.title}
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {section.fields.map((field) => {
                if (field.showIf && values[field.showIf.key] !== field.showIf.equals) {
                  return null;
                }

                const wrapperClass = field.fullWidth ? "sm:col-span-2" : "";

                if (field.type === "checkbox-group") {
                  return (
                    <div key={field.key} className={wrapperClass}>
                      <CheckboxGroupField
                        label={field.label}
                        values={(values[field.key] as string[]) || []}
                        onChange={(v) => set(field.key, v)}
                        options={field.options || []}
                      />
                    </div>
                  );
                }

                if (field.type === "select") {
                  return (
                    <div key={field.key} className={wrapperClass}>
                      <SelectField
                        label={field.label}
                        value={(values[field.key] as string) || ""}
                        onChange={(v) => set(field.key, v)}
                        options={field.options || []}
                        required={field.required}
                        highlight={field.highlight}
                      />
                    </div>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.key} className={wrapperClass}>
                      <TextAreaField
                        label={field.label}
                        value={(values[field.key] as string) || ""}
                        onChange={(v) => set(field.key, v)}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.key} className={wrapperClass}>
                    <TextField
                      label={field.label}
                      value={(values[field.key] as string) || ""}
                      onChange={(v) => set(field.key, v)}
                      required={field.required}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
                      placeholder={field.placeholder}
                      highlight={field.highlight}
                      maxLength={field.maxLength}
                      numericOnly={field.numericOnly}
                      uppercase={field.uppercase}
                    />
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}

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

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push("/central")}
            className="sm:hidden flex items-center justify-center gap-2 border border-brand-slate-100 text-brand-slate-700 font-medium py-3.5 rounded-xl transition-colors hover:bg-brand-slate-50"
          >
            <LayoutGrid size={16} />
            Voltar ao menu principal
          </button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-brand-green-500 hover:bg-brand-green-600 disabled:opacity-60 text-white font-semibold py-4 rounded-xl transition-colors shadow-card"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            {submitting ? "Enviando notificação..." : `Enviar Notificação ${schema.codigo}`}
          </motion.button>
        </div>
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
                A ficha {schema.codigo} foi registrada com sucesso e vinculada à sua unidade.
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
