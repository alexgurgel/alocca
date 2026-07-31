import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface ListaPublicaEventoInfo {
  id: string;
  nome: string;
  local: string | null;
  data_inicio: string;
  data_fim: string;
  status: string;
  empresa_nome: string;
}

export interface FreelancerConfirmado {
  funcionario_id: string;
  nome: string;
  funcao_nome: string;
  cpf: string | null;
  data_nascimento: string | null;
  telefone: string | null;
  email: string | null;
  chave_pix: string | null;
}

export async function getListaPublicaEventoInfo(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<ListaPublicaEventoInfo | null> {
  const { data, error } = await supabase.rpc("lista_publica_evento_info", {
    p_evento_id: eventoId,
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getListaConfirmadosEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<FreelancerConfirmado[]> {
  const { data, error } = await supabase.rpc("lista_confirmados_evento", {
    p_evento_id: eventoId,
  });
  if (error) throw error;
  return data ?? [];
}
