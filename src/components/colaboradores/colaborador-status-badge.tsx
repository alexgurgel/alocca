import { StatusBadge } from "@/components/shared/status-badge";
import { STATUS_FUNCIONARIO_LABEL, type StatusFuncionario } from "@/types";
import { STATUS_FUNCIONARIO_TONE } from "@/lib/constants";

export function ColaboradorStatusBadge({ status }: { status: StatusFuncionario }) {
  return (
    <StatusBadge label={STATUS_FUNCIONARIO_LABEL[status]} tone={STATUS_FUNCIONARIO_TONE[status]} />
  );
}
