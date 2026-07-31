"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  listConfirmadosSemCheckinResolvido,
  type FreelancerPendente,
} from "@/services/checkins.service";

export function useFinalizacaoEvento(eventoId: string | undefined) {
  const [pendentes, setPendentes] = useState<FreelancerPendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!eventoId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await listConfirmadosSemCheckinResolvido(supabase, eventoId);
      setPendentes(dados);
    } finally {
      setCarregando(false);
    }
  }, [eventoId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  useEffect(() => {
    if (!eventoId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`finalizacao-evento-${eventoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `evento_id=eq.${eventoId}` },
        () => recarregar()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "convites", filter: `evento_id=eq.${eventoId}` },
        () => recarregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, recarregar]);

  return { pendentes, carregando, recarregar };
}
