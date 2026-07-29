"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { useFuncoes } from "@/hooks/use-funcoes";
import { PageHeader } from "@/components/shared/page-header";
import { ColaboradorForm } from "@/components/colaboradores/colaborador-form";

export default function NovoColaboradorPage() {
  const { perfil } = useAppContext();
  const empresaId = perfil.empresa_id ?? "";
  const { funcoes } = useFuncoes(perfil.empresa_id ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="Novo freelancer" description="Cadastre um novo membro da equipe." />
      <div className="mx-auto max-w-3xl">
        <ColaboradorForm empresaId={empresaId} funcoes={funcoes} />
      </div>
    </div>
  );
}
