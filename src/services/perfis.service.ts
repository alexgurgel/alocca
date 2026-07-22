import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Perfil } from "@/types";

export async function getPerfilAtual(
  supabase: SupabaseClient<Database>
): Promise<Perfil | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function atualizarPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<Pick<Perfil, "nome" | "telefone" | "avatar_url">>
) {
  const { data, error } = await supabase
    .from("perfis")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
