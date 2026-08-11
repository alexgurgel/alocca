"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  aprovarPerfil,
  atualizarAtivoPerfil,
  atualizarLimiteUsuariosEmpresa,
  atualizarPlanoPerfil,
  atualizarVencimentoPerfil,
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

  const atualizarAtivo = useCallback(
    async (id: string, ativo: boolean) => {
      const supabase = createClient();
      await atualizarAtivoPerfil(supabase, id, ativo);
      toast.success(ativo ? "Cadastro reativado." : "Cadastro inativado.");
      await recarregar();
    },
    [recarregar]
  );

  const atualizarVencimento = useCallback(
    async (id: string, dataVencimento: string | null) => {
      const supabase = createClient();
      await atualizarVencimentoPerfil(supabase, id, dataVencimento);
      toast.success(dataVencimento ? "Data de vencimento atualizada." : "Vencimento removido.");
      await recarregar();
    },
    [recarregar]
  );

  const atualizarLimiteUsuarios = useCallback(
    async (empresaId: string, limite: number) => {
      const supabase = createClient();
      await atualizarLimiteUsuariosEmpresa(supabase, empresaId, limite);
      toast.success("Limite de usuários atualizado.");
      await recarregar();
    },
    [recarregar]
  );

  return {
    perfis,
    carregando,
    aprovar,
    recusar,
    atualizarPlano,
    atualizarAtivo,
    atualizarVencimento,
    atualizarLimiteUsuarios,
    recarregar,
  };
}
