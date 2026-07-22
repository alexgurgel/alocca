"use client";

import { useState } from "react";
import { Tags, Trash2 } from "lucide-react";
import { useFuncoes } from "@/hooks/use-funcoes";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FuncaoDialog } from "./funcao-dialog";
import type { Funcao } from "@/types";

export function FuncoesManager({ empresaId }: { empresaId: string | undefined }) {
  const { funcoes, carregando, criar, atualizar, remover } = useFuncoes(empresaId);
  const [paraExcluir, setParaExcluir] = useState<Funcao | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Funções cadastradas</h3>
          <p className="text-xs text-muted-foreground">
            Cargos que podem ser atribuídos a colaboradores e escalados em eventos.
          </p>
        </div>
        <FuncaoDialog onSalvar={criar} />
      </div>

      {carregando ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : funcoes.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma função cadastrada"
          description="Cadastre funções como Garçom, Barman, Segurança para montar suas escalas."
        />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {funcoes.map((funcao) => (
            <li key={funcao.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">{funcao.nome}</p>
                {funcao.descricao ? (
                  <p className="text-xs text-muted-foreground">{funcao.descricao}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <FuncaoDialog funcao={funcao} onSalvar={(input) => atualizar(funcao.id, input)} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setParaExcluir(funcao)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(open) => !open && setParaExcluir(null)}
        title={`Remover a função "${paraExcluir?.nome}"?`}
        description="Colaboradores e escalas que usam esta função perderão essa associação."
        confirmLabel="Remover"
        onConfirm={async () => {
          if (paraExcluir) await remover(paraExcluir.id);
        }}
      />
    </div>
  );
}
