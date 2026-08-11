"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  cancelarConviteEquipe,
  criarConviteEquipe,
  listConvitesEquipePendentes,
  listMembrosEquipe,
} from "@/services/equipe.service";
import type { ConviteEquipe, Perfil } from "@/types";

export function useEquipe(empresaId: string | undefined) {
  const [membros, setMembros] = useState<Perfil[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<ConviteEquipe[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const [dadosMembros, dadosConvites] = await Promise.all([
        listMembrosEquipe(supabase, empresaId),
        listConvitesEquipePendentes(supabase, empresaId),
      ]);
      setMembros(dadosMembros);
      setConvitesPendentes(dadosConvites);
    } catch {
      toast.error("Não foi possível carregar a equipe.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const convidar = useCallback(
    async (email: string) => {
      const supabase = createClient();
      const convite = await criarConviteEquipe(supabase, email);
      try {
        const res = await fetch("/api/convidar-equipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conviteId: convite.id }),
        });
        if (!res.ok) throw new Error(await res.text());
        toast.success("Convite enviado por e-mail.");
      } catch {
        toast.error("Convite criado, mas não foi possível enviar o e-mail. Copie o link manualmente.");
      }
      await recarregar();
      return convite;
    },
    [recarregar]
  );

  const cancelar = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await cancelarConviteEquipe(supabase, id);
      toast.success("Convite cancelado.");
      await recarregar();
    },
    [recarregar]
  );

  return { membros, convitesPendentes, carregando, convidar, cancelar, recarregar };
}
