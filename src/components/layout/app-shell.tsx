import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { Perfil } from "@/types";

export function AppShell({ perfil, children }: { perfil: Perfil; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar perfil={perfil} />
      <Topbar perfil={perfil} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
