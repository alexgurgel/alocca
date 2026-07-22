"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listFuncionarios } from "@/services/funcionarios.service";
import type { FuncionarioComFuncoes, StatusFuncionario } from "@/types";
import { useDebounce } from "./use-debounce";

const POR_PAGINA = 8;

export function useColaboradores(empresaId: string | undefined) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusFuncionario | "todos">("todos");
  const [funcaoId, setFuncaoId] = useState<string>("todas");
  const [pagina, setPagina] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState<"nome" | "created_at" | "status">("nome");
  const [ordemAsc, setOrdemAsc] = useState(true);

  const [dados, setDados] = useState<FuncionarioComFuncoes[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const buscaDebounced = useDebounce(busca, 350);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, status, funcaoId]);

  const recarregar = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const resultado = await listFuncionarios(supabase, {
        empresaId,
        busca: buscaDebounced,
        status,
        funcaoId,
        ordenarPor,
        ordemAsc,
        pagina,
        porPagina: POR_PAGINA,
      });
      setDados(resultado.dados);
      setTotal(resultado.total);
    } finally {
      setCarregando(false);
    }
  }, [empresaId, buscaDebounced, status, funcaoId, ordenarPor, ordemAsc, pagina]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const alternarOrdenacao = useCallback(
    (coluna: "nome" | "created_at" | "status") => {
      if (ordenarPor === coluna) {
        setOrdemAsc((v) => !v);
      } else {
        setOrdenarPor(coluna);
        setOrdemAsc(true);
      }
    },
    [ordenarPor]
  );

  return {
    dados,
    total,
    carregando,
    busca,
    setBusca,
    status,
    setStatus,
    funcaoId,
    setFuncaoId,
    pagina,
    setPagina,
    porPagina: POR_PAGINA,
    ordenarPor,
    ordemAsc,
    alternarOrdenacao,
    recarregar,
  };
}
