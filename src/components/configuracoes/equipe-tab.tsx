"use client";

import { Mail, Trash2, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConvidarUsuarioDialog } from "./convidar-usuario-dialog";
import { useEquipe } from "@/hooks/use-equipe";
import { getInitials } from "@/lib/format";
import type { Empresa } from "@/types";

export function EquipeTab({ empresa }: { empresa: Empresa }) {
  const { membros, convitesPendentes, carregando, convidar, cancelar } = useEquipe(empresa.id);

  const ocupados = membros.length + convitesPendentes.length;
  const semVagas = ocupados >= empresa.limite_usuarios;

  if (carregando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Equipe</h3>
          <p className="text-xs text-muted-foreground">
            {ocupados} de {empresa.limite_usuarios} acesso{empresa.limite_usuarios === 1 ? "" : "s"} em uso.
          </p>
        </div>
        <ConvidarUsuarioDialog onConvidar={convidar} disabled={semVagas} />
      </div>

      {semVagas ? (
        <p className="text-xs text-muted-foreground">
          Sua conta atingiu o limite de usuários. Fale com o administrador da Alocca para liberar
          mais acessos.
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {membros.map((membro) => (
            <li key={membro.id} className="flex items-center gap-3 p-4">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(membro.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{membro.nome}</p>
                <p className="truncate text-xs text-muted-foreground">{membro.email}</p>
              </div>
            </li>
          ))}

          {convitesPendentes.map((convite) => (
            <li key={convite.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{convite.email}</p>
                  <p className="text-xs text-muted-foreground">Convite pendente</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => cancelar(convite.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>

        {membros.length === 0 && convitesPendentes.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário na equipe ainda" />
        ) : null}
      </div>
    </div>
  );
}
