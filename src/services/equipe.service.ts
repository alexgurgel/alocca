import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { ConviteEquipe, Perfil } from "@/types";

export async function listMembrosEquipe(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("papel", "admin")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listConvitesEquipePendentes(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<ConviteEquipe[]> {
  const { data, error } = await supabase
    .from("convites_equipe")
    .select("*")
    .eq("empresa_id", empresaId)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function criarConviteEquipe(
  supabase: SupabaseClient<Database>,
  email: string
): Promise<ConviteEquipe> {
  const { data, error } = await supabase.rpc("criar_convite_equipe", { p_email: email });
  if (error) throw error;
  return data;
}

export async function cancelarConviteEquipe(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("convites_equipe").delete().eq("id", id);
  if (error) throw error;
}

export interface ConviteEquipePublico {
  email: string;
  empresaNome: string;
}

export async function obterConviteEquipe(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<ConviteEquipePublico | null> {
  const { data, error } = await supabase.rpc("obter_convite_equipe", { p_token: token });
  if (error) throw error;
  const row = data?.[0];
  return row ? { email: row.email, empresaNome: row.empresa_nome } : null;
}

export async function aceitarConviteEquipe(
  supabase: SupabaseClient<Database>,
  token: string,
  nome: string
): Promise<Perfil> {
  const { data, error } = await supabase.rpc("aceitar_convite_equipe", {
    p_token: token,
    p_nome: nome,
  });
  if (error) throw error;
  return data;
}
