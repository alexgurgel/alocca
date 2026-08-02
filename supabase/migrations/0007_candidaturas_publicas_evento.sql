--
-- Alocca - Candidaturas publicas por evento com aprovacao administrativa
--

alter table public.eventos
  add column if not exists candidatura_publica_token uuid;

update public.eventos
set candidatura_publica_token = gen_random_uuid()
where candidatura_publica_token is null;

alter table public.eventos
  alter column candidatura_publica_token set default gen_random_uuid(),
  alter column candidatura_publica_token set not null;

create unique index if not exists idx_eventos_candidatura_publica_token
  on public.eventos (candidatura_publica_token);

create table if not exists public.candidaturas_evento (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  evento_id uuid not null references public.eventos (id) on delete cascade,
  funcao_id uuid not null references public.funcoes (id) on delete restrict,
  funcionario_id uuid references public.funcionarios (id) on delete set null,
  convite_id uuid references public.convites (id) on delete set null,
  nome text not null,
  telefone text,
  email text,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada')),
  aprovada_em timestamptz,
  rejeitada_em timestamptz,
  avaliada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_candidaturas_evento_evento on public.candidaturas_evento (evento_id);
create index if not exists idx_candidaturas_evento_empresa on public.candidaturas_evento (empresa_id);
create index if not exists idx_candidaturas_evento_status on public.candidaturas_evento (status);
create index if not exists idx_candidaturas_evento_funcao on public.candidaturas_evento (funcao_id);

drop trigger if exists trg_candidaturas_evento_updated_at on public.candidaturas_evento;
create trigger trg_candidaturas_evento_updated_at
  before update on public.candidaturas_evento
  for each row execute function public.set_updated_at();

alter table public.candidaturas_evento enable row level security;

drop policy if exists "candidaturas_evento_select" on public.candidaturas_evento;
create policy "candidaturas_evento_select" on public.candidaturas_evento
for select using (empresa_id = public.current_empresa_id());

drop policy if exists "candidaturas_evento_insert" on public.candidaturas_evento;
create policy "candidaturas_evento_insert" on public.candidaturas_evento
for insert with check (empresa_id = public.current_empresa_id());

drop policy if exists "candidaturas_evento_update" on public.candidaturas_evento;
create policy "candidaturas_evento_update" on public.candidaturas_evento
for update using (empresa_id = public.current_empresa_id())
with check (empresa_id = public.current_empresa_id());

drop policy if exists "candidaturas_evento_delete" on public.candidaturas_evento;
create policy "candidaturas_evento_delete" on public.candidaturas_evento
for delete using (empresa_id = public.current_empresa_id());

create or replace function public.obter_evento_candidatura_publica(p_token uuid)
returns table (
  evento_id uuid,
  evento_nome text,
  evento_status text,
  evento_cliente text,
  evento_local text,
  evento_endereco text,
  evento_data_inicio timestamptz,
  evento_data_fim timestamptz,
  evento_observacoes text,
  candidatura_publica_token uuid,
  funcao_id uuid,
  funcao_nome text,
  vagas integer,
  confirmados bigint,
  pendentes bigint
)
language sql
security definer
set search_path = public
as $$
  select
    e.id as evento_id,
    e.nome as evento_nome,
    e.status as evento_status,
    e.cliente as evento_cliente,
    e.local as evento_local,
    e.endereco as evento_endereco,
    e.data_inicio as evento_data_inicio,
    e.data_fim as evento_data_fim,
    e.observacoes as evento_observacoes,
    e.candidatura_publica_token,
    ef.funcao_id,
    f.nome as funcao_nome,
    ef.vagas,
    count(*) filter (where c.status = 'aceito') as confirmados,
    count(*) filter (where c.status = 'pendente') as pendentes
  from public.eventos e
  join public.evento_funcoes ef on ef.evento_id = e.id
  join public.funcoes f on f.id = ef.funcao_id
  left join public.convites c
    on c.evento_id = e.id
   and c.funcao_id = ef.funcao_id
  where e.candidatura_publica_token = p_token
  group by
    e.id, e.nome, e.status, e.cliente, e.local, e.endereco,
    e.data_inicio, e.data_fim, e.observacoes, e.candidatura_publica_token,
    ef.funcao_id, f.nome, ef.vagas
  order by f.nome asc;
$$;

grant execute on function public.obter_evento_candidatura_publica(uuid) to anon, authenticated;

create or replace function public.criar_candidatura_publica(
  p_token uuid,
  p_funcao_id uuid,
  p_nome text,
  p_telefone text default null,
  p_email text default null,
  p_observacoes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evento public.eventos%rowtype;
  v_existente uuid;
  v_candidatura_id uuid;
  v_telefone_limpo text;
begin
  select *
    into v_evento
  from public.eventos
  where candidatura_publica_token = p_token;

  if not found then
    raise exception 'Evento nao encontrado';
  end if;

  if v_evento.status in ('cancelado', 'finalizado') then
    raise exception 'Evento indisponivel para candidaturas';
  end if;

  if not exists (
    select 1
    from public.evento_funcoes
    where evento_id = v_evento.id
      and funcao_id = p_funcao_id
  ) then
    raise exception 'Funcao indisponivel para este evento';
  end if;

  v_telefone_limpo := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');

  select c.id
    into v_existente
  from public.candidaturas_evento c
  where c.evento_id = v_evento.id
    and c.funcao_id = p_funcao_id
    and c.status = 'pendente'
    and (
      (nullif(trim(coalesce(p_email, '')), '') is not null and lower(coalesce(c.email, '')) = lower(trim(p_email)))
      or (
        v_telefone_limpo is not null
        and nullif(regexp_replace(coalesce(c.telefone, ''), '\D', '', 'g'), '') = v_telefone_limpo
      )
    )
  limit 1;

  if v_existente is not null then
    raise exception 'Ja existe uma candidatura pendente com este contato';
  end if;

  insert into public.candidaturas_evento (
    empresa_id,
    evento_id,
    funcao_id,
    nome,
    telefone,
    email,
    observacoes
  )
  values (
    v_evento.empresa_id,
    v_evento.id,
    p_funcao_id,
    trim(p_nome),
    nullif(trim(coalesce(p_telefone, '')), ''),
    nullif(lower(trim(coalesce(p_email, ''))), ''),
    nullif(trim(coalesce(p_observacoes, '')), '')
  )
  returning id into v_candidatura_id;

  return v_candidatura_id;
end;
$$;

grant execute on function public.criar_candidatura_publica(uuid, uuid, text, text, text, text) to anon, authenticated;

create or replace function public.aprovar_candidatura_evento(p_candidatura_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidatura public.candidaturas_evento%rowtype;
  v_evento public.eventos%rowtype;
  v_funcionario_id uuid;
  v_convite_id uuid;
begin
  select *
    into v_candidatura
  from public.candidaturas_evento
  where id = p_candidatura_id
    and empresa_id = public.current_empresa_id();

  if not found then
    raise exception 'Candidatura nao encontrada';
  end if;

  if v_candidatura.status <> 'pendente' then
    raise exception 'A candidatura ja foi avaliada';
  end if;

  select *
    into v_evento
  from public.eventos
  where id = v_candidatura.evento_id
    and empresa_id = public.current_empresa_id();

  if not found then
    raise exception 'Evento nao encontrado';
  end if;

  select f.id
    into v_funcionario_id
  from public.funcionarios f
  where f.empresa_id = v_candidatura.empresa_id
    and (
      (v_candidatura.email is not null and lower(coalesce(f.email, '')) = lower(v_candidatura.email))
      or (
        v_candidatura.telefone is not null
        and nullif(regexp_replace(coalesce(f.telefone, ''), '\D', '', 'g'), '') =
            nullif(regexp_replace(v_candidatura.telefone, '\D', '', 'g'), '')
      )
    )
  order by f.created_at asc
  limit 1;

  if v_funcionario_id is null then
    insert into public.funcionarios (
      empresa_id,
      nome,
      telefone,
      email,
      observacoes,
      status
    )
    values (
      v_candidatura.empresa_id,
      v_candidatura.nome,
      v_candidatura.telefone,
      v_candidatura.email,
      v_candidatura.observacoes,
      'ativo'
    )
    returning id into v_funcionario_id;
  else
    update public.funcionarios
      set
        nome = case when coalesce(nome, '') = '' then v_candidatura.nome else nome end,
        telefone = coalesce(telefone, v_candidatura.telefone),
        email = coalesce(email, v_candidatura.email),
        observacoes = coalesce(observacoes, v_candidatura.observacoes),
        status = 'ativo'
    where id = v_funcionario_id;
  end if;

  insert into public.funcionario_funcoes (funcionario_id, funcao_id)
  values (v_funcionario_id, v_candidatura.funcao_id)
  on conflict do nothing;

  select c.id
    into v_convite_id
  from public.convites c
  where c.evento_id = v_candidatura.evento_id
    and c.funcionario_id = v_funcionario_id
    and c.funcao_id = v_candidatura.funcao_id
  order by c.created_at desc
  limit 1;

  if v_convite_id is null then
    insert into public.convites (
      evento_id,
      funcionario_id,
      funcao_id,
      status,
      valor_diaria,
      observacoes
    )
    values (
      v_candidatura.evento_id,
      v_funcionario_id,
      v_candidatura.funcao_id,
      'pendente',
      v_evento.valor_diaria_padrao,
      v_candidatura.observacoes
    )
    returning id into v_convite_id;
  end if;

  update public.candidaturas_evento
    set
      status = 'aprovada',
      funcionario_id = v_funcionario_id,
      convite_id = v_convite_id,
      aprovada_em = now(),
      rejeitada_em = null,
      avaliada_em = now()
  where id = v_candidatura.id;

  return v_convite_id;
end;
$$;

grant execute on function public.aprovar_candidatura_evento(uuid) to authenticated;

create or replace function public.rejeitar_candidatura_evento(p_candidatura_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidatura public.candidaturas_evento%rowtype;
begin
  select *
    into v_candidatura
  from public.candidaturas_evento
  where id = p_candidatura_id
    and empresa_id = public.current_empresa_id();

  if not found then
    raise exception 'Candidatura nao encontrada';
  end if;

  if v_candidatura.status <> 'pendente' then
    raise exception 'A candidatura ja foi avaliada';
  end if;

  update public.candidaturas_evento
    set
      status = 'rejeitada',
      aprovada_em = null,
      rejeitada_em = now(),
      avaliada_em = now()
  where id = v_candidatura.id;
end;
$$;

grant execute on function public.rejeitar_candidatura_evento(uuid) to authenticated;
