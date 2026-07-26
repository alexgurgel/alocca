-- =====================================================================
-- Alocca — Caminho 2: inscricao publica de freelancers por evento
-- Permite gerar um link publico por evento onde um freelancer ainda nao
-- cadastrado (ou ja cadastrado, via CPF) se candidata a uma funcao com
-- vaga aberta. A candidatura entra como convite "pendente" com
-- origem = 'candidatura', para o gestor aprovar ou recusar.
-- =====================================================================

alter table public.eventos
  add column if not exists inscricao_publica_ativa boolean not null default false;

alter table public.convites
  add column if not exists origem text not null default 'convite'
    check (origem in ('convite', 'candidatura'));

-- Evita freelancer duplicado dentro da mesma empresa (compara so os digitos do CPF)
create unique index if not exists idx_funcionarios_empresa_cpf
  on public.funcionarios (empresa_id, regexp_replace(cpf, '\D', '', 'g'))
  where cpf is not null and btrim(cpf) <> '';

-- ---------------------------------------------------------------------
-- Validacao de CPF (algoritmo padrao dos digitos verificadores)
-- ---------------------------------------------------------------------
create or replace function public.cpf_valido(p_cpf text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_digits text;
  v_soma int;
  v_resto int;
  v_dv1 int;
  v_dv2 int;
  i int;
begin
  v_digits := regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g');

  if length(v_digits) <> 11 then
    return false;
  end if;

  if v_digits ~ '^(\d)\1{10}$' then
    return false;
  end if;

  v_soma := 0;
  for i in 1..9 loop
    v_soma := v_soma + substring(v_digits from i for 1)::int * (11 - i);
  end loop;
  v_resto := (v_soma * 10) % 11;
  v_dv1 := case when v_resto >= 10 then 0 else v_resto end;

  if v_dv1 <> substring(v_digits from 10 for 1)::int then
    return false;
  end if;

  v_soma := 0;
  for i in 1..10 loop
    v_soma := v_soma + substring(v_digits from i for 1)::int * (12 - i);
  end loop;
  v_resto := (v_soma * 10) % 11;
  v_dv2 := case when v_resto >= 10 then 0 else v_resto end;

  return v_dv2 = substring(v_digits from 11 for 1)::int;
end;
$$;

-- ---------------------------------------------------------------------
-- Info publica do evento (so retorna se a inscricao publica estiver ativa)
-- ---------------------------------------------------------------------
create or replace function public.evento_publico(p_evento_id uuid)
returns table (
  id uuid,
  nome text,
  local text,
  endereco text,
  data_inicio timestamptz,
  data_fim timestamptz,
  observacoes text,
  valor_diaria_padrao numeric,
  empresa_nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id, e.nome, e.local, e.endereco, e.data_inicio, e.data_fim,
         e.observacoes, e.valor_diaria_padrao, emp.nome as empresa_nome
  from public.eventos e
  join public.empresas emp on emp.id = e.empresa_id
  where e.id = p_evento_id
    and e.inscricao_publica_ativa = true
    and e.status in ('planejado', 'em_andamento');
$$;

grant execute on function public.evento_publico(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Funcoes com vaga aberta nesse evento (vagas - convites aceitos > 0)
-- ---------------------------------------------------------------------
create or replace function public.funcoes_disponiveis_evento(p_evento_id uuid)
returns table (
  funcao_id uuid,
  nome text,
  vagas_disponiveis int
)
language sql
security definer
set search_path = public
stable
as $$
  select f.id, f.nome, (ef.vagas - coalesce(aceitas.qtd, 0))::int as vagas_disponiveis
  from public.evento_funcoes ef
  join public.funcoes f on f.id = ef.funcao_id
  left join (
    select funcao_id, count(*) as qtd
    from public.convites
    where evento_id = p_evento_id and status = 'aceito'
    group by funcao_id
  ) aceitas on aceitas.funcao_id = ef.funcao_id
  where ef.evento_id = p_evento_id
    and (ef.vagas - coalesce(aceitas.qtd, 0)) > 0;
$$;

grant execute on function public.funcoes_disponiveis_evento(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Busca freelancer existente por CPF, restrita a empresa dona do evento
-- ---------------------------------------------------------------------
create or replace function public.buscar_funcionario_por_cpf(p_evento_id uuid, p_cpf text)
returns table (
  nome text,
  telefone text,
  email text,
  data_nascimento date,
  cidade text,
  estado text,
  observacoes text
)
language sql
security definer
set search_path = public
stable
as $$
  select fn.nome, fn.telefone, fn.email, fn.data_nascimento, fn.cidade, fn.estado, fn.observacoes
  from public.funcionarios fn
  join public.eventos e on e.id = p_evento_id
  where fn.empresa_id = e.empresa_id
    and regexp_replace(fn.cpf, '\D', '', 'g') = regexp_replace(p_cpf, '\D', '', 'g')
  limit 1;
$$;

grant execute on function public.buscar_funcionario_por_cpf(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Envia a candidatura: cria/atualiza o funcionario e cria/reabre o convite
-- ---------------------------------------------------------------------
create or replace function public.inscricao_publica_evento(
  p_evento_id uuid,
  p_funcao_id uuid,
  p_nome text,
  p_cpf text,
  p_telefone text,
  p_email text,
  p_data_nascimento date,
  p_cidade text,
  p_estado text,
  p_observacoes text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_empresa_id uuid;
  v_evento_status text;
  v_ativo boolean;
  v_vagas int;
  v_aceitas int;
  v_funcionario_id uuid;
  v_convite_id uuid;
  v_convite_status text;
begin
  if p_nome is null or btrim(p_nome) = '' then
    raise exception 'Nome obrigatorio';
  end if;
  if not public.cpf_valido(p_cpf) then
    raise exception 'CPF invalido';
  end if;
  if p_telefone is null or btrim(p_telefone) = '' then
    raise exception 'Telefone obrigatorio';
  end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'E-mail invalido';
  end if;
  if p_data_nascimento is null then
    raise exception 'Data de nascimento obrigatoria';
  end if;
  if p_cidade is null or btrim(p_cidade) = '' then
    raise exception 'Cidade obrigatoria';
  end if;
  if p_estado is null or btrim(p_estado) = '' then
    raise exception 'Estado obrigatorio';
  end if;
  if p_funcao_id is null then
    raise exception 'Funcao obrigatoria';
  end if;

  select empresa_id, status, inscricao_publica_ativa
    into v_empresa_id, v_evento_status, v_ativo
  from public.eventos where id = p_evento_id;

  if v_empresa_id is null then
    raise exception 'Evento nao encontrado';
  end if;
  if not v_ativo or v_evento_status not in ('planejado', 'em_andamento') then
    raise exception 'As inscricoes para este evento estao encerradas';
  end if;

  select vagas into v_vagas
  from public.evento_funcoes
  where evento_id = p_evento_id and funcao_id = p_funcao_id;

  if v_vagas is null then
    raise exception 'Funcao invalida para este evento';
  end if;

  select count(*) into v_aceitas
  from public.convites
  where evento_id = p_evento_id and funcao_id = p_funcao_id and status = 'aceito';

  if v_aceitas >= v_vagas then
    raise exception 'Nao ha mais vagas disponiveis para esta funcao';
  end if;

  select id into v_funcionario_id
  from public.funcionarios
  where empresa_id = v_empresa_id
    and regexp_replace(cpf, '\D', '', 'g') = regexp_replace(p_cpf, '\D', '', 'g')
  limit 1;

  if v_funcionario_id is not null then
    update public.funcionarios set
      nome = p_nome,
      telefone = p_telefone,
      email = p_email,
      data_nascimento = p_data_nascimento,
      cidade = p_cidade,
      estado = p_estado,
      observacoes = coalesce(p_observacoes, observacoes),
      updated_at = now()
    where id = v_funcionario_id;
  else
    insert into public.funcionarios (
      empresa_id, nome, cpf, telefone, email, data_nascimento, cidade, estado, observacoes, status
    ) values (
      v_empresa_id, p_nome, p_cpf, p_telefone, p_email, p_data_nascimento, p_cidade, p_estado, p_observacoes, 'ativo'
    )
    returning id into v_funcionario_id;
  end if;

  select id, status into v_convite_id, v_convite_status
  from public.convites
  where evento_id = p_evento_id and funcionario_id = v_funcionario_id;

  if v_convite_id is not null then
    if v_convite_status in ('pendente', 'aceito') then
      raise exception 'Ja existe um convite ou candidatura ativa para este evento';
    end if;

    update public.convites set
      funcao_id = p_funcao_id,
      status = 'pendente',
      origem = 'candidatura',
      observacoes = p_observacoes,
      enviado_em = now(),
      respondido_em = null
    where id = v_convite_id;
  else
    insert into public.convites (evento_id, funcionario_id, funcao_id, status, origem, observacoes)
    values (p_evento_id, v_funcionario_id, p_funcao_id, 'pendente', 'candidatura', p_observacoes)
    returning id into v_convite_id;
  end if;

  return v_convite_id;
end;
$$;

grant execute on function public.inscricao_publica_evento(
  uuid, uuid, text, text, text, text, date, text, text, text
) to anon, authenticated;
