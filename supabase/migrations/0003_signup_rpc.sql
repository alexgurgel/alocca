-- =====================================================================
-- Alocca — RPC de cadastro inicial
-- Cria a empresa e o perfil do usuario em uma unica transacao, evitando
-- estados parciais (empresa sem perfil) durante o fluxo de Cadastro.
-- =====================================================================

create or replace function public.criar_empresa_e_perfil(
  p_nome_empresa text,
  p_nome_usuario text,
  p_email text
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

  insert into public.empresas (owner_id, nome, email)
  values (auth.uid(), p_nome_empresa, p_email)
  returning id into v_empresa_id;

  insert into public.perfis (id, empresa_id, nome, email, papel)
  values (auth.uid(), v_empresa_id, p_nome_usuario, p_email, 'admin')
  returning * into v_perfil;

  return v_perfil;
end;
$$;

grant execute on function public.criar_empresa_e_perfil(text, text, text) to authenticated;
