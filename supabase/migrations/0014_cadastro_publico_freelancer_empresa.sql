-- =====================================================================
-- Alocca — Cadastro publico de freelancer no banco de dados da empresa,
-- sem estar vinculado a nenhum evento especifico. Complementa a
-- candidatura publica por evento (inscricao_publica_evento): aqui o
-- fornecedor manda um link generico (por empresa) para o freelancer se
-- cadastrar antes mesmo de existir um evento aberto.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Dados publicos da empresa (so o nome, para exibir na pagina de
-- cadastro)
-- ---------------------------------------------------------------------
create or replace function public.empresa_publica(p_empresa_id uuid)
returns table (
  id uuid,
  nome text
)
language sql
security definer
set search_path = public
stable
as $$
  select e.id, e.nome
  from public.empresas e
  where e.id = p_empresa_id;
$$;

grant execute on function public.empresa_publica(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Busca por CPF direto na empresa (sem depender de um evento)
-- ---------------------------------------------------------------------
create or replace function public.buscar_funcionario_por_cpf_empresa(p_empresa_id uuid, p_cpf text)
returns table (
  nome text,
  telefone text,
  email text,
  data_nascimento date,
  cidade text,
  estado text,
  chave_pix text,
  observacoes text
)
language sql
security definer
set search_path = public
stable
as $$
  select fn.nome, fn.telefone, fn.email, fn.data_nascimento, fn.cidade, fn.estado, fn.chave_pix, fn.observacoes
  from public.funcionarios fn
  where fn.empresa_id = p_empresa_id
    and regexp_replace(fn.cpf, '\D', '', 'g') = regexp_replace(p_cpf, '\D', '', 'g')
  limit 1;
$$;

grant execute on function public.buscar_funcionario_por_cpf_empresa(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Cadastro publico no banco da empresa: mesma validacao da candidatura
-- por evento (nome, CPF, telefone, e-mail, maioridade, cidade/estado,
-- chave PIX, LGPD), mas sem funcao/vagas/convite — so grava/atualiza o
-- funcionario.
-- ---------------------------------------------------------------------
create or replace function public.cadastro_publico_freelancer(
  p_empresa_id uuid,
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
  v_empresa_existe boolean;
  v_funcionario_id uuid;
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
  if p_aceite_lgpd is not true then
    raise exception 'E necessario aceitar os termos de privacidade (LGPD)';
  end if;

  select exists(select 1 from public.empresas where id = p_empresa_id) into v_empresa_existe;
  if not v_empresa_existe then
    raise exception 'Empresa nao encontrada';
  end if;

  select id into v_funcionario_id
  from public.funcionarios
  where empresa_id = p_empresa_id
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
      p_empresa_id, v_nome_normalizado, p_cpf, p_telefone, p_email, p_data_nascimento, p_cidade, p_estado,
      p_chave_pix, p_observacoes, 'ativo', now()
    )
    returning id into v_funcionario_id;
  end if;

  return v_funcionario_id;
end;
$$;

grant execute on function public.cadastro_publico_freelancer(
  uuid, text, text, text, text, date, text, text, text, text, boolean
) to anon, authenticated;
