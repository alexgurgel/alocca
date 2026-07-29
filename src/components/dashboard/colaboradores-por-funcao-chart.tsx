"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ColaboradoresPorFuncao } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ColaboradoresPorFuncao }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{item.funcao}</p>
      <p className="text-muted-foreground">
        {item.quantidade} freelancer{item.quantidade === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function ColaboradoresPorFuncaoChart({
  dados,
  carregando,
}: {
  dados: ColaboradoresPorFuncao[];
  carregando?: boolean;
}) {
  if (carregando) return <Skeleton className="h-64 w-full" />;

  if (dados.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum freelancer com função"
        description="Atribua funções aos freelancers para ver a distribuição aqui."
      />
    );
  }

  const altura = Math.max(160, dados.length * 40);

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 0, right: 28, left: 0, bottom: 0 }}
        barSize={18}
      >
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="funcao"
          axisLine={false}
          tickLine={false}
          width={110}
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
        />
        <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
        <Bar dataKey="quantidade" fill="var(--chart-1)" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="quantidade"
            position="right"
            style={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
