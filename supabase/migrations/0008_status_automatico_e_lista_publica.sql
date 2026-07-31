-- =====================================================================
-- Alocca — Status automático de eventos + lista pública de confirmados
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Flag da lista pública de confirmados (mesmo padrão de
--    inscricao_publica_ativa)
-- ---------------------------------------------------------------------
alter table public.eventos
  add column if not exists lista_publica_ativa boolean not null default false;

-- ---------------------------------------------------------------------
-- 2. Planejado -> Em andamento
--    a) sob demanda, quando o app carrega o evento (chamada autenticada,
--       restrita a empresa dona do evento)
--    b) em lote, via pg_cron a cada minuto, cobrindo o caso de ninguem
--       estar com o app aberto no horario exato
-- ---------------------------------------------------------------------
create or replace function public.avancar_status_evento(p_evento_id uuid)
returns public.eventos
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evento public.eventos;
begin
  select * into v_evento from public.eventos
  where id = p_evento_id and empresa_id = public.current_empresa_id();

  if v_evento.id is null then
    raise exception 'Evento nao encontrado';
  end if;

  if v_evento.status = 'planejado' and now() >= v_evento.data_inicio then
    update public.eventos set status = 'em_andamento'
    where id = p_evento_id
    returning * into v_evento;
  end if;

  return v_evento;
end;
$$;

grant execute on function public.avancar_status_evento(uuid) to authenticated;

create or replace function public.avancar_status_eventos_vencidos()
returns void
language sql
security definer
set search_path = public
as $$
  update public.eventos
  set status = 'em_andamento'
  where status = 'planejado' and data_inicio <= now();
$$;

-- pg_cron pode nao estar disponivel/autorizado em todo projeto Supabase;
-- se a extensao ou o agendamento falhar aqui, o avanco de status ainda
-- funciona via avancar_status_evento() sempre que alguem abrir o evento
-- no app (chamado a partir do front-end).
do $$
begin
  create extension if not exists pg_cron;
exception when others then
  raise notice 'pg_cron indisponivel, avanco automatico ficara apenas sob demanda: %', sqlerrm;
end;
$$;

do $$
begin
  perform cron.schedule(
    'alocca-avancar-status-eventos',
    '* * * * *',
    $cron$select public.avancar_status_eventos_vencidos();$cron$
  );
exception when others then
  raise notice 'Nao foi possivel agendar o job pg_cron: %', sqlerrm;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Lista publica de confirmados (link por evento, so nome + funcao)
-- ---------------------------------------------------------------------
create or replace function public.lista_publica_evento_info(p_evento_id uuid)
returns table (
  id uuid,
  nome text,
  local text,
  data_inicio timestamptz,
  data_fim timestamptz,
  status text,
  empresa_nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id, e.nome, e.local, e.data_inicio, e.data_fim, e.status, emp.nome as empresa_nome
  from public.eventos e
  join public.empresas emp on emp.id = e.empresa_id
  where e.id = p_evento_id
    and e.lista_publica_ativa = true;
$$;

grant execute on function public.lista_publica_evento_info(uuid) to anon, authenticated;

create or replace function public.lista_confirmados_evento(p_evento_id uuid)
returns table (
  funcionario_id uuid,
  nome text,
  funcao_nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select c.funcionario_id, fn.nome, f.nome as funcao_nome
  from public.convites c
  join public.funcionarios fn on fn.id = c.funcionario_id
  join public.funcoes f on f.id = c.funcao_id
  join public.eventos e on e.id = c.evento_id
  where c.evento_id = p_evento_id
    and c.status = 'aceito'
    and e.lista_publica_ativa = true
  order by fn.nome;
$$;

grant execute on function public.lista_confirmados_evento(uuid) to anon, authenticated;
