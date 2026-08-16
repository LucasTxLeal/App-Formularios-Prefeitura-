-- ============================================================
-- SCHEMA: Plataforma de Formularios de Seguranca do Trabalho
-- Execute este script no SQL Editor do Supabase (ou psql)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Codigos de acesso municipais (login sem senha)
-- ------------------------------------------------------------
create table if not exists access_codes (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,              -- ex: '2050'
  unidade_nome text not null,             -- ex: 'Secretaria de Obras - Zona Norte'
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into access_codes (code, unidade_nome) values
  ('2050', 'Unidade 2050 - Secretaria de Obras'),
  ('3040', 'Unidade 3040 - Secretaria de Saude'),
  ('4020', 'Unidade 4020 - Secretaria de Educacao'),
  ('5010', 'Unidade 5010 - Secretaria de Meio Ambiente')
on conflict (code) do nothing;

-- ------------------------------------------------------------
-- 2. Tipos de formulario (grid C1 a C11 da central)
-- ------------------------------------------------------------
create table if not exists form_types (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,              -- ex: 'acidente-trabalho'
  codigo_curto text unique not null,      -- 'C1', 'C2' ... 'C11'
  titulo text not null,
  descricao text,
  ativo boolean not null default true,
  ordem int not null default 0
);

insert into form_types (slug, codigo_curto, titulo, descricao, ativo, ordem) values
  ('y96', 'Y96', 'Acidente de Trabalho (Y96)', 'Notificação SINAN de acidente de trabalho', true, 1),
  ('quase-acidente', 'C2', 'Registro de Quase Acidente', 'Em construcao', false, 2),
  ('inspecao-epi', 'C3', 'Inspecao de EPI', 'Em construcao', false, 3),
  ('ordem-servico', 'C4', 'Ordem de Servico (OS)', 'Em construcao', false, 4),
  ('dds', 'C5', 'Dialogo Diario de Seguranca (DDS)', 'Em construcao', false, 5),
  ('checklist-veicular', 'C6', 'Checklist Veicular', 'Em construcao', false, 6),
  ('inspecao-extintor', 'C7', 'Inspecao de Extintores', 'Em construcao', false, 7),
  ('analise-risco', 'C8', 'Analise Preliminar de Risco (APR)', 'Em construcao', false, 8),
  ('treinamento', 'C9', 'Ficha de Treinamento', 'Em construcao', false, 9),
  ('epi-entrega', 'C10', 'Ficha de Entrega de EPI', 'Em construcao', false, 10),
  ('nao-conformidade', 'C11', 'Registro de Nao Conformidade', 'Em construcao', false, 11)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 3. Formulário Y96 - Notificação de Acidente de Trabalho
--    (baseado na ficha oficial SINAN, CID-10 V01 a Y98)
-- ------------------------------------------------------------
create table if not exists y96_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),

  -- Dados Gerais
  data_notificacao date not null,
  data_acidente date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,                        -- Masculino | Feminino
  gestante text,                    -- Não | 1º Trimestre | 2º Trimestre | 3º Trimestre | Idade Gestacional Ignorada | Ignorado
  raca_cor text,                    -- Branca | Preta | Amarela | Parda | Indígena | Ignorado
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  municipio_residencia text,
  logradouro text,
  numero_endereco text,
  complemento text,
  bairro text,
  ocupacao text,

  -- Dados do Trabalho
  situacao_mercado_trabalho text,
  local_acidente text,              -- Instalações do contratante | Via pública | Instalações de terceiros | Domicílio próprio | Ignorado
  tempo_trabalho_ocupacao text,

  -- Dados da Empresa Contratante
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_endereco text,
  empresa_bairro text,
  empresa_municipio text,
  empresa_numero text,
  empresa_uf text,
  empresa_terceirizada text,        -- Sim | Não | Não se aplica | Ignorado
  empresa_principal_cnae text,
  empresa_principal_cnpj text,
  empresa_principal_nome text,

  -- Dados do Acidente
  hora_acidente time,
  horas_apos_jornada text,
  municipio_ocorrencia text,
  cid10_causa text,
  tipo_acidente text,               -- Típico | Trajeto | Ignorado
  outros_atingidos text,            -- Sim | Não | Ignorado
  outros_atingidos_qtd int,
  atendimento_medico text,          -- Sim | Não | Ignorado
  data_atendimento date,
  municipio_atendimento text,
  unidade_saude text,
  partes_corpo text[],              -- múltipla escolha: Olho, Cabeça, Pescoço, Tórax, Abdome, Mão, Membro superior, Membro inferior, Pé, Todo o corpo, Outro, Ignorado
  diagnostico_cid10 text,
  regime_tratamento text,           -- Hospitalar | Ambulatorial | Ambos | Ignorado
  evolucao_caso text,
  data_obito date,
  cat_emitida text,                 -- Sim | Não | Não se aplica | Ignorado

  -- Encerramento / responsável pela notificação (campo de texto, sem assinatura em canvas)
  notificador_nome text not null,
  notificador_funcao text not null,

  status text not null default 'enviado',
  created_at timestamptz not null default now()
);

create index if not exists idx_y96_reports_code on y96_reports(access_code);
create index if not exists idx_y96_reports_created on y96_reports(created_at desc);
create index if not exists idx_y96_reports_data_acidente on y96_reports(data_acidente desc);

-- ------------------------------------------------------------
-- 4. RLS (Row Level Security)
-- Todo o acesso de escrita/leitura sensivel passa pelas rotas
-- de API do servidor Next.js usando a SERVICE ROLE KEY, que
-- ignora RLS. O client (anon key) nao acessa estas tabelas
-- diretamente, entao mantemos RLS ligada e sem policies
-- publicas -- bloqueando qualquer chamada direta do browser.
-- ------------------------------------------------------------
alter table access_codes enable row level security;
alter table form_types enable row level security;
alter table y96_reports enable row level security;

-- Nenhuma policy publica e criada de proposito: apenas chamadas
-- autenticadas com a service_role (usada nas API routes do
-- servidor) conseguem ler/escrever nestas tabelas.

-- ------------------------------------------------------------
-- 5. (Opcional) Admin via Supabase Auth
-- Crie o usuario administrador em Authentication > Users no
-- painel do Supabase (email + senha). Nao e necessaria tabela
-- adicional: a rota /api/admin/login valida as credenciais
-- usando supabase.auth.signInWithPassword no servidor.
-- ------------------------------------------------------------
