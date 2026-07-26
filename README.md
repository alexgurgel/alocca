# Alocca

Plataforma de gestão operacional para produtores de eventos — colaboradores,
funções, eventos, escalas, convites e check-in em um só lugar.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (estilo `base-nova`, sobre [Base UI](https://base-ui.com))
- [Supabase](https://supabase.com) (Postgres, Auth, Storage, Realtime)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)
- [Recharts](https://recharts.org) para os gráficos do painel
- [Lucide](https://lucide.dev) para ícones

## Como rodar localmente

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure o Supabase

Crie um projeto em [supabase.com](https://supabase.com) e aplique as migrations
em `supabase/migrations/` (veja `supabase/README.md` para o passo a passo
detalhado). Elas criam todas as tabelas, políticas de RLS, buckets de storage
e a função de cadastro.

### 3. Configure as variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com as credenciais do
seu projeto Supabase (URL + anon key, em **Project Settings → API**):

```bash
cp .env.local.example .env.local
```

### 4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A raiz redireciona para
`/entrar` (login) ou `/painel`, dependendo da sessão.

## Estrutura do projeto

```
src/
  app/                 # Rotas (App Router)
    (auth)/            # Conecte-se, Cadastro, Esqueci/Redefinir senha
    (app)/              # Área do produtor: Painel, Eventos, Colaboradores,
                        # Escalas, Check-in, Relatórios, Configurações, Perfil
    (colaborador)/      # Portal do colaborador: Meus convites
  components/
    ui/                # Componentes shadcn/ui (base-ui)
    layout/             # Sidebar, topbar, menu do usuário
    dashboard/ eventos/ colaboradores/ escalas/ checkin/
    relatorios/ configuracoes/ colaborador-portal/
    shared/             # Componentes reutilizáveis (empty state, paginação...)
    providers/          # Contexto de perfil/empresa autenticados
  hooks/                # Hooks de dados (use-eventos, use-colaboradores...)
  services/             # Funções puras de acesso ao Supabase
  lib/
    supabase/           # Clientes browser/server + refresh de sessão (proxy)
    validations/        # Schemas Zod dos formulários
  types/                # Tipos gerados do banco + tipos de domínio
supabase/
  migrations/           # Schema SQL, RLS e storage
```

## Notas de arquitetura

- **Multi-tenant por `empresa_id`**, isolado via Row Level Security no
  Postgres — nenhuma query do cliente depende de filtros manuais de
  segurança.
- **Sem dados fictícios fixos**: todas as telas leem diretamente do Supabase
  e mostram estados vazios até que dados reais sejam cadastrados.
- **Tempo real**: a lista de convites (escala) e o check-in usam
  `supabase.channel(...).on('postgres_changes', ...)` para refletir mudanças
  instantaneamente.
- Preparado para evolução futura: PIX/pagamentos, IA e app mobile podem ser
  adicionados sem alterar o modelo de dados atual (ver `supabase/README.md`).

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
