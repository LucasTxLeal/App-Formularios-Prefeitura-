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
  code text unique not null,
  unidade_nome text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into access_codes (code, unidade_nome) values
  ('2050', 'UBSF BGV II'),
  ('3040', 'UBSF Quinta'),
  ('4020', 'UPA Cassino'),
  ('5010', 'UBS Parque Marinha')
on conflict (code) do update set unidade_nome = excluded.unidade_nome;

-- Se você já tinha rodado a versão anterior deste script com os códigos
-- sendo os próprios nomes das unidades ('UBSF BGV II', etc.), desative-os
-- agora que os códigos numéricos voltaram a ser a forma de login (rode
-- manualmente se for o seu caso, não é executado automaticamente):
-- update access_codes set active = false where code in ('UBSF BGV II','UBSF Quinta','UPA Cassino','UBS Parque Marinha');

-- ------------------------------------------------------------
-- 2. Tipos de formulario (grid da central)
-- ------------------------------------------------------------
create table if not exists form_types (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  codigo_curto text unique not null,
  titulo text not null,
  descricao text,
  ativo boolean not null default true,
  ordem int not null default 0
);

insert into form_types (slug, codigo_curto, titulo, descricao, ativo, ordem) values
  ('y96', 'Y96', 'Acidente de Trabalho', 'Notificacao SINAN de acidente de trabalho', true, 1),
  ('transtorno-mental', 'F99', 'Transtorno Mental Relacionado ao Trabalho', 'Notificacao SINAN de transtorno mental', true, 2),
  ('material-biologico', 'Z20.9', 'Acidente com Material Biologico', 'Notificacao SINAN de exposicao a material biologico', true, 3),
  ('ler-dort', 'Z57.9', 'LER/DORT', 'Notificacao SINAN de lesoes por esforco repetitivo', true, 4),
  ('dermatose-ocupacional', 'L98.9', 'Dermatose Ocupacional', 'Notificacao SINAN de dermatose ocupacional', true, 5),
  ('pair', 'H83.3', 'PAIR', 'Notificacao SINAN de perda auditiva induzida por ruido', true, 6),
  ('pneumoconiose', 'J64', 'Pneumoconiose', 'Notificacao SINAN de pneumoconiose', true, 7),
  ('intoxicacao-exogena', 'T65.9', 'Intoxicacao Exogena', 'Notificacao SINAN de intoxicacao exogena', true, 8),
  ('cancer', 'C80', 'Cancer Relacionado ao Trabalho', 'Notificacao SINAN de cancer relacionado ao trabalho', true, 9),
  ('epi-entrega', 'C10', 'Entrega de EPI', 'Em construcao', false, 10),
  ('nao-conformidade', 'C11', 'Registro de Nao Conformidade', 'Em construcao', false, 11)
on conflict (slug) do update set
  codigo_curto = excluded.codigo_curto,
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  ativo = excluded.ativo,
  ordem = excluded.ordem;

-- ------------------------------------------------------------
-- 3. Formulario Y96 - Notificacao de Acidente de Trabalho
-- ------------------------------------------------------------
create table if not exists y96_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_acidente date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  municipio_residencia text,
  logradouro text,
  numero_endereco text,
  complemento text,
  bairro text,
  ocupacao text,
  situacao_mercado_trabalho text,
  local_acidente text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_endereco text,
  empresa_bairro text,
  empresa_municipio text,
  empresa_numero text,
  empresa_uf text,
  empresa_terceirizada text,
  empresa_principal_cnae text,
  empresa_principal_cnpj text,
  empresa_principal_nome text,
  hora_acidente time,
  horas_apos_jornada text,
  municipio_ocorrencia text,
  cid10_causa text,
  tipo_acidente text,
  outros_atingidos text,
  outros_atingidos_qtd int,
  atendimento_medico text,
  data_atendimento date,
  municipio_atendimento text,
  unidade_saude text,
  partes_corpo text[],
  diagnostico_cid10 text,
  regime_tratamento text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);

-- Migração segura para quem já tinha criado a tabela y96_reports antes
-- deste campo existir (não quebra instalações novas, pois a coluna já
-- nasce criada no CREATE TABLE acima).
alter table y96_reports add column if not exists informacoes_complementares text;

create index if not exists idx_y96_reports_code on y96_reports(access_code);
create index if not exists idx_y96_reports_created on y96_reports(created_at desc);

-- ------------------------------------------------------------
-- 4. Formularios de agravos (8 formularios, gerados a partir dos
--    schemas TypeScript em src/data/dynamicForms/ para garantir
--    que os nomes/tipos de coluna batem exatamente com o codigo)
-- ------------------------------------------------------------

-- ==== transtorno_mental_reports (50 campos) ====
create table if not exists transtorno_mental_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  regime_tratamento text,
  diagnostico_especifico_cid10 text,
  habitos text[],
  habito_fumar text,
  tempo_exposicao_tabaco_valor integer,
  tempo_exposicao_tabaco_unidade text,
  conduta_geral text[],
  conduta_geral_outros text,
  outros_trabalhadores_mesma_doenca text,
  encaminhado_caps text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_transtorno_mental_reports_code on transtorno_mental_reports(access_code);
create index if not exists idx_transtorno_mental_reports_created on transtorno_mental_reports(created_at desc);

-- ==== material_biologico_reports (52 campos) ====
create table if not exists material_biologico_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_acidente date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  municipio_residencia text,
  logradouro text,
  numero_endereco text,
  complemento text,
  bairro text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_endereco text,
  empresa_bairro text,
  empresa_municipio text,
  empresa_numero text,
  empresa_uf text,
  empresa_terceirizada text,
  tipo_exposicao_i text,
  tipo_exposicao_i_outros text,
  tipo_exposicao_ii text,
  material_organico text[],
  circunstancia_acidente text,
  agente text,
  uso_epi text[],
  situacao_vacinal_hepatite_b text,
  exame_momento_anti_hiv text,
  exame_momento_hbsag text,
  exame_momento_anti_hbs text,
  exame_momento_anti_hcv text,
  paciente_fonte_conhecida text,
  fonte_anti_hiv text,
  fonte_hbsag text,
  fonte_anti_hbs text,
  fonte_anti_hcv text,
  conduta_momento_acidente text[],
  conduta_outro_arv text,
  evolucao_caso text,
  alta_conversao_virus text,
  data_obito date,
  cat_emitida text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_material_biologico_reports_code on material_biologico_reports(access_code);
create index if not exists idx_material_biologico_reports_created on material_biologico_reports(created_at desc);

-- ==== ler_dort_reports (55 campos) ====
create table if not exists ler_dort_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  agravos_associados text[],
  agravos_outras text,
  regime_tratamento text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  sinais_sintomas text[],
  sinais_sintomas_outro text,
  limitacao_incapacidade_tarefas text,
  exposto_local_trabalho text[],
  diagnostico_especifico_cid10 text,
  afastamento_trabalho_tratamento text,
  tempo_afastamento_valor integer,
  tempo_afastamento_unidade text,
  afastamento_resultado text,
  outros_trabalhadores_mesma_doenca text,
  conduta_geral text[],
  conduta_geral_outros text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_ler_dort_reports_code on ler_dort_reports(access_code);
create index if not exists idx_ler_dort_reports_created on ler_dort_reports(created_at desc);

-- ==== dermatose_ocupacional_reports (56 campos) ====
create table if not exists dermatose_ocupacional_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  agravos_associados text[],
  agravos_outras text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  regime_tratamento text,
  principal_agente_causador text,
  principal_agente_outros text,
  localizacao_lesao text,
  localizacao_lesao_outro text,
  teste_epicutaneo_positivo text,
  diagnostico_especifico_cid10 text,
  afastamento_trabalho_tratamento text,
  tempo_afastamento_valor integer,
  tempo_afastamento_unidade text,
  afastamento_resultado text,
  outros_trabalhadores_mesma_doenca text,
  conduta_geral text[],
  conduta_geral_outros text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_dermatose_ocupacional_reports_code on dermatose_ocupacional_reports(access_code);
create index if not exists idx_dermatose_ocupacional_reports_created on dermatose_ocupacional_reports(created_at desc);

-- ==== pair_reports (57 campos) ====
create table if not exists pair_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  idade integer,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  agravos_associados text[],
  agravos_outras text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  regime_tratamento text,
  tipo_ruido_predominante text,
  exposicao_concomitante text[],
  exposicao_concomitante_outros text,
  sintomas text[],
  sintomas_outros text,
  diagnostico_especifico_cid10 text,
  afastamento_trabalho_tratamento text,
  tempo_afastamento_valor integer,
  tempo_afastamento_unidade text,
  afastamento_resultado text,
  outros_trabalhadores_mesma_doenca text,
  conduta_geral text[],
  conduta_geral_outros text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_pair_reports_code on pair_reports(access_code);
create index if not exists idx_pair_reports_created on pair_reports(created_at desc);

-- ==== pneumoconiose_reports (57 campos) ====
create table if not exists pneumoconiose_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  idade integer,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  agravos_associados text[],
  agravos_outras text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  regime_tratamento text,
  exposicao_multiplos_vinculos text,
  exposicao_multiplos_vinculos_especificar text,
  agentes_exposicao text[],
  habito_fumar text,
  tempo_exposicao_tabaco_valor integer,
  tempo_exposicao_tabaco_unidade text,
  confirmacao_diagnostica text[],
  diagnostico_especifico_cid10 text,
  outros_trabalhadores_mesma_doenca text,
  outros_trabalhadores_especificar text,
  avaliacao_funcional text,
  resultado_avaliacao_funcional text,
  conduta_geral text[],
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_pneumoconiose_reports_code on pneumoconiose_reports(access_code);
create index if not exists idx_pneumoconiose_reports_created on pneumoconiose_reports(created_at desc);

-- ==== intoxicacao_exogena_reports (66 campos) ====
create table if not exists intoxicacao_exogena_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_primeiros_sintomas date,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  pais text,
  data_investigacao date,
  ocupacao text,
  situacao_mercado_trabalho text,
  local_ocorrencia_exposicao text,
  nome_local_estabelecimento text,
  estabelecimento_cnae text,
  estabelecimento_uf text,
  estabelecimento_municipio text,
  estabelecimento_bairro text,
  estabelecimento_logradouro text,
  estabelecimento_numero text,
  estabelecimento_complemento text,
  estabelecimento_ponto_referencia text,
  estabelecimento_cep text,
  estabelecimento_telefone text,
  zona_exposicao text,
  grupo_agente_toxico text,
  agente_toxico_nome_comercial text,
  agente_toxico_principio_ativo text,
  agente_toxico_outros text,
  agrotoxico_finalidade text,
  agrotoxico_atividades text[],
  agrotoxico_cultura_lavoura text,
  via_exposicao text[],
  circunstancia_exposicao text,
  exposicao_decorrente_trabalho text,
  tipo_exposicao text,
  tempo_exposicao_atendimento_valor integer,
  tempo_exposicao_atendimento_unidade text,
  tipo_atendimento text,
  houve_hospitalizacao text,
  data_internacao date,
  uf_hospitalizacao text,
  municipio_hospitalizacao text,
  unidade_saude text,
  classificacao_final text,
  diagnostico_se_confirmada text,
  cid10 text,
  criterio_confirmacao text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  data_encerramento date,
  observacoes text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_intoxicacao_exogena_reports_code on intoxicacao_exogena_reports(access_code);
create index if not exists idx_intoxicacao_exogena_reports_created on intoxicacao_exogena_reports(created_at desc);

-- ==== cancer_reports (48 campos) ====
create table if not exists cancer_reports (
  id uuid primary key default uuid_generate_v4(),
  access_code text not null references access_codes(code),
  data_notificacao date not null,
  data_diagnostico date not null,
  nome_paciente text not null,
  data_nascimento date,
  sexo text,
  gestante text,
  raca_cor text,
  escolaridade text,
  cartao_sus text,
  nome_mae text,
  uf text,
  municipio_residencia text,
  bairro text,
  logradouro text,
  numero_endereco text,
  complemento text,
  cep text,
  telefone text,
  zona text,
  ocupacao text,
  situacao_mercado_trabalho text,
  tempo_trabalho_ocupacao text,
  empresa_cnpj_cpf text,
  empresa_nome text,
  empresa_cnae text,
  empresa_uf text,
  empresa_municipio text,
  empresa_bairro text,
  empresa_endereco text,
  empresa_numero text,
  empresa_telefone text,
  empresa_terceirizada text,
  tempo_exposicao_agente_valor integer,
  tempo_exposicao_agente_unidade text,
  regime_tratamento text,
  diagnostico_especifico_cid10 text,
  agentes_exposicao text[],
  agentes_exposicao_outros text,
  habito_fumar text,
  tempo_exposicao_tabaco_valor integer,
  tempo_exposicao_tabaco_unidade text,
  outros_trabalhadores_mesma_doenca text,
  evolucao_caso text,
  data_obito date,
  cat_emitida text,
  informacoes_complementares text,
  notificador_nome text not null,
  notificador_funcao text not null,
  status text not null default 'enviado',
  created_at timestamptz not null default now()
);
create index if not exists idx_cancer_reports_code on cancer_reports(access_code);
create index if not exists idx_cancer_reports_created on cancer_reports(created_at desc);

-- ------------------------------------------------------------
-- 5. Rate limiting e log de auditoria (seguranca)
-- ------------------------------------------------------------

-- Guarda cada tentativa de login (certa ou errada) para permitir bloquear
-- excesso de tentativas por IP em uma janela de tempo (ver src/lib/rateLimit.ts).
create table if not exists login_attempts (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null,       -- IP do cliente
  login_type text not null,       -- 'access' | 'admin'
  success boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_attempts_lookup
  on login_attempts(identifier, login_type, created_at desc);

-- Pode crescer bastante ao longo do tempo; linhas com mais de 30 dias podem
-- ser apagadas periodicamente (nao ha nenhuma rotina automatica para isso).
create index if not exists idx_login_attempts_created on login_attempts(created_at desc);

-- Log de auditoria: quem fez login, quem visualizou qual notificacao, quem
-- enviou qual notificacao. Ver src/lib/auditLog.ts.
create table if not exists access_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_type text not null,       -- 'code' | 'admin'
  actor text not null,            -- o codigo de acesso ou o e-mail do admin
  action text not null,           -- 'login_access' | 'login_admin' | 'login_failed' | 'view_report' | 'submit_report'
  resource_type text,             -- slug do formulario (y96, transtorno-mental, ...)
  resource_id uuid,               -- id do registro na tabela do formulario
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_access_logs_created on access_logs(created_at desc);
create index if not exists idx_access_logs_actor on access_logs(actor);

-- ------------------------------------------------------------
-- 6. RLS (Row Level Security)
-- Todo o acesso de escrita/leitura sensivel passa pelas rotas
-- de API do servidor Next.js usando a SERVICE ROLE KEY, que
-- ignora RLS. O client (anon key) nao acessa estas tabelas
-- diretamente, entao mantemos RLS ligada e sem policies
-- publicas -- bloqueando qualquer chamada direta do browser.
-- ------------------------------------------------------------
alter table access_codes enable row level security;
alter table form_types enable row level security;
alter table y96_reports enable row level security;
alter table transtorno_mental_reports enable row level security;
alter table material_biologico_reports enable row level security;
alter table ler_dort_reports enable row level security;
alter table dermatose_ocupacional_reports enable row level security;
alter table pair_reports enable row level security;
alter table pneumoconiose_reports enable row level security;
alter table intoxicacao_exogena_reports enable row level security;
alter table cancer_reports enable row level security;
alter table login_attempts enable row level security;
alter table access_logs enable row level security;

-- Nenhuma policy publica e criada de proposito: apenas chamadas
-- autenticadas com a service_role (usada nas API routes do
-- servidor) conseguem ler/escrever nestas tabelas.

-- ------------------------------------------------------------
-- 7. (Opcional) Admin via Supabase Auth
-- Crie o usuario administrador em Authentication > Users no
-- painel do Supabase (email + senha). Nao e necessaria tabela
-- adicional: a rota /api/admin/login valida as credenciais
-- usando supabase.auth.signInWithPassword no servidor.
-- ------------------------------------------------------------
