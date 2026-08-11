import { redirect } from "next/navigation";
import { ShieldX } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { SairButton } from "@/components/shared/sair-button";
import { createClient } from "@/lib/supabase/server";

export default async function ContaInativaPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome, plano, ativo, data_vencimento")
    .eq("id", user.id)
    .maybeSingle();

  if (!perfil) {
    redirect("/entrar");
  }

  // Se a conta foi reativada / o vencimento foi removido enquanto o
  // usuario estava fora, nao faz sentido manter essa tela.
  const hoje = new Date().toISOString().slice(0, 10);
  const aindaBloqueado =
    perfil.plano !== "admin" &&
    (!perfil.ativo || (!!perfil.data_vencimento && perfil.data_vencimento < hoje));

  if (!aindaBloqueado) {
    redirect("/painel");
  }

  const vencido = motivo === "vencido" || (!!perfil.data_vencimento && perfil.data_vencimento < hoje);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="size-6 text-destructive" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          {vencido ? "Sua assinatura venceu" : "Cadastro inativado"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {perfil.nome.split(" ")[0]}, {vencido
            ? "o acesso da sua conta à Alocca expirou."
            : "seu acesso à Alocca foi desativado pelo administrador."}{" "}
          Entre em contato com o administrador da plataforma para regularizar sua conta.
        </p>

        <SairButton className="mx-auto" />
      </div>
    </div>
  );
}
