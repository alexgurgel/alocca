import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export interface PainelEvento {
  previstas: number;
  confirmados: number;
  recusados: number;
  pendentes: number;
  presentes: number;
  ausentes: number;
  atrasados: number;
}

export async function getPainelEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<PainelEvento> {
  const [vagasRes, convitesRes, checkinsRes] = await Promise.all([
    supabase.from("evento_funcoes").select("vagas").eq("evento_id", eventoId),
    supabase.from("convites").select("status").eq("evento_id", eventoId),
    supabase.from("checkins").select("status").eq("evento_id", eventoId),
  ]);

  if (vagasRes.error) throw vagasRes.error;
  if (convitesRes.error) throw convitesRes.error;
  if (checkinsRes.error) throw checkinsRes.error;

  const previstas = (vagasRes.data ?? []).reduce((soma, item) => soma + item.vagas, 0);

  const convites = convitesRes.data ?? [];
  const confirmados = convites.filter((c) => c.status === "aceito").length;
  const recusados = convites.filter((c) => c.status === "recusado").length;
  const pendentes = convites.filter((c) => c.status === "pendente").length;

  const checkins = checkinsRes.data ?? [];
  const presentes = checkins.filter((c) => c.status === "presente").length;
  const ausentes = checkins.filter((c) => c.status === "ausente").length;
  const atrasados = checkins.filter((c) => c.status === "atrasado").length;

  return { previstas, confirmados, recusados, pendentes, presentes, ausentes, atrasados };
}
