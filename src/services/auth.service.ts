import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function entrar(
  supabase: SupabaseClient<Database>,
  email: string,
  senha: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  return data;
}

export async function sair(supabase: SupabaseClient<Database>) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function cadastrar(
  supabase: SupabaseClient<Database>,
  email: string,
  senha: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      emailRedirectTo:
        typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
  if (error) throw error;
  return data;
}

export async function enviarEmailRedefinirSenha(
  supabase: SupabaseClient<Database>,
  email: string
) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window !== "undefined" ? `${window.location.origin}/redefinir-senha` : undefined,
  });
  if (error) throw error;
}

export async function atualizarSenha(supabase: SupabaseClient<Database>, novaSenha: string) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}
