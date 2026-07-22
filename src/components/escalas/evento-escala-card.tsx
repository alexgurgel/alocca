"use client";

import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { usePainelEvento } from "@/hooks/use-painel-evento";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import type { Evento } from "@/types";

export function EventoEscalaCard({ evento }: { evento: Evento }) {
  const { painel, carregando } = usePainelEvento(evento.id);
  const percentual =
    painel && painel.previstas > 0
      ? Math.min(100, Math.round((painel.confirmados / painel.previstas) * 100))
      : 0;

  return (
    <Link
      href={`/eventos/${evento.id}?tab=escala`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
          {evento.nome}
        </h3>
        <EventoStatusBadge status={evento.status} />
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5 shrink-0" />
          <span>{formatDateTime(evento.data_inicio)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{evento.local || "Local a definir"}</span>
        </div>
      </div>

      {carregando || !painel ? (
        <Skeleton className="h-2 w-full rounded-full" />
      ) : (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percentual}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {painel.confirmados}/{painel.previstas} vagas confirmadas
          </p>
        </div>
      )}
    </Link>
  );
}
