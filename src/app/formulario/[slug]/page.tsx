"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Construction } from "lucide-react";
import { FORM_TYPES } from "@/data/formTypes";
import { getFormSchema, DYNAMIC_FORM_SLUGS } from "@/data/dynamicForms/registry";
import DynamicForm from "@/components/DynamicForm";

export default function FormularioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  if (DYNAMIC_FORM_SLUGS.includes(slug)) {
    const schema = getFormSchema(slug);
    if (schema) {
      return <DynamicForm schema={schema} />;
    }
  }

  return <PlaceholderPage slug={slug} />;
}

function PlaceholderPage({ slug }: { slug: string }) {
  const router = useRouter();
  const form = FORM_TYPES.find((f) => f.slug === slug);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-card p-8 text-center"
      >
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-brand-blue-50 flex items-center justify-center">
          <Construction className="text-brand-blue-600" size={30} />
        </div>
        <h1 className="font-bold text-lg text-brand-slate-900">
          {form ? `${form.codigo} · ${form.titulo}` : "Formulário"}
        </h1>
        <p className="text-brand-slate-700/60 text-sm mt-2">
          Este formulário está em construção e será disponibilizado em uma próxima
          atualização da plataforma.
        </p>
        <button
          onClick={() => router.push("/central")}
          className="mt-6 inline-flex items-center gap-2 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar à Central
        </button>
      </motion.div>
    </main>
  );
}
