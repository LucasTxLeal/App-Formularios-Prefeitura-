# Plataforma de Segurança do Trabalho

Aplicação web para preenchimento de fichas de notificação de agravos
relacionados ao trabalho (padrão SINAN), organizadas por código de acesso
municipal, com painel administrativo centralizador.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS + Framer Motion + lucide-react
- **Backend:** API Routes do Next.js (server-side) + Supabase (Postgres + Auth)
- **React:** v19

---

## 1. Identidade visual

A logo oficial (`public/logo.jpg`) aparece em destaque em todas as telas —
login por código, central, painel admin (login, dashboard e detalhe/impressão)
e no cabeçalho de cada formulário — além de ser usada como favicon do site.

Os 9 formulários ativos usam, como ícone na central, um pictograma vetorial
próprio (`public/icons/<slug>.svg`) — um desenho simples e reconhecível para
cada tipo de notificação, na paleta de cores do site. Por serem vetores
(SVG), nunca ficam borrados em nenhum tamanho de tela, e o conjunto inteiro
pesa menos de 40 KB. Para trocar algum ícone, edite o arquivo `.svg`
correspondente diretamente — qualquer editor de texto funciona, já que SVG é
apenas XML descrevendo formas.

## 2. Formulários implementados

| Código | Nome | Slug |
|---|---|---|
| Y96 | Acidente de Trabalho | `y96` |
| F99 | Transtorno Mental Relacionado ao Trabalho | `transtorno-mental` |
| Z20.9 | Acidente de Trabalho com Material Biológico | `material-biologico` |
| Z57.9 | LER/DORT | `ler-dort` |
| L98.9 | Dermatose Ocupacional | `dermatose-ocupacional` |
| H83.3 | PAIR (Perda Auditiva Induzida por Ruído) | `pair` |
| J64 | Pneumoconiose | `pneumoconiose` |
| T65.9 | Intoxicação Exógena | `intoxicacao-exogena` |
| C80 | Câncer Relacionado ao Trabalho | `cancer` |

"Entrega de EPI" e "Registro de Não Conformidade" foram retirados da tela a
pedido (nunca tiveram schema/tabela implementados). O código deles continua
no projeto, comentado em `src/data/formTypes.ts`, com uma nota de como
reativar rapidamente quando forem implementados — veja a seção 7.

### Simplificações assumidas nos 7 formulários novos

Ao digitalizar as fichas originais, dois pontos foram simplificados
conscientemente (fique ciente se precisar da versão 100% fiel):

- **Intoxicação Exógena — "Agente tóxico (até três agentes)":** o formulário
  captura um agente tóxico principal estruturado (nome comercial + princípio
  ativo) e um campo de texto livre para agentes adicionais, em vez de
  triplicar os campos.
- **Campos "até três opções" (Via de exposição, Atividades com agrotóxico):**
  implementados como grupos de checkbox (multi-seleção livre), sem limitar
  tecnicamente a 3 itens.

---

## 3. Estrutura do projeto

```
seguranca-trabalho-app/
├── supabase/
│   └── schema.sql                # script SQL completo (10 tabelas + RLS + seed)
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Tela 1 - login por código
│   │   ├── central/page.tsx                  # Tela 2 - grid de formulários
│   │   ├── formulario/
│   │   │   ├── y96/page.tsx                  # Y96 (formulário próprio)
│   │   │   └── [slug]/page.tsx               # os outros 7 (via DynamicForm) + placeholder
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                  # pastas por código
│   │   │       └── [codigo]/
│   │   │           ├── page.tsx               # lista combinada (todos os tipos)
│   │   │           └── [slug]/[id]/page.tsx   # detalhe genérico (estilo impresso)
│   │   └── api/
│   │       ├── reports/[slug]/route.ts       # grava qualquer um dos 9 tipos
│   │       └── admin/reports/                # listagem e detalhe (genéricos)
│   ├── components/
│   │   ├── DynamicForm.tsx                   # renderiza qualquer schema como formulário
│   │   ├── FormFields.tsx                    # campos reutilizáveis (texto/select/checkbox)
│   │   ├── SignatureCanvas.tsx               # canvas de assinatura (disponível p/ C9-C11)
│   │   └── FormCard.tsx
│   ├── data/
│   │   ├── formTypes.ts                      # grid da central (ícones, slugs, ativo/inativo)
│   │   ├── y96Options.ts                     # opções específicas do Y96
│   │   └── dynamicForms/                     # um arquivo por formulário novo (schema completo)
│   │       ├── types.ts                      # tipos FormSchema/FieldDef/SectionDef
│   │       ├── options.ts                    # opções compartilhadas entre os formulários
│   │       ├── registry.ts                   # registro central (slug → schema)
│   │       ├── transtornoMental.ts
│   │       ├── materialBiologico.ts
│   │       ├── lerDort.ts
│   │       ├── dermatose.ts
│   │       ├── pair.ts
│   │       ├── pneumoconiose.ts
│   │       └── intoxicacaoExogena.ts
│   ├── lib/
│   │   ├── session.ts                        # cookies assinados (HMAC / Web Crypto)
│   │   └── supabase/{client,server}.ts
│   └── proxy.ts                                # proteção de rotas privadas
├── .env.local.example
└── package.json
```

### Por que um sistema "genérico" para os 7 formulários novos?

Em vez de 7 páginas de formulário escritas à mão (centenas de campos cada,
alto risco de erro de transcrição), cada formulário é descrito **uma única
vez** como dados (`FormSchema`, em `src/data/dynamicForms/`). Esse mesmo
schema alimenta:

1. o formulário de preenchimento (`DynamicForm.tsx`),
2. a validação e gravação no banco (`/api/reports/[slug]`),
3. a listagem e visualização no painel admin.

As tabelas do banco (`supabase/schema.sql`) foram geradas **a partir** desses
schemas TypeScript por um pequeno script, não digitadas à mão — isso garante
que nome/tipo de cada coluna bate exatamente com o campo correspondente no
formulário.

---

## 4. Passo a passo para rodar o projeto

### 3.1. Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita em [supabase.com](https://supabase.com)

### 3.2. Criar o projeto no Supabase

1. Crie um novo projeto no Supabase.
2. Vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` e execute (**RUN**). Isso cria as 10 tabelas de
   relatório + `access_codes` + `form_types`, ativa o RLS e insere os
   códigos numéricos de exemplo (`2050`, `3040`, `4020`, `5010`), já vinculados
   aos nomes reais das unidades (UBSF BGV II, UBSF Quinta, UPA Cassino, UBS
   Parque Marinha).
3. Vá em **Authentication → Users → Add user** e crie o usuário
   administrador (e-mail + senha). Marque "Auto Confirm User".
4. Vá em **Project Settings → API Keys** e copie o **Project URL** e as
   chaves (nas contas mais novas, a página pode mostrar `publishable key` /
   `secret key` em vez de `anon` / `service_role` — ambos os formatos
   funcionam com as mesmas variáveis de ambiente abaixo).

### 3.3. Configurar as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-ou-publishable-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-ou-secret-key
SESSION_SECRET=gere-uma-string-aleatoria-grande-aqui
```

Gerar o `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4. Instalar e rodar

```bash
npm install
npm run dev
```

Acesse **http://localhost:3000**.

- **Login por código:** `2050` (UBSF BGV II), `3040` (UBSF Quinta), `4020`
  (UPA Cassino) ou `5010` (UBS Parque Marinha).
- **Login administrativo:** `/admin/login`, com o e-mail/senha criados no
  passo 3.2.3.

### 3.5. Build de produção

```bash
npm run build
npm run start
```

**Importante:** sempre que trocar de versão do Next.js ou baixar uma versão
atualizada deste projeto, apague `.next` e `node_modules` antes de reinstalar
(`Remove-Item -Recurse -Force .next, node_modules` no PowerShell) — tipos
gerados de uma versão anterior podem causar erros de build.

---

## 5. Fluxo da aplicação

1. **Tela 1 — Login por código:** cookie de sessão HTTP-only assinado
   (HMAC-SHA256 via Web Crypto API).
2. **Tela 2 — Central:** grid com os 9 formulários ativos.
3. **Tela 3 — Formulário:** cada um dos 9 tipos grava na sua própria tabela,
   vinculado automaticamente ao código de acesso da sessão ativa. Nenhum dos
   8 usa assinatura em canvas — o encerramento é sempre por texto
   (Notificador / Nome + Função).
4. **Tela 4 — Painel administrativo:** login separado (Supabase Auth) →
   pastas por código → lista combinada de **todos os 9 tipos** (com badge do
   código/tipo) → detalhe genérico em formato de documento, com botão
   **Imprimir / Salvar PDF**.

---

## 6. Segurança implementada

- Nenhuma tabela tem policy pública de RLS — todo acesso passa pelas API
  Routes do servidor (`service_role key`, nunca exposta ao navegador).
- Sessões via cookies HTTP-only, `SameSite=Lax`, assinados com HMAC-SHA256.
- `src/proxy.ts` bloqueia acesso direto a `/central`, `/formulario/*` e
  `/admin/dashboard/*` sem sessão válida.
- Login do administrador delega a validação de senha ao Supabase Auth.
- **Rate limiting no login:** tanto o login por código quanto o login do
  admin ficam bloqueados por 10 minutos após 8 tentativas (certas ou
  erradas) do mesmo IP, contadas na tabela `login_attempts`. Isso não
  distingue acerto/erro de propósito — o objetivo é impedir varredura
  automatizada de códigos/senhas.
- **Log de auditoria:** a tabela `access_logs` registra login (código e
  admin, inclusive tentativas que falharam), quem visualizou cada
  notificação no painel admin e quem enviou cada notificação — sempre com
  ator, tipo de evento, notificação afetada, IP e data/hora. Consulte em
  **Painel Administrativo → Log de Auditoria** (`/admin/dashboard/logs`).

### O que este projeto NÃO cobre (fique ciente antes de ir a produção)

- Sem validação de dígito verificador em CPF/CNPJ (só bloqueia letras).
- Sem criptografia adicional de campo — os dados ficam em texto plano no
  Postgres do Supabase (protegidos por TLS em trânsito e criptografia de
  disco padrão do provedor, mas não por criptografia específica da
  aplicação).
- Nada de LGPD implementado (consentimento, prazo de retenção, rota de
  exclusão a pedido do titular) — como o sistema coleta dado de saúde do
  trabalhador (dado sensível, art. 5º, II da LGPD), vale alinhar com quem
  cuida de LGPD na prefeitura antes de usar com dados reais de produção.
- As tabelas `login_attempts` e `access_logs` crescem indefinidamente; não
  há rotina automática de limpeza de registros antigos.

---

## 7. Como reativar "Entrega de EPI"/"Não Conformidade" ou adicionar um novo formulário

**Para reativar os 2 formulários removidos da tela** (Entrega de EPI, Não
Conformidade): eles ainda não têm schema/tabela implementados, só o card.
Descomente o bloco correspondente em `src/data/formTypes.ts` (procure pelo
comentário "Removidos da tela a pedido"), reimporte `ClipboardList` e
`FileWarning` do `lucide-react` no topo do arquivo, e siga os passos abaixo
para criar o formulário de verdade — o card sozinho só reaparece com
`ativo: false` ("em breve") até o schema existir.

**Para adicionar qualquer novo formulário do zero**, com o sistema genérico:

1. Criar `src/data/dynamicForms/<novoFormulario>.ts` exportando um
   `FormSchema` (copie a estrutura de qualquer um dos 9 existentes).
2. Registrar em `src/data/dynamicForms/registry.ts` (`FORM_SCHEMAS`).
3. Adicionar a tabela correspondente em `supabase/schema.sql` (mesmos nomes
   de coluna que as `key` do schema).
4. Adicionar (ou descomentar) o card em `src/data/formTypes.ts` com
   `ativo: true` — se quiser um ícone próprio, crie um `.svg` em
   `public/icons/` e aponte em `iconSrc`.

Não é necessário criar uma página nova — `/formulario/[slug]/page.tsx` e o
painel admin já tratam qualquer schema registrado automaticamente.

## 8. Evitar que o Supabase pause o projeto (plano Free)

No plano gratuito, o Supabase **pausa automaticamente qualquer projeto que
fique 7 dias sem receber nenhuma consulta ao banco**. Isso é uma política
deles, não um bug — e pausado, o site para de funcionar até você entrar no
painel do Supabase e clicar em "Restore".

Este projeto já vem com uma solução pronta: uma rota
`/api/cron/keep-alive` que faz uma consulta simples ao banco, agendada para
rodar todo dia às 6h (UTC) via **Vercel Cron** (configurado em
`vercel.json`). Isso é suficiente para o Supabase nunca considerar o projeto
inativo.

**O que você precisa fazer:**

1. Adicione a variável `CRON_SECRET` no painel da Vercel (Project Settings →
   Environment Variables) com qualquer string aleatória — a mesma lógica do
   `SESSION_SECRET`. Isso impede que qualquer pessoa na internet chame essa
   rota manualmente.
2. Nada mais. O arquivo `vercel.json` já está configurado e a Vercel ativa o
   cron automaticamente no primeiro deploy.

Você pode conferir se está rodando em **Vercel Dashboard → seu projeto →
aba Cron Jobs** — lá aparece o histórico de execuções.

> O agendamento diário funciona até no plano gratuito (Hobby) da Vercel, que
> permite no máximo 1 execução por dia por cron — não tente diminuir o
> intervalo para "a cada hora" ou similar, pois o deploy falha nesse plano.

## 9. Como adicionar um novo código de acesso (unidade)

No SQL Editor do Supabase:

```sql
insert into access_codes (code, unidade_nome) values
  ('6070', 'UBS Nome da Nova Unidade');
```
