import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CheckinComRelacoes, StatusCheckin } from "@/types";

/**
 * Garante que exista uma linha de check-in (status "pendente") para cada
 * convite aceito do evento — idempotente via UNIQUE (evento_id, funcionario_id).
 */
export async function garantirCheckinsDoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
) {
  const { data: convites, error } = await supabase
    .from("convites")
    .select("funcionario_id")
    .eq("evento_id", eventoId)
    .eq("status", "aceito");

  if (error) throw error;
  if (!convites || convites.length === 0) return;

  const { error: upsertError } = await supabase.from("checkins").upsert(
    convites.map((c) => ({
      evento_id: eventoId,
      funcionario_id: c.funcionario_id,
    })),
    { onConflict: "evento_id,funcionario_id", ignoreDuplicates: true }
  );

  if (upsertError) throw upsertError;
}

export async function listCheckinsDoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<CheckinComRelacoes[]> {
  const { data, error } = await supabase
    .from("checkins")
    .select("*, funcionario:funcionarios(*)")
    .eq("evento_id", eventoId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as CheckinComRelacoes[];
}

export interface FreelancerPendente {
  id: string;
  nome: string;
}

/**
 * Lista os freelancers confirmados (convite aceito) cujo check-in ainda
 * esta "pendente" — ou seja, sem presenca ou ausencia registrada. Usado
 * para bloquear a finalizacao do evento. Garante primeiro que exista um
 * check-in para cada confirmado (idempotente).
 */
export async function listConfirmadosSemCheckinResolvido(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<FreelancerPendente[]> {
  await garantirCheckinsDoEvento(supabase, eventoId);

  const { data, error } = await supabase
    .from("checkins")
    .select("id, funcionario:funcionarios(id, nome)")
    .eq("evento_id", eventoId)
    .eq("status", "pendente");

  if (error) throw error;

  type Row = { id: string; funcionario: { id: string; nome: string } };
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.funcionario.id,
    nome: row.funcionario.nome,
  }));
}

export interface ResultadoScanQr {
  nome: string;
  status: StatusCheckin;
  jaConfirmado: boolean;
}

/**
 * Processa a leitura de um QR code de check-in: localiza o checkin pelo
 * token (escopado ao evento aberto, para nao aceitar QR de outro evento)
 * e aplica "presente" ou "atrasado" automaticamente, com base numa
 * tolerancia de 15 minutos apos o horario de inicio do evento. Se o
 * check-in ja tiver sido resolvido antes, nao reprocessa — so informa.
 */
export async function checkinPorQrToken(
  supabase: SupabaseClient<Database>,
  eventoId: string,
  qrToken: string,
  eventoDataInicio: string
): Promise<ResultadoScanQr | null> {
  const { data, error } = await supabase
    .from("checkins")
    .select("id, status, funcionario:funcionarios(nome)")
    .eq("evento_id", eventoId)
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  type Row = { id: string; status: StatusCheckin; funcionario: { nome: string } };
  const row = data as unknown as Row;

  if (row.status !== "pendente") {
    return { nome: row.funcionario.nome, status: row.status, jaConfirmado: true };
  }

  const TOLERANCIA_MINUTOS = 15;
  const limite = new Date(eventoDataInicio).getTime() + TOLERANCIA_MINUTOS * 60 * 1000;
  const novoStatus: StatusCheckin = Date.now() <= limite ? "presente" : "atrasado";

  await atualizarStatusCheckin(supabase, row.id, novoStatus);

  return { nome: row.funcionario.nome, status: novoStatus, jaConfirmado: false };
}

export async function atualizarStatusCheckin(
  supabase: SupabaseClient<Database>,
  id: string,
  status: StatusCheckin
) {
  const { data, error } = await supabase
    .from("checkins")
    .update({
      status,
      hora_checkin: status === "presente" || status === "atrasado" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("*, funcionario:funcionarios(*)")
    .single();

  if (error) throw error;
  return data;
}
