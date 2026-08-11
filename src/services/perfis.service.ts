import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Empresa, Perfil, PlanoAcesso } from "@/types";

export interface PerfilComEmpresa extends Perfil {
  empresa: Empresa | null;
}

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

export async function listPerfisAdmins(
  supabase: SupabaseClient<Database>
): Promise<PerfilComEmpresa[]> {
  const { data, error } = await supabase
    .from("perfis")
    .select("*, empresa:empresas(*)")
    .eq("papel", "admin")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PerfilComEmpresa[];
}

export async function aprovarPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  aprovadoPorId: string
) {
  const { error } = await supabase
    .from("perfis")
    .update({ status_conta: "aprovado", aprovado_por: aprovadoPorId, aprovado_em: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function recusarPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  aprovadoPorId: string
) {
  const { error } = await supabase
    .from("perfis")
    .update({ status_conta: "recusado", aprovado_por: aprovadoPorId, aprovado_em: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function atualizarPlanoPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  plano: PlanoAcesso
) {
  const { error } = await supabase.from("perfis").update({ plano }).eq("id", id);
  if (error) throw error;
}

export async function atualizarAtivoPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  ativo: boolean
) {
  const { error } = await supabase.from("perfis").update({ ativo }).eq("id", id);
  if (error) throw error;
}

export async function atualizarVencimentoPerfil(
  supabase: SupabaseClient<Database>,
  id: string,
  dataVencimento: string | null
) {
  const { error } = await supabase
    .from("perfis")
    .update({ data_vencimento: dataVencimento })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarLimiteUsuariosEmpresa(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  limite: number
) {
  const { error } = await supabase
    .from("empresas")
    .update({ limite_usuarios: limite })
    .eq("id", empresaId);
  if (error) throw error;
}
