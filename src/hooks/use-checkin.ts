"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  atualizarStatusCheckin,
  garantirCheckinsDoEvento,
  listCheckinsDoEvento,
} from "@/services/checkins.service";
import type { CheckinComRelacoes, StatusCheckin } from "@/types";
import { toast } from "sonner";

export function useCheckin(eventoId: string | undefined) {
  const [checkins, setCheckins] = useState<CheckinComRelacoes[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!eventoId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      await garantirCheckinsDoEvento(supabase, eventoId);
      const dados = await listCheckinsDoEvento(supabase, eventoId);
      setCheckins(dados);
    } catch {
      toast.error("Não foi possível carregar a lista de check-in.");
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
      .channel(`checkins-evento-${eventoId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `evento_id=eq.${eventoId}` },
        () => recarregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventoId, recarregar]);

  const marcarStatus = useCallback(async (id: string, status: StatusCheckin) => {
    const supabase = createClient();
    const anterior = checkins;
    setCheckins((atual) =>
      atual.map((c) => (c.id === id ? { ...c, status } : c))
    );
    try {
      await atualizarStatusCheckin(supabase, id, status);
    } catch {
      setCheckins(anterior);
      toast.error("Não foi possível atualizar o check-in.");
    }
  }, [checkins]);

  return { checkins, carregando, marcarStatus, recarregar };
}
