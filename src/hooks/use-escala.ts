"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  addFuncaoAoEvento,
  listEscalaDoEvento,
  removeFuncaoDoEvento,
  updateVagasFuncaoEvento,
} from "@/services/escalas.service";
import { cancelarConvite, enviarConvite, responderConvite } from "@/services/convites.service";
import type { EscalaFuncao } from "@/types";
import type { EscalaFuncaoInput, ConvidarColaboradorInput } from "@/lib/validations/escala.schema";
import { toast } from "sonner";

export function useEscala(eventoId: string | undefined) {
  const [escala, setEscala] = useState<EscalaFuncao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!eventoId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await listEscalaDoEvento(supabase, eventoId);
      setEscala(dados);
    } catch {
      toast.error("Não foi possível carregar a escala do evento.");
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
      .channel(`convites-evento-${eventoId}`)
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

  const adicionarFuncao = useCallback(
    async (input: EscalaFuncaoInput) => {
      if (!eventoId) return;
      const supabase = createClient();
      await addFuncaoAoEvento(supabase, eventoId, input);
      toast.success("Função adicionada à escala.");
      await recarregar();
    },
    [eventoId, recarregar]
  );

  const atualizarVagas = useCallback(
    async (id: string, vagas: number) => {
      const supabase = createClient();
      await updateVagasFuncaoEvento(supabase, id, vagas);
      await recarregar();
    },
    [recarregar]
  );

  const removerFuncao = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await removeFuncaoDoEvento(supabase, id);
      toast.success("Função removida da escala.");
      await recarregar();
    },
    [recarregar]
  );

  const convidar = useCallback(
    async (funcaoId: string, input: ConvidarColaboradorInput) => {
      if (!eventoId) return;
      const supabase = createClient();
      await enviarConvite(supabase, eventoId, funcaoId, input);
      toast.success("Convite enviado ao colaborador.");
      await recarregar();
    },
    [eventoId, recarregar]
  );

  const cancelarConviteEnviado = useCallback(
    async (conviteId: string) => {
      const supabase = createClient();
      await cancelarConvite(supabase, conviteId);
      toast.success("Convite cancelado.");
      await recarregar();
    },
    [recarregar]
  );

  const marcarResposta = useCallback(
    async (conviteId: string, status: "aceito" | "recusado") => {
      const supabase = createClient();
      await responderConvite(supabase, conviteId, status);
      await recarregar();
    },
    [recarregar]
  );

  const avaliarCandidatura = useCallback(
    async (conviteId: string, status: "aceito" | "recusado") => {
      const supabase = createClient();
      await responderConvite(supabase, conviteId, status);
      toast.success(status === "aceito" ? "Candidatura aprovada." : "Candidatura recusada.");
      await recarregar();
    },
    [recarregar]
  );

  return {
    escala,
    carregando,
    adicionarFuncao,
    atualizarVagas,
    removerFuncao,
    convidar,
    cancelarConviteEnviado,
    marcarResposta,
    avaliarCandidatura,
    recarregar,
  };
}
