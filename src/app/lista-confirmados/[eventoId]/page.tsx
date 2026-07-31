"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Download, FileSpreadsheet, FileText, Loader2, MapPin, ShieldOff, Users } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { formatCPF, formatDate, formatDateTime, formatTelefone, slugify } from "@/lib/format";
import { exportarPdf } from "@/lib/export/pdf";
import { exportarExcel } from "@/lib/export/excel";
import {
  getListaConfirmadosEvento,
  getListaPublicaEventoInfo,
  type FreelancerConfirmado,
  type ListaPublicaEventoInfo,
} from "@/services/lista-confirmados.service";

const INTERVALO_ATUALIZACAO_MS = 5000;

const COLUNAS_EXPORTACAO = ["Nome completo", "Função", "CPF", "Data de nascimento", "Telefone", "E-mail", "Chave PIX"];

function linhaExportacao(c: FreelancerConfirmado) {
  return [
    c.nome,
    c.funcao_nome,
    formatCPF(c.cpf) || "—",
    formatDate(c.data_nascimento) ,
    formatTelefone(c.telefone) || "—",
    c.email || "—",
    c.chave_pix || "—",
  ];
}

export default function ListaConfirmadosPublicaPage() {
  const params = useParams<{ eventoId: string }>();

  const [info, setInfo] = useState<ListaPublicaEventoInfo | null | undefined>(undefined);
  const [confirmados, setConfirmados] = useState<FreelancerConfirmado[]>([]);

  useEffect(() => {
    let ativo = true;
    const supabase = createClient();

    async function carregar() {
      const [dadosInfo, dadosConfirmados] = await Promise.all([
        getListaPublicaEventoInfo(supabase, params.eventoId),
        getListaConfirmadosEvento(supabase, params.eventoId),
      ]);
      if (!ativo) return;
      setInfo(dadosInfo);
      setConfirmados(dadosConfirmados);
    }

    carregar();
    const intervalo = setInterval(carregar, INTERVALO_ATUALIZACAO_MS);
    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [params.eventoId]);

  function exportarSnapshotPdf() {
    if (!info) return;
    exportarPdf({
      titulo: `Freelancers confirmados — ${info.nome}`,
      subtitulo: `${info.empresa_nome} · gerado em ${formatDateTime(new Date())}`,
      colunas: COLUNAS_EXPORTACAO,
      linhas: confirmados.map(linhaExportacao),
      nomeArquivo: `confirmados-${slugify(info.nome)}.pdf`,
    });
  }

  function exportarSnapshotExcel() {
    if (!info) return;
    exportarExcel({
      nomeAba: "Confirmados",
      colunas: COLUNAS_EXPORTACAO,
      linhas: confirmados.map(linhaExportacao),
      nomeArquivo: `confirmados-${slugify(info.nome)}.xlsx`,
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-6 py-12">
      <Logo />

      <div className="w-full max-w-5xl">
        {info === undefined ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : info === null ? (
          <EmptyState
            icon={ShieldOff}
            title="Lista indisponível"
            description="Esse link não está mais ativo, ou o evento não existe."
          />
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-1 text-xs font-medium text-primary">{info.empresa_nome}</p>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">{info.nome}</h2>

              <div className="space-y-3">
                {info.local ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm text-foreground">{info.local}</p>
                  </div>
                ) : null}
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{formatDateTime(info.data_inicio)}</p>
                    <p className="text-sm text-muted-foreground">até {formatDateTime(info.data_fim)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Users className="size-4" />
                  Freelancers confirmados ({confirmados.length})
                </h3>

                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" />}>
                    <Download />
                    Baixar snapshot
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportarSnapshotPdf}>
                      <FileText />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportarSnapshotExcel}>
                      <FileSpreadsheet />
                      Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {confirmados.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum freelancer confirmado ainda"
                  description="Assim que houver confirmações, elas aparecem aqui automaticamente."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome completo</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Data de nascimento</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Chave PIX</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmados.map((c) => (
                      <TableRow key={c.funcionario_id}>
                        <TableCell className="font-medium text-foreground">{c.nome}</TableCell>
                        <TableCell className="text-muted-foreground">{c.funcao_nome}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCPF(c.cpf) || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(c.data_nascimento)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatTelefone(c.telefone) || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{c.chave_pix || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Esta lista é atualizada automaticamente. O snapshot baixado acima é uma foto do momento
                do download e não muda depois, mesmo que novos freelancers sejam confirmados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
