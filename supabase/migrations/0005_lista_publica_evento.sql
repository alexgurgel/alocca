-- =====================================================================
-- Alocca — Lista pública do evento para acompanhamento por fornecedor
-- Cada evento ganha um token público estável que pode ser compartilhado
-- externamente sem expor a área autenticada do sistema.
-- =====================================================================

alter table public.eventos
  add column if not exists lista_publica_token uuid;

update public.eventos
set lista_publica_token = gen_random_uuid()
where lista_publica_token is null;

alter table public.eventos
  alter column lista_publica_token set default gen_random_uuid(),
  alter column lista_publica_token set not null;

create unique index if not exists idx_eventos_lista_publica_token
  on public.eventos (lista_publica_token);

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
