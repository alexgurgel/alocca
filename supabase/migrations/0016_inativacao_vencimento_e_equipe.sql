-- =====================================================================
-- Alocca — Inativação/vencimento de conta + múltiplos usuários por
-- empresa (assentos + convite de equipe).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Inativação e vencimento (não se aplica a plano = 'admin', que tem
--    acesso vitalício — a checagem fica no app, essas colunas só
--    guardam o dado).
-- ---------------------------------------------------------------------
alter table public.perfis
  add column if not exists ativo boolean not null default true,
  add column if not exists data_vencimento date;

-- ---------------------------------------------------------------------
-- 2. Assentos por empresa (quantos usuarios podem logar na mesma conta)
-- ---------------------------------------------------------------------
alter table public.empresas
  add column if not exists limite_usuarios integer not null default 1
    check (limite_usuarios >= 1);

-- ---------------------------------------------------------------------
-- 3. Convites de equipe: um admin da empresa convida outro usuario
--    (por e-mail) para logar na mesma conta, respeitando o limite de
--    assentos definido pela plataforma.
-- ---------------------------------------------------------------------
create table public.convites_equipe (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas (id) on delete cascade,
  email text not null,
  criado_por uuid not null references public.perfis (id) on delete cascade,
  usado_em timestamptz,
  expira_em timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index idx_convites_equipe_empresa on public.convites_equipe (empresa_id);

alter table public.convites_equipe enable row level security;

create policy "convites_equipe_select" on public.convites_equipe
  for select using (empresa_id = public.current_empresa_id());

create policy "convites_equipe_delete" on public.convites_equipe
  for delete using (empresa_id = public.current_empresa_id());

-- ---------------------------------------------------------------------
-- 4. Criar convite: valida limite de assentos e e-mail duplicado antes
--    de gerar o token (evita corrida entre checagem e insercao feitas
--    direto do cliente).
-- ---------------------------------------------------------------------
create or replace function public.criar_convite_equipe(p_email text)
returns public.convites_equipe
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_limite int;
  v_atual int;
  v_pendentes int;
  v_convite public.convites_equipe;
  v_email text;
begin
  v_email := lower(btrim(coalesce(p_email, '')));
  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'E-mail invalido';
  end if;

  select empresa_id into v_empresa_id
  from public.perfis
  where id = auth.uid() and papel = 'admin';

  if v_empresa_id is null then
    raise exception 'Apenas administradores da empresa podem convidar usuarios';
  end if;

  select limite_usuarios into v_limite from public.empresas where id = v_empresa_id;

  select count(*) into v_atual from public.perfis
  where empresa_id = v_empresa_id and papel = 'admin';

  select count(*) into v_pendentes from public.convites_equipe
  where empresa_id = v_empresa_id and usado_em is null and expira_em > now();

  if (v_atual + v_pendentes) >= v_limite then
    raise exception 'Limite de usuarios da conta atingido';
  end if;

  if exists (
    select 1 from public.perfis
    where empresa_id = v_empresa_id and lower(email) = v_email
  ) then
    raise exception 'Esse e-mail ja faz parte da equipe';
  end if;

  delete from public.convites_equipe
  where empresa_id = v_empresa_id and lower(email) = v_email and usado_em is null;

  insert into public.convites_equipe (empresa_id, email, criado_por)
  values (v_empresa_id, v_email, auth.uid())
  returning * into v_convite;

  return v_convite;
end;
$$;

grant execute on function public.criar_convite_equipe(text) to authenticated;

-- ---------------------------------------------------------------------
-- 5. Leitura publica do convite (pagina de aceite, antes do login)
-- ---------------------------------------------------------------------
create or replace function public.obter_convite_equipe(p_token uuid)
returns table (email text, empresa_nome text)
language sql
security definer
set search_path = public
stable
as $$
  select ce.email, emp.nome as empresa_nome
  from public.convites_equipe ce
  join public.empresas emp on emp.id = ce.empresa_id
  where ce.id = p_token
    and ce.usado_em is null
    and ce.expira_em > now();
$$;

grant execute on function public.obter_convite_equipe(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. Aceitar convite: roda logo apos o novo usuario se autenticar
--    (mesmo padrao de criar_empresa_e_perfil). O novo perfil herda o
--    plano do admin mais antigo da empresa, para o gate de
--    funcionalidades ficar igual entre os usuarios da mesma conta.
-- ---------------------------------------------------------------------
create or replace function public.aceitar_convite_equipe(p_token uuid, p_nome text)
returns public.perfis
language plpgsql
security definer
set search_path = public
as $$
declare
  v_convite public.convites_equipe;
  v_plano public.perfis.plano%type;
  v_perfil public.perfis;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado';
  end if;

  if exists (select 1 from public.perfis where id = auth.uid()) then
    raise exception 'Perfil ja existe para este usuario';
  end if;

  select * into v_convite from public.convites_equipe
  where id = p_token and usado_em is null and expira_em > now();

  if v_convite.id is null then
    raise exception 'Convite invalido ou expirado';
  end if;

  select plano into v_plano
  from public.perfis
  where empresa_id = v_convite.empresa_id and papel = 'admin'
  order by created_at asc
  limit 1;

  insert into public.perfis (id, empresa_id, nome, email, papel, plano, status_conta, ativo)
  values (
    auth.uid(), v_convite.empresa_id, p_nome, v_convite.email, 'admin',
    coalesce(v_plano, 'free'), 'aprovado', true
  )
  returning * into v_perfil;

  update public.convites_equipe set usado_em = now() where id = p_token;

  return v_perfil;
end;
$$;

grant execute on function public.aceitar_convite_equipe(uuid, text) to authenticated;
