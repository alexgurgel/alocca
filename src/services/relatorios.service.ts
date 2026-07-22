import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { StatusEvento } from "@/types";

export interface ResumoRelatorio {
  totalEventos: number;
  totalColaboradoresAtivos: number;
  taxaAceite: number;
  totalCheckinsPresentes: number;
}

export async function getResumoRelatorio(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<ResumoRelatorio> {
  const [eventosRes, colaboradoresRes, convitesRes, checkinsRes] = await Promise.all([
    supabase.from("eventos").select("id", { count: "exact", head: true }).eq("empresa_id", empresaId),
    supabase
      .from("funcionarios")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", empresaId)
      .eq("status", "ativo"),
    supabase
      .from("convites")
      .select("status, evento:eventos!inner(empresa_id)")
      .eq("evento.empresa_id", empresaId)
      .in("status", ["aceito", "recusado"]),
    supabase
      .from("checkins")
      .select("id, evento:eventos!inner(empresa_id)", { count: "exact", head: true })
      .eq("evento.empresa_id", empresaId)
      .eq("status", "presente"),
  ]);

  if (eventosRes.error) throw eventosRes.error;
  if (colaboradoresRes.error) throw colaboradoresRes.error;
  if (convitesRes.error) throw convitesRes.error;
  if (checkinsRes.error) throw checkinsRes.error;

  const convites = convitesRes.data ?? [];
  const aceitos = convites.filter((c) => c.status === "aceito").length;
  const taxaAceite = convites.length > 0 ? Math.round((aceitos / convites.length) * 100) : 0;

  return {
    totalEventos: eventosRes.count ?? 0,
    totalColaboradoresAtivos: colaboradoresRes.count ?? 0,
    taxaAceite,
    totalCheckinsPresentes: checkinsRes.count ?? 0,
  };
}

export interface EventosPorStatusItem {
  status: StatusEvento;
  quantidade: number;
}

export async function getEventosPorStatus(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<EventosPorStatusItem[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("status")
    .eq("empresa_id", empresaId);

  if (error) throw error;

  const ordem: StatusEvento[] = ["planejado", "em_andamento", "finalizado", "cancelado"];
  const contagem = new Map<StatusEvento, number>(ordem.map((s) => [s, 0]));
  for (const evento of data ?? []) {
    contagem.set(evento.status, (contagem.get(evento.status) ?? 0) + 1);
  }

  return ordem.map((status) => ({ status, quantidade: contagem.get(status) ?? 0 }));
}

export interface ColaboradorAtivoItem {
  funcionarioId: string;
  nome: string;
  fotoUrl: string | null;
  eventosConfirmados: number;
}

export async function getColaboradoresMaisAtivos(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  limite = 8
): Promise<ColaboradorAtivoItem[]> {
  const { data, error } = await supabase
    .from("convites")
    .select("funcionario:funcionarios!inner(id, nome, foto_url, empresa_id)")
    .eq("status", "aceito")
    .eq("funcionario.empresa_id", empresaId);

  if (error) throw error;

  const contagem = new Map<string, ColaboradorAtivoItem>();
  for (const row of (data ?? []) as unknown as {
    funcionario: { id: string; nome: string; foto_url: string | null };
  }[]) {
    const atual = contagem.get(row.funcionario.id);
    if (atual) {
      atual.eventosConfirmados += 1;
    } else {
      contagem.set(row.funcionario.id, {
        funcionarioId: row.funcionario.id,
        nome: row.funcionario.nome,
        fotoUrl: row.funcionario.foto_url,
        eventosConfirmados: 1,
      });
    }
  }

  return Array.from(contagem.values())
    .sort((a, b) => b.eventosConfirmados - a.eventosConfirmados)
    .slice(0, limite);
}
