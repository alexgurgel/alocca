import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  let { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil) {
    // Autoconserto: se o cadastro criou o usuario mas a criacao da
    // empresa/perfil falhou (ex: instabilidade momentanea no callback
    // de confirmacao de e-mail), tenta de novo usando os metadados
    // salvos no proprio signUp, em vez de deixar a conta orfa.
    const metadata = user.user_metadata as {
      nome_empresa?: string;
      nome?: string;
      aceite_lgpd?: boolean;
    };

    if (metadata?.nome_empresa && metadata?.nome) {
      const { data: perfilCriado } = await supabase.rpc("criar_empresa_e_perfil", {
        p_nome_empresa: metadata.nome_empresa,
        p_nome_usuario: metadata.nome,
        p_email: user.email ?? "",
        p_aceite_lgpd: metadata.aceite_lgpd === true,
      });
      perfil = perfilCriado ?? null;
    }
  }

  if (!perfil) {
    redirect("/entrar?erro=perfil");
  }

  if (perfil.papel === "colaborador") {
    redirect("/meus-convites");
  }

  if (perfil.status_conta !== "aprovado") {
    redirect("/aguardando-aprovacao");
  }

  const { data: empresa } = perfil.empresa_id
    ? await supabase.from("empresas").select("*").eq("id", perfil.empresa_id).maybeSingle()
    : { data: null };

  return (
    <AppProvider perfil={perfil} empresa={empresa}>
      <AppShell perfil={perfil}>{children}</AppShell>
    </AppProvider>
  );
}
