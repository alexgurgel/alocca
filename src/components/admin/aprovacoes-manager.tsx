"use client";

import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataField } from "@/components/shared/data-field";
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
import type { PerfilComEmpresa } from "@/services/perfis.service";

export function AprovacoesManager({ currentUserId }: { currentUserId: string }) {
  const {
    perfis,
    carregando,
    aprovar,
    recusar,
    atualizarPlano,
    atualizarAtivo,
    atualizarVencimento,
    atualizarLimiteUsuarios,
  } = usePerfisAdmin();
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
            Ajuste plano, acessos, inativação e vencimento de cada produtora cadastrada.
            Contas com plano Admin têm acesso vitalício e não sofrem essas restrições.
          </p>
        </div>

        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {perfis.map((perfil) => (
            <PerfilRow
              key={perfil.id}
              perfil={perfil}
              currentUserId={currentUserId}
              onAtualizarPlano={atualizarPlano}
              onAtualizarAtivo={atualizarAtivo}
              onAtualizarVencimento={atualizarVencimento}
              onAtualizarLimiteUsuarios={atualizarLimiteUsuarios}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

interface PerfilRowProps {
  perfil: PerfilComEmpresa;
  currentUserId: string;
  onAtualizarPlano: (id: string, plano: PlanoAcesso) => void;
  onAtualizarAtivo: (id: string, ativo: boolean) => void;
  onAtualizarVencimento: (id: string, dataVencimento: string | null) => void;
  onAtualizarLimiteUsuarios: (empresaId: string, limite: number) => void;
}

function PerfilRow({
  perfil,
  currentUserId,
  onAtualizarPlano,
  onAtualizarAtivo,
  onAtualizarVencimento,
  onAtualizarLimiteUsuarios,
}: PerfilRowProps) {
  const [limiteInput, setLimiteInput] = useState(String(perfil.empresa?.limite_usuarios ?? 1));
  const ehAdminPlataforma = perfil.plano === "admin";

  function salvarLimite() {
    const empresa = perfil.empresa;
    if (!empresa) return;
    const novoLimite = Number(limiteInput);
    if (!Number.isInteger(novoLimite) || novoLimite < 1) {
      setLimiteInput(String(empresa.limite_usuarios));
      return;
    }
    if (novoLimite !== empresa.limite_usuarios) {
      onAtualizarLimiteUsuarios(empresa.id, novoLimite);
    }
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge
          label={STATUS_CONTA_LABEL[perfil.status_conta]}
          tone={STATUS_CONTA_TONE[perfil.status_conta]}
        />

        <Select
          items={PLANO_LABEL}
          value={perfil.plano}
          onValueChange={(v: PlanoAcesso | null) => v && onAtualizarPlano(perfil.id, v)}
          disabled={perfil.id === currentUserId}
        >
          <SelectTrigger className="w-36">
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

        {!ehAdminPlataforma ? (
          <>
            <label className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">
              Ativo
              <Switch
                checked={perfil.ativo}
                onCheckedChange={(v) => onAtualizarAtivo(perfil.id, v)}
              />
            </label>

            <DataField
              value={perfil.data_vencimento}
              onChange={(v) => onAtualizarVencimento(perfil.id, v)}
              placeholder="Sem vencimento"
            />
          </>
        ) : null}

        {perfil.empresa ? (
          <label className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">
            Acessos
            <Input
              type="number"
              min={1}
              value={limiteInput}
              onChange={(e) => setLimiteInput(e.target.value)}
              onBlur={salvarLimite}
              className="h-6 w-12 border-0 p-0 text-center text-foreground"
            />
          </label>
        ) : null}
      </div>
    </li>
  );
}
