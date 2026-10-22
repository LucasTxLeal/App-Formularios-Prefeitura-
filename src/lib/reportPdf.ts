import { jsPDF } from "jspdf";
import type { FormSchema } from "@/data/dynamicForms/types";

export interface ReportReceipt {
  id: string;
  created_at: string;
  unidade: string;
  values: Record<string, unknown>;
}

export function createReportPdf(schema: FormSchema, receipt: ReportReceipt) {
  const doc = new jsPDF({ format: "a4", compress: true });
  const margin = 18;
  const width = 174;
  let y = 22;
  const clean = (value: string) => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/[–—]/g, "-");
  function ensureSpace(height: number) {
    if (y + height > 278) { doc.addPage(); y = 22; }
  }
  function text(value: string, size = 10, bold = false) {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines: string[] = doc.splitTextToSize(clean(value), width);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, margin, y);
      y += size * 0.45;
    }
    y += 2;
  }
  text("Vigilância em Saúde do Trabalhador", 15, true);
  text(`${schema.codigo} - ${schema.titulo}`, 12, true);
  text(`Unidade: ${receipt.unidade}`);
  text(`Protocolo: ${receipt.id}`, 9);
  text(`Enviado em: ${new Date(receipt.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`, 9);
  y += 4;
  for (const section of schema.sections) {
    ensureSpace(25);
    doc.setTextColor(30, 64, 175);
    text(section.title, 12, true);
    doc.setTextColor(20, 30, 45);
    for (const field of section.fields) {
      if (field.showIf && receipt.values[field.showIf.key] !== field.showIf.equals) continue;
      let value = receipt.values[field.key];
      if (Array.isArray(value)) value = value.join("; ");
      let display = value === null || value === undefined || value === "" ? "Não informado" : String(value);
      if (field.type === "date") display = display.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
      if (field.type === "time" && value) display = display.slice(0, 5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      ensureSpace(Math.min(45, doc.splitTextToSize(clean(field.label), width).length * 4.05 + 10));
      text(field.label, 9, true);
      text(display, 10);
      y += 2;
    }
    y += 3;
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Notificação ${schema.codigo} | Página ${page} de ${pages}`, margin, 288);
  }
  return doc;
}
