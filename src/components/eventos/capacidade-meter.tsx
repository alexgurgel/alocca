import { CheckCircle2, CircleDashed, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PainelEvento } from "@/services/painel-evento.service";

export function CapacidadeMeter({ painel }: { painel: PainelEvento }) {
  const { previstas, confirmados, recusados, pendentes } = painel;
  const preenchidas = confirmados + recusados + pendentes;
  const restantes = Math.max(previstas - preenchidas, 0);
  const total = previstas > 0 ? previstas : Math.max(preenchidas, 1);

  const segmentos = [
    { key: "confirmados", valor: confirmados, className: "bg-[var(--success)]" },
    { key: "pendentes", valor: pendentes, className: "bg-[var(--warning)]" },
    { key: "recusados", valor: recusados, className: "bg-destructive" },
    { key: "restantes", valor: restantes, className: "bg-muted" },
  ];

  const percentualPreenchido = total > 0 ? Math.round((confirmados / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm font-medium text-foreground">Capacidade da escala</p>
        <p className="text-sm text-muted-foreground">
          {confirmados}/{previstas || preenchidas} confirmados · {percentualPreenchido}%
        </p>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {segmentos.map((seg) =>
          seg.valor > 0 ? (
            <div
              key={seg.key}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", seg.className)}
              style={{ width: `${(seg.valor / total) * 100}%` }}
            />
          ) : null
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-[var(--success)]" />
          Confirmados <span className="font-medium text-foreground">{confirmados}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-[var(--warning)]" />
          Pendentes <span className="font-medium text-foreground">{pendentes}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <XCircle className="size-3.5 text-destructive" />
          Recusados <span className="font-medium text-foreground">{recusados}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <CircleDashed className="size-3.5" />
          Vagas restantes <span className="font-medium text-foreground">{restantes}</span>
        </span>
      </div>
    </div>
  );
}
