"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmpresaForm } from "@/components/configuracoes/empresa-form";
import { FuncoesManager } from "@/components/configuracoes/funcoes-manager";
import { EquipeTab } from "@/components/configuracoes/equipe-tab";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const { perfil, empresa } = useAppContext();
  const temMultiplosAcessos = (empresa?.limite_usuarios ?? 1) > 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie os dados da sua empresa e as funções da equipe." />

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="funcoes">Funções</TabsTrigger>
          {temMultiplosAcessos ? <TabsTrigger value="equipe">Equipe</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="empresa" className="pt-4">
          <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
            {empresa ? (
              <EmpresaForm empresa={empresa} />
            ) : (
              <EmptyState icon={Building2} title="Empresa não encontrada" />
            )}
          </div>
        </TabsContent>

        <TabsContent value="funcoes" className="pt-4">
          <div className="max-w-2xl">
            <FuncoesManager empresaId={perfil.empresa_id ?? undefined} />
          </div>
        </TabsContent>

        {temMultiplosAcessos && empresa ? (
          <TabsContent value="equipe" className="pt-4">
            <div className="max-w-2xl">
              <EquipeTab empresa={empresa} />
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
