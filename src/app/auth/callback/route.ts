import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/painel";

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/entrar?erro=auth`);
  }

  const { data: perfilExistente } = await supabase
    .from("perfis")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!perfilExistente) {
    const metadata = data.user.user_metadata as {
      nome_empresa?: string;
      nome?: string;
    };

    if (metadata?.nome_empresa && metadata?.nome) {
      const { error: rpcError } = await supabase.rpc("criar_empresa_e_perfil", {
        p_nome_empresa: metadata.nome_empresa,
        p_nome_usuario: metadata.nome,
        p_email: data.user.email ?? "",
      });

      if (rpcError) {
        return NextResponse.redirect(`${origin}/entrar?erro=perfil`);
      }
    } else {
      return NextResponse.redirect(`${origin}/entrar?erro=perfil`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
