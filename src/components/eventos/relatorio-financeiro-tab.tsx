"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Percent,
  UserCheck,
  UserX,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { formatCPF, formatCurrencyBRL, formatTelefone, slugify } from "@/lib/format";
import { exportarPdf } from "@/lib/export/pdf";
import { exportarExcel } from "@/lib/export/excel";
import {
  getRelatorioFinanceiroEvento,
  type RelatorioFinanceiroEvento,
} from "@/services/relatorio-financeiro.service";
import { STATUS_CHECKIN_LABEL, type Evento } from "@/types";
import { STATUS_CHECKIN_TONE } from "@/lib/constants";

const ITENS_RESUMO = [
  { key: "vagasPlanejadas", label: "Vagas planejadas", icon: CalendarRange },
  { key: "confirmados", label: "Confirmados", icon: CheckCircle2 },
  { key: "presentes", label: "Presentes", icon: UserCheck },
  { key: "ausentes", label: "Ausentes", icon: UserX },
  { key: "atrasados", label: "Atrasados", icon: Clock },
] as const;

function linhasResumo(evento: Evento, relatorio: RelatorioFinanceiroEvento): string[] {
  return [
    `Vagas planejadas: ${relatorio.vagasPlanejadas}  ·  Confirmados: ${relatorio.confirmados}  ·  ` +
      `Presentes: ${relatorio.presentes}  ·  Ausentes: ${relatorio.ausentes}  ·  Atrasados: ${relatorio.atrasados}`,
    `Taxa de comparecimento: ${relatorio.taxaComparecimento.toFixed(1)}%  ·  ` +
      `Folha total: ${formatCurrencyBRL(relatorio.valorTotalFolha)}`,
  ];
}

export function RelatorioFinanceiroTab({ evento }: { evento: Evento }) {
  const [relatorio, setRelatorio] = useState<RelatorioFinanceiroEvento | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await getRelatorioFinanceiroEvento(supabase, evento.id);
      setRelatorio(dados);
    } finally {
      setCarregando(false);
    }
  }, [evento.id]);

  useEffect(() => {
    if (evento.status === "finalizado") carregar();
    else setCarregando(false);
  }, [evento.status, carregar]);

  if (evento.status !== "finalizado") {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Relatório ainda não disponível"
        description="O relatório financeiro é gerado automaticamente quando o evento é finalizado."
      />
    );
  }

  if (carregando || !relatorio) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  function exportarRelatorio(formato: "pdf" | "excel") {
    if (!relatorio) return;
    const colunas = ["Freelancer", "Função", "Status", "Valor a receber"];
    const linhas = relatorio.freelancers.map((f) => [
      f.nome,
      f.funcaoNome,
      STATUS_CHECKIN_LABEL[f.status],
      formatCurrencyBRL(f.valorAReceber),
    ]);
    const nomeArquivo = `relatorio-financeiro-${slugify(evento.nome)}`;

    if (formato === "pdf") {
      exportarPdf({
        titulo: `Relatório financeiro — ${evento.nome}`,
        subtitulo: linhasResumo(evento, relatorio),
        colunas,
        linhas,
        nomeArquivo: `${nomeArquivo}.pdf`,
      });
    } else {
      exportarExcel({ nomeAba: "Relatório financeiro", colunas, linhas, nomeArquivo: `${nomeArquivo}.xlsx` });
    }
  }

  function exportarListaPresentes(formato: "pdf" | "excel") {
    if (!relatorio) return;
    const presentes = relatorio.freelancers.filter((f) => f.status === "presente" || f.status === "atrasado");
    const colunas = ["Nome completo", "CPF", "Telefone", "E-mail", "Chave PIX", "Função", "Status", "Valor a receber"];
    const linhas = presentes.map((f) => [
      f.nome,
      formatCPF(f.cpf) || "—",
      formatTelefone(f.telefone) || "—",
      f.email || "—",
      f.chavePix || "—",
      f.funcaoNome,
      STATUS_CHECKIN_LABEL[f.status],
      formatCurrencyBRL(f.valorAReceber),
    ]);
    const nomeArquivo = `lista-presentes-${slugify(evento.nome)}`;

    if (formato === "pdf") {
      exportarPdf({
        titulo: `Lista de presentes — ${evento.nome}`,
        subtitulo: `${presentes.length} freelancer(s) presentes ou atrasados`,
        colunas,
        linhas,
        nomeArquivo: `${nomeArquivo}.pdf`,
      });
    } else {
      exportarExcel({ nomeAba: "Lista de presentes", colunas, linhas, nomeArquivo: `${nomeArquivo}.xlsx` });
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">Resumo financeiro</h3>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" />}>
                <Download />
                Relatório financeiro
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportarRelatorio("pdf")}>
                  <FileText />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportarRelatorio("excel")}>
                  <FileSpreadsheet />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" />}>
                <Download />
                Lista de presentes
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportarListaPresentes("pdf")}>
                  <FileText />
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportarListaPresentes("excel")}>
                  <FileSpreadsheet />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ITENS_RESUMO.map((item) => (
            <div key={item.key} className="rounded-xl border border-border bg-muted/30 p-3">
              <item.icon className="mb-2 size-4 text-primary" />
              <p className="text-xl font-semibold text-foreground">{relatorio[item.key]}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <Percent className="mb-2 size-4 text-[var(--success)]" />
            <p className="text-xl font-semibold text-foreground">{relatorio.taxaComparecimento.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Comparecimento</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <Banknote className="mb-2 size-4 text-[var(--success)]" />
            <p className="text-xl font-semibold text-foreground">{formatCurrencyBRL(relatorio.valorTotalFolha)}</p>
            <p className="text-xs text-muted-foreground">Folha total</p>
          </div>
        </div>

        {relatorio.valorPorFuncao.length > 0 ? (
          <div className="mt-6">
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground">Valor por função</h4>
            <div className="flex flex-wrap gap-2">
              {relatorio.valorPorFuncao.map((item) => (
                <span
                  key={item.funcao}
                  className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-foreground"
                >
                  {item.funcao}: <span className="font-semibold">{formatCurrencyBRL(item.valor)}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Freelancers</h3>

        {relatorio.freelancers.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nenhum freelancer confirmado neste evento" />
        ) : (
          <ul className="divide-y divide-border">
            {relatorio.freelancers.map((f) => (
              <li key={f.funcionarioId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{f.nome}</p>
                  <p className="text-xs text-muted-foreground">{f.funcaoNome}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge label={STATUS_CHECKIN_LABEL[f.status]} tone={STATUS_CHECKIN_TONE[f.status]} />
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrencyBRL(f.valorAReceber)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
