-- =====================================================================
-- Alocca — Lista pública de confirmados passa a trazer os dados
-- cadastrais completos do freelancer (nome, função, CPF, data de
-- nascimento, telefone, e-mail e chave PIX), a pedido do cliente.
-- =====================================================================

drop function if exists public.lista_confirmados_evento(uuid);

create function public.lista_confirmados_evento(p_evento_id uuid)
returns table (
  funcionario_id uuid,
  nome text,
  funcao_nome text,
  cpf text,
  data_nascimento date,
  telefone text,
  email text,
  chave_pix text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.funcionario_id,
    fn.nome,
    f.nome as funcao_nome,
    fn.cpf,
    fn.data_nascimento,
    fn.telefone,
    fn.email,
    fn.chave_pix
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
