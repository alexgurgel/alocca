"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { EventosPorMes } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarDays } from "lucide-react";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {payload[0].value} evento{payload[0].value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function EventosPorMesChart({
  dados,
  carregando,
}: {
  dados: EventosPorMes[];
  carregando?: boolean;
}) {
  if (carregando) return <Skeleton className="h-64 w-full" />;

  const temDados = dados.some((d) => d.quantidade > 0);
  if (!temDados) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum evento no período"
        description="Cadastre eventos para acompanhar o volume mensal aqui."
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={24}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          width={28}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
        <Bar dataKey="quantidade" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
