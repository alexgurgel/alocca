import { redirect } from "next/navigation";
import { Clock, ShieldX } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { SairButton } from "@/components/shared/sair-button";
import { createClient } from "@/lib/supabase/server";

export default async function AguardandoAprovacaoPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil) {
    redirect("/entrar");
  }

  if (perfil.papel === "colaborador") {
    redirect("/meus-convites");
  }

  if (perfil.status_conta === "aprovado") {
    redirect("/painel");
  }

  const recusado = perfil.status_conta === "recusado";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          {recusado ? (
            <ShieldX className="size-6 text-destructive" />
          ) : (
            <Clock className="size-6 text-primary" />
          )}
        </div>

        {recusado ? (
          <>
            <h2 className="text-xl font-semibold tracking-tight">Cadastro não aprovado</h2>
            <p className="text-sm text-muted-foreground">
              Seu acesso à Alocca não foi aprovado. Se você acredita que isso é um engano,
              entre em contato com o administrador da plataforma.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold tracking-tight">Sua conta está em análise</h2>
            <p className="text-sm text-muted-foreground">
              Recebemos seu cadastro, {perfil.nome.split(" ")[0]}. Um administrador da Alocca
              precisa aprovar seu acesso antes que você possa entrar. Assim que isso acontecer,
              você poderá acessar normalmente.
            </p>
          </>
        )}

        <SairButton className="mx-auto" />
      </div>
    </div>
  );
}
