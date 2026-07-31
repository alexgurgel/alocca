"use client";

import { UserRoundCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckinStatusButtons } from "./checkin-status-buttons";
import { useCheckin } from "@/hooks/use-checkin";
import { getInitials } from "@/lib/format";
import { STATUS_CHECKIN_LABEL } from "@/types";

export function CheckinList({ eventoId }: { eventoId: string }) {
  const { checkins, carregando, marcarStatus } = useCheckin(eventoId);

  const contagem = {
    presente: checkins.filter((c) => c.status === "presente").length,
    atrasado: checkins.filter((c) => c.status === "atrasado").length,
    ausente: checkins.filter((c) => c.status === "ausente").length,
    pendente: checkins.filter((c) => c.status === "pendente").length,
  };

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
        icon={UserRoundCheck}
        title="Nenhum freelancer convocado"
        description="Convide freelancers na escala do evento para que apareçam aqui no dia do check-in."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">
          Presentes <span className="font-semibold text-foreground">{contagem.presente}</span>
        </span>
        <span className="text-muted-foreground">
          Atrasados <span className="font-semibold text-foreground">{contagem.atrasado}</span>
        </span>
        <span className="text-muted-foreground">
          Ausentes <span className="font-semibold text-foreground">{contagem.ausente}</span>
        </span>
        <span className="text-muted-foreground">
          Pendentes <span className="font-semibold text-foreground">{contagem.pendente}</span>
        </span>
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
        {checkins.map((checkin) => (
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
                  {checkin.status === "pendente"
                    ? "Aguardando check-in"
                    : STATUS_CHECKIN_LABEL[checkin.status]}
                </p>
              </div>
            </div>

            <CheckinStatusButtons
              status={checkin.status}
              onChange={(status) => marcarStatus(checkin.id, status)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
