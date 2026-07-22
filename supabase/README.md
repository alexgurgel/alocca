# Banco de dados — Alocca

Este diretório contém as migrations SQL usadas para provisionar o projeto Supabase da Alocca.

## Como aplicar

### Opção 1 — Supabase CLI (recomendado)

```bash
npm install -g supabase
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

### Opção 2 — SQL Editor do painel Supabase

Copie e execute, nesta ordem, o conteúdo de cada arquivo em `migrations/` no
**SQL Editor** do painel do Supabase:

1. `0001_init.sql` — tabelas, índices, funções de RLS e políticas
2. `0002_storage.sql` — buckets de storage (`avatars`, `logos`) e políticas
3. `0003_signup_rpc.sql` — função `criar_empresa_e_perfil` usada no cadastro

## Modelo de dados

| Tabela | Descrição |
| --- | --- |
| `empresas` | Tenant — a produtora de eventos que usa a plataforma |
| `perfis` | Extensão de `auth.users`; guarda nome, papel (`admin`/`colaborador`) e vínculo com empresa/funcionário |
| `funcionarios` | Colaboradores da operação (equipe de campo) |
| `funcoes` | Cargos cadastráveis (Garçom, Barman, Segurança…) |
| `funcionario_funcoes` | Relação N:N entre funcionários e funções |
| `eventos` | Eventos cadastrados pela produtora |
| `evento_funcoes` | Escala do evento — quantas vagas de cada função |
| `convites` | Convites enviados a um funcionário para uma função de um evento |
| `checkins` | Check-in de presença de cada funcionário convocado |

Todas as tabelas (exceto `empresas`) são isoladas por `empresa_id` via Row
Level Security, usando as funções auxiliares `current_empresa_id()` e
`current_funcionario_id()` (ambas `security definer`, avaliadas a partir de
`perfis` do usuário autenticado).

## Autenticação

- **Conta do produtor**: criada via Cadastro → `supabase.auth.signUp` seguido
  da RPC `criar_empresa_e_perfil`, que cria `empresas` + `perfis` em uma
  única transação (papel `admin`).
- **Conta do colaborador**: o `funcionario` é cadastrado pelo produtor sem
  login. Quando o colaborador precisar acessar convites/check-in pelo
  próprio usuário, vincule `funcionarios.user_id` e `perfis.funcionario_id`
  (papel `colaborador`) — a estrutura já está pronta para essa evolução.

Nenhum dado fictício é semeado — todas as telas leem diretamente do Supabase
e mostram estados vazios até que dados reais sejam cadastrados.
