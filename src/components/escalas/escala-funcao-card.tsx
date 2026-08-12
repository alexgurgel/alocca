"use client";

import { useState } from "react";
import { Check, Mail, MessageCircle, Minus, Plus, Trash2, X, Link2 } from "lucide-react";
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
  onAtualizarVagas: (id: string, vagas: number) => Promise<void>;
  onAtualizarValorDiaria: (id: string, valorDiaria: number) => Promise<void>;
  onRemoverFuncao: (id: string) => Promise<void>;
  onConvidar: (funcaoId: string, input: ConvidarColaboradorInput) => Promise<void>;
  onCancelarConvite: (conviteId: string) => Promise<void>;
  onAvaliarCandidatura: (
    conviteId: string,
    status: "aceito" | "recusado",
    valorDiariaFuncao: number | null
  ) => Promise<void>;
}

export function EscalaFuncaoCard({
  empresaId,
  eventoNome,
  escala,
  onAtualizarVagas,
  onAtualizarValorDiaria,
  onRemoverFuncao,
  onConvidar,
  onCancelarConvite,
  onAvaliarCandidatura,
}: EscalaFuncaoCardProps) {
  const [confirmarRemover, setConfirmarRemover] = useState(false);
  const [valorDiariaInput, setValorDiariaInput] = useState(
    escala.valor_diaria != null ? String(escala.valor_diaria) : ""
  );
  const preenchidas = escala.convites.filter((c) => c.status === "aceito").length;

  async function copiarLink(conviteId: string) {
    const link = getLinkConvite(conviteId);
    await navigator.clipboard.writeText(link);
    toast.success("Link do convite copiado.");
  }

  function salvarValorDiaria() {
    const novoValor = Number(valorDiariaInput);
    if (!novoValor || novoValor <= 0) {
      setValorDiariaInput(escala.valor_diaria != null ? String(escala.valor_diaria) : "");
      return;
    }
    if (novoValor !== escala.valor_diaria) {
      onAtualizarValorDiaria(escala.id, novoValor);
    }
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

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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

          <label className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-sm text-muted-foreground">
            R$
            <input
              type="number"
              step="0.01"
              min="0"
              value={valorDiariaInput}
              onChange={(e) => setValorDiariaInput(e.target.value)}
              onBlur={salvarValorDiaria}
              placeholder="0,00"
              className="w-16 bg-transparent text-right text-foreground outline-none"
            />
            <span className="text-xs">/diária</span>
          </label>

          <ConvidarColaboradorDialog
            empresaId={empresaId}
            funcaoNome={escala.funcao.nome}
            idsJaConvidados={escala.convites.map((c) => c.funcionario_id)}
            valorPadrao={escala.valor_diaria}
            vagasPreenchidas={preenchidas >= escala.vagas}
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
            <li key={convite.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarImage src={convite.funcionario.foto_url ?? undefined} alt={convite.funcionario.nome} />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(convite.funcionario.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {convite.funcionario.nome}
                    </p>
                    {convite.origem === "candidatura" ? (
                      <span className="shrink-0 rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-600 dark:text-cyan-400">
                        Candidatura
                      </span>
                    ) : null}
                  </div>
                  {convite.valor_diaria ? (
                    <p className="text-xs text-muted-foreground">
                      {formatCurrencyBRL(convite.valor_diaria)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap shrink-0 items-center gap-1.5">
                <StatusBadge
                  label={STATUS_CONVITE_LABEL[convite.status]}
                  tone={STATUS_CONVITE_TONE[convite.status]}
                />

                {convite.origem === "candidatura" && convite.status === "pendente" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onAvaliarCandidatura(convite.id, "aceito", escala.valor_diaria)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--success)] bg-[var(--success)] px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                    >
                      <Check className="size-3.5" />
                      Aceitar
                    </button>
                    <button
                      type="button"
                      onClick={() => onAvaliarCandidatura(convite.id, "recusado", null)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive bg-destructive px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90"
                    >
                      <X className="size-3.5" />
                      Recusar
                    </button>
                  </>
                ) : null}

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

                {!(convite.origem === "candidatura" && convite.status === "pendente") ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Remover"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => onCancelarConvite(convite.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          Nenhum freelancer convidado para esta função ainda.
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
