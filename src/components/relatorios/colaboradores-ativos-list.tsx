import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/format";
import { Trophy } from "lucide-react";
import type { ColaboradorAtivoItem } from "@/services/relatorios.service";

export function ColaboradoresAtivosList({
  dados,
  carregando,
}: {
  dados: ColaboradorAtivoItem[];
  carregando?: boolean;
}) {
  if (carregando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (dados.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Nenhum evento confirmado ainda"
        description="O ranking aparece assim que colaboradores aceitarem convites."
      />
    );
  }

  const maior = dados[0]?.eventosConfirmados ?? 1;

  return (
    <ul className="space-y-3">
      {dados.map((item, index) => (
        <li key={item.funcionarioId} className="flex items-center gap-3">
          <span className="w-4 text-xs font-medium text-muted-foreground">{index + 1}</span>
          <Avatar className="size-8">
            <AvatarImage src={item.fotoUrl ?? undefined} alt={item.nome} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(item.nome)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{item.nome}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.eventosConfirmados / maior) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-foreground">{item.eventosConfirmados}</span>
        </li>
      ))}
    </ul>
  );
}
