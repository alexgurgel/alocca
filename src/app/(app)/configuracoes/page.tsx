"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmpresaForm } from "@/components/configuracoes/empresa-form";
import { EquipeTab } from "@/components/configuracoes/equipe-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const { empresa } = useAppContext();
  const temMultiplosAcessos = (empresa?.limite_usuarios ?? 1) > 1;

  const empresaCard = (
    <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      {empresa ? <EmpresaForm empresa={empresa} /> : <EmptyState icon={Building2} title="Empresa não encontrada" />}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie os dados da sua empresa." />

      {temMultiplosAcessos && empresa ? (
        <Tabs defaultValue="empresa">
          <TabsList>
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="pt-4">
            {empresaCard}
          </TabsContent>

          <TabsContent value="equipe" className="pt-4">
            <div className="max-w-2xl">
              <EquipeTab empresa={empresa} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        empresaCard
      )}
    </div>
  );
}
