"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  getColaboradoresMaisAtivos,
  getEventosPorStatus,
  getResumoRelatorio,
  type ColaboradorAtivoItem,
  type EventosPorStatusItem,
  type ResumoRelatorio,
} from "@/services/relatorios.service";

export function useRelatorios(empresaId: string | undefined) {
  const [resumo, setResumo] = useState<ResumoRelatorio | null>(null);
  const [eventosPorStatus, setEventosPorStatus] = useState<EventosPorStatusItem[]>([]);
  const [colaboradoresAtivos, setColaboradoresAtivos] = useState<ColaboradorAtivoItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!empresaId) return;
    let ativo = true;
    setCarregando(true);
    const supabase = createClient();

    Promise.all([
      getResumoRelatorio(supabase, empresaId),
      getEventosPorStatus(supabase, empresaId),
      getColaboradoresMaisAtivos(supabase, empresaId),
    ])
      .then(([resumoDados, statusDados, ativosDados]) => {
        if (!ativo) return;
        setResumo(resumoDados);
        setEventosPorStatus(statusDados);
        setColaboradoresAtivos(ativosDados);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [empresaId]);

  return { resumo, eventosPorStatus, colaboradoresAtivos, carregando };
}
