import {
  HardHat,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
  MessageSquareWarning,
  Truck,
  FireExtinguisher,
  FileSearch,
  GraduationCap,
  PackageCheck,
  FileWarning,
  LucideIcon,
} from "lucide-react";

export interface FormTypeDef {
  slug: string;
  codigo: string; // C1 ... C11
  titulo: string;
  descricao: string;
  icon: LucideIcon;
  ativo: boolean; // somente C1 esta implementado nesta versao inicial
}

export const FORM_TYPES: FormTypeDef[] = [
  {
    slug: "y96",
    codigo: "Y96",
    titulo: "Acidente de Trabalho",
    descricao: "Notificação SINAN (Y96)",
    icon: HardHat,
    ativo: true,
  },
  {
    slug: "quase-acidente",
    codigo: "C2",
    titulo: "Quase Acidente",
    descricao: "Registro de incidentes sem lesao",
    icon: AlertTriangle,
    ativo: false,
  },
  {
    slug: "inspecao-epi",
    codigo: "C3",
    titulo: "Inspeção de EPI",
    descricao: "Checklist de equipamentos de protecao",
    icon: ShieldCheck,
    ativo: false,
  },
  {
    slug: "ordem-servico",
    codigo: "C4",
    titulo: "Ordem de Serviço",
    descricao: "Emissao de OS de seguranca",
    icon: ClipboardList,
    ativo: false,
  },
  {
    slug: "dds",
    codigo: "C5",
    titulo: "DDS",
    descricao: "Dialogo Diario de Seguranca",
    icon: MessageSquareWarning,
    ativo: false,
  },
  {
    slug: "checklist-veicular",
    codigo: "C6",
    titulo: "Checklist Veicular",
    descricao: "Inspecao de frota",
    icon: Truck,
    ativo: false,
  },
  {
    slug: "inspecao-extintor",
    codigo: "C7",
    titulo: "Inspeção de Extintores",
    descricao: "Vistoria de combate a incendio",
    icon: FireExtinguisher,
    ativo: false,
  },
  {
    slug: "analise-risco",
    codigo: "C8",
    titulo: "Análise de Risco",
    descricao: "APR - Analise Preliminar de Risco",
    icon: FileSearch,
    ativo: false,
  },
  {
    slug: "treinamento",
    codigo: "C9",
    titulo: "Ficha de Treinamento",
    descricao: "Registro de capacitacoes",
    icon: GraduationCap,
    ativo: false,
  },
  {
    slug: "epi-entrega",
    codigo: "C10",
    titulo: "Entrega de EPI",
    descricao: "Controle de entrega de equipamentos",
    icon: PackageCheck,
    ativo: false,
  },
  {
    slug: "nao-conformidade",
    codigo: "C11",
    titulo: "Não Conformidade",
    descricao: "Registro de nao conformidades",
    icon: FileWarning,
    ativo: false,
  },
];
