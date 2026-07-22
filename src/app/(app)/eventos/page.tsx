"use client";

import Link from "next/link";
import { CalendarX2, Plus } from "lucide-react";

import { useAppContext } from "@/components/providers/app-provider";
import { useEventos } from "@/hooks/use-eventos";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { EventosToolbar } from "@/components/eventos/eventos-toolbar";
import { EventoCard } from "@/components/eventos/evento-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventosPage() {
  const { perfil } = useAppContext();
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
  } = useEventos(perfil.empresa_id ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Eventos"
        description="Planeje e acompanhe todos os eventos da sua produtora."
        actions={
          <Button render={<Link href="/eventos/novo" />}>
            <Plus />
            Novo evento
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <EventosToolbar busca={busca} onBuscaChange={setBusca} status={status} onStatusChange={setStatus} />
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : dados.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Nenhum evento encontrado"
          description="Ajuste os filtros ou cadastre o primeiro evento da sua operação."
          action={
            <Button render={<Link href="/eventos/novo" />}>
              <Plus />
              Novo evento
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dados.map((evento) => (
            <EventoCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}

      {dados.length > 0 ? (
        <PaginationBar pagina={pagina} porPagina={porPagina} total={total} onChange={setPagina} />
      ) : null}
    </div>
  );
}
