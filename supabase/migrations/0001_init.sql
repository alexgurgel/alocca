-- =====================================================================
-- Alocca — Esquema inicial do banco de dados
-- Plataforma de gestao operacional para produtores de eventos
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Helper: mantem a coluna updated_at sempre atualizada
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- EMPRESAS
-- Cada empresa e um tenant. Todo dado operacional pertence a uma empresa.
-- =====================================================================
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  cnpj text,
  telefone text,
  email text,
  endereco text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_empresas_updated_at
  before update on public.empresas
  for each row execute function public.set_updated_at();

-- =====================================================================
-- FUNCIONARIOS (colaboradores da operacao: garcom, barman, seguranca...)
-- =====================================================================
create table public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  nome text not null,
  cpf text,
  telefone text,
  email text,
  data_nascimento date,
  cidade text,
  estado text,
  foto_url text,
  observacoes text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_funcionarios_empresa on public.funcionarios (empresa_id);
create unique index idx_funcionarios_user on public.funcionarios (user_id) where user_id is not null;

create trigger trg_funcionarios_updated_at
  before update on public.funcionarios
  for each row execute function public.set_updated_at();

-- =====================================================================
-- PERFIS (extensao de auth.users com dados de aplicacao)
-- papel: admin (produtor/gestor da empresa) ou colaborador (equipe de campo)
-- =====================================================================
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  empresa_id uuid references public.empresas (id) on delete set null,
  funcionario_id uuid references public.funcionarios (id) on delete set null,
  nome text not null,
  email text not null,
  avatar_url text,
  telefone text,
  papel text not null default 'admin' check (papel in ('admin', 'colaborador')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_perfis_empresa on public.perfis (empresa_id);

create trigger trg_perfis_updated_at
  before update on public.perfis
  for each row execute function public.set_updated_at();

-- =====================================================================
-- FUNCOES (cargos: garcom, barman, caixa, seguranca, recepcionista...)
-- =====================================================================
create table public.funcoes (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  nome text not null,
  descricao text,
  cor text,
  created_at timestamptz not null default now(),
  unique (empresa_id, nome)
);

create index idx_funcoes_empresa on public.funcoes (empresa_id);

-- =====================================================================
-- FUNCOES_DO_FUNCIONARIO (many-to-many: um colaborador pode ter varias funcoes)
-- =====================================================================
create table public.funcionario_funcoes (
  funcionario_id uuid not null references public.funcionarios (id) on delete cascade,
  funcao_id uuid not null references public.funcoes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (funcionario_id, funcao_id)
);

create index idx_funcionario_funcoes_funcao on public.funcionario_funcoes (funcao_id);

-- =====================================================================
-- EVENTOS
-- =====================================================================
create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  criado_por uuid references public.perfis (id) on delete set null,
  nome text not null,
  cliente text,
  local text,
  endereco text,
  data_inicio timestamptz not null,
  data_fim timestamptz not null,
  valor_diaria_padrao numeric(10, 2),
  observacoes text,
  status text not null default 'planejado'
    check (status in ('planejado', 'em_andamento', 'finalizado', 'cancelado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_eventos_empresa on public.eventos (empresa_id);
create index idx_eventos_data_inicio on public.eventos (data_inicio);
create index idx_eventos_status on public.eventos (status);

create trigger trg_eventos_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();

-- =====================================================================
-- FUNCOES_DO_EVENTO (escala: quantas vagas de cada funcao um evento precisa)
-- =====================================================================
create table public.evento_funcoes (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  funcao_id uuid not null references public.funcoes (id) on delete cascade,
  vagas integer not null default 1 check (vagas >= 0),
  created_at timestamptz not null default now(),
  unique (evento_id, funcao_id)
);

create index idx_evento_funcoes_evento on public.evento_funcoes (evento_id);

-- =====================================================================
-- CONVITES_PARA_EVENTOS
-- =====================================================================
create table public.convites (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios (id) on delete cascade,
  funcao_id uuid not null references public.funcoes (id) on delete restrict,
  status text not null default 'pendente' check (status in ('pendente', 'aceito', 'recusado')),
  valor_diaria numeric(10, 2),
  observacoes text,
  enviado_em timestamptz not null default now(),
  respondido_em timestamptz,
  created_at timestamptz not null default now(),
  unique (evento_id, funcionario_id)
);

create index idx_convites_evento on public.convites (evento_id);
create index idx_convites_funcionario on public.convites (funcionario_id);
create index idx_convites_status on public.convites (status);

-- =====================================================================
-- CHECK-INS DE EVENTOS
-- =====================================================================
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references public.eventos (id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios (id) on delete cascade,
  convite_id uuid references public.convites (id) on delete set null,
  status text not null default 'pendente' check (status in ('pendente', 'presente', 'ausente', 'atrasado')),
  hora_checkin timestamptz,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evento_id, funcionario_id)
);

create index idx_checkins_evento on public.checkins (evento_id);

create trigger trg_checkins_updated_at
  before update on public.checkins
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Helpers de RLS (security definer evita recursao nas policies)
-- =====================================================================
create or replace function public.current_empresa_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select empresa_id from public.perfis where id = auth.uid();
$$;

create or replace function public.current_funcionario_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select funcionario_id from public.perfis where id = auth.uid();
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.empresas enable row level security;
alter table public.funcionarios enable row level security;
alter table public.perfis enable row level security;
alter table public.funcoes enable row level security;
alter table public.funcionario_funcoes enable row level security;
alter table public.eventos enable row level security;
alter table public.evento_funcoes enable row level security;
alter table public.convites enable row level security;
alter table public.checkins enable row level security;

-- EMPRESAS
create policy "empresas_select" on public.empresas
  for select using (id = public.current_empresa_id() or owner_id = auth.uid());

create policy "empresas_insert" on public.empresas
  for insert with check (owner_id = auth.uid());

create policy "empresas_update" on public.empresas
  for update using (id = public.current_empresa_id() or owner_id = auth.uid());

-- PERFIS
create policy "perfis_select" on public.perfis
  for select using (id = auth.uid() or empresa_id = public.current_empresa_id());

create policy "perfis_insert" on public.perfis
  for insert with check (id = auth.uid());

create policy "perfis_update" on public.perfis
  for update using (id = auth.uid());

-- FUNCIONARIOS
create policy "funcionarios_select" on public.funcionarios
  for select using (
    empresa_id = public.current_empresa_id()
    or user_id = auth.uid()
  );

create policy "funcionarios_insert" on public.funcionarios
  for insert with check (empresa_id = public.current_empresa_id());

create policy "funcionarios_update" on public.funcionarios
  for update using (
    empresa_id = public.current_empresa_id()
    or user_id = auth.uid()
  );

create policy "funcionarios_delete" on public.funcionarios
  for delete using (empresa_id = public.current_empresa_id());

-- FUNCOES
create policy "funcoes_select" on public.funcoes
  for select using (empresa_id = public.current_empresa_id());

create policy "funcoes_insert" on public.funcoes
  for insert with check (empresa_id = public.current_empresa_id());

create policy "funcoes_update" on public.funcoes
  for update using (empresa_id = public.current_empresa_id());

create policy "funcoes_delete" on public.funcoes
  for delete using (empresa_id = public.current_empresa_id());

-- FUNCIONARIO_FUNCOES
create policy "funcionario_funcoes_select" on public.funcionario_funcoes
  for select using (
    exists (
      select 1 from public.funcionarios f
      where f.id = funcionario_funcoes.funcionario_id
        and (f.empresa_id = public.current_empresa_id() or f.user_id = auth.uid())
    )
  );

create policy "funcionario_funcoes_insert" on public.funcionario_funcoes
  for insert with check (
    exists (
      select 1 from public.funcionarios f
      where f.id = funcionario_funcoes.funcionario_id
        and f.empresa_id = public.current_empresa_id()
    )
  );

create policy "funcionario_funcoes_delete" on public.funcionario_funcoes
  for delete using (
    exists (
      select 1 from public.funcionarios f
      where f.id = funcionario_funcoes.funcionario_id
        and f.empresa_id = public.current_empresa_id()
    )
  );

-- EVENTOS
create policy "eventos_select" on public.eventos
  for select using (empresa_id = public.current_empresa_id());

create policy "eventos_insert" on public.eventos
  for insert with check (empresa_id = public.current_empresa_id());

create policy "eventos_update" on public.eventos
  for update using (empresa_id = public.current_empresa_id());

create policy "eventos_delete" on public.eventos
  for delete using (empresa_id = public.current_empresa_id());

-- EVENTO_FUNCOES
create policy "evento_funcoes_select" on public.evento_funcoes
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_funcoes.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "evento_funcoes_insert" on public.evento_funcoes
  for insert with check (
    exists (
      select 1 from public.eventos e
      where e.id = evento_funcoes.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "evento_funcoes_update" on public.evento_funcoes
  for update using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_funcoes.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "evento_funcoes_delete" on public.evento_funcoes
  for delete using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_funcoes.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

-- CONVITES
create policy "convites_select" on public.convites
  for select using (
    funcionario_id = public.current_funcionario_id()
    or exists (
      select 1 from public.eventos e
      where e.id = convites.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "convites_insert" on public.convites
  for insert with check (
    exists (
      select 1 from public.eventos e
      where e.id = convites.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "convites_update" on public.convites
  for update using (
    funcionario_id = public.current_funcionario_id()
    or exists (
      select 1 from public.eventos e
      where e.id = convites.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "convites_delete" on public.convites
  for delete using (
    exists (
      select 1 from public.eventos e
      where e.id = convites.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

-- CHECKINS
create policy "checkins_select" on public.checkins
  for select using (
    funcionario_id = public.current_funcionario_id()
    or exists (
      select 1 from public.eventos e
      where e.id = checkins.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "checkins_insert" on public.checkins
  for insert with check (
    exists (
      select 1 from public.eventos e
      where e.id = checkins.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "checkins_update" on public.checkins
  for update using (
    exists (
      select 1 from public.eventos e
      where e.id = checkins.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create policy "checkins_delete" on public.checkins
  for delete using (
    exists (
      select 1 from public.eventos e
      where e.id = checkins.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );
