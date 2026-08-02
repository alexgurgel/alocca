"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AppProvider } from "@/components/providers/app-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/layout/user-menu";
import type { Empresa, Perfil } from "@/types";

type Mode = "admin" | "colaborador";

type LoadState = {
  perfil: Perfil | null;
  empresa: Empresa | null;
};

export function AuthenticatedLayoutClient({
  children,
  mode,
}: {
  children: ReactNode;
  mode: Mode;
}) {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ perfil: null, empresa: null });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user) {
          router.replace("/entrar");
          return;
        }

        const { data: perfil, error: perfilError } = await supabase
          .from("perfis")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (perfilError || !perfil) {
          router.replace("/entrar");
          return;
        }

        if (mode === "admin" && perfil.papel === "colaborador") {
          router.replace("/meus-convites");
          return;
        }

        if (mode === "colaborador" && perfil.papel !== "colaborador") {
          router.replace("/painel");
          return;
        }

        let empresa: Empresa | null = null;
        if (perfil.empresa_id && mode === "admin") {
          const { data: empresaData } = await supabase
            .from("empresas")
            .select("*")
            .eq("id", perfil.empresa_id)
            .maybeSingle();
          empresa = empresaData ?? null;
        }

        if (ativo) {
          setState({ perfil, empresa });
          setCarregando(false);
        }
      } catch {
        if (ativo) {
          router.replace("/entrar");
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [mode, router]);

  if (carregando || !state.perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Carregando sua area...</span>
        </div>
      </div>
    );
  }

  if (mode === "colaborador") {
    return (
      <AppProvider perfil={state.perfil} empresa={null}>
        <div className="min-h-screen bg-muted/40">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
            <Logo />
            <div className="w-56">
              <UserMenu perfil={state.perfil} minimal />
            </div>
          </header>
          <main className="mx-auto w-full max-w-2xl px-4 py-6">{children}</main>
        </div>
      </AppProvider>
    );
  }

  return (
    <AppProvider perfil={state.perfil} empresa={state.empresa}>
      <AppShell perfil={state.perfil}>{children}</AppShell>
    </AppProvider>
  );
}
