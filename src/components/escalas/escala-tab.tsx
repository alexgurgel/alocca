"use client";

import { ClipboardList, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";

import { useEscala } from "@/hooks/use-escala";
import { useFuncoes } from "@/hooks/use-funcoes";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AdicionarFuncaoDialog } from "./adicionar-funcao-dialog";
import { EscalaFuncaoCard } from "./escala-funcao-card";
import type { Evento } from "@/types";

export function EscalaTab({ empresaId, evento }: { empresaId: string; evento: Evento }) {
  const {
    escala,
    carregando,
    adicionarFuncao,
    atualizarVagas,
    removerFuncao,
    convidar,
    cancelarConviteEnviado,
  } = useEscala(evento.id);
  const { funcoes } = useFuncoes(empresaId);

  const listaPublicaUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/lista/${evento.lista_publica_token}`
      : `/lista/${evento.lista_publica_token}`;
  const candidaturaPublicaUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/candidatura/${evento.candidatura_publica_token}`
      : `/candidatura/${evento.candidatura_publica_token}`;

  async function copiarLinkFornecedor() {
    await navigator.clipboard.writeText(listaPublicaUrl);
    toast.success("Link da lista do fornecedor copiado.");
  }

  async function copiarLinkCandidatura() {
    await navigator.clipboard.writeText(candidaturaPublicaUrl);
    toast.success("Link de candidatura copiado.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Escala do evento</h3>
          <p className="text-xs text-muted-foreground">
            Defina as funcoes necessarias, convide colaboradores e compartilhe a lista publica
            com o fornecedor.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={copiarLinkFornecedor}>
            <Share2 />
            Copiar link do fornecedor
          </Button>
          <Button variant="outline" onClick={copiarLinkCandidatura}>
            <Share2 />
            Copiar link de candidatura
          </Button>
          <Button
            variant="outline"
            render={<a href={listaPublicaUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink />
            Abrir lista publica
          </Button>
          <Button
            variant="outline"
            render={<a href={candidaturaPublicaUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink />
            Abrir candidatura publica
          </Button>
          <AdicionarFuncaoDialog
            funcoes={funcoes}
            funcoesJaAdicionadas={escala.map((e) => e.funcao_id)}
            onAdicionar={adicionarFuncao}
          />
        </div>
      </div>

      {carregando ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : escala.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma funcao na escala"
          description="Adicione as funcoes necessarias para este evento e defina quantas vagas cada uma precisa."
        />
      ) : (
        <div className="space-y-3">
          {escala.map((item) => (
            <EscalaFuncaoCard
              key={item.id}
              empresaId={empresaId}
              eventoNome={evento.nome}
              escala={item}
              valorPadrao={evento.valor_diaria_padrao}
              onAtualizarVagas={atualizarVagas}
              onRemoverFuncao={removerFuncao}
              onConvidar={convidar}
              onCancelarConvite={cancelarConviteEnviado}
            />
          ))}
        </div>
      )}
    </div>
  );
}
