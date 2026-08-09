"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { EmpresaForm } from "@/components/configuracoes/empresa-form";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const { empresa } = useAppContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie os dados da sua empresa." />

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
        {empresa ? <EmpresaForm empresa={empresa} /> : <EmptyState icon={Building2} title="Empresa não encontrada" />}
      </div>
    </div>
  );
}
