-- =====================================================================
-- Alocca — Convite público (link direto, sem exigir login do colaborador)
-- O id do convite (uuid aleatorio) funciona como token de acesso: quem tem
-- o link consegue ver e responder aquele convite especifico, sem precisar
-- de conta. Nenhuma outra rota fica exposta.
-- =====================================================================

create or replace function public.obter_convite_publico(p_id uuid)
returns table (
  id uuid,
  status text,
  valor_diaria numeric,
  observacoes text,
  funcao_nome text,
  evento_nome text,
  evento_local text,
  evento_endereco text,
  evento_data_inicio timestamptz,
  evento_data_fim timestamptz,
  evento_observacoes text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id,
    c.status,
    c.valor_diaria,
    c.observacoes,
    f.nome as funcao_nome,
    e.nome as evento_nome,
    e.local as evento_local,
    e.endereco as evento_endereco,
    e.data_inicio as evento_data_inicio,
    e.data_fim as evento_data_fim,
    e.observacoes as evento_observacoes
  from public.convites c
  join public.funcoes f on f.id = c.funcao_id
  join public.eventos e on e.id = c.evento_id
  where c.id = p_id;
$$;

grant execute on function public.obter_convite_publico(uuid) to anon, authenticated;

create or replace function public.responder_convite_publico(p_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('aceito', 'recusado') then
    raise exception 'Status invalido';
  end if;

  update public.convites
  set status = p_status, respondido_em = now()
  where id = p_id and status = 'pendente';

  if not found then
    raise exception 'Convite nao encontrado ou ja respondido';
  end if;
end;
$$;

grant execute on function public.responder_convite_publico(uuid, text) to anon, authenticated;
