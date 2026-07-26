"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Check, Loader2, MailX, MapPin, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { getContePublico, responderContePublico, type ContePublico } from "@/services/convites.service";
import { formatCurrencyBRL, formatDateTime } from "@/lib/format";
import { STATUS_CONVITE_LABEL } from "@/types";
import { STATUS_CONVITE_TONE } from "@/lib/constants";

export default function ConvitePublicoPage() {
  const params = useParams<{ id: string }>();
  const [convite, setConvite] = useState<ContePublico | null | undefined>(undefined);
  const [confirmarRecusa, setConfirmarRecusa] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function carregar() {
    const supabase = createClient();
    const dados = await getContePublico(supabase, params.id);
    setConvite(dados);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function responder(status: "aceito" | "recusado") {
    if (!convite) return;
    setEnviando(true);
    try {
      const supabase = createClient();
      await responderContePublico(supabase, convite.id, status);
      toast.success(status === "aceito" ? "Convite aceito!" : "Convite recusado.");
      await carregar();
    } catch {
      toast.error("Não foi possível registrar sua resposta.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-md">
        {convite === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : convite === null ? (
          <EmptyState icon={MailX} title="Convite não encontrado ou inválido" />
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {convite.evento_nome}
                </h2>
                <StatusBadge
                  label={STATUS_CONVITE_LABEL[convite.status]}
                  tone={STATUS_CONVITE_TONE[convite.status]}
                />
              </div>

              <span className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {convite.funcao_nome}
              </span>

              <div className="mt-4 space-y-4">
                {convite.evento_local || convite.evento_endereco ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {convite.evento_local || "Local a definir"}
                      </p>
                      {convite.evento_endereco ? (
                        <p className="text-sm text-muted-foreground">{convite.evento_endereco}</p>
                      ) : null}
                      {convite.evento_endereco || convite.evento_local ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            convite.evento_endereco || convite.evento_local || ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Ver no mapa
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatDateTime(convite.evento_data_inicio)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      até {formatDateTime(convite.evento_data_fim)}
                    </p>
                  </div>
                </div>

                {convite.valor_diaria ? (
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrencyBRL(convite.valor_diaria)} / diária
                    </p>
                  </div>
                ) : null}

                {convite.observacoes || convite.evento_observacoes ? (
                  <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                    {convite.observacoes || convite.evento_observacoes}
                  </div>
                ) : null}
              </div>
            </div>

            {convite.status === "pendente" ? (
              <div className="flex gap-3">
                <Button className="flex-1" disabled={enviando} onClick={() => responder("aceito")}>
                  {enviando ? <Loader2 className="size-4 animate-spin" /> : <Check />}
                  Aceitar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={enviando}
                  onClick={() => setConfirmarRecusa(true)}
                >
                  <X />
                  Recusar
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Você já respondeu este convite ({STATUS_CONVITE_LABEL[convite.status].toLowerCase()}).
              </p>
            )}

            <ConfirmDialog
              open={confirmarRecusa}
              onOpenChange={setConfirmarRecusa}
              title="Recusar este convite?"
              description="O produtor será notificado de que você não poderá participar deste evento."
              confirmLabel="Recusar convite"
              onConfirm={() => responder("recusado")}
            />
          </div>
        )}
      </div>
    </div>
  );
}
