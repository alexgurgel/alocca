"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, Check, Loader2, MailX, MapPin, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { getConvite, responderConvite } from "@/services/convites.service";
import { formatCurrencyBRL, formatDateTime } from "@/lib/format";
import { STATUS_CONVITE_LABEL, type ConviteComRelacoes } from "@/types";
import { STATUS_CONVITE_TONE } from "@/lib/constants";

export default function ConviteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [convite, setConvite] = useState<ConviteComRelacoes | null | undefined>(undefined);
  const [confirmarRecusa, setConfirmarRecusa] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function carregar() {
    const supabase = createClient();
    const dados = await getConvite(supabase, params.id);
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
      await responderConvite(supabase, convite.id, status);
      toast.success(status === "aceito" ? "Convite aceito!" : "Convite recusado.");
      router.refresh();
      await carregar();
    } catch {
      toast.error("Não foi possível registrar sua resposta.");
    } finally {
      setEnviando(false);
    }
  }

  if (convite === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (convite === null || !convite.evento) {
    return (
      <EmptyState
        icon={MailX}
        title="Convite não encontrado"
        action={
          <Link href="/meus-convites" className="text-sm font-medium text-primary hover:underline">
            Voltar para meus convites
          </Link>
        }
      />
    );
  }

  const evento = convite.evento;
  const enderecoBusca = evento.endereco || evento.local;
  const mapaUrl = enderecoBusca
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title={evento.nome} />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {convite.funcao.nome}
          </span>
          <StatusBadge
            label={STATUS_CONVITE_LABEL[convite.status]}
            tone={STATUS_CONVITE_TONE[convite.status]}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {evento.local || "Local a definir"}
              </p>
              {evento.endereco ? (
                <p className="text-sm text-muted-foreground">{evento.endereco}</p>
              ) : null}
              {mapaUrl ? (
                <a
                  href={mapaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Ver no mapa
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatDateTime(evento.data_inicio)}
              </p>
              <p className="text-sm text-muted-foreground">até {formatDateTime(evento.data_fim)}</p>
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

          {convite.observacoes || evento.observacoes ? (
            <div className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
              {convite.observacoes || evento.observacoes}
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
  );
}
