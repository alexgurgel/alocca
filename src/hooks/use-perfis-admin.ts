"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  aprovarPerfil,
  atualizarPlanoPerfil,
  listPerfisAdmins,
  recusarPerfil,
  type PerfilComEmpresa,
} from "@/services/perfis.service";
import type { PlanoAcesso } from "@/types";

export function usePerfisAdmin() {
  const [perfis, setPerfis] = useState<PerfilComEmpresa[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await listPerfisAdmins(supabase);
      setPerfis(dados);
    } catch {
      toast.error("Não foi possível carregar os perfis.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const aprovar = useCallback(
    async (id: string, aprovadoPorId: string) => {
      const supabase = createClient();
      await aprovarPerfil(supabase, id, aprovadoPorId);
      toast.success("Conta aprovada.");
      await recarregar();
    },
    [recarregar]
  );

  const recusar = useCallback(
    async (id: string, aprovadoPorId: string) => {
      const supabase = createClient();
      await recusarPerfil(supabase, id, aprovadoPorId);
      toast.success("Conta recusada.");
      await recarregar();
    },
    [recarregar]
  );

  const atualizarPlano = useCallback(
    async (id: string, plano: PlanoAcesso) => {
      const supabase = createClient();
      await atualizarPlanoPerfil(supabase, id, plano);
      toast.success("Plano atualizado.");
      await recarregar();
    },
    [recarregar]
  );

  return { perfis, carregando, aprovar, recusar, atualizarPlano, recarregar };
}
