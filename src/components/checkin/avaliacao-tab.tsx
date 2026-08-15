"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardCheck, Search, Star, ThumbsUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AvaliacaoButtons } from "./avaliacao-buttons";
import { useCheckin } from "@/hooks/use-checkin";
import { getInitials } from "@/lib/format";
import { AVALIACAO_LABEL } from "@/types";

export function AvaliacaoTab({ eventoId }: { eventoId: string }) {
  const { checkins, carregando, marcarAvaliacao, avaliarTodos } = useCheckin(eventoId);
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return checkins;
    return checkins.filter((c) => c.funcionario.nome.toLowerCase().includes(termo));
  }, [checkins, busca]);

  const avaliados = checkins.filter((c) => c.avaliacao !== null).length;

  if (carregando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (checkins.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Nenhum freelancer para avaliar"
        description="Assim que houver freelancers confirmados, eles aparecem aqui para avaliação."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar freelancer pelo nome..."
            className="pl-8"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {avaliados} de {checkins.length} avaliado{checkins.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Avaliar todos de uma vez</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => avaliarTodos("recomendo")}>
            <Star className="text-[var(--success)]" />
            {AVALIACAO_LABEL.recomendo}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => avaliarTodos("ok")}>
            <ThumbsUp className="text-[var(--warning)]" />
            {AVALIACAO_LABEL.ok}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => avaliarTodos("nao_recomendo")}>
            <AlertTriangle className="text-destructive" />
            {AVALIACAO_LABEL.nao_recomendo}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Aplica a mesma avaliação a todos — depois é só ajustar individualmente quem for diferente.
        </p>
      </div>

      {filtrados.length === 0 ? (
        <EmptyState icon={Search} title="Nenhum freelancer encontrado" description="Ajuste a busca." />
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {filtrados.map((checkin) => (
            <li key={checkin.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={checkin.funcionario.foto_url ?? undefined} alt={checkin.funcionario.nome} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(checkin.funcionario.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{checkin.funcionario.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {checkin.avaliacao ? AVALIACAO_LABEL[checkin.avaliacao] : "Ainda não avaliado"}
                  </p>
                </div>
              </div>
              <AvaliacaoButtons
                avaliacao={checkin.avaliacao}
                onChange={(avaliacao) => marcarAvaliacao(checkin.id, avaliacao)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
