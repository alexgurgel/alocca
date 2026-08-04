import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppProvider } from "@/components/providers/app-provider";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/layout/user-menu";

export default async function ColaboradorLayout({ children }: { children: ReactNode }) {
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

  if (perfil.papel !== "colaborador") {
    redirect("/painel");
  }

  return (
    <AppProvider perfil={perfil} empresa={null}>
      <div className="min-h-screen bg-muted/40">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
          <Logo />
          <div className="w-56">
            <UserMenu perfil={perfil} minimal />
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl px-4 py-6">{children}</main>
      </div>
    </AppProvider>
  );
}
