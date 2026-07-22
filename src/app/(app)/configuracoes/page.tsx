"use client";

import { useAppContext } from "@/components/providers/app-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmpresaForm } from "@/components/configuracoes/empresa-form";
import { FuncoesManager } from "@/components/configuracoes/funcoes-manager";
import { EmptyState } from "@/components/shared/empty-state";
import { Building2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const { perfil, empresa } = useAppContext();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie os dados da sua empresa e as funções da equipe." />

      <Tabs defaultValue="empresa">
        <TabsList>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="funcoes">Funções</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
