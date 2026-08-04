-- =====================================================================
-- Alocca — Hierarquia de perfis (free/intermediario/master/admin) e
-- fila de aprovacao de novas empresas.
--
-- Nomenclatura: "papel" (ja existente) continua distinguindo admin da
-- empresa vs colaborador/freelancer. "plano" e um conceito totalmente
-- separado — o nivel de acesso do usuario dentro do app (usado hoje
-- so por quem tem papel = 'admin', que sao os unicos que efetivamente
-- logam na area principal).
-- =====================================================================

alter table public.perfis
  add column if not exists plano text not null default 'free'
    check (plano in ('free', 'intermediario', 'master', 'admin')),
  add column if not exists status_conta text not null default 'aprovado'
    check (status_conta in ('pendente', 'aprovado', 'recusado')),
  add column if not exists aprovado_por uuid references public.perfis (id) on delete set null,
  add column if not exists aprovado_em timestamptz;

-- Contas ja existentes ficam com acesso total (nao travar quem ja usa o app)
update public.perfis
set plano = 'master'
where plano = 'free';

-- ---------------------------------------------------------------------
-- Helper de RLS (mesmo padrao de current_empresa_id — security definer
-- evita recursao na policy)
-- ---------------------------------------------------------------------
create or replace function public.is_admin_plataforma()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select plano = 'admin' from public.perfis where id = auth.uid()), false);
$$;

-- Admin de plataforma enxerga e gerencia perfis de todas as empresas
-- (alem do que a policy existente ja permite: proprio perfil / mesma empresa)
create policy "perfis_select_admin_plataforma" on public.perfis
  for select using (public.is_admin_plataforma());

create policy "perfis_update_admin_plataforma" on public.perfis
  for update using (public.is_admin_plataforma());

-- Precisa ver o nome da empresa de cada solicitacao pendente
create policy "empresas_select_admin_plataforma" on public.empresas
  for select using (public.is_admin_plataforma());

-- ---------------------------------------------------------------------
-- Cadastro novo: entra como free + pendente de aprovacao
-- ---------------------------------------------------------------------
create or replace function public.criar_empresa_e_perfil(
  p_nome_empresa text,
  p_nome_usuario text,
  p_email text,
  p_aceite_lgpd boolean
)
returns public.perfis
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_perfil public.perfis;
begin
  if auth.uid() is null then
    raise exception 'Usuario nao autenticado';
  end if;

  if exists (select 1 from public.perfis where id = auth.uid()) then
    raise exception 'Perfil ja existe para este usuario';
  end if;

  if p_aceite_lgpd is not true then
    raise exception 'E necessario aceitar os termos de privacidade (LGPD)';
  end if;

  insert into public.empresas (owner_id, nome, email)
  values (auth.uid(), p_nome_empresa, p_email)
  returning id into v_empresa_id;

  insert into public.perfis (
    id, empresa_id, nome, email, papel, consentimento_lgpd_em, plano, status_conta
  )
  values (
    auth.uid(), v_empresa_id, p_nome_usuario, p_email, 'admin', now(), 'free', 'pendente'
  )
  returning * into v_perfil;

  return v_perfil;
end;
$$;

grant execute on function public.criar_empresa_e_perfil(text, text, text, boolean) to authenticated;
