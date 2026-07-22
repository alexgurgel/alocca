import { CalendarRange, CheckCircle2, Clock, UserCheck, UserX, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CapacidadeMeter } from "./capacidade-meter";
import type { PainelEvento } from "@/services/painel-evento.service";

const ITENS = [
  { key: "previstas", label: "Vagas previstas", icon: CalendarRange, tone: "text-primary" },
  { key: "confirmados", label: "Confirmados", icon: CheckCircle2, tone: "text-[var(--success)]" },
  { key: "pendentes", label: "Pendentes", icon: Clock, tone: "text-[var(--warning)]" },
  { key: "recusados", label: "Recusados", icon: XCircle, tone: "text-destructive" },
  { key: "presentes", label: "Presentes", icon: UserCheck, tone: "text-[var(--success)]" },
  { key: "ausentes", label: "Ausentes", icon: UserX, tone: "text-destructive" },
] as const;

export function PainelControle({
  painel,
  carregando,
}: {
  painel: PainelEvento | null;
  carregando: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Painel de controle</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {ITENS.map((item) => (
          <div key={item.key} className="rounded-xl border border-border bg-muted/30 p-3">
            <item.icon className={`mb-2 size-4 ${item.tone}`} />
            {carregando || !painel ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="text-xl font-semibold text-foreground">{painel[item.key]}</p>
            )}
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        {carregando || !painel ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <CapacidadeMeter painel={painel} />
        )}
      </div>
    </div>
  );
}
