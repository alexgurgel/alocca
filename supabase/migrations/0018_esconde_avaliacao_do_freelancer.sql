-- =====================================================================
-- Alocca — A avaliação do freelancer (recomendo/ok/não recomendo e a
-- nota que ela gera) não pode ficar visível para o próprio freelancer.
--
-- A policy de SELECT em checkins permitia "funcionario_id = eu mesmo",
-- pensada originalmente para o colaborador ver seu próprio check-in —
-- mas isso também deixaria a coluna avaliacao (adicionada depois)
-- visível pra ele via consulta direta à tabela (RLS é por linha, não
-- por coluna). Hoje nenhuma tela do portal do colaborador lê checkins,
-- então remover esse acesso não quebra nada — só fecha a brecha.
--
-- Reforça também a RPC obter_notas_funcionarios como security definer
-- restrita a admin da própria empresa, em vez de depender só da RLS.
-- =====================================================================

drop policy if exists "checkins_select" on public.checkins;

create policy "checkins_select" on public.checkins
  for select using (
    exists (
      select 1 from public.eventos e
      where e.id = checkins.evento_id and e.empresa_id = public.current_empresa_id()
    )
  );

create or replace function public.obter_notas_funcionarios(p_funcionario_ids uuid[])
returns table (
  funcionario_id uuid,
  nota_media numeric,
  total_avaliacoes int
)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.perfis where id = auth.uid() and papel = 'admin'
  ) then
    raise exception 'Acesso restrito a administradores da empresa';
  end if;

  return query
  select
    c.funcionario_id,
    round(avg(public.nota_avaliacao(c.avaliacao)), 1) as nota_media,
    count(*)::int as total_avaliacoes
  from public.checkins c
  join public.eventos e on e.id = c.evento_id
  where c.funcionario_id = any(p_funcionario_ids)
    and c.avaliacao is not null
    and e.empresa_id = public.current_empresa_id()
  group by c.funcionario_id;
end;
$$;

grant execute on function public.obter_notas_funcionarios(uuid[]) to authenticated;
