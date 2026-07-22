import { StatusBadge } from "@/components/shared/status-badge";
import { STATUS_EVENTO_LABEL, type StatusEvento } from "@/types";
import { STATUS_EVENTO_TONE } from "@/lib/constants";

export function EventoStatusBadge({ status }: { status: StatusEvento }) {
  return <StatusBadge label={STATUS_EVENTO_LABEL[status]} tone={STATUS_EVENTO_TONE[status]} />;
}
