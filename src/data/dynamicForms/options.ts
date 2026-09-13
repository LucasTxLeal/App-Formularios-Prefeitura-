// Opções compartilhadas entre os formulários de agravos (padrão "F99-style"
// dos documentos: Transtorno Mental, LER/DORT, Dermatose, PAIR, Pneumoconiose).
// Os códigos (M –, 1 –, 01 –, etc.) são copiados literalmente dos documentos
// originais — não foram inventados nem reformulados.

export const OPCOES_SEXO_COD = ["M – Masculino", "F – Feminino", "I – Ignorado"];

export const OPCOES_GESTANTE_COD = [
  "1 – 1º Trimestre",
  "2 – 2º Trimestre",
  "3 – 3º Trimestre",
  "4 – Idade gestacional ignorada",
  "5 – Não",
  "6 – Não se aplica",
  "9 – Ignorado",
];

export const OPCOES_RACA_COR_COD = [
  "1 – Branca",
  "2 – Preta",
  "3 – Amarela",
  "4 – Parda",
  "5 – Indígena",
  "9 – Ignorado",
];

export const OPCOES_ESCOLARIDADE_COD = [
  "0 – Analfabeto",
  "1 – 1ª a 4ª série incompleta do EF (antigo primário ou 1º grau)",
  "2 – 4ª série completa do EF (antigo primário ou 1º grau)",
  "3 – 5ª à 8ª série incompleta do EF (antigo ginásio ou 1º grau)",
  "4 – Ensino fundamental completo",
  "5 – Ensino médio incompleto",
  "6 – Ensino médio completo",
  "7 – Educação superior incompleta",
  "8 – Educação superior completa",
  "9 – Ignorado",
  "10 – Não se aplica",
];

export const OPCOES_ZONA = ["1 – Urbana", "2 – Rural", "3 – Periurbana", "9 – Ignorado"];

export const OPCOES_SITUACAO_MERCADO_TRABALHO_COD = [
  "01 – Empregado registrado com carteira assinada",
  "02 – Empregado não registrado",
  "03 – Autônomo/conta própria",
  "04 – Servidor público estatutário",
  "05 – Servidor público celetista",
  "06 – Aposentado",
  "07 – Desempregado",
  "08 – Trabalho temporário",
  "09 – Cooperativado",
  "10 – Trabalhador avulso",
  "11 – Empregador",
  "12 – Outros",
  "99 – Ignorado",
];

export const OPCOES_TERCEIRIZADA_COD = ["1 – Sim", "2 – Não", "3 – Não se aplica", "9 – Ignorado"];

export const OPCOES_TEMPO_UNIDADE = ["1 – Hora", "2 – Dia", "3 – Mês", "4 – Ano"];

export const OPCOES_REGIME_TRATAMENTO_2 = ["1 – Hospitalar", "2 – Ambulatorial"];

export const OPCOES_SIM_NAO_COD = ["1 – Sim", "2 – Não", "9 – Ignorado"];

export const OPCOES_SIM_NAO_NA_COD = ["1 – Sim", "2 – Não", "3 – Não se aplica", "9 – Ignorado"];

export const OPCOES_MELHORA_PIORA_COD = ["1 – Melhora", "2 – Piora", "9 – Ignorado"];

export const OPCOES_EVOLUCAO_CASO_9 = [
  "1 – Cura",
  "2 – Cura não confirmada",
  "3 – Incapacidade Temporária",
  "4 – Incapacidade Permanente Parcial",
  "5 – Incapacidade Permanente Total",
  "6 – Óbito por doença relacionada ao trabalho",
  "7 – Óbito por outra causa",
  "8 – Outro",
  "9 – Ignorado",
];

export const OPCOES_CAT_COD = ["1 – Sim", "2 – Não", "3 – Não se aplica", "9 – Ignorado"];
