"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createFuncao, deleteFuncao, listFuncoes, updateFuncao } from "@/services/funcoes.service";
import type { Funcao } from "@/types";
import type { FuncaoInput } from "@/lib/validations/funcao.schema";
import { toast } from "sonner";

export function useFuncoes(empresaId: string | undefined) {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const dados = await listFuncoes(supabase, empresaId);
      setFuncoes(dados);
    } catch {
      toast.error("Não foi possível carregar as funções.");
    } finally {
      setCarregando(false);
    }
  }, [empresaId]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const criar = useCallback(
    async (input: FuncaoInput) => {
      if (!empresaId) return;
      const supabase = createClient();
      await createFuncao(supabase, empresaId, input);
      toast.success("Função criada com sucesso.");
      await recarregar();
    },
    [empresaId, recarregar]
  );

  const atualizar = useCallback(
    async (id: string, input: FuncaoInput) => {
      const supabase = createClient();
      await updateFuncao(supabase, id, input);
      toast.success("Função atualizada.");
      await recarregar();
    },
    [recarregar]
  );

  const remover = useCallback(
    async (id: string) => {
      const supabase = createClient();
      await deleteFuncao(supabase, id);
      toast.success("Função removida.");
      await recarregar();
    },
    [recarregar]
  );

  return { funcoes, carregando, criar, atualizar, remover, recarregar };
}
