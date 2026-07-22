import { cn } from "@/lib/utils";
import { STATUS_EVENTO_LABEL } from "@/types";
import { STATUS_EVENTO_TONE, TONE_BG_SOLID } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { EventosPorStatusItem } from "@/services/relatorios.service";

export function EventosPorStatusList({
  dados,
  carregando,
}: {
  dados: EventosPorStatusItem[];
  carregando?: boolean;
}) {
  if (carregando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  const total = dados.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <div className="space-y-3">
      {dados.map((item) => {
        const percentual = total > 0 ? (item.quantidade / total) * 100 : 0;
        const tone = STATUS_EVENTO_TONE[item.status];
        return (
          <div key={item.status}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-foreground">
                <span className={cn("inline-block size-2 rounded-full", TONE_BG_SOLID[tone])} />
                {STATUS_EVENTO_LABEL[item.status]}
              </span>
              <span className="text-muted-foreground">{item.quantidade}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", TONE_BG_SOLID[tone])}
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
