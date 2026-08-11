"use client";

import { ClipboardList } from "lucide-react";
import { useEscala } from "@/hooks/use-escala";
import { useFuncoes } from "@/hooks/use-funcoes";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AdicionarFuncaoDialog } from "./adicionar-funcao-dialog";
import { EscalaFuncaoCard } from "./escala-funcao-card";
import type { Evento } from "@/types";

export function EscalaTab({ empresaId, evento }: { empresaId: string; evento: Evento }) {
  const {
    escala,
    carregando,
    adicionarFuncao,
    atualizarVagas,
    atualizarValorDiaria,
    removerFuncao,
    convidar,
    cancelarConviteEnviado,
    avaliarCandidatura,
  } = useEscala(evento.id);
  const { funcoes } = useFuncoes(empresaId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Escala do evento</h3>
          <p className="text-xs text-muted-foreground">
            Defina as funções necessárias e convide freelancers para cada uma.
          </p>
        </div>
        <AdicionarFuncaoDialog
          funcoes={funcoes}
          funcoesJaAdicionadas={escala.map((e) => e.funcao_id)}
          onAdicionar={adicionarFuncao}
        />
      </div>

      {carregando ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : escala.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma função na escala"
          description="Adicione as funções necessárias para este evento e defina quantas vagas cada uma precisa."
        />
      ) : (
        <div className="space-y-3">
          {escala.map((item) => (
            <EscalaFuncaoCard
              key={item.id}
              empresaId={empresaId}
              eventoNome={evento.nome}
              escala={item}
              onAtualizarVagas={atualizarVagas}
              onAtualizarValorDiaria={atualizarValorDiaria}
              onRemoverFuncao={removerFuncao}
              onConvidar={convidar}
              onCancelarConvite={cancelarConviteEnviado}
              onAvaliarCandidatura={avaliarCandidatura}
            />
          ))}
        </div>
      )}
    </div>
  );
}
