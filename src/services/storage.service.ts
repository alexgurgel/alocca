import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

async function uploadArquivo(
  supabase: SupabaseClient<Database>,
  bucket: "avatars" | "logos",
  empresaId: string,
  arquivo: File
) {
  const extensao = arquivo.name.split(".").pop() ?? "jpg";
  const caminho = `${empresaId}/${crypto.randomUUID()}.${extensao}`;

  const { error } = await supabase.storage.from(bucket).upload(caminho, arquivo, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(caminho);
  return data.publicUrl;
}

export function uploadFotoColaborador(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  arquivo: File
) {
  return uploadArquivo(supabase, "avatars", empresaId, arquivo);
}

export function uploadLogoEmpresa(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  arquivo: File
) {
  return uploadArquivo(supabase, "logos", empresaId, arquivo);
}
