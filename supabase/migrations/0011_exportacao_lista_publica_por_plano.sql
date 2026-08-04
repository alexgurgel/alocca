-- =====================================================================
-- Alocca — A exportacao (PDF/Excel) da lista publica de confirmados
-- exige plano intermediario ou superior do admin dono do evento. O
-- resto da lista publica (ativar, ver, copiar link) continua liberado
-- pra todo mundo, inclusive Free.
-- =====================================================================

drop function if exists public.lista_publica_evento_info(uuid);

create function public.lista_publica_evento_info(p_evento_id uuid)
returns table (
  id uuid,
  nome text,
  local text,
  data_inicio timestamptz,
  data_fim timestamptz,
  status text,
  empresa_nome text,
  exportacao_liberada boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    e.id, e.nome, e.local, e.data_inicio, e.data_fim, e.status, emp.nome as empresa_nome,
    coalesce(
      (
        select p.plano in ('intermediario', 'master', 'admin')
        from public.perfis p
        where p.empresa_id = e.empresa_id and p.papel = 'admin'
        order by p.created_at asc
        limit 1
      ),
      false
    ) as exportacao_liberada
  from public.eventos e
  join public.empresas emp on emp.id = e.empresa_id
  where e.id = p_evento_id
    and e.lista_publica_ativa = true;
$$;

grant execute on function public.lista_publica_evento_info(uuid) to anon, authenticated;
