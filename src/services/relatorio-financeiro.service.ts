import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { StatusCheckin } from "@/types";

export interface FreelancerRelatorio {
  funcionarioId: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  chavePix: string | null;
  funcaoNome: string;
  status: StatusCheckin;
  valorAReceber: number;
}

export interface ValorPorFuncao {
  funcao: string;
  valor: number;
}

export interface RelatorioFinanceiroEvento {
  vagasPlanejadas: number;
  confirmados: number;
  presentes: number;
  ausentes: number;
  atrasados: number;
  taxaComparecimento: number;
  valorTotalFolha: number;
  valorPorFuncao: ValorPorFuncao[];
  freelancers: FreelancerRelatorio[];
}

type ConviteRelatorioRow = {
  funcionario_id: string;
  valor_diaria: number | null;
  funcao: { nome: string } | null;
  funcionario: {
    id: string;
    nome: string;
    cpf: string | null;
    telefone: string | null;
    email: string | null;
    chave_pix: string | null;
  } | null;
};

export async function getRelatorioFinanceiroEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<RelatorioFinanceiroEvento> {
  const [vagasRes, convitesRes, checkinsRes] = await Promise.all([
    supabase.from("evento_funcoes").select("vagas").eq("evento_id", eventoId),
    supabase
      .from("convites")
      .select("funcionario_id, valor_diaria, funcao:funcoes(nome), funcionario:funcionarios(id, nome, cpf, telefone, email, chave_pix)")
      .eq("evento_id", eventoId)
      .eq("status", "aceito"),
    supabase.from("checkins").select("funcionario_id, status").eq("evento_id", eventoId),
  ]);

  if (vagasRes.error) throw vagasRes.error;
  if (convitesRes.error) throw convitesRes.error;
  if (checkinsRes.error) throw checkinsRes.error;

  const vagasPlanejadas = (vagasRes.data ?? []).reduce((soma, item) => soma + item.vagas, 0);

  const checkinPorFuncionario = new Map<string, StatusCheckin>();
  for (const c of checkinsRes.data ?? []) {
    checkinPorFuncionario.set(c.funcionario_id, c.status);
  }

  const freelancers: FreelancerRelatorio[] = ((convitesRes.data ?? []) as unknown as ConviteRelatorioRow[])
    .filter((c) => c.funcionario && c.funcao)
    .map((c) => {
      const status = checkinPorFuncionario.get(c.funcionario_id) ?? "pendente";
      const recebe = status === "presente" || status === "atrasado";
      return {
        funcionarioId: c.funcionario!.id,
        nome: c.funcionario!.nome,
        cpf: c.funcionario!.cpf,
        telefone: c.funcionario!.telefone,
        email: c.funcionario!.email,
        chavePix: c.funcionario!.chave_pix,
        funcaoNome: c.funcao!.nome,
        status,
        valorAReceber: recebe ? c.valor_diaria ?? 0 : 0,
      };
    });

  const confirmados = freelancers.length;
  const presentes = freelancers.filter((f) => f.status === "presente").length;
  const ausentes = freelancers.filter((f) => f.status === "ausente").length;
  const atrasados = freelancers.filter((f) => f.status === "atrasado").length;
  const taxaComparecimento = confirmados > 0 ? ((presentes + atrasados) / confirmados) * 100 : 0;
  const valorTotalFolha = freelancers.reduce((soma, f) => soma + f.valorAReceber, 0);

  const valorPorFuncaoMap = new Map<string, number>();
  for (const f of freelancers) {
    if (f.valorAReceber <= 0) continue;
    valorPorFuncaoMap.set(f.funcaoNome, (valorPorFuncaoMap.get(f.funcaoNome) ?? 0) + f.valorAReceber);
  }

  return {
    vagasPlanejadas,
    confirmados,
    presentes,
    ausentes,
    atrasados,
    taxaComparecimento,
    valorTotalFolha,
    valorPorFuncao: Array.from(valorPorFuncaoMap.entries()).map(([funcao, valor]) => ({ funcao, valor })),
    freelancers,
  };
}
