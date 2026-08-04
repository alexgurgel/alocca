"use client";

import { Check, ShieldCheck, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePerfisAdmin } from "@/hooks/use-perfis-admin";
import { getInitials, formatDate } from "@/lib/format";
import { STATUS_CONTA_TONE } from "@/lib/constants";
import { PLANO_LABEL, STATUS_CONTA_LABEL, type PlanoAcesso } from "@/types";

export function AprovacoesManager({ currentUserId }: { currentUserId: string }) {
  const { perfis, carregando, aprovar, recusar, atualizarPlano } = usePerfisAdmin();
  const pendentes = perfis.filter((p) => p.status_conta === "pendente");

  if (carregando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pendentes de aprovação</h3>
          <p className="text-xs text-muted-foreground">
            Novos cadastros de produtoras ficam aqui até serem aprovados.
          </p>
        </div>

        {pendentes.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nenhuma solicitação pendente" />
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {pendentes.map((perfil) => (
              <li key={perfil.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(perfil.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{perfil.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {perfil.empresa?.nome ?? "—"} · {perfil.email} · cadastrado em{" "}
                      {formatDate(perfil.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => aprovar(perfil.id, currentUserId)}>
                    <Check />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => recusar(perfil.id, currentUserId)}
                  >
                    <X />
                    Recusar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Todos os perfis</h3>
          <p className="text-xs text-muted-foreground">
            Ajuste o plano de acesso de cada produtora cadastrada.
          </p>
        </div>

        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {perfis.map((perfil) => (
            <li key={perfil.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(perfil.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{perfil.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {perfil.empresa?.nome ?? "—"} · {perfil.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={STATUS_CONTA_LABEL[perfil.status_conta]}
                  tone={STATUS_CONTA_TONE[perfil.status_conta]}
                />
                <Select
                  items={PLANO_LABEL}
                  value={perfil.plano}
                  onValueChange={(v: PlanoAcesso | null) => v && atualizarPlano(perfil.id, v)}
                  disabled={perfil.id === currentUserId}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PLANO_LABEL) as PlanoAcesso[]).map((plano) => (
                      <SelectItem key={plano} value={plano}>
                        {PLANO_LABEL[plano]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
