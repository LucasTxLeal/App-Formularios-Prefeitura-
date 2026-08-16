# Plataforma de Segurança do Trabalho

Aplicação web para preenchimento de formulários de segurança do trabalho
organizados por código de acesso municipal, com painel administrativo
centralizador.

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + lucide-react
- **Backend:** API Routes do Next.js (server-side) + Supabase (Postgres + Auth)
- **Assinatura digital:** HTML5 Canvas (componente próprio, sem libs externas)

---

## 1. Estrutura do projeto

```
seguranca-trabalho-app/
├── supabase/
│   └── schema.sql              # script SQL completo (tabelas + RLS + seed)
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Tela 1 - login por código
│   │   ├── central/page.tsx                  # Tela 2 - grid C1-C11
│   │   ├── formulario/
│   │   │   ├── y96/page.tsx                  # Tela 3 - formulário Y96 (completo)
│   │   │   └── [slug]/page.tsx               # placeholder C2-C11
│   │   ├── admin/
│   │   │   ├── login/page.tsx                # login do administrador
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                  # Tela 4 - pastas por código
│   │   │       └── [codigo]/
│   │   │           ├── page.tsx              # lista de relatórios da pasta
│   │   │           └── [id]/page.tsx         # relatório completo (estilo impresso)
│   │   └── api/                              # rotas server-side (auth, reports, admin)
│   ├── components/
│   │   ├── FormFields.tsx                    # campos reutilizáveis (texto/select/checkbox)
│   │   ├── SignatureCanvas.tsx               # canvas de assinatura (disponível p/ C2-C11)
│   │   └── FormCard.tsx                      # card animado da central
│   ├── data/formTypes.ts                     # definição estática dos 11 formulários
│   ├── lib/
│   │   ├── session.ts                        # cookies assinados (HMAC / Web Crypto)
│   │   └── supabase/{client,server}.ts       # clientes Supabase (browser / server)
│   └── middleware.ts                          # proteção de rotas privadas
├── .env.local.example
└── package.json
```

---

## 2. Passo a passo para rodar o projeto

### 2.1. Pré-requisitos

- Node.js 18 ou superior
- Uma conta gratuita em [supabase.com](https://supabase.com)

### 2.2. Criar o projeto no Supabase

1. Crie um novo projeto no Supabase (anote a **senha do banco**, você não vai
   precisar dela para este projeto, mas é bom guardar).
2. Vá em **SQL Editor** → **New query**, cole todo o conteúdo do arquivo
   `supabase/schema.sql` e execute (**RUN**). Isso cria as tabelas
   `access_codes`, `form_types`, `y96_reports`, ativa o RLS e insere os
   códigos de exemplo `2050`, `3040`, `4020`, `5010`.
3. Vá em **Authentication → Users → Add user** e crie o usuário
   administrador (e-mail + senha) que vai acessar o painel central. Marque
   "Auto Confirm User".
4. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ nunca exponha esta chave no frontend)

### 2.3. Configurar as variáveis de ambiente

Copie o arquivo de exemplo e preencha com os dados do passo anterior:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-publica
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
SESSION_SECRET=gere-uma-string-aleatoria-grande-aqui
```

Dica para gerar o `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse **http://localhost:3000**.

- **Login por código (profissionais de campo):** use `2050`, `3040`, `4020`
  ou `5010` (cadastrados no seed do banco).
- **Login administrativo:** acesse `/admin/login` com o e-mail/senha criados
  no passo 2.2.3.

### 2.5. Build de produção

```bash
npm run build
npm run start
```

---

## 3. Fluxo da aplicação

1. **Tela 1 — Autenticação por código:** o profissional digita o código da
   sua unidade; se válido, um cookie de sessão (HTTP-only, assinado com
   HMAC-SHA256) é criado e ele é redirecionado para a central.
2. **Tela 2 — Central de formulários:** grid com os 11 tipos de formulário
   (C1 a C11). Nesta versão inicial, **C1 (Relato de Acidente de Trabalho)**
   está totalmente funcional; os demais aparecem como "em breve" e podem ser
   implementados seguindo o mesmo padrão de `y96/page.tsx`.
3. **Tela 3 — Formulário Y96:** ficha completa de notificação de acidente de
   trabalho (Dados Gerais, Dados do Trabalho, Dados da Empresa Contratante,
   Dados do Acidente e Notificador), seguindo a estrutura oficial da ficha
   SINAN. O encerramento é feito com campos de texto simples (nome e função
   do notificador) — sem assinatura em canvas. Ao enviar, os dados são
   gravados na tabela
   `y96_reports`, vinculados automaticamente ao código de acesso da
   sessão ativa.
4. **Tela 4 — Painel administrativo:** login separado (Supabase Auth) →
   dashboard com uma "pasta" por código de acesso, mostrando quantos
   relatórios cada uma recebeu → lista tabular ordenada por data → visão
   detalhada de cada relatório, em formato de documento (com botão
   **Imprimir / Salvar PDF**, usando `window.print()` com CSS de impressão
   já configurado em `globals.css`).

---

## 4. Segurança implementada

- **Nenhuma tabela tem policy pública de RLS** — todo acesso a
  `access_codes`, `form_types` e `y96_reports` passa exclusivamente
  pelas API Routes do servidor, que usam a `service_role key` (nunca exposta
  ao navegador).
- **Sessões via cookies HTTP-only, `SameSite=Lax` e assinados com
  HMAC-SHA256** (Web Crypto API, compatível com Edge Runtime) — não é
  possível forjar um código de acesso ou sessão de admin sem o
  `SESSION_SECRET` do servidor.
- **`middleware.ts`** bloqueia o acesso direto (via URL) a `/central`,
  `/formulario/*` e `/admin/dashboard/*` sem sessão válida, redirecionando
  para o login correspondente.
- **Login do administrador** delega a validação de senha ao Supabase Auth
  (hash e verificação de senha ficam inteiramente do lado do Supabase).

---

## 5. Como adicionar um novo código de acesso (unidade)

No SQL Editor do Supabase:

```sql
insert into access_codes (code, unidade_nome) values
  ('6070', 'Unidade 6070 - Secretaria de Transporte');
```

## 6. Como implementar os formulários C2 a C11

Cada formulário segue o mesmo padrão do C1:

1. Adicione os campos da tabela em `supabase/schema.sql` (ou crie uma nova
   tabela, ex. `quase_acidente_reports`).
2. Duplique `src/app/formulario/y96/page.tsx` para
   `src/app/formulario/<slug>/page.tsx`, ajustando os campos do formulário.
3. Crie a rota `POST /api/reports/<slug>` seguindo o padrão de
   `src/app/api/reports/route.ts`.
4. Marque `ativo: true` no formulário correspondente em
   `src/data/formTypes.ts`.
5. Replique a listagem/visualização no painel admin
   (`admin/dashboard/[codigo]/page.tsx` e `.../[id]/page.tsx`), ou generalize
   essas telas para múltiplos tipos de formulário por pasta.
