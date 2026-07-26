import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Evento, StatusEvento } from "@/types";
import type { EventoInput } from "@/lib/validations/evento.schema";

export interface ListEventosParams {
  empresaId: string;
  busca?: string;
  status?: StatusEvento | "todos";
  ordenarPor?: "data_inicio" | "nome" | "created_at";
  ordemAsc?: boolean;
  pagina?: number;
  porPagina?: number;
}

export interface ListEventosResult {
  dados: Evento[];
  total: number;
}

export async function listEventos(
  supabase: SupabaseClient<Database>,
  params: ListEventosParams
): Promise<ListEventosResult> {
  const {
    empresaId,
    busca,
    status = "todos",
    ordenarPor = "data_inicio",
    ordemAsc = false,
    pagina = 1,
    porPagina = 10,
  } = params;

  let query = supabase
    .from("eventos")
    .select("*", { count: "exact" })
    .eq("empresa_id", empresaId);

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,cliente.ilike.%${busca}%,local.ilike.%${busca}%`);
  }

  if (status !== "todos") {
    query = query.eq("status", status);
  }

  const from = (pagina - 1) * porPagina;
  const to = from + porPagina - 1;

  const { data, error, count } = await query
    .order(ordenarPor, { ascending: ordemAsc })
    .range(from, to);

  if (error) throw error;
  return { dados: data ?? [], total: count ?? 0 };
}

export async function getEvento(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<Evento | null> {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function toPayload(input: EventoInput) {
  return {
    nome: input.nome,
    cliente: input.cliente || null,
    local: input.local || null,
    endereco: input.endereco || null,
    data_inicio: new Date(input.data_inicio).toISOString(),
    data_fim: new Date(input.data_fim).toISOString(),
    observacoes: input.observacoes || null,
    status: input.status,
  };
}

export async function createEvento(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  criadoPor: string | null,
  input: EventoInput
) {
  const { data, error } = await supabase
    .from("eventos")
    .insert({ empresa_id: empresaId, criado_por: criadoPor, ...toPayload(input) })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvento(
  supabase: SupabaseClient<Database>,
  id: string,
  input: EventoInput
) {
  const { data, error } = await supabase
    .from("eventos")
    .update(toPayload(input))
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function toggleInscricaoPublica(
  supabase: SupabaseClient<Database>,
  id: string,
  ativa: boolean
) {
  const { data, error } = await supabase
    .from("eventos")
    .update({ inscricao_publica_ativa: ativa })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvento(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) throw error;
}

export async function listProximosEventos(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  limite = 5
): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("empresa_id", empresaId)
    .gte("data_fim", new Date().toISOString())
    .in("status", ["planejado", "em_andamento"])
    .order("data_inicio", { ascending: true })
    .limit(limite);

  if (error) throw error;
  return data ?? [];
}

export async function listEventosHoje(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<Evento[]> {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fim = new Date();
  fim.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("empresa_id", empresaId)
    .lte("data_inicio", fim.toISOString())
    .gte("data_fim", inicio.toISOString())
    .order("data_inicio", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
