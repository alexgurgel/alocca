import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ConviteComRelacoes, EscalaFuncao } from "@/types";
import type { EscalaFuncaoInput } from "@/lib/validations/escala.schema";

export async function listEscalaDoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<EscalaFuncao[]> {
  const { data: eventoFuncoes, error } = await supabase
    .from("evento_funcoes")
    .select("*, funcao:funcoes(*)")
    .eq("evento_id", eventoId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const { data: convites, error: convitesError } = await supabase
    .from("convites")
    .select("*, funcionario:funcionarios(*), funcao:funcoes(*)")
    .eq("evento_id", eventoId);

  if (convitesError) throw convitesError;

  const convitesTyped = (convites ?? []) as unknown as ConviteComRelacoes[];

  return ((eventoFuncoes ?? []) as unknown as EscalaFuncao[]).map((ef) => ({
    ...ef,
    convites: convitesTyped.filter((c) => c.funcao_id === ef.funcao_id),
  }));
}

export async function addFuncaoAoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string,
  input: EscalaFuncaoInput
) {
  const { data, error } = await supabase
    .from("evento_funcoes")
    .insert({
      evento_id: eventoId,
      funcao_id: input.funcao_id,
      vagas: input.vagas,
      valor_diaria: Number(input.valor_diaria),
    })
    .select("*, funcao:funcoes(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function updateVagasFuncaoEvento(
  supabase: SupabaseClient<Database>,
  id: string,
  vagas: number
) {
  const { data, error } = await supabase
    .from("evento_funcoes")
    .update({ vagas })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateValorDiariaFuncaoEvento(
  supabase: SupabaseClient<Database>,
  id: string,
  valorDiaria: number
) {
  const { data, error } = await supabase
    .from("evento_funcoes")
    .update({ valor_diaria: valorDiaria })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function removeFuncaoDoEvento(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("evento_funcoes").delete().eq("id", id);
  if (error) throw error;
}
