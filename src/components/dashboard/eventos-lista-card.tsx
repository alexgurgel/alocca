import Link from "next/link";
import { CalendarX2, MapPin } from "lucide-react";
import type { Evento } from "@/types";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";

export function EventosListaCard({
  titulo,
  descricao,
  eventos,
  carregando,
  vazio,
}: {
  titulo: string;
  descricao?: string;
  eventos: Evento[];
  carregando?: boolean;
  vazio: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
        {descricao ? <p className="text-xs text-muted-foreground">{descricao}</p> : null}
      </div>

      {carregando ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : eventos.length === 0 ? (
        <EmptyState icon={CalendarX2} title={vazio} />
      ) : (
        <ul className="space-y-1">
          {eventos.map((evento) => (
            <li key={evento.id}>
              <Link
                href={`/eventos/${evento.id}`}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{evento.nome}</p>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    <span className="truncate">{evento.local || "Local a definir"}</span>
                    <span>·</span>
                    <span>{formatDateTime(evento.data_inicio)}</span>
                  </div>
                </div>
                <EventoStatusBadge status={evento.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
