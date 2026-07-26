"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CalendarX2,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { useAppContext } from "@/components/providers/app-provider";
import { usePainelEvento } from "@/hooks/use-painel-evento";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import { PainelControle } from "@/components/eventos/painel-controle";
import { InscricaoPublicaCard } from "@/components/eventos/inscricao-publica-card";
import { EscalaTab } from "@/components/escalas/escala-tab";
import { CheckinList } from "@/components/checkin/checkin-list";
import { createClient } from "@/lib/supabase/client";
import { deleteEvento, getEvento } from "@/services/eventos.service";
import { formatDateTime } from "@/lib/format";
import type { Evento } from "@/types";

export default function EventoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { perfil } = useAppContext();

  const [evento, setEvento] = useState<Evento | null | undefined>(undefined);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const { painel, carregando: carregandoPainel } = usePainelEvento(evento?.id);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();
    getEvento(supabase, params.id).then((dados) => {
      if (ativo) setEvento(dados);
    });
    return () => {
      ativo = false;
    };
  }, [params.id]);

  async function handleExcluir() {
    if (!evento) return;
    try {
      const supabase = createClient();
      await deleteEvento(supabase, evento.id);
      toast.success("Evento removido.");
      router.push("/eventos");
    } catch {
      toast.error("Não foi possível remover o evento.");
    }
  }

  if (evento === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (evento === null) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Evento não encontrado"
        action={
          <Link href="/eventos" className="text-sm font-medium text-primary hover:underline">
            Voltar para eventos
          </Link>
        }
      />
    );
  }

  const enderecoBusca = evento.endereco || evento.local;
  const mapaUrl = enderecoBusca
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={evento.nome}
        actions={
          <>
            <Button variant="outline" render={<Link href={`/eventos/${evento.id}/editar`} />}>
              <Pencil />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => setConfirmarExcluir(true)}
            >
              <Trash2 />
              Excluir
            </Button>
          </>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <EventoStatusBadge status={evento.status} />
          {evento.cliente ? (
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <User className="size-3.5" />
              {evento.cliente}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDateTime(evento.data_inicio)} — {formatDateTime(evento.data_fim)}
          </span>
        </div>

        {evento.local || evento.endereco ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span>{[evento.local, evento.endereco].filter(Boolean).join(" · ")}</span>
            {mapaUrl ? (
              <a
                href={mapaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Ver no mapa
              </a>
            ) : null}
          </div>
        ) : null}

        {evento.observacoes ? (
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
            {evento.observacoes}
          </p>
        ) : null}
      </div>

      <Tabs defaultValue={searchParams.get("tab") ?? "visao-geral"}>
        <TabsList>
          <TabsTrigger value="visao-geral">Visão geral</TabsTrigger>
          <TabsTrigger value="escala">Escala</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 pt-4">
          <InscricaoPublicaCard evento={evento} onAtualizado={setEvento} />
          <PainelControle painel={painel} carregando={carregandoPainel} />
        </TabsContent>

        <TabsContent value="escala" className="pt-4">
          <EscalaTab empresaId={perfil.empresa_id ?? ""} evento={evento} />
        </TabsContent>

        <TabsContent value="checkin" className="pt-4">
          <CheckinList eventoId={evento.id} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmarExcluir}
        onOpenChange={setConfirmarExcluir}
        title={`Excluir ${evento.nome}?`}
        description="Essa ação removerá também a escala, os convites e os check-ins deste evento."
        confirmLabel="Excluir"
        onConfirm={handleExcluir}
      />
    </div>
  );
}
