"use client";

import { CalendarCheck2, TrendingUp, UserCheck2, Users } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { useRelatorios } from "@/hooks/use-relatorios";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventosPorStatusList } from "@/components/relatorios/eventos-por-status-list";
import { ColaboradoresAtivosList } from "@/components/relatorios/colaboradores-ativos-list";

export default function RelatoriosPage() {
  const { perfil } = useAppContext();
  const { resumo, eventosPorStatus, colaboradoresAtivos, carregando } = useRelatorios(
    perfil.empresa_id ?? undefined
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Indicadores gerais da operação da sua produtora."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de eventos"
          value={resumo?.totalEventos ?? 0}
          icon={CalendarCheck2}
          tone="blue"
          loading={carregando}
        />
        <StatCard
          label="Colaboradores ativos"
          value={resumo?.totalColaboradoresAtivos ?? 0}
          icon={Users}
          tone="purple"
          loading={carregando}
        />
        <StatCard
          label="Taxa de aceite de convites"
          value={resumo ? `${resumo.taxaAceite}%` : "0%"}
          icon={TrendingUp}
          tone="cyan"
          loading={carregando}
        />
        <StatCard
          label="Check-ins presentes"
          value={resumo?.totalCheckinsPresentes ?? 0}
          icon={UserCheck2}
          tone="blue"
          loading={carregando}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Eventos por status</h3>
          <p className="mb-4 text-xs text-muted-foreground">Distribuição de todos os eventos cadastrados</p>
          <EventosPorStatusList dados={eventosPorStatus} carregando={carregando} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Colaboradores mais convocados</h3>
          <p className="mb-4 text-xs text-muted-foreground">Ranking por eventos confirmados</p>
          <ColaboradoresAtivosList dados={colaboradoresAtivos} carregando={carregando} />
        </div>
      </div>
    </div>
  );
}
