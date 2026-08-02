--
-- Alocca - Campos obrigatorios, LGPD e validacao de duplicidade para candidatura publica
--

alter table public.candidaturas_evento
  add column if not exists cpf text,
  add column if not exists data_nascimento date,
  add column if not exists cidade text,
  add column if not exists estado text,
  add column if not exists lgpd_aceito boolean not null default false,
  add column if not exists lgpd_aceito_em timestamptz;

drop function if exists public.criar_candidatura_publica(uuid, uuid, text, text, text, text);

create or replace function public.criar_candidatura_publica(
  p_token uuid,
  p_funcao_id uuid,
  p_nome text,
  p_cpf text,
  p_telefone text,
  p_email text,
  p_data_nascimento date,
  p_cidade text,
  p_estado text,
  p_lgpd_aceito boolean,
  p_observacoes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evento public.eventos%rowtype;
  v_existente uuid;
  v_candidatura_id uuid;
  v_cpf_limpo text;
  v_telefone_limpo text;
begin
  select *
    into v_evento
  from public.eventos
  where candidatura_publica_token = p_token;

  if not found then
    raise exception 'Evento nao encontrado';
  end if;

  if v_evento.status in ('cancelado', 'finalizado') then
    raise exception 'Evento indisponivel para candidaturas';
  end if;

  if not exists (
    select 1
    from public.evento_funcoes
    where evento_id = v_evento.id
      and funcao_id = p_funcao_id
  ) then
    raise exception 'Funcao indisponivel para este evento';
  end if;

  if coalesce(p_lgpd_aceito, false) = false then
    raise exception 'Voce precisa aceitar o termo de LGPD para continuar';
  end if;

  v_cpf_limpo := nullif(regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g'), '');
  v_telefone_limpo := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');

  if v_cpf_limpo is null then
    raise exception 'CPF obrigatorio';
  end if;

  select c.id
    into v_existente
  from public.candidaturas_evento c
  where c.evento_id = v_evento.id
    and (
      nullif(regexp_replace(coalesce(c.cpf, ''), '\D', '', 'g'), '') = v_cpf_limpo
      or lower(coalesce(c.email, '')) = lower(trim(p_email))
      or nullif(regexp_replace(coalesce(c.telefone, ''), '\D', '', 'g'), '') = v_telefone_limpo
    )
  order by c.created_at desc
  limit 1;

  if v_existente is not null then
    raise exception 'Voce ja realizou o cadastro para este evento';
  end if;

  insert into public.candidaturas_evento (
    empresa_id,
    evento_id,
    funcao_id,
    nome,
    cpf,
    telefone,
    email,
    data_nascimento,
    cidade,
    estado,
    observacoes,
    lgpd_aceito,
    lgpd_aceito_em
  )
  values (
    v_evento.empresa_id,
    v_evento.id,
    p_funcao_id,
    trim(p_nome),
    trim(p_cpf),
    trim(p_telefone),
    lower(trim(p_email)),
    p_data_nascimento,
    trim(p_cidade),
    upper(trim(p_estado)),
    nullif(trim(coalesce(p_observacoes, '')), ''),
    true,
    now()
  )
  returning id into v_candidatura_id;

  return v_candidatura_id;
end;
$$;

grant execute on function public.criar_candidatura_publica(uuid, uuid, text, text, text, text, date, text, text, boolean, text) to anon, authenticated;

create or replace function public.buscar_cadastro_publico_evento(
  p_token uuid,
  p_cpf text,
  p_email text default null,
  p_telefone text default null
)
returns table (
  funcionario_id uuid,
  nome text,
  cpf text,
  telefone text,
  email text,
  data_nascimento date,
  cidade text,
  estado text,
  observacoes text,
  ja_cadastrado_evento boolean,
  candidatura_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evento public.eventos%rowtype;
  v_cpf_limpo text;
  v_telefone_limpo text;
begin
  select *
    into v_evento
  from public.eventos
  where candidatura_publica_token = p_token;

  if not found then
    raise exception 'Evento nao encontrado';
  end if;

  v_cpf_limpo := nullif(regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g'), '');
  v_telefone_limpo := nullif(regexp_replace(coalesce(p_telefone, ''), '\D', '', 'g'), '');

  if v_cpf_limpo is null and nullif(trim(coalesce(p_email, '')), '') is null and v_telefone_limpo is null then
    return;
  end if;

  return query
  with candidatura_match as (
    select
      c.*
    from public.candidaturas_evento c
    where c.evento_id = v_evento.id
      and (
        (v_cpf_limpo is not null and nullif(regexp_replace(coalesce(c.cpf, ''), '\D', '', 'g'), '') = v_cpf_limpo)
        or (nullif(trim(coalesce(p_email, '')), '') is not null and lower(coalesce(c.email, '')) = lower(trim(p_email)))
        or (v_telefone_limpo is not null and nullif(regexp_replace(coalesce(c.telefone, ''), '\D', '', 'g'), '') = v_telefone_limpo)
      )
    order by c.created_at desc
    limit 1
  ),
  funcionario_match as (
    select
      f.*
    from public.funcionarios f
    where f.empresa_id = v_evento.empresa_id
      and (
        (v_cpf_limpo is not null and nullif(regexp_replace(coalesce(f.cpf, ''), '\D', '', 'g'), '') = v_cpf_limpo)
        or (
          nullif(trim(coalesce(p_email, '')), '') is not null
          and lower(coalesce(f.email, '')) = lower(trim(p_email))
          and v_telefone_limpo is not null
          and nullif(regexp_replace(coalesce(f.telefone, ''), '\D', '', 'g'), '') = v_telefone_limpo
        )
      )
    order by
      case
        when v_cpf_limpo is not null and nullif(regexp_replace(coalesce(f.cpf, ''), '\D', '', 'g'), '') = v_cpf_limpo then 0
        else 1
      end,
      f.created_at asc
    limit 1
  )
  select
    fm.id as funcionario_id,
    coalesce(fm.nome, cm.nome) as nome,
    coalesce(fm.cpf, cm.cpf) as cpf,
    coalesce(fm.telefone, cm.telefone) as telefone,
    coalesce(fm.email, cm.email) as email,
    coalesce(fm.data_nascimento, cm.data_nascimento) as data_nascimento,
    coalesce(fm.cidade, cm.cidade) as cidade,
    coalesce(fm.estado, cm.estado) as estado,
    coalesce(fm.observacoes, cm.observacoes) as observacoes,
    (cm.id is not null) as ja_cadastrado_evento,
    cm.status as candidatura_status
  from funcionario_match fm
  full outer join candidatura_match cm on true
  where fm.id is not null or cm.id is not null;
end;
$$;

grant execute on function public.buscar_cadastro_publico_evento(uuid, text, text, text) to anon, authenticated;

create or replace function public.aprovar_candidatura_evento(p_candidatura_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidatura public.candidaturas_evento%rowtype;
  v_evento public.eventos%rowtype;
  v_funcionario_id uuid;
  v_convite_id uuid;
begin
  select *
    into v_candidatura
  from public.candidaturas_evento
  where id = p_candidatura_id
    and empresa_id = public.current_empresa_id();

  if not found then
    raise exception 'Candidatura nao encontrada';
  end if;

  if v_candidatura.status <> 'pendente' then
    raise exception 'A candidatura ja foi avaliada';
  end if;

  select *
    into v_evento
  from public.eventos
  where id = v_candidatura.evento_id
    and empresa_id = public.current_empresa_id();

  if not found then
    raise exception 'Evento nao encontrado';
  end if;

  select f.id
    into v_funcionario_id
  from public.funcionarios f
  where f.empresa_id = v_candidatura.empresa_id
    and (
      nullif(regexp_replace(coalesce(f.cpf, ''), '\D', '', 'g'), '') =
        nullif(regexp_replace(coalesce(v_candidatura.cpf, ''), '\D', '', 'g'), '')
      or (v_candidatura.email is not null and lower(coalesce(f.email, '')) = lower(v_candidatura.email))
      or (
        v_candidatura.telefone is not null
        and nullif(regexp_replace(coalesce(f.telefone, ''), '\D', '', 'g'), '') =
            nullif(regexp_replace(v_candidatura.telefone, '\D', '', 'g'), '')
      )
    )
  order by
    case
      when nullif(regexp_replace(coalesce(f.cpf, ''), '\D', '', 'g'), '') =
           nullif(regexp_replace(coalesce(v_candidatura.cpf, ''), '\D', '', 'g'), '') then 0
      else 1
    end,
    f.created_at asc
  limit 1;

  if v_funcionario_id is null then
    insert into public.funcionarios (
      empresa_id,
      nome,
      cpf,
      telefone,
      email,
      data_nascimento,
      cidade,
      estado,
      observacoes,
      status
    )
    values (
      v_candidatura.empresa_id,
      v_candidatura.nome,
      v_candidatura.cpf,
      v_candidatura.telefone,
      v_candidatura.email,
      v_candidatura.data_nascimento,
      v_candidatura.cidade,
      v_candidatura.estado,
      v_candidatura.observacoes,
      'ativo'
    )
    returning id into v_funcionario_id;
  else
    update public.funcionarios
      set
        nome = case when coalesce(nome, '') = '' then v_candidatura.nome else nome end,
        cpf = coalesce(cpf, v_candidatura.cpf),
        telefone = coalesce(telefone, v_candidatura.telefone),
        email = coalesce(email, v_candidatura.email),
        data_nascimento = coalesce(data_nascimento, v_candidatura.data_nascimento),
        cidade = coalesce(cidade, v_candidatura.cidade),
        estado = coalesce(estado, v_candidatura.estado),
        observacoes = coalesce(observacoes, v_candidatura.observacoes),
        status = 'ativo'
    where id = v_funcionario_id;
  end if;

  insert into public.funcionario_funcoes (funcionario_id, funcao_id)
  values (v_funcionario_id, v_candidatura.funcao_id)
  on conflict do nothing;

  select c.id
    into v_convite_id
  from public.convites c
  where c.evento_id = v_candidatura.evento_id
    and c.funcionario_id = v_funcionario_id
    and c.funcao_id = v_candidatura.funcao_id
  order by c.created_at desc
  limit 1;

  if v_convite_id is null then
    insert into public.convites (
      evento_id,
      funcionario_id,
      funcao_id,
      status,
      valor_diaria,
      observacoes
    )
    values (
      v_candidatura.evento_id,
      v_funcionario_id,
      v_candidatura.funcao_id,
      'pendente',
      v_evento.valor_diaria_padrao,
      v_candidatura.observacoes
    )
    returning id into v_convite_id;
  end if;

  update public.candidaturas_evento
    set
      status = 'aprovada',
      funcionario_id = v_funcionario_id,
      convite_id = v_convite_id,
      aprovada_em = now(),
      rejeitada_em = null,
      avaliada_em = now()
  where id = v_candidatura.id;

  return v_convite_id;
end;
$$;

grant execute on function public.aprovar_candidatura_evento(uuid) to authenticated;
