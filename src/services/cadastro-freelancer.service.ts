import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CadastroFreelancerInput } from "@/lib/validations/cadastro-freelancer.schema";

export interface EmpresaPublica {
  id: string;
  nome: string;
}

export interface FuncionarioEncontrado {
  nome: string;
  telefone: string | null;
  email: string | null;
  data_nascimento: string | null;
  cidade: string | null;
  estado: string | null;
  chave_pix: string | null;
  observacoes: string | null;
}

export async function getEmpresaPublica(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<EmpresaPublica | null> {
  const { data, error } = await supabase.rpc("empresa_publica", { p_empresa_id: empresaId });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function buscarFuncionarioPorCpfEmpresa(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  cpf: string
): Promise<FuncionarioEncontrado | null> {
  const { data, error } = await supabase.rpc("buscar_funcionario_por_cpf_empresa", {
    p_empresa_id: empresaId,
    p_cpf: cpf,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function enviarCadastroFreelancer(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  cpf: string,
  input: CadastroFreelancerInput
) {
  const { data, error } = await supabase.rpc("cadastro_publico_freelancer", {
    p_empresa_id: empresaId,
    p_nome: input.nome,
    p_cpf: cpf,
    p_telefone: input.telefone,
    p_email: input.email,
    p_data_nascimento: input.data_nascimento,
    p_cidade: input.cidade,
    p_estado: input.estado,
    p_chave_pix: input.chave_pix,
    p_observacoes: input.observacoes || null,
    p_aceite_lgpd: input.aceiteLgpd,
  });
  if (error) throw error;
  return data;
}
