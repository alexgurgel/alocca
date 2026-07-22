"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getColaboradoresPorFuncao,
  getEventosPorMes,
  getIndicadores,
  type ColaboradoresPorFuncao,
  type EventosPorMes,
  type Indicadores,
} from "@/services/dashboard.service";
import { listEventosHoje, listProximosEventos } from "@/services/eventos.service";
import type { Evento } from "@/types";

export function useDashboard(empresaId: string | undefined) {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [eventosPorMes, setEventosPorMes] = useState<EventosPorMes[]>([]);
  const [colaboradoresPorFuncao, setColaboradoresPorFuncao] = useState<ColaboradoresPorFuncao[]>(
    []
  );
  const [proximosEventos, setProximosEventos] = useState<Evento[]>([]);
  const [eventosHoje, setEventosHoje] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId) return;
    let ativo = true;
    setCarregando(true);

    const supabase = createClient();

    Promise.all([
      getIndicadores(supabase, empresaId),
      getEventosPorMes(supabase, empresaId),
      getColaboradoresPorFuncao(supabase, empresaId),
      listProximosEventos(supabase, empresaId),
      listEventosHoje(supabase, empresaId),
    ])
      .then(([ind, porMes, porFuncao, proximos, hoje]) => {
        if (!ativo) return;
        setIndicadores(ind);
        setEventosPorMes(porMes);
        setColaboradoresPorFuncao(porFuncao);
        setProximosEventos(proximos);
        setEventosHoje(hoje);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [empresaId]);

  return {
    indicadores,
    eventosPorMes,
    colaboradoresPorFuncao,
    proximosEventos,
    eventosHoje,
    carregando,
  };
}
