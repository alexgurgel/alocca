-- =====================================================================
-- Alocca — Diaria por funcao (em vez de valor unico por evento) + LGPD
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Diaria por funcao
-- ---------------------------------------------------------------------
alter table public.evento_funcoes
  add column if not exists valor_diaria numeric(10, 2);

drop function if exists public.evento_publico(uuid);
drop function if exists public.funcoes_disponiveis_evento(uuid);

alter table public.eventos
  drop column if exists valor_diaria_padrao;

create function public.evento_publico(p_evento_id uuid)
returns table (
  id uuid,
  nome text,
  local text,
  endereco text,
  data_inicio timestamptz,
  data_fim timestamptz,
  observacoes text,
  empresa_nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id, e.nome, e.local, e.endereco, e.data_inicio, e.data_fim,
         e.observacoes, emp.nome as empresa_nome
  from public.eventos e
  join public.empresas emp on emp.id = e.empresa_id
  where e.id = p_evento_id
    and e.inscricao_publica_ativa = true
    and e.status in ('planejado', 'em_andamento');
$$;

grant execute on function public.evento_publico(uuid) to anon, authenticated;

create function public.funcoes_disponiveis_evento(p_evento_id uuid)
returns table (
  funcao_id uuid,
  nome text,
  vagas_disponiveis int,
  valor_diaria numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select f.id, f.nome, (ef.vagas - coalesce(aceitas.qtd, 0))::int as vagas_disponiveis, ef.valor_diaria
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
-- 2. Validacao server-side de nome completo (espelha a validacao do front)
-- ---------------------------------------------------------------------
create or replace function public.nome_completo_valido(p_nome text)
returns boolean
language plpgsql
immutable
as $$
declare
  v_nome text;
begin
  if p_nome is null then
    return false;
  end if;

  v_nome := btrim(regexp_replace(p_nome, '\s+', ' ', 'g'));

  if v_nome ~ '[0-9]' then
    return false;
  end if;

  if v_nome !~ '^[[:alpha:][:space:]''-]+$' then
    return false;
  end if;

  if array_length(regexp_split_to_array(v_nome, ' '), 1) < 2 then
    return false;
  end if;

  if length(v_nome) < 8 or length(v_nome) > 120 then
    return false;
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Consentimento LGPD (registro de quando o aceite foi dado)
-- ---------------------------------------------------------------------
alter table public.perfis
  add column if not exists consentimento_lgpd_em timestamptz;

alter table public.funcionarios
  add column if not exists consentimento_lgpd_em timestamptz;

drop function if exists public.criar_empresa_e_perfil(text, text, text);

create function public.criar_empresa_e_perfil(
  p_nome_empresa text,
  p_nome_usuario text,
  p_email text,
  p_aceite_lgpd boolean
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

  if p_aceite_lgpd is not true then
    raise exception 'E necessario aceitar os termos de privacidade (LGPD)';
  end if;

  insert into public.empresas (owner_id, nome, email)
  values (auth.uid(), p_nome_empresa, p_email)
  returning id into v_empresa_id;

  insert into public.perfis (id, empresa_id, nome, email, papel, consentimento_lgpd_em)
  values (auth.uid(), v_empresa_id, p_nome_usuario, p_email, 'admin', now())
  returning * into v_perfil;

  return v_perfil;
end;
$$;

grant execute on function public.criar_empresa_e_perfil(text, text, text, boolean) to authenticated;

-- ---------------------------------------------------------------------
-- 4. inscricao_publica_evento: valor por funcao + validacao de nome + LGPD
-- ---------------------------------------------------------------------
drop function if exists public.inscricao_publica_evento(
  uuid, uuid, text, text, text, text, date, text, text, text
);

create function public.inscricao_publica_evento(
  p_evento_id uuid,
  p_funcao_id uuid,
  p_nome text,
  p_cpf text,
  p_telefone text,
  p_email text,
  p_data_nascimento date,
  p_cidade text,
  p_estado text,
  p_observacoes text,
  p_aceite_lgpd boolean
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
  v_nome_normalizado text;
begin
  v_nome_normalizado := btrim(regexp_replace(coalesce(p_nome, ''), '\s+', ' ', 'g'));

  if not public.nome_completo_valido(v_nome_normalizado) then
    raise exception 'Nome invalido: informe nome e sobrenome, apenas letras, entre 8 e 120 caracteres';
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
  if p_aceite_lgpd is not true then
    raise exception 'E necessario aceitar os termos de privacidade (LGPD)';
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
      nome = v_nome_normalizado,
      telefone = p_telefone,
      email = p_email,
      data_nascimento = p_data_nascimento,
      cidade = p_cidade,
      estado = p_estado,
      observacoes = coalesce(p_observacoes, observacoes),
      consentimento_lgpd_em = now(),
      updated_at = now()
    where id = v_funcionario_id;
  else
    insert into public.funcionarios (
      empresa_id, nome, cpf, telefone, email, data_nascimento, cidade, estado, observacoes,
      status, consentimento_lgpd_em
    ) values (
      v_empresa_id, v_nome_normalizado, p_cpf, p_telefone, p_email, p_data_nascimento, p_cidade, p_estado,
      p_observacoes, 'ativo', now()
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
  uuid, uuid, text, text, text, text, date, text, text, text, boolean
) to anon, authenticated;
