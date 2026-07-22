"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listEventos } from "@/services/eventos.service";
import type { Evento, StatusEvento } from "@/types";
import { useDebounce } from "./use-debounce";

const POR_PAGINA = 9;

export function useEventos(empresaId: string | undefined) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusEvento | "todos">("todos");
  const [pagina, setPagina] = useState(1);
  const [ordenarPor, setOrdenarPor] = useState<"data_inicio" | "nome" | "created_at">(
    "data_inicio"
  );
  const [ordemAsc, setOrdemAsc] = useState(false);

  const [dados, setDados] = useState<Evento[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);

  const buscaDebounced = useDebounce(busca, 350);

  useEffect(() => {
    setPagina(1);
  }, [buscaDebounced, status]);

  const recarregar = useCallback(async () => {
    if (!empresaId) return;
    setCarregando(true);
    try {
      const supabase = createClient();
      const resultado = await listEventos(supabase, {
        empresaId,
        busca: buscaDebounced,
        status,
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
  }, [empresaId, buscaDebounced, status, ordenarPor, ordemAsc, pagina]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return {
    dados,
    total,
    carregando,
    busca,
    setBusca,
    status,
    setStatus,
    pagina,
    setPagina,
    porPagina: POR_PAGINA,
    ordenarPor,
    setOrdenarPor,
    ordemAsc,
    setOrdemAsc,
    recarregar,
  };
}
