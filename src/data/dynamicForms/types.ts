// Sistema genérico de formulários "dinâmicos": cada doença/agravo notificável
// (Transtorno Mental, Material Biológico, LER/DORT, Dermatose, PAIR,
// Pneumoconiose, Intoxicação Exógena) é descrita por um único FormSchema
// nesta estrutura. O mesmo schema alimenta: o formulário de preenchimento
// (DynamicForm), a validação/gravação (API genérica) e a visualização no
// painel admin (lista + detalhe). Isso evita ter a mesma lista de campos
// escrita em vários lugares diferentes, que é a maior fonte de erro de
// transcrição num formulário deste tamanho.

export type FieldType =
  | "text"
  | "date"
  | "time"
  | "number"
  | "select"
  | "checkbox-group"
  | "textarea";

export interface FieldDef {
  /** Nome da coluna no banco (snake_case) e chave no estado do formulário. */
  key: string;
  label: string;
  type: FieldType;
  /** Obrigatório apenas para type "select" e "checkbox-group". */
  options?: string[];
  required?: boolean;
  placeholder?: string;
  /** Mostra este campo apenas quando outro campo tiver um valor específico. */
  showIf?: { key: string; equals: string };
  /** Ocupa a linha inteira no grid de 2 colunas (padrão: 1 coluna). */
  fullWidth?: boolean;
  /** Label em negrito/destacado (usado no campo Ocupação). */
  highlight?: boolean;
  /** Limite de caracteres — usado apenas em campos "óbvios" (CPF, CEP, UF, telefone...). */
  maxLength?: number;
  /** Aceita apenas dígitos (CPF/CNPJ, CEP, telefone, cartão SUS). */
  numericOnly?: boolean;
  /** Converte automaticamente para maiúsculas (UF). */
  uppercase?: boolean;
}

export interface SectionDef {
  title: string;
  fields: FieldDef[];
}

export interface FormSchema {
  slug: string;
  /** Nome da tabela no Supabase. */
  table: string;
  codigo: string;
  titulo: string;
  definicaoCaso: string;
  sections: SectionDef[];
  /** Chave do campo de data principal, usada para ordenar a listagem admin. */
  primaryDateKey: string;
  /** Chave do campo "nome do paciente" (ou equivalente), usado como coluna principal na listagem admin. */
  primaryLabelKey: string;
}

/** Percorre todas as seções e devolve os metadados usados pela API genérica. */
export function getSchemaMeta(schema: FormSchema) {
  const requiredKeys: string[] = [];
  const dateKeys: string[] = [];
  const timeKeys: string[] = [];
  const numberKeys: string[] = [];
  const arrayKeys: string[] = [];

  for (const section of schema.sections) {
    for (const field of section.fields) {
      if (field.required) requiredKeys.push(field.key);
      if (field.type === "date") dateKeys.push(field.key);
      if (field.type === "time") timeKeys.push(field.key);
      if (field.type === "number") numberKeys.push(field.key);
      if (field.type === "checkbox-group") arrayKeys.push(field.key);
    }
  }

  return { requiredKeys, dateKeys, timeKeys, numberKeys, arrayKeys };
}
