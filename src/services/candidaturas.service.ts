import type { SupabaseClient } from "@supabase/supabase-js";

import type { CandidaturaPublicaInput } from "@/lib/validations/candidatura.schema";
import type { Database, StatusCandidatura, StatusEvento } from "@/types/database.types";
import type { CandidaturaEventoComRelacoes } from "@/types";

type EventoCandidaturaPublicaRow =
  Database["public"]["Functions"]["obter_evento_candidatura_publica"]["Returns"][number];

export interface CandidaturaPublicaFuncao {
  id: string;
  nome: string;
  vagas: number;
  confirmados: number;
  pendentes: number;
}

export interface EventoCandidaturaPublica {
  id: string;
  nome: string;
  status: StatusEvento;
  cliente: string | null;
  local: string | null;
  endereco: string | null;
  dataInicio: string;
  dataFim: string;
  observacoes: string | null;
  token: string;
  funcoes: CandidaturaPublicaFuncao[];
}

export interface CandidaturaEventoAdmin {
  id: string;
  eventoId: string;
  funcaoId: string;
  funcionarioId: string | null;
  conviteId: string | null;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  dataNascimento: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  lgpdAceito: boolean;
  lgpdAceitoEm: string | null;
  status: StatusCandidatura;
  aprovadaEm: string | null;
  rejeitadaEm: string | null;
  avaliadaEm: string | null;
  createdAt: string;
  updatedAt: string;
  funcaoNome: string;
  funcionarioNome: string | null;
}

export interface CadastroPublicoExistente {
  funcionarioId: string | null;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  dataNascimento: string | null;
  cidade: string | null;
  estado: string | null;
  observacoes: string | null;
  jaCadastradoEvento: boolean;
  candidaturaStatus: StatusCandidatura | null;
}

export async function getEventoCandidaturaPublica(
  supabase: SupabaseClient<Database>,
  token: string
): Promise<EventoCandidaturaPublica | null> {
  const { data, error } = await supabase.rpc("obter_evento_candidatura_publica", { p_token: token });
  if (error) throw error;

  const rows = (data ?? []) as EventoCandidaturaPublicaRow[];
  if (rows.length === 0) return null;

  const first = rows[0];

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
    token: first.candidatura_publica_token,
    funcoes: rows.map((row) => ({
      id: row.funcao_id,
      nome: row.funcao_nome,
      vagas: row.vagas,
      confirmados: row.confirmados,
      pendentes: row.pendentes,
    })),
  };
}

export async function enviarCandidaturaPublica(
  supabase: SupabaseClient<Database>,
  token: string,
  input: CandidaturaPublicaInput
) {
  const { data, error } = await supabase.rpc("criar_candidatura_publica", {
    p_token: token,
    p_funcao_id: input.funcao_id,
    p_nome: input.nome,
    p_cpf: input.cpf,
    p_telefone: input.telefone,
    p_email: input.email,
    p_data_nascimento: input.data_nascimento,
    p_cidade: input.cidade,
    p_estado: input.estado,
    p_lgpd_aceito: input.lgpd_aceito,
    p_observacoes: input.observacoes || null,
  });

  if (error) throw error;
  return data;
}

export async function buscarCadastroPublicoEvento(
  supabase: SupabaseClient<Database>,
  token: string,
  input: {
    cpf: string;
    email?: string;
    telefone?: string;
  }
): Promise<CadastroPublicoExistente | null> {
  const { data, error } = await supabase.rpc("buscar_cadastro_publico_evento", {
    p_token: token,
    p_cpf: input.cpf,
    p_email: input.email || null,
    p_telefone: input.telefone || null,
  });

  if (error) throw error;

  const row = data?.[0];
  if (!row) return null;

  return {
    funcionarioId: row.funcionario_id,
    nome: row.nome,
    cpf: row.cpf,
    telefone: row.telefone,
    email: row.email,
    dataNascimento: row.data_nascimento,
    cidade: row.cidade,
    estado: row.estado,
    observacoes: row.observacoes,
    jaCadastradoEvento: row.ja_cadastrado_evento,
    candidaturaStatus: row.candidatura_status,
  };
}

export async function listCandidaturasDoEvento(
  supabase: SupabaseClient<Database>,
  eventoId: string
): Promise<CandidaturaEventoAdmin[]> {
  const { data, error } = await supabase
    .from("candidaturas_evento")
    .select("*, funcao:funcoes(*), funcionario:funcionarios(*), convite:convites(*)")
    .eq("evento_id", eventoId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as unknown as CandidaturaEventoComRelacoes[];

  return rows
    .map((row) => ({
      id: row.id,
      eventoId: row.evento_id,
      funcaoId: row.funcao_id,
      funcionarioId: row.funcionario_id,
      conviteId: row.convite_id,
      nome: row.nome,
      cpf: row.cpf,
      telefone: row.telefone,
      email: row.email,
      dataNascimento: row.data_nascimento,
      cidade: row.cidade,
      estado: row.estado,
      observacoes: row.observacoes,
      lgpdAceito: row.lgpd_aceito,
      lgpdAceitoEm: row.lgpd_aceito_em,
      status: row.status,
      aprovadaEm: row.aprovada_em,
      rejeitadaEm: row.rejeitada_em,
      avaliadaEm: row.avaliada_em,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      funcaoNome: row.funcao?.nome ?? "Funcao",
      funcionarioNome: row.funcionario?.nome ?? null,
    }))
    .sort((a, b) => {
      const prioridade: Record<StatusCandidatura, number> = {
        pendente: 0,
        aprovada: 1,
        rejeitada: 2,
      };

      return prioridade[a.status] - prioridade[b.status];
    });
}

export async function aprovarCandidaturaEvento(
  supabase: SupabaseClient<Database>,
  candidaturaId: string
) {
  const { data, error } = await supabase.rpc("aprovar_candidatura_evento", {
    p_candidatura_id: candidaturaId,
  });

  if (error) throw error;
  return data;
}

export async function rejeitarCandidaturaEvento(
  supabase: SupabaseClient<Database>,
  candidaturaId: string
) {
  const { error } = await supabase.rpc("rejeitar_candidatura_evento", {
    p_candidatura_id: candidaturaId,
  });

  if (error) throw error;
}
