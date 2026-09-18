"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useEscala } from "@/hooks/use-escala";
import { useFuncoes } from "@/hooks/use-funcoes";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AdicionarFuncaoDialog } from "./adicionar-funcao-dialog";
import { EscalaFuncaoCard } from "./escala-funcao-card";
import { EscalaToolbar, type EscalaFiltroStatus, type EscalaOrdenacao } from "./escala-toolbar";
import type { ConviteComRelacoes, Evento } from "@/types";

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

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<EscalaFiltroStatus>("todos");
  const [ordenarPor, setOrdenarPor] = useState<EscalaOrdenacao>("nome");

  const filtroAtivo = busca.trim().length > 0 || status !== "todos";

  const escalaComConvitesFiltrados = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    function ordenarConvites(convites: ConviteComRelacoes[]) {
      return [...convites].sort((a, b) => {
        if (ordenarPor === "status") {
          return a.status.localeCompare(b.status);
        }
        if (ordenarPor === "valor_diaria") {
          return (b.valor_diaria ?? 0) - (a.valor_diaria ?? 0);
        }
        return a.funcionario.nome.localeCompare(b.funcionario.nome, "pt-BR");
      });
    }

    return escala.map((item) => {
      let convites = item.convites;

      if (buscaNormalizada) {
        convites = convites.filter((c) => c.funcionario.nome.toLowerCase().includes(buscaNormalizada));
      }
      if (status !== "todos") {
        convites = convites.filter((c) => c.status === status);
      }

      return { item, convitesExibidos: ordenarConvites(convites) };
    });
  }, [escala, busca, status, ordenarPor]);

  const funcoesVisiveis = filtroAtivo
    ? escalaComConvitesFiltrados.filter(({ convitesExibidos }) => convitesExibidos.length > 0)
    : escalaComConvitesFiltrados;

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
        <>
          <EscalaToolbar
            busca={busca}
            onBuscaChange={setBusca}
            status={status}
            onStatusChange={setStatus}
            ordenarPor={ordenarPor}
            onOrdenarPorChange={setOrdenarPor}
          />

          {funcoesVisiveis.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhum freelancer encontrado"
              description="Ajuste a busca ou o filtro para ver outros freelancers da escala."
            />
          ) : (
            <div className="space-y-3">
              {funcoesVisiveis.map(({ item, convitesExibidos }) => (
                <EscalaFuncaoCard
                  key={item.id}
                  empresaId={empresaId}
                  eventoNome={evento.nome}
                  escala={item}
                  convitesExibidos={convitesExibidos}
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
        </>
      )}
    </div>
  );
}
