import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface Indicadores {
  proximosEventos: number;
  eventosHoje: number;
  colaboradoresAtivos: number;
  colaboradoresConvocados: number;
  pessoasTrabalhandoHoje: number;
}

function limitesDoDia() {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);
  return { inicio, fim };
}

export async function getIndicadores(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<Indicadores> {
  const { inicio, fim } = limitesDoDia();
  const agora = new Date().toISOString();

  const [
    proximosEventosRes,
    eventosHojeRes,
    colaboradoresAtivosRes,
    convocadosRes,
    trabalhandoHojeRes,
  ] = await Promise.all([
    supabase
      .from("eventos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .gte("data_fim", agora)
      .in("status", ["planejado", "em_andamento"]),
    supabase
      .from("eventos")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .lte("data_inicio", fim.toISOString())
      .gte("data_fim", inicio.toISOString()),
    supabase
      .from("funcionarios")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("status", "ativo"),
    supabase
      .from("convites")
      .select("funcionario_id, evento:eventos!inner(empresa_id, data_fim)")
      .eq("evento.empresa_id", empresaId)
      .in("status", ["pendente", "aceito"])
      .gte("evento.data_fim", agora),
    supabase
      .from("convites")
      .select("funcionario_id, evento:eventos!inner(empresa_id, data_inicio, data_fim)")
      .eq("evento.empresa_id", empresaId)
      .eq("status", "aceito")
      .lte("evento.data_inicio", fim.toISOString())
      .gte("evento.data_fim", inicio.toISOString()),
  ]);

  if (proximosEventosRes.error) throw proximosEventosRes.error;
  if (eventosHojeRes.error) throw eventosHojeRes.error;
  if (colaboradoresAtivosRes.error) throw colaboradoresAtivosRes.error;
  if (convocadosRes.error) throw convocadosRes.error;
  if (trabalhandoHojeRes.error) throw trabalhandoHojeRes.error;

  const convocadosUnicos = new Set((convocadosRes.data ?? []).map((c) => c.funcionario_id));
  const trabalhandoUnicos = new Set(
    (trabalhandoHojeRes.data ?? []).map((c) => c.funcionario_id)
  );

  return {
    proximosEventos: proximosEventosRes.count ?? 0,
    eventosHoje: eventosHojeRes.count ?? 0,
    colaboradoresAtivos: colaboradoresAtivosRes.count ?? 0,
    colaboradoresConvocados: convocadosUnicos.size,
    pessoasTrabalhandoHoje: trabalhandoUnicos.size,
  };
}

export interface EventosPorMes {
  mes: string;
  quantidade: number;
}

export async function getEventosPorMes(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  meses = 6
): Promise<EventosPorMes[]> {
  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);
  inicio.setMonth(inicio.getMonth() - (meses - 1));

  const { data, error } = await supabase
    .from("eventos")
    .select("data_inicio")
    .eq("empresa_id", empresaId)
    .gte("data_inicio", inicio.toISOString());

  if (error) throw error;

  const buckets = new Map<string, number>();
  const labelFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
  const chaves: string[] = [];

  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(inicio);
    d.setMonth(inicio.getMonth() + (meses - 1 - i));
    const chave = `${d.getFullYear()}-${d.getMonth()}`;
    buckets.set(chave, 0);
    chaves.push(chave);
  }

  for (const evento of data ?? []) {
    const d = new Date(evento.data_inicio);
    const chave = `${d.getFullYear()}-${d.getMonth()}`;
    if (buckets.has(chave)) {
      buckets.set(chave, (buckets.get(chave) ?? 0) + 1);
    }
  }

  return chaves.map((chave) => {
    const [ano, mesIndex] = chave.split("-").map(Number);
    const label = labelFormatter.format(new Date(ano, mesIndex, 1));
    return {
      mes: label.charAt(0).toUpperCase() + label.slice(1).replace(".", ""),
      quantidade: buckets.get(chave) ?? 0,
    };
  });
}

export interface ColaboradoresPorFuncao {
  funcao: string;
  quantidade: number;
}

export async function getColaboradoresPorFuncao(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<ColaboradoresPorFuncao[]> {
  const { data, error } = await supabase
    .from("funcionario_funcoes")
    .select("funcao:funcoes(id, nome), funcionario:funcionarios!inner(empresa_id)")
    .eq("funcionario.empresa_id", empresaId);

  if (error) throw error;

  const contagem = new Map<string, ColaboradoresPorFuncao>();
  for (const row of (data ?? []) as unknown as { funcao: { id: string; nome: string } | null }[]) {
    if (!row.funcao) continue;
    const atual = contagem.get(row.funcao.id);
    if (atual) {
      atual.quantidade += 1;
    } else {
      contagem.set(row.funcao.id, { funcao: row.funcao.nome, quantidade: 1 });
    }
  }

  return Array.from(contagem.values()).sort((a, b) => b.quantidade - a.quantidade);
}
