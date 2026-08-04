import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { AprovacoesManager } from "@/components/admin/aprovacoes-manager";

export default async function AprovacoesPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/entrar");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("plano")
    .eq("id", session.user.id)
    .maybeSingle();

  if (perfil?.plano !== "admin") {
    redirect("/painel");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aprovações"
        description="Aprove novos cadastros de produtoras e gerencie o plano de acesso de cada uma."
      />
      <AprovacoesManager currentUserId={session.user.id} />
    </div>
  );
}
