"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppContext } from "@/components/providers/app-provider";
import { useColaboradores } from "@/hooks/use-colaboradores";
import { useFuncoes } from "@/hooks/use-funcoes";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { ColaboradoresTable } from "@/components/colaboradores/colaboradores-table";
import { ColaboradoresToolbar } from "@/components/colaboradores/colaboradores-toolbar";
import { createClient } from "@/lib/supabase/client";
import { deleteFuncionario } from "@/services/funcionarios.service";
import { getLinkCadastroFreelancer } from "@/lib/convite-links";
import type { FuncionarioComFuncoes } from "@/types";

export default function ColaboradoresPage() {
  const { perfil } = useAppContext();
  const empresaId = perfil.empresa_id ?? undefined;

  const {
    dados,
    total,
    carregando,
    busca,
    setBusca,
    status,
    setStatus,
    funcaoId,
    setFuncaoId,
    pagina,
    setPagina,
    porPagina,
    ordenarPor,
    ordemAsc,
    alternarOrdenacao,
    recarregar,
  } = useColaboradores(empresaId);

  const { funcoes } = useFuncoes(empresaId);
  const [paraExcluir, setParaExcluir] = useState<FuncionarioComFuncoes | null>(null);

  async function handleExcluir() {
    if (!paraExcluir) return;
    try {
      const supabase = createClient();
      await deleteFuncionario(supabase, paraExcluir.id);
      toast.success("Freelancer removido.");
      await recarregar();
    } catch {
      toast.error("Não foi possível remover o freelancer.");
    }
  }

  async function copiarLinkCadastro() {
    if (!empresaId) return;
    await navigator.clipboard.writeText(getLinkCadastroFreelancer(empresaId));
    toast.success("Link de cadastro copiado. Envie para o freelancer se juntar à sua equipe.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Freelancers"
        description="Gerencie a equipe disponível para escalar em seus eventos."
        actions={
          <>
            <Button variant="outline" onClick={copiarLinkCadastro}>
              <Link2 />
              Copiar link de cadastro
            </Button>
            <Button render={<Link href="/colaboradores/novo" />}>
              <Plus />
              Novo freelancer
            </Button>
          </>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <ColaboradoresToolbar
            busca={busca}
            onBuscaChange={setBusca}
            status={status}
            onStatusChange={setStatus}
            funcaoId={funcaoId}
            onFuncaoChange={setFuncaoId}
            funcoes={funcoes}
          />
        </div>

        <ColaboradoresTable
          dados={dados}
          carregando={carregando}
          ordenarPor={ordenarPor}
          ordemAsc={ordemAsc}
          onOrdenar={alternarOrdenacao}
          onExcluir={setParaExcluir}
        />

        <PaginationBar pagina={pagina} porPagina={porPagina} total={total} onChange={setPagina} />
      </div>

      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(open) => !open && setParaExcluir(null)}
        title={`Remover ${paraExcluir?.nome ?? "freelancer"}?`}
        description="Essa ação não pode ser desfeita. O histórico de convites e check-ins associados também será removido."
        confirmLabel="Remover"
        onConfirm={handleExcluir}
      />
    </div>
  );
}
