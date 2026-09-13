import { FormSchema } from "./types";
import { OPCOES_ZONA, OPCOES_SITUACAO_MERCADO_TRABALHO_COD, OPCOES_TEMPO_UNIDADE } from "./options";

const OPCOES_SEXO_COD = ["M – Masculino", "F – Feminino", "I – Ignorado"];
const OPCOES_GESTANTE_SEM_COD = ["1º Trimestre", "2º Trimestre", "3º Trimestre", "Idade gestacional ignorada", "Não", "Não se aplica", "Ignorado"];
const OPCOES_RACA_COR_COD = ["1 - Branca", "2 - Preta", "3 - Amarela", "4 - Parda", "5 - Indígena", "9 - Ignorado"];
const OPCOES_ESCOLARIDADE_COD = [
  "0 - Analfabeto", "1 - 1ª a 4ª série incompleta do EF", "2 - 4ª série completa do EF", "3 - 5ª à 8ª série incompleta do EF",
  "4 - Ensino fundamental completo", "5 - Ensino médio incompleto", "6 - Ensino médio completo",
  "7 - Educação superior incompleta", "8 - Educação superior completa", "9 - Ignorado", "10 - Não se aplica",
];

export const intoxicacaoExogenaSchema: FormSchema = {
  slug: "intoxicacao-exogena",
  table: "intoxicacao_exogena_reports",
  codigo: "T65.9",
  titulo: "Intoxicação Exógena",
  definicaoCaso:
    "Todo indivíduo que, tendo sido exposto a substâncias químicas (agrotóxicos, medicamentos, produtos de uso doméstico, cosméticos e higiene pessoal, produtos químicos de uso industrial, drogas, plantas e alimentos e bebidas), apresente sinais e sintomas clínicos de intoxicação e/ou alterações laboratoriais provavelmente ou possivelmente compatíveis.",
  primaryDateKey: "data_notificacao",
  primaryLabelKey: "nome_paciente",
  sections: [
    {
      title: "Dados Gerais",
      fields: [
        { key: "data_notificacao", label: "Data da Notificação", type: "date", required: true },
        { key: "data_primeiros_sintomas", label: "Data dos Primeiros Sintomas", type: "date" },
      ],
    },
    {
      title: "Notificação Individual",
      fields: [
        { key: "nome_paciente", label: "Nome do Paciente", type: "text", required: true, fullWidth: true },
        { key: "data_nascimento", label: "Data de Nascimento", type: "date" },
        { key: "sexo", label: "Sexo", type: "select", options: OPCOES_SEXO_COD },
        { key: "gestante", label: "Gestante", type: "select", options: OPCOES_GESTANTE_SEM_COD },
        { key: "raca_cor", label: "Raça/Cor", type: "select", options: OPCOES_RACA_COR_COD },
        { key: "escolaridade", label: "Escolaridade", type: "select", options: OPCOES_ESCOLARIDADE_COD, fullWidth: true },
        { key: "cartao_sus", label: "Número do Cartão SUS", type: "text", maxLength: 15, numericOnly: true },
        { key: "nome_mae", label: "Nome da mãe", type: "text" },
      ],
    },
    {
      title: "Dados de Residência",
      fields: [
        { key: "uf", label: "UF", type: "text", maxLength: 2, uppercase: true },
        { key: "municipio_residencia", label: "Município de Residência", type: "text" },
        { key: "bairro", label: "Bairro", type: "text" },
        { key: "logradouro", label: "Logradouro (rua, avenida...)", type: "text" },
        { key: "numero_endereco", label: "Número", type: "text" },
        { key: "complemento", label: "Complemento (apto., casa...)", type: "text" },
        { key: "cep", label: "CEP", type: "text", maxLength: 8, numericOnly: true },
        { key: "telefone", label: "(DDD) Telefone", type: "text", maxLength: 11, numericOnly: true },
        { key: "zona", label: "Zona", type: "select", options: OPCOES_ZONA },
        { key: "pais", label: "País (se residente fora do Brasil)", type: "text" },
      ],
    },
    {
      title: "Dados do Trabalho",
      fields: [
        { key: "data_investigacao", label: "Data da Investigação", type: "date" },
        { key: "ocupacao", label: "Ocupação", type: "text", required: true, highlight: true },
        { key: "situacao_mercado_trabalho", label: "Situação no Mercado de Trabalho", type: "select", options: OPCOES_SITUACAO_MERCADO_TRABALHO_COD, fullWidth: true },
      ],
    },
    {
      title: "Dados da Exposição",
      fields: [
        {
          key: "local_ocorrencia_exposicao",
          label: "Local de ocorrência da exposição",
          type: "select",
          fullWidth: true,
          options: ["1 – Residência", "2 – Ambiente de trabalho", "3 – Trajeto do trabalho", "4 – Serviços de saúde", "5 – Escola/creche", "6 – Ambiente externo", "7 – Outro", "9 – Ignorado"],
        },
        { key: "nome_local_estabelecimento", label: "Nome do local/estabelecimento de ocorrência", type: "text", fullWidth: true },
        { key: "estabelecimento_cnae", label: "Atividade Econômica (CNAE)", type: "text", required: true },
        { key: "estabelecimento_uf", label: "UF", type: "text", maxLength: 2, uppercase: true },
        { key: "estabelecimento_municipio", label: "Município do estabelecimento", type: "text" },
        { key: "estabelecimento_bairro", label: "Bairro", type: "text" },
        { key: "estabelecimento_logradouro", label: "Logradouro (endereço do estabelecimento)", type: "text" },
        { key: "estabelecimento_numero", label: "Número", type: "text" },
        { key: "estabelecimento_complemento", label: "Complemento", type: "text" },
        { key: "estabelecimento_ponto_referencia", label: "Ponto de Referência do estabelecimento", type: "text" },
        { key: "estabelecimento_cep", label: "CEP", type: "text", maxLength: 8, numericOnly: true },
        { key: "estabelecimento_telefone", label: "(DDD) Telefone", type: "text", maxLength: 11, numericOnly: true },
        { key: "zona_exposicao", label: "Zona de exposição", type: "select", options: OPCOES_ZONA },
      ],
    },
    {
      title: "Dados da Exposição – Agente Tóxico",
      fields: [
        {
          key: "grupo_agente_toxico",
          label: "Grupo do agente tóxico / Classificação geral",
          type: "select",
          fullWidth: true,
          options: [
            "01 – Medicamento", "02 – Agrotóxico; uso agrícola", "03 – Agrotóxico/uso doméstico", "04 – Agrotóxico/uso saúde pública",
            "05 – Raticida", "06 – Produto veterinário", "07 – Produto de uso Domiciliar", "08 – Cosmético/higiene pessoal",
            "09 – Produto químico de uso industrial", "10 – Metal", "11 – Drogas de abuso", "12 – Planta tóxica",
            "13 – Alimento e bebida", "14 – Outro", "99 – Ignorado",
          ],
        },
        { key: "agente_toxico_nome_comercial", label: "Agente tóxico – Nome Comercial/popular", type: "text" },
        { key: "agente_toxico_principio_ativo", label: "Princípio Ativo", type: "text" },
        { key: "agente_toxico_outros", label: "Demais agentes envolvidos, se mais de um (nome comercial e princípio ativo)", type: "textarea", fullWidth: true },
        {
          key: "agrotoxico_finalidade",
          label: "Se agrotóxico, qual a finalidade da utilização",
          type: "select",
          fullWidth: true,
          options: ["1 – Inseticida", "2 – Herbicida", "3 – Carrapaticida", "4 – Raticida", "5 – Fungicida", "6 – Preservante para madeira", "7 – Outro", "8 – Não se aplica", "9 – Ignorado"],
        },
        {
          key: "agrotoxico_atividades",
          label: "Se agrotóxico, atividades exercidas na exposição atual (até três opções)",
          type: "checkbox-group",
          fullWidth: true,
          options: [
            "01 – Diluição", "02 – Pulverização", "03 – Tratamento de sementes", "04 – Armazenagem", "05 – Colheita",
            "06 – Transporte", "07 – Desinsetização", "08 – Produção/formulação", "09 – Outros", "10 – Não se aplica", "99 – Ignorado",
          ],
        },
        { key: "agrotoxico_cultura_lavoura", label: "Se agrotóxico de uso agrícola, qual a cultura/lavoura", type: "text", fullWidth: true },
        {
          key: "via_exposicao",
          label: "Via de exposição/contaminação (até três opções)",
          type: "checkbox-group",
          fullWidth: true,
          options: ["1 – Digestiva", "2 – Cutânea", "3 – Respiratória", "4 – Ocular", "5 – Parenteral", "6 – Vaginal", "7 – Transplacentária", "8 – Outra", "9 – Ignorada"],
        },
        {
          key: "circunstancia_exposicao",
          label: "Circunstância da exposição/contaminação",
          type: "select",
          fullWidth: true,
          options: [
            "01 – Uso Habitual", "02 – Acidental", "03 – Ambiental", "04 – Uso terapêutico", "05 – Prescrição médica inadequada",
            "06 – Erro de administração", "07 – Automedicação", "08 – Abuso", "09 – Ingestão de alimento ou bebida",
            "10 – Tentativa de suicídio", "11 – Tentativa de aborto", "12 – Violência/homicídio", "13 – Outra", "99 – Ignorado",
          ],
        },
        { key: "exposicao_decorrente_trabalho", label: "A exposição/contaminação foi decorrente do trabalho/ocupação?", type: "select", options: ["1 – Sim", "2 – Não", "9 – Ignorado"] },
        { key: "tipo_exposicao", label: "Tipo de Exposição", type: "select", options: ["1 – Aguda – única", "2 – Aguda – repetida", "3 – Crônica", "4 – Aguda sobre Crônica", "9 – Ignorado"] },
      ],
    },
    {
      title: "Dados do Atendimento",
      fields: [
        { key: "tempo_exposicao_atendimento_valor", label: "Tempo Decorrido entre a Exposição e o Atendimento", type: "number" },
        { key: "tempo_exposicao_atendimento_unidade", label: "Unidade", type: "select", options: [...OPCOES_TEMPO_UNIDADE, "9 – Ignorado"] },
        { key: "tipo_atendimento", label: "Tipo de atendimento", type: "select", options: ["1 – Hospitalar", "2 – Ambulatorial", "3 – Domiciliar", "4 – Nenhum", "9 – Ignorado"] },
        { key: "houve_hospitalizacao", label: "Houve hospitalização?", type: "select", options: ["1 – Sim", "2 – Não", "9 – Ignorado"] },
        { key: "data_internacao", label: "Data da internação", type: "date" },
        { key: "uf_hospitalizacao", label: "UF", type: "text", maxLength: 2, uppercase: true },
        { key: "municipio_hospitalizacao", label: "Município de hospitalização", type: "text" },
        { key: "unidade_saude", label: "Unidade de saúde", type: "text" },
      ],
    },
    {
      title: "Conclusão do Caso",
      fields: [
        {
          key: "classificacao_final",
          label: "Classificação final",
          type: "select",
          fullWidth: true,
          options: ["1 – Intoxicação confirmada", "2 – Só Exposição", "3 – Reação Adversa", "4 – Outro Diagnóstico", "5 – Síndrome de abstinência", "9 – Ignorado"],
        },
        { key: "diagnostico_se_confirmada", label: "Se intoxicação confirmada, qual o diagnóstico", type: "text", fullWidth: true },
        { key: "cid10", label: "CID-10", type: "text" },
        { key: "criterio_confirmacao", label: "Critério de confirmação", type: "select", options: ["1 – Laboratorial", "2 – Clínico-epidemiológico", "3 – Clínico"] },
        {
          key: "evolucao_caso",
          label: "Evolução do Caso",
          type: "select",
          fullWidth: true,
          options: ["1 – Cura sem sequela", "2 – Cura com sequela", "3 – Óbito por intoxicação exógena", "4 – Óbito por outra causa", "5 – Perda de seguimento", "9 – Ignorado"],
        },
        { key: "data_obito", label: "Data do óbito", type: "date" },
        { key: "cat_emitida", label: "Comunicação de Acidente de Trabalho – CAT", type: "select", options: ["1 – Sim", "2 – Não", "3 – Não se aplica", "9 – Ignorado"] },
        { key: "data_encerramento", label: "Data do Encerramento", type: "date" },
        { key: "observacoes", label: "Informações complementares e observações — Ex.: Descreva como ocorreu o acidente ou o adoecimento e as lesões existentes.", type: "textarea", fullWidth: true, required: true, placeholder: "Ex: Descreva como ocorreu o acidente ou o adoecimento e as lesões existentes" },
      ],
    },
    {
      title: "Notificador",
      fields: [
        { key: "notificador_nome", label: "Notificador / Nome", type: "text", required: true },
        { key: "notificador_funcao", label: "Função", type: "text", required: true },
      ],
    },
  ],
};
