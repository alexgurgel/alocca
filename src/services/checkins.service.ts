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
