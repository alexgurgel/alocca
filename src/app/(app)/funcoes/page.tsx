"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { FuncoesManager } from "@/components/configuracoes/funcoes-manager";

export default function FuncoesPage() {
  const { perfil } = useAppContext();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Funções"
        description="Cadastre as funções da equipe (garçom, segurança, recepção etc.) usadas na escala dos eventos."
      />
      <div className="max-w-2xl">
        <FuncoesManager empresaId={perfil.empresa_id ?? undefined} />
      </div>
    </div>
  );
}
