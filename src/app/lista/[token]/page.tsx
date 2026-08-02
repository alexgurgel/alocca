"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  Copy,
  type LucideIcon,
  Loader2,
  MapPin,
  RefreshCw,
  Share2,
  UserCheck,
  Users,
  UsersRound,
  UserX,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { EventoStatusBadge } from "@/components/eventos/evento-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { STATUS_CONVITE_TONE } from "@/lib/constants";
import { STATUS_CONVITE_LABEL } from "@/types";
import { formatDateTime } from "@/lib/format";
import { getListaPublicaEvento, type ListaPublicaEvento } from "@/services/lista-publica.service";

const POLLING_INTERVAL_MS = 10000;

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

export default function ListaPublicaEventoPage() {
  const params = useParams<{ token: string }>();
  const [lista, setLista] = useState<ListaPublicaEvento | null | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState<Date | null>(null);
  const [observacaoFornecedor, setObservacaoFornecedor] = useState("");
  const [observacaoAlterada, setObservacaoAlterada] = useState(false);
  const [salvandoObservacao, setSalvandoObservacao] = useState(false);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    async function carregar(silencioso = false) {
      if (!silencioso) {
        setCarregando(true);
      }

      try {
        const dados = await getListaPublicaEvento(supabase, params.token);
        if (!ativo) return;
        setLista(dados);
        setAtualizadoEm(new Date());
      } catch {
        if (!ativo) return;
        if (!silencioso) {
          setLista(null);
          toast.error("Nao foi possivel atualizar a lista compartilhada.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();
    const interval = window.setInterval(() => {
      carregar(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      ativo = false;
      window.clearInterval(interval);
    };
  }, [params.token]);

  const mapaUrl = useMemo(() => {
    if (!lista) return null;
    const enderecoBusca = lista.endereco || lista.local;
    if (!enderecoBusca) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoBusca)}`;
  }, [lista]);

  const linhasTabela = useMemo(() => {
    if (!lista) return [];

    return lista.funcoes.flatMap((funcao) =>
      funcao.colaboradores.map((colaborador) => ({
        id: colaborador.conviteId,
        funcao: funcao.funcaoNome,
        nome: colaborador.nome,
        status: colaborador.status,
        respondidoEm: colaborador.respondidoEm,
      }))
    );
  }, [lista]);

  async function copiarLink() {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link da lista copiado.");
  }

  useEffect(() => {
    if (!lista || observacaoAlterada) return;
    setObservacaoFornecedor(lista.observacaoFornecedor ?? "");
  }, [lista, observacaoAlterada]);

  async function salvarObservacaoFornecedor() {
    try {
      setSalvandoObservacao(true);
      const supabase = createClient();
      await supabase.rpc("atualizar_observacao_publica_evento", {
        p_token: params.token,
        p_observacao: observacaoFornecedor,
      });

      setLista((atual) =>
        atual
          ? {
              ...atual,
              observacaoFornecedor: observacaoFornecedor.trim() || null,
              observacaoFornecedorAtualizadaEm:
                observacaoFornecedor.trim() ? new Date().toISOString() : null,
            }
          : atual
      );
      setObservacaoAlterada(false);
      toast.success("Observacao do fornecedor salva.");
    } catch {
      toast.error("Nao foi possivel salvar a observacao.");
    } finally {
      setSalvandoObservacao(false);
    }
  }

  if (carregando && lista === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lista) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={Share2}
          title="Lista compartilhada nao encontrada"
          description="Verifique se o link esta correto ou solicite um novo compartilhamento."
          action={
            <Link href="/" className="text-sm font-medium text-primary hover:underline">
              Voltar ao inicio
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title={lista.nome}
        description="Lista de credenciamento compartilhada."
        actions={
          <>
            <Button variant="outline" onClick={copiarLink}>
              <Copy />
              Copiar link
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw />
              Atualizar
            </Button>
          </>
        }
      />

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <EventoStatusBadge status={lista.status} />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {formatDateTime(lista.dataInicio)} ate {formatDateTime(lista.dataFim)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="size-3.5" />
            Atualizacao automatica a cada 10 segundos
          </span>
        </div>

        {lista.local || lista.endereco ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span>{[lista.local, lista.endereco].filter(Boolean).join(" · ")}</span>
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

        {atualizadoEm ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Ultima sincronizacao: {formatDateTime(atualizadoEm)}
          </p>
        ) : null}
      </div>

      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Observacao do fornecedor</h2>
            <p className="text-xs text-muted-foreground">
              Use este campo para registrar recados gerais de credenciamento, acesso ou operacao.
            </p>
            {lista.observacaoFornecedorAtualizadaEm ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Ultima observacao salva em {formatDateTime(lista.observacaoFornecedorAtualizadaEm)}
              </p>
            ) : null}
          </div>
          <Button
            onClick={salvarObservacaoFornecedor}
            disabled={salvandoObservacao || !observacaoAlterada}
          >
            {salvandoObservacao ? <Loader2 className="size-4 animate-spin" /> : null}
            Salvar observacao
          </Button>
        </div>

        <div className="mt-4">
          <Textarea
            rows={4}
            value={observacaoFornecedor}
            onChange={(event) => {
              setObservacaoFornecedor(event.target.value);
              setObservacaoAlterada(true);
            }}
            placeholder="Ex.: fornecedor chega as 14h, entrada pelo portao lateral, levar lista impressa..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatPill icon={UsersRound} label="Vagas previstas" value={lista.totais.vagas} />
        <StatPill icon={UserCheck} label="Confirmados" value={lista.totais.confirmados} />
        <StatPill icon={Users} label="Pendentes" value={lista.totais.pendentes} />
        <StatPill icon={UserX} label="Recusados" value={lista.totais.recusados} />
      </div>

      {linhasTabela.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="Nenhum colaborador na lista ainda"
          description="Assim que a escala receber convites, os nomes aparecerao aqui para acompanhamento."
        />
      ) : (
        <div className="rounded-3xl border border-border bg-card p-2 shadow-sm sm:p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funcao</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Resposta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasTabela.map((linha) => (
                <TableRow key={linha.id}>
                  <TableCell className="text-sm font-medium text-foreground">{linha.funcao}</TableCell>
                  <TableCell className="text-sm text-foreground">{linha.nome}</TableCell>
                  <TableCell>
                    <StatusBadge
                      label={STATUS_CONVITE_LABEL[linha.status]}
                      tone={STATUS_CONVITE_TONE[linha.status]}
                    />
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                    {linha.respondidoEm ? formatDateTime(linha.respondidoEm) : "Aguardando"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
