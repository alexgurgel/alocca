"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, ExternalLink, Loader2, RefreshCw, Share2, X } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CANDIDATURA_TONE } from "@/lib/constants";
import { formatDateTime, formatTelefone } from "@/lib/format";
import { STATUS_CANDIDATURA_LABEL, type Evento } from "@/types";
import {
  aprovarCandidaturaEvento,
  listCandidaturasDoEvento,
  rejeitarCandidaturaEvento,
  type CandidaturaEventoAdmin,
} from "@/services/candidaturas.service";

function getCandidaturaUrl(token: string) {
  if (typeof window === "undefined") {
    return `/candidatura/${token}`;
  }

  return `${window.location.origin}/candidatura/${token}`;
}

export function CandidaturasTab({ evento }: { evento: Evento }) {
  const [candidaturas, setCandidaturas] = useState<CandidaturaEventoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);

  const candidaturaUrl = getCandidaturaUrl(evento.candidatura_publica_token);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await listCandidaturasDoEvento(supabase, evento.id);
      setCandidaturas(dados);
    } catch {
      toast.error("Nao foi possivel carregar as candidaturas do evento.");
    } finally {
      setCarregando(false);
    }
  }, [evento.id]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`candidaturas-evento-${evento.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "candidaturas_evento", filter: `evento_id=eq.${evento.id}` },
        () => recarregar()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "convites", filter: `evento_id=eq.${evento.id}` },
        () => recarregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [evento.id, recarregar]);

  const pendentes = useMemo(
    () => candidaturas.filter((candidatura) => candidatura.status === "pendente"),
    [candidaturas]
  );

  const avaliadas = useMemo(
    () => candidaturas.filter((candidatura) => candidatura.status !== "pendente"),
    [candidaturas]
  );

  async function copiarLink() {
    await navigator.clipboard.writeText(candidaturaUrl);
    toast.success("Link de candidatura copiado.");
  }

  async function aprovar(candidaturaId: string) {
    try {
      setProcessandoId(candidaturaId);
      const supabase = createClient();
      await aprovarCandidaturaEvento(supabase, candidaturaId);

      const respostaEmail = await fetch(`/api/candidaturas/${candidaturaId}/notificar-confirmacao`, {
        method: "POST",
      });

      const payload = (await respostaEmail.json().catch(() => null)) as { message?: string } | null;

      if (respostaEmail.ok) {
        toast.success("Candidatura aprovada, enviada para a escala e notificada por e-mail.");
      } else {
        toast.success("Candidatura aprovada e enviada para a escala.");
        toast.error(payload?.message || "Aprovacao concluida, mas nao foi possivel enviar o e-mail.");
      }

      await recarregar();
    } catch (error) {
      console.error("Falha ao aprovar candidatura", error);
      toast.error(error instanceof Error ? error.message : "Nao foi possivel aprovar a candidatura.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function rejeitar(candidaturaId: string) {
    try {
      setProcessandoId(candidaturaId);
      const supabase = createClient();
      await rejeitarCandidaturaEvento(supabase, candidaturaId);
      toast.success("Candidatura rejeitada.");
      await recarregar();
    } catch (error) {
      console.error("Falha ao rejeitar candidatura", error);
      toast.error(error instanceof Error ? error.message : "Nao foi possivel rejeitar a candidatura.");
    } finally {
      setProcessandoId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Candidaturas do evento</h3>
          <p className="text-xs text-muted-foreground">
            Compartilhe o link em grupos, receba inscricoes e aprove somente quem deve entrar na escala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={copiarLink}>
            <Share2 />
            Copiar link de candidatura
          </Button>
          <Button
            variant="outline"
            render={<a href={candidaturaUrl} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink />
            Abrir pagina publica
          </Button>
          <Button variant="outline" onClick={recarregar}>
            <RefreshCw />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Pendentes</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{pendentes.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Aprovadas</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {candidaturas.filter((c) => c.status === "aprovada").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Rejeitadas</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {candidaturas.filter((c) => c.status === "rejeitada").length}
          </p>
        </div>
      </div>

      {carregando ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : candidaturas.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma candidatura recebida"
          description="Assim que alguem preencher a pagina publica deste evento, os pedidos vao aparecer aqui."
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 px-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Pendentes de aprovacao</h4>
                <p className="text-xs text-muted-foreground">
                  Ao aprovar, a candidatura vira convite pendente na escala do evento.
                </p>
              </div>
            </div>

            {pendentes.length === 0 ? (
              <p className="px-2 pb-2 text-sm text-muted-foreground">Nenhuma candidatura pendente.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recebido em</TableHead>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Funcao</TableHead>
                    <TableHead className="hidden md:table-cell">Contato</TableHead>
                    <TableHead className="hidden lg:table-cell">Observacao</TableHead>
                    <TableHead className="w-[190px]">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendentes.map((candidatura) => (
                    <TableRow key={candidatura.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(candidatura.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{candidatura.nome}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {[formatTelefone(candidatura.telefone), candidatura.email]
                              .filter((value) => value && value !== "")
                              .join(" · ") || "Sem contato"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{candidatura.funcaoNome}</TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        <div className="space-y-1">
                          <p>{formatTelefone(candidatura.telefone) || "Sem telefone"}</p>
                          <p>{candidatura.email || "Sem e-mail"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-xs text-sm text-muted-foreground lg:table-cell">
                        {candidatura.observacoes || "Sem observacao"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => aprovar(candidatura.id)}
                            disabled={processandoId === candidatura.id}
                          >
                            {processandoId === candidatura.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check />
                            )}
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejeitar(candidatura.id)}
                            disabled={processandoId === candidatura.id}
                          >
                            <X />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-4">
            <div className="mb-3 px-2">
              <h4 className="text-sm font-semibold text-foreground">Historico de avaliacoes</h4>
              <p className="text-xs text-muted-foreground">
                Aqui ficam as candidaturas ja processadas para consulta rapida.
              </p>
            </div>

            {avaliadas.length === 0 ? (
              <p className="px-2 pb-2 text-sm text-muted-foreground">Nenhuma candidatura avaliada ainda.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Funcao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Avaliado em</TableHead>
                    <TableHead className="hidden lg:table-cell">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {avaliadas.map((candidatura) => (
                    <TableRow key={candidatura.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{candidatura.nome}</p>
                          <p className="text-xs text-muted-foreground">{candidatura.email || formatTelefone(candidatura.telefone) || "Sem contato"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{candidatura.funcaoNome}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={STATUS_CANDIDATURA_LABEL[candidatura.status]}
                          tone={STATUS_CANDIDATURA_TONE[candidatura.status]}
                        />
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {formatDateTime(candidatura.avaliadaEm)}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {candidatura.status === "aprovada"
                          ? candidatura.funcionarioNome
                            ? `${candidatura.funcionarioNome} enviado para a escala`
                            : "Enviado para a escala"
                          : "Nao entrou na escala"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
