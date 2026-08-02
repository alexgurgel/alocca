-- =====================================================================
-- Alocca — Observacao publica do fornecedor na lista compartilhada
-- Permite que quem tiver o link da lista registre uma observacao geral
-- para o evento, sem exigir login.
-- =====================================================================

alter table public.eventos
  add column if not exists lista_publica_observacao_fornecedor text,
  add column if not exists lista_publica_observacao_fornecedor_at timestamptz;

drop function if exists public.obter_lista_publica_evento(uuid);

create or replace function public.obter_lista_publica_evento(p_token uuid)
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
  lista_publica_token uuid,
  lista_publica_observacao_fornecedor text,
  lista_publica_observacao_fornecedor_at timestamptz,
  funcao_id uuid,
  funcao_nome text,
  vagas integer,
  convite_id uuid,
  convite_status text,
  funcionario_nome text,
  valor_diaria numeric,
  convite_observacoes text,
  respondido_em timestamptz
)
language sql
security definer
set search_path = public
stable
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
    e.lista_publica_token,
    e.lista_publica_observacao_fornecedor,
    e.lista_publica_observacao_fornecedor_at,
    ef.funcao_id,
    f.nome as funcao_nome,
    ef.vagas,
    c.id as convite_id,
    c.status as convite_status,
    fn.nome as funcionario_nome,
    c.valor_diaria,
    c.observacoes as convite_observacoes,
    c.respondido_em
  from public.eventos e
  left join public.evento_funcoes ef on ef.evento_id = e.id
  left join public.funcoes f on f.id = ef.funcao_id
  left join public.convites c
    on c.evento_id = e.id
   and c.funcao_id = ef.funcao_id
  left join public.funcionarios fn on fn.id = c.funcionario_id
  where e.lista_publica_token = p_token
  order by
    ef.created_at nulls last,
    fn.nome nulls last,
    c.enviado_em nulls last;
$$;

grant execute on function public.obter_lista_publica_evento(uuid) to anon, authenticated;

create or replace function public.atualizar_observacao_publica_evento(
  p_token uuid,
  p_observacao text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_observacao text;
begin
  v_observacao := nullif(btrim(p_observacao), '');

  update public.eventos
  set
    lista_publica_observacao_fornecedor = case
      when v_observacao is null then null
      else left(v_observacao, 2000)
    end,
    lista_publica_observacao_fornecedor_at = case
      when v_observacao is null then null
      else now()
    end
  where lista_publica_token = p_token;

  if not found then
    raise exception 'Lista publica nao encontrada';
  end if;
end;
$$;

grant execute on function public.atualizar_observacao_publica_evento(uuid, text) to anon, authenticated;
