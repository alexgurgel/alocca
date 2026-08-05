-- =====================================================================
-- Alocca — Bloqueia cadastro de menor de idade na inscricao publica
-- (mesma checagem ja feita no cliente, replicada aqui para nao poder
-- ser contornada por uma chamada direta a RPC).
-- =====================================================================

drop function if exists public.inscricao_publica_evento(
  uuid, uuid, text, text, text, text, date, text, text, text, text, boolean
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
  p_chave_pix text,
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
  if p_data_nascimento > (current_date - interval '18 years')::date then
    raise exception 'Nao e permitido cadastro de menor de idade';
  end if;
  if p_cidade is null or btrim(p_cidade) = '' then
    raise exception 'Cidade obrigatoria';
  end if;
  if p_estado is null or btrim(p_estado) = '' then
    raise exception 'Estado obrigatorio';
  end if;
  if p_chave_pix is null or btrim(p_chave_pix) = '' then
    raise exception 'Chave PIX obrigatoria';
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
      chave_pix = p_chave_pix,
      observacoes = coalesce(p_observacoes, observacoes),
      consentimento_lgpd_em = now(),
      updated_at = now()
    where id = v_funcionario_id;
  else
    insert into public.funcionarios (
      empresa_id, nome, cpf, telefone, email, data_nascimento, cidade, estado, chave_pix, observacoes,
      status, consentimento_lgpd_em
    ) values (
      v_empresa_id, v_nome_normalizado, p_cpf, p_telefone, p_email, p_data_nascimento, p_cidade, p_estado,
      p_chave_pix, p_observacoes, 'ativo', now()
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
  uuid, uuid, text, text, text, text, date, text, text, text, text, boolean
) to anon, authenticated;
