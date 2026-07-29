"use client";

import { CalendarClock, CalendarDays, UserCheck, Users, UsersRound } from "lucide-react";
import { useAppContext } from "@/components/providers/app-provider";
import { useDashboard } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventosPorMesChart } from "@/components/dashboard/eventos-por-mes-chart";
import { ColaboradoresPorFuncaoChart } from "@/components/dashboard/colaboradores-por-funcao-chart";
import { EventosListaCard } from "@/components/dashboard/eventos-lista-card";

export default function PainelPage() {
  const { perfil, empresa } = useAppContext();
  const { indicadores, eventosPorMes, colaboradoresPorFuncao, proximosEventos, eventosHoje, carregando } =
    useDashboard(perfil.empresa_id ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${perfil.nome.split(" ")[0]}`}
        description={empresa ? `Visão geral da operação da ${empresa.nome}.` : "Visão geral da sua operação."}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Próximos eventos"
          value={indicadores?.proximosEventos ?? 0}
          icon={CalendarDays}
          tone="blue"
          loading={carregando}
        />
        <StatCard
          label="Eventos hoje"
          value={indicadores?.eventosHoje ?? 0}
          icon={CalendarClock}
          tone="purple"
          loading={carregando}
        />
        <StatCard
          label="Freelancers ativos"
          value={indicadores?.colaboradoresAtivos ?? 0}
          icon={Users}
          tone="blue"
          loading={carregando}
        />
        <StatCard
          label="Freelancers convocados"
          value={indicadores?.colaboradoresConvocados ?? 0}
          icon={UsersRound}
          tone="cyan"
          loading={carregando}
        />
        <StatCard
          label="Trabalhando hoje"
          value={indicadores?.pessoasTrabalhandoHoje ?? 0}
          icon={UserCheck}
          tone="purple"
          loading={carregando}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Eventos por mês</h3>
          <p className="mb-4 text-xs text-muted-foreground">Volume de eventos nos últimos 6 meses</p>
          <EventosPorMesChart dados={eventosPorMes} carregando={carregando} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-foreground">Freelancers por função</h3>
          <p className="mb-4 text-xs text-muted-foreground">Distribuição da equipe cadastrada</p>
          <ColaboradoresPorFuncaoChart dados={colaboradoresPorFuncao} carregando={carregando} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <EventosListaCard
          titulo="Próximos eventos"
          descricao="Eventos planejados ou em andamento"
          eventos={proximosEventos}
          carregando={carregando}
          vazio="Nenhum evento futuro cadastrado."
        />
        <EventosListaCard
          titulo="Eventos de hoje"
          descricao="Acontecendo hoje"
          eventos={eventosHoje}
          carregando={carregando}
          vazio="Nenhum evento hoje."
        />
      </div>
    </div>
  );
}
