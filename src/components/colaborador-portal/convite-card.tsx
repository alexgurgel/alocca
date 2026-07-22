import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { STATUS_CONVITE_LABEL, type ConviteComRelacoes } from "@/types";
import { STATUS_CONVITE_TONE } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export function ConviteCard({ convite }: { convite: ConviteComRelacoes }) {
  return (
    <Link
      href={`/meus-convites/${convite.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-foreground">{convite.evento?.nome}</h3>
        <StatusBadge
          label={STATUS_CONVITE_LABEL[convite.status]}
          tone={STATUS_CONVITE_TONE[convite.status]}
        />
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {convite.funcao.nome}
          </span>
        </div>
        {convite.evento ? (
          <>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-3.5 shrink-0" />
              <span>{formatDateTime(convite.evento.data_inicio)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">{convite.evento.local || "Local a definir"}</span>
            </div>
          </>
        ) : null}
      </div>
    </Link>
  );
}
