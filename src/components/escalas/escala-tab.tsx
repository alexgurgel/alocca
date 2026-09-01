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

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<EscalaFiltroStatus>("todas");
  const [ordenarPor, setOrdenarPor] = useState<EscalaOrdenacao>("nome");

  const escalaFiltrada = useMemo(() => {
    const buscaNormalizada = busca.trim().toLowerCase();

    const filtrada = escala.filter((item) => {
      if (buscaNormalizada && !item.funcao.nome.toLowerCase().includes(buscaNormalizada)) {
        return false;
      }

      const preenchidas = item.convites.filter((c) => c.status === "aceito").length;
      if (status === "abertas" && preenchidas >= item.vagas) return false;
      if (status === "completas" && preenchidas < item.vagas) return false;
      if (
        status === "pendentes" &&
        !item.convites.some((c) => c.origem === "candidatura" && c.status === "pendente")
      ) {
        return false;
      }

      return true;
    });

    const ordenada = [...filtrada].sort((a, b) => {
      if (ordenarPor === "vagas_preenchidas") {
        const preenchidasA = a.convites.filter((c) => c.status === "aceito").length;
        const preenchidasB = b.convites.filter((c) => c.status === "aceito").length;
        return preenchidasB - preenchidasA;
      }
      if (ordenarPor === "valor_diaria") {
        return (b.valor_diaria ?? 0) - (a.valor_diaria ?? 0);
      }
      return a.funcao.nome.localeCompare(b.funcao.nome, "pt-BR");
    });

    return ordenada;
  }, [escala, busca, status, ordenarPor]);

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

          {escalaFiltrada.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Nenhuma função encontrada"
              description="Ajuste a busca ou o filtro para ver outras funções da escala."
            />
          ) : (
            <div className="space-y-3">
              {escalaFiltrada.map((item) => (
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
        </>
      )}
    </div>
  );
}
