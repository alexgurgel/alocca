import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { InscricaoPublicaInput } from "@/lib/validations/inscricao-publica.schema";

export interface EventoPublico {
  id: string;
  nome: string;
  local: string | null;
  endereco: string | null;
  data_inicio: string;
  data_fim: string;
  observacoes: string | null;
  valor_diaria_padrao: number | null;
  empresa_nome: string;
}

export interface FuncaoDisponivel {
  funcao_id: string;
  nome: string;
  vagas_disponiveis: number;
}

export interface FuncionarioEncontrado {
  nome: string;
  telefone: string | null;
  email: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
}

export async function getEventoPublico(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<EventoPublico | null> {
  const { data, error } = await supabase.rpc("evento_publico", { p_evento_id: eventoId });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getFuncoesDisponiveisEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<FuncaoDisponivel[]> {
  const { data, error } = await supabase.rpc("funcoes_disponiveis_evento", {
    p_evento_id: eventoId,
  });
  if (error) throw error;
  return data ?? [];
}

export async function buscarFuncionarioPorCpf(
  supabase: SupabaseClient<Database>,
  eventoId: string,
  cpf: string
): Promise<FuncionarioEncontrado | null> {
  const { data, error } = await supabase.rpc("buscar_funcionario_por_cpf", {
    p_evento_id: eventoId,
    p_cpf: cpf,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function enviarInscricaoPublica(
  supabase: SupabaseClient<Database>,
  eventoId: string,
  cpf: string,
  input: InscricaoPublicaInput
) {
  const { data, error } = await supabase.rpc("inscricao_publica_evento", {
    p_evento_id: eventoId,
    p_funcao_id: input.funcao_id,
    p_nome: input.nome,
    p_cpf: cpf,
    p_telefone: input.telefone,
    p_email: input.email,
    p_data_nascimento: input.data_nascimento,
    p_cidade: input.cidade,
    p_estado: input.estado,
    p_observacoes: input.observacoes || null,
  });
  if (error) throw error;
  return data;
}
