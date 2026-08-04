import { Lock } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PLANO_LABEL, type PlanoAcesso } from "@/types";

export function PlanoBloqueado({
  planoAtual,
  planoNecessario,
}: {
  planoAtual: PlanoAcesso;
  planoNecessario: "Intermediário" | "Master";
}) {
  return (
    <EmptyState
      icon={Lock}
      title={`Disponível a partir do plano ${planoNecessario}`}
      description={`Seu plano atual (${PLANO_LABEL[planoAtual]}) não inclui esse recurso. Fale com o administrador da Alocca para fazer upgrade.`}
    />
  );
}
