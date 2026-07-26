import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Empresa } from "@/types";

export async function criarContaInicial(
  supabase: SupabaseClient<Database>,
  params: { nomeEmpresa: string; nomeUsuario: string; email: string; aceiteLgpd: boolean }
) {
  const { data, error } = await supabase.rpc("criar_empresa_e_perfil", {
    p_nome_empresa: params.nomeEmpresa,
    p_nome_usuario: params.nomeUsuario,
    p_email: params.email,
    p_aceite_lgpd: params.aceiteLgpd,
  });

  if (error) throw error;
  return data;
}

export async function getEmpresa(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Empresa | null> {
  const { data, error } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function atualizarEmpresa(
  supabase: SupabaseClient<Database>,
  id: string,
  input: Partial<Pick<Empresa, "nome" | "cnpj" | "telefone" | "email" | "endereco" | "logo_url">>
) {
  const { data, error } = await supabase
    .from("empresas")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
