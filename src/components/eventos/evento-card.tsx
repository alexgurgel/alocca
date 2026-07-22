import Link from "next/link";
import { CalendarDays, MapPin, User } from "lucide-react";
import type { Evento } from "@/types";
import { EventoStatusBadge } from "./evento-status-badge";
import { formatDateTime } from "@/lib/format";

export function EventoCard({ evento }: { evento: Evento }) {
  return (
    <Link
      href={`/eventos/${evento.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
          {evento.nome}
        </h3>
        <EventoStatusBadge status={evento.status} />
      </div>

      <div className="space-y-1.5 text-sm text-muted-foreground">
        {evento.cliente ? (
          <div className="flex items-center gap-2">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{evento.cliente}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{evento.local || "Local a definir"}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-3.5 shrink-0" />
          <span>{formatDateTime(evento.data_inicio)}</span>
        </div>
      </div>
    </Link>
  );
}
