-- =====================================================================
-- Alocca — RPC universal de confirmação (funciona para qualquer forma
-- de aceite: candidatura, convite público sem login, convite do portal
-- do colaborador logado) + avaliação de freelancers por evento.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Prepara o check-in (upsert) e devolve tudo que o e-mail de
--    confirmação precisa, incluindo o qr_token. Security definer para
--    funcionar mesmo sem sessão (aceite via link público) — a validação
--    de que o convite existe e já está aceito é feita aqui dentro.
-- ---------------------------------------------------------------------
create or replace function public.preparar_checkin_confirmacao(p_convite_id uuid)
returns table (
  funcionario_nome text,
  funcionario_email text,
  funcao_nome text,
  evento_nome text,
  evento_local text,
  evento_data_inicio timestamptz,
  qr_token uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evento_id uuid;
  v_funcionario_id uuid;
  v_funcao_id uuid;
  v_status text;
  v_qr_token uuid;
begin
  select c.evento_id, c.funcionario_id, c.funcao_id, c.status
    into v_evento_id, v_funcionario_id, v_funcao_id, v_status
  from public.convites c
  where c.id = p_convite_id;

  if v_evento_id is null then
    raise exception 'Convite nao encontrado';
  end if;

  if v_status <> 'aceito' then
    raise exception 'Convite ainda nao foi aceito';
  end if;

  insert into public.checkins (evento_id, funcionario_id, convite_id)
  values (v_evento_id, v_funcionario_id, p_convite_id)
  on conflict (evento_id, funcionario_id)
  do update set convite_id = excluded.convite_id
  returning checkins.qr_token into v_qr_token;

  return query
  select fn.nome, fn.email, fc.nome, e.nome, e.local, e.data_inicio, v_qr_token
  from public.funcionarios fn, public.funcoes fc, public.eventos e
  where fn.id = v_funcionario_id and fc.id = v_funcao_id and e.id = v_evento_id;
end;
$$;

grant execute on function public.preparar_checkin_confirmacao(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Avaliação do freelancer por evento (1 avaliação por checkin, ou
--    seja, por freelancer por evento). Nota fica em código (2/6/10),
--    calculada a partir do rótulo — nunca gravada solta, pra não
--    dessincronizar do critério.
-- ---------------------------------------------------------------------
alter table public.checkins
  add column if not exists avaliacao text
    check (avaliacao in ('recomendo', 'ok', 'nao_recomendo'));

create or replace function public.nota_avaliacao(p_avaliacao text)
returns smallint
language sql
immutable
as $$
  select case p_avaliacao
    when 'recomendo' then 10
    when 'ok' then 6
    when 'nao_recomendo' then 2
    else null
  end;
$$;

-- Notas medias de varios freelancers de uma vez (usado na tela de
-- convite e no cadastro do freelancer). Nao e security definer — RLS
-- de checkins/funcionarios ja restringe a propria empresa.
create or replace function public.obter_notas_funcionarios(p_funcionario_ids uuid[])
returns table (
  funcionario_id uuid,
  nota_media numeric,
  total_avaliacoes int
)
language sql
stable
set search_path = public
as $$
  select
    c.funcionario_id,
    round(avg(public.nota_avaliacao(c.avaliacao)), 1) as nota_media,
    count(*)::int as total_avaliacoes
  from public.checkins c
  where c.funcionario_id = any(p_funcionario_ids)
    and c.avaliacao is not null
  group by c.funcionario_id;
$$;

grant execute on function public.obter_notas_funcionarios(uuid[]) to authenticated;
