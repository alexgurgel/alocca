"use client";

import { useState } from "react";
import { Mail, MessageCircle, Minus, Plus, Trash2, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ConvidarColaboradorDialog } from "./convidar-colaborador-dialog";
import { getInitials, formatCurrencyBRL } from "@/lib/format";
import { getLinkConvite, getLinkEmail, getLinkWhatsApp, mensagemConvite } from "@/lib/convite-links";
import { STATUS_CONVITE_LABEL, type EscalaFuncao } from "@/types";
import { STATUS_CONVITE_TONE } from "@/lib/constants";
import type { ConvidarColaboradorInput } from "@/lib/validations/escala.schema";

interface EscalaFuncaoCardProps {
  empresaId: string;
  eventoNome: string;
  escala: EscalaFuncao;
  valorPadrao?: number | null;
  onAtualizarVagas: (id: string, vagas: number) => Promise<void>;
  onRemoverFuncao: (id: string) => Promise<void>;
  onConvidar: (funcaoId: string, input: ConvidarColaboradorInput) => Promise<void>;
  onCancelarConvite: (conviteId: string) => Promise<void>;
}

export function EscalaFuncaoCard({
  empresaId,
  eventoNome,
  escala,
  valorPadrao,
  onAtualizarVagas,
  onRemoverFuncao,
  onConvidar,
  onCancelarConvite,
}: EscalaFuncaoCardProps) {
  const [confirmarRemover, setConfirmarRemover] = useState(false);
  const preenchidas = escala.convites.filter((c) => c.status === "aceito").length;

  async function copiarLink(conviteId: string) {
    const link = getLinkConvite(conviteId);
    await navigator.clipboard.writeText(link);
    toast.success("Link do convite copiado.");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{escala.funcao.nome}</h4>
          <p className="text-xs text-muted-foreground">
            {preenchidas} de {escala.vagas} vaga{escala.vagas === 1 ? "" : "s"} preenchida
            {preenchidas === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onAtualizarVagas(escala.id, Math.max(1, escala.vagas - 1))}
              disabled={escala.vagas <= 1}
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium">{escala.vagas}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onAtualizarVagas(escala.id, escala.vagas + 1)}
            >
              <Plus className="size-3.5" />
            </Button>
          </div>

          <ConvidarColaboradorDialog
            empresaId={empresaId}
            funcaoNome={escala.funcao.nome}
            idsJaConvidados={escala.convites.map((c) => c.funcionario_id)}
            valorPadrao={valorPadrao}
            onConvidar={(input) => onConvidar(escala.funcao_id, input)}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmarRemover(true)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {escala.convites.length > 0 ? (
        <ul className="mt-4 divide-y divide-border border-t border-border">
          {escala.convites.map((convite) => (
            <li key={convite.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarImage src={convite.funcionario.foto_url ?? undefined} alt={convite.funcionario.nome} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(convite.funcionario.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {convite.funcionario.nome}
                  </p>
                  {convite.valor_diaria ? (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyBRL(convite.valor_diaria)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <StatusBadge
                  label={STATUS_CONVITE_LABEL[convite.status]}
                  tone={STATUS_CONVITE_TONE[convite.status]}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Copiar link do convite"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => copiarLink(convite.id)}
                >
                  <Link2 className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Enviar por WhatsApp"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={!convite.funcionario.telefone}
                  render={
                    <a
                      href={
                        getLinkWhatsApp(
                          convite.funcionario.telefone,
                          mensagemConvite(eventoNome, getLinkConvite(convite.id))
                        ) ?? undefined
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <MessageCircle className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Enviar por e-mail"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  disabled={!convite.funcionario.email}
                  render={
                    <a
                      href={
                        getLinkEmail(
                          convite.funcionario.email,
                          eventoNome,
                          mensagemConvite(eventoNome, getLinkConvite(convite.id))
                        ) ?? undefined
                      }
                    />
                  }
                >
                  <Mail className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => onCancelarConvite(convite.id)}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Nenhum colaborador convidado para esta função ainda.
        </p>
      )}

      <ConfirmDialog
        open={confirmarRemover}
        onOpenChange={setConfirmarRemover}
        title={`Remover ${escala.funcao.nome} da escala?`}
        description="Todos os convites enviados para esta função também serão removidos."
        confirmLabel="Remover"
        onConfirm={() => onRemoverFuncao(escala.id)}
      />
    </div>
  );
}
