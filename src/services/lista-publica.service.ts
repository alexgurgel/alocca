import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, StatusConvite, StatusEvento } from "@/types/database.types";

type ListaPublicaRow = Database["public"]["Functions"]["obter_lista_publica_evento"]["Returns"][number];

export interface ListaPublicaColaborador {
  conviteId: string;
  nome: string;
  status: StatusConvite;
  valorDiaria: number | null;
  observacoes: string | null;
  respondidoEm: string | null;
}

export interface ListaPublicaFuncao {
  funcaoId: string;
  funcaoNome: string;
  vagas: number;
  confirmados: number;
  pendentes: number;
  recusados: number;
  colaboradores: ListaPublicaColaborador[];
}

export interface ListaPublicaEvento {
  id: string;
  nome: string;
  status: StatusEvento;
  cliente: string | null;
  local: string | null;
  endereco: string | null;
  dataInicio: string;
  dataFim: string;
  observacoes: string | null;
  observacaoFornecedor: string | null;
  observacaoFornecedorAtualizadaEm: string | null;
  listaPublicaToken: string;
  funcoes: ListaPublicaFuncao[];
  totais: {
    vagas: number;
    confirmados: number;
    pendentes: number;
    recusados: number;
  };
}

export async function getListaPublicaEvento(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<ListaPublicaEvento | null> {
  const { data, error } = await supabase.rpc("obter_lista_publica_evento", { p_token: token });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const first = data[0] as ListaPublicaRow;
  const funcoes = new Map<string, ListaPublicaFuncao>();

  for (const row of data as ListaPublicaRow[]) {
    if (!row.funcao_id || !row.funcao_nome || row.vagas === null) continue;

    const atual =
      funcoes.get(row.funcao_id) ??
      {
        funcaoId: row.funcao_id,
        funcaoNome: row.funcao_nome,
        vagas: row.vagas,
        confirmados: 0,
        pendentes: 0,
        recusados: 0,
        colaboradores: [],
      };

    if (row.convite_id && row.convite_status && row.funcionario_nome) {
      atual.colaboradores.push({
        conviteId: row.convite_id,
        nome: row.funcionario_nome,
        status: row.convite_status,
        valorDiaria: row.valor_diaria,
        observacoes: row.convite_observacoes,
        respondidoEm: row.respondido_em,
      });

      if (row.convite_status === "aceito") atual.confirmados += 1;
      if (row.convite_status === "pendente") atual.pendentes += 1;
      if (row.convite_status === "recusado") atual.recusados += 1;
    }

    funcoes.set(row.funcao_id, atual);
  }

  const listaFuncoes = Array.from(funcoes.values());

  return {
    id: first.evento_id,
    nome: first.evento_nome,
    status: first.evento_status,
    cliente: first.evento_cliente,
    local: first.evento_local,
    endereco: first.evento_endereco,
    dataInicio: first.evento_data_inicio,
    dataFim: first.evento_data_fim,
    observacoes: first.evento_observacoes,
    observacaoFornecedor: first.lista_publica_observacao_fornecedor,
    observacaoFornecedorAtualizadaEm: first.lista_publica_observacao_fornecedor_at,
    listaPublicaToken: first.lista_publica_token,
    funcoes: listaFuncoes,
    totais: {
      vagas: listaFuncoes.reduce((total, item) => total + item.vagas, 0),
      confirmados: listaFuncoes.reduce((total, item) => total + item.confirmados, 0),
      pendentes: listaFuncoes.reduce((total, item) => total + item.pendentes, 0),
      recusados: listaFuncoes.reduce((total, item) => total + item.recusados, 0),
    },
  };
}
