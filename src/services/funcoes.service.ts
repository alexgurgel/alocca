import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Funcao } from "@/types";
import type { FuncaoInput } from "@/lib/validations/funcao.schema";

export async function listFuncoes(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<Funcao[]> {
  const { data, error } = await supabase
    .from("funcoes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createFuncao(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  input: FuncaoInput
) {
  const { data, error } = await supabase
    .from("funcoes")
    .insert({
      empresa_id: empresaId,
      nome: input.nome,
      descricao: input.descricao || null,
      cor: input.cor || null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateFuncao(
  supabase: SupabaseClient<Database>,
  id: string,
  input: FuncaoInput
) {
  const { data, error } = await supabase
    .from("funcoes")
    .update({
      nome: input.nome,
      descricao: input.descricao || null,
      cor: input.cor || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFuncao(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("funcoes").delete().eq("id", id);
  if (error) throw error;
}
