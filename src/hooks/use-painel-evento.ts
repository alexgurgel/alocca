"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPainelEvento, type PainelEvento } from "@/services/painel-evento.service";

export function usePainelEvento(eventoId: string | undefined) {
  const [painel, setPainel] = useState<PainelEvento | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!eventoId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await getPainelEvento(supabase, eventoId);
      setPainel(dados);
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
      .channel(`painel-evento-${eventoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "convites", filter: `evento_id=eq.${eventoId}` },
        () => recarregar()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `evento_id=eq.${eventoId}` },
        () => recarregar()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "evento_funcoes",
          filter: `evento_id=eq.${eventoId}`,
        },
        () => recarregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, recarregar]);

  return { painel, carregando, recarregar };
}
