import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

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

  const { data: empresa } = perfil.empresa_id
    ? await supabase.from("empresas").select("*").eq("id", perfil.empresa_id).maybeSingle()
    : { data: null };

  return (
    <AppProvider perfil={perfil} empresa={empresa}>
      <AppShell perfil={perfil}>{children}</AppShell>
    </AppProvider>
  );
}
