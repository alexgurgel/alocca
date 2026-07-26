import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ConviteComRelacoes } from "@/types";
import type { ConvidarColaboradorInput } from "@/lib/validations/escala.schema";

export async function listConvitesDoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<ConviteComRelacoes[]> {
  const { data, error } = await supabase
    .from("convites")
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*)")
    .eq("evento_id", eventoId)
    .order("enviado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ConviteComRelacoes[];
}

export async function listConvitesDoColaborador(
  supabase: SupabaseClient<Database>,
  funcionarioId: string
): Promise<ConviteComRelacoes[]> {
  const { data, error } = await supabase
    .from("convites")
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*), evento:eventos(*)")
    .eq("funcionario_id", funcionarioId)
    .order("enviado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ConviteComRelacoes[];
}

export async function getConvite(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ConviteComRelacoes | null> {
  const { data, error } = await supabase
    .from("convites")
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*), evento:eventos(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ConviteComRelacoes | null;
}

export async function enviarConvite(
  supabase: SupabaseClient<Database>,
  eventoId: string,
  funcaoId: string,
  input: ConvidarColaboradorInput
) {
  const { data, error } = await supabase
    .from("convites")
    .insert({
      evento_id: eventoId,
      funcao_id: funcaoId,
      funcionario_id: input.funcionario_id,
      valor_diaria: input.valor_diaria ? Number(input.valor_diaria) : null,
      observacoes: input.observacoes || null,
    })
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function cancelarConvite(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("convites").delete().eq("id", id);
  if (error) throw error;
}

export async function responderConvite(
  supabase: SupabaseClient<Database>,
  id: string,
  status: "aceito" | "recusado"
) {
  const { data, error } = await supabase
    .from("convites")
    .update({ status, respondido_em: new Date().toISOString() })
    .eq("id", id)
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*), evento:eventos(*)")
    .single();

  if (error) throw error;
  return data;
}

export interface ContePublico {
  id: string;
  status: "pendente" | "aceito" | "recusado";
  valor_diaria: number | null;
  observacoes: string | null;
  funcao_nome: string;
  evento_nome: string;
  evento_local: string | null;
  evento_endereco: string | null;
  evento_data_inicio: string;
  evento_data_fim: string;
  evento_observacoes: string | null;
}

export async function getContePublico(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<ContePublico | null> {
  const { data, error } = await supabase.rpc("obter_convite_publico", { p_id: id });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function responderContePublico(
  supabase: SupabaseClient<Database>,
  id: string,
  status: "aceito" | "recusado"
) {
  const { error } = await supabase.rpc("responder_convite_publico", {
    p_id: id,
    p_status: status,
  });
  if (error) throw error;
}
