import { LucideIcon } from "lucide-react";

export interface FormTypeDef {
  slug: string;
  codigo: string;
  titulo: string;
  descricao: string;
  /** Caminho para a imagem do ícone em /public (usado nos formulários com imagem própria). */
  iconSrc?: string;
  /** Ícone de fallback (Lucide) para os formulários que ainda não têm imagem própria. */
  icon?: LucideIcon;
  ativo: boolean;
}

export const FORM_TYPES: FormTypeDef[] = [
  {
    slug: "y96",
    codigo: "Y96",
    titulo: "Acidente de Trabalho",
    descricao: "Notificação SINAN (Y96)",
    iconSrc: "/icons/y96.svg",
    ativo: true,
  },
  {
    slug: "transtorno-mental",
    codigo: "F99",
    titulo: "Transtorno Mental",
    descricao: "Relacionado ao trabalho",
    iconSrc: "/icons/transtorno-mental.svg",
    ativo: true,
  },
  {
    slug: "material-biologico",
    codigo: "Z20.9",
    titulo: "Material Biológico",
    descricao: "Acidente com exposição biológica",
    iconSrc: "/icons/material-biologico.svg",
    ativo: true,
  },
  {
    slug: "ler-dort",
    codigo: "Z57.9",
    titulo: "LER/DORT",
    descricao: "Lesões por esforço repetitivo",
    iconSrc: "/icons/ler-dort.svg",
    ativo: true,
  },
  {
    slug: "dermatose-ocupacional",
    codigo: "L98.9",
    titulo: "Dermatose Ocupacional",
    descricao: "Afecções de pele relacionadas ao trabalho",
    iconSrc: "/icons/dermatose-ocupacional.svg",
    ativo: true,
  },
  {
    slug: "pair",
    codigo: "H83.3",
    titulo: "PAIR",
    descricao: "Perda auditiva induzida por ruído",
    iconSrc: "/icons/pair.svg",
    ativo: true,
  },
  {
    slug: "pneumoconiose",
    codigo: "J64",
    titulo: "Pneumoconiose",
    descricao: "Doenças pulmonares ocupacionais",
    iconSrc: "/icons/pneumoconiose.svg",
    ativo: true,
  },
  {
    slug: "intoxicacao-exogena",
    codigo: "T65.9",
    titulo: "Intoxicação Exógena",
    descricao: "Exposição a substâncias químicas",
    iconSrc: "/icons/intoxicacao-exogena.svg",
    ativo: true,
  },
  {
    slug: "cancer",
    codigo: "C80",
    titulo: "Câncer Relacionado ao Trabalho",
    descricao: "Notificação SINAN (C80)",
    iconSrc: "/icons/cancer.svg",
    ativo: true,
  },

  // Removidos da tela a pedido — os dois formulários abaixo nunca tiveram
  // schema/tabela implementados (eram só placeholders "em breve"). Ficam
  // comentados aqui para reativação rápida no futuro, se precisar: basta
  // descomentar o bloco e importar ClipboardList/FileWarning de volta do
  // lucide-react no topo do arquivo.
  //
  // {
  //   slug: "epi-entrega",
  //   codigo: "C10",
  //   titulo: "Entrega de EPI",
  //   descricao: "Controle de entrega de equipamentos",
  //   icon: ClipboardList,
  //   ativo: false,
  // },
  // {
  //   slug: "nao-conformidade",
  //   codigo: "C11",
  //   titulo: "Não Conformidade",
  //   descricao: "Registro de não conformidades",
  //   icon: FileWarning,
  //   ativo: false,
  // },
];
