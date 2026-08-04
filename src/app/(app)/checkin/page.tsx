"use client";

import Link from "next/link";
import { QrCode } from "lucide-react";
import { CalendarDays, MapPin } from "lucide-react";

import { useAppContext } from "@/components/providers/app-provider";
import { useEventos } from "@/hooks/use-eventos";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { PlanoBloqueado } from "@/components/shared/plano-bloqueado";
import { EventosToolbar } from "@/components/eventos/eventos-toolbar";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { PLANOS_COM_CHECKIN } from "@/types";

export default function CheckinLandingPage() {
  const { perfil } = useAppContext();
  const temAcesso = PLANOS_COM_CHECKIN.includes(perfil.plano);
  const {
    dados,
    total,
    carregando,
    busca,
    setBusca,
    status,
    setStatus,
    pagina,
    setPagina,
    porPagina,
  } = useEventos(temAcesso ? (perfil.empresa_id ?? undefined) : undefined);

  if (!temAcesso) {
    return (
      <div className="space-y-6">
        <PageHeader title="Check-in" description="Selecione o evento para confirmar a presença da equipe." />
        <PlanoBloqueado planoAtual={perfil.plano} planoNecessario="Intermediário" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Check-in" description="Selecione o evento para confirmar a presença da equipe." />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <EventosToolbar busca={busca} onBuscaChange={setBusca} status={status} onStatusChange={setStatus} />
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : dados.length === 0 ? (
        <EmptyState icon={QrCode} title="Nenhum evento encontrado" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dados.map((evento) => (
            <Link
              key={evento.id}
              href={`/eventos/${evento.id}?tab=checkin`}
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
            </Link>
          ))}
        </div>
      )}

      {dados.length > 0 ? (
        <PaginationBar pagina={pagina} porPagina={porPagina} total={total} onChange={setPagina} />
      ) : null}
    </div>
  );
}
