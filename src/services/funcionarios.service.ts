import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Funcionario, FuncionarioComFuncoes, StatusFuncionario } from "@/types";
import type { ColaboradorInput } from "@/lib/validations/colaborador.schema";

export interface ListFuncionariosParams {
  empresaId: string;
  busca?: string;
  status?: StatusFuncionario | "todos";
  funcaoId?: string | "todas";
  ordenarPor?: "nome" | "created_at" | "status";
  ordemAsc?: boolean;
  pagina?: number;
  porPagina?: number;
}

export interface ListFuncionariosResult {
  dados: FuncionarioComFuncoes[];
  total: number;
}

export async function listFuncionarios(
  supabase: SupabaseClient<Database>,
  params: ListFuncionariosParams
): Promise<ListFuncionariosResult> {
  const {
    empresaId,
    busca,
    status = "todos",
    funcaoId = "todas",
    ordenarPor = "nome",
    ordemAsc = true,
    pagina = 1,
    porPagina = 10,
  } = params;

  const relacaoFuncoes =
    funcaoId !== "todas" ? "funcionario_funcoes!inner" : "funcionario_funcoes";

  let query = supabase
    .from("funcionarios")
    .select(`*, ${relacaoFuncoes}(funcao:funcoes(*))`, { count: "exact" })
    .eq("empresa_id", empresaId);

  if (busca) {
    query = query.or(
      `nome.ilike.%${busca}%,email.ilike.%${busca}%,cpf.ilike.%${busca}%`
    );
  }

  if (status !== "todos") {
    query = query.eq("status", status);
  }

  if (funcaoId !== "todas") {
    query = query.eq("funcionario_funcoes.funcao_id", funcaoId);
  }

  const from = (pagina - 1) * porPagina;
  const to = from + porPagina - 1;

  const { data, error, count } = await query
    .order(ordenarPor, { ascending: ordemAsc })
    .range(from, to);

  if (error) throw error;

  type Row = Funcionario & {
    funcionario_funcoes: { funcao: FuncionarioComFuncoes["funcoes"][number] }[];
  };

  const dados: FuncionarioComFuncoes[] = ((data ?? []) as unknown as Row[]).map((row) => {
    const { funcionario_funcoes, ...funcionario } = row;
    return {
      ...(funcionario as Funcionario),
      funcoes: (funcionario_funcoes ?? []).map((ff) => ff.funcao).filter(Boolean),
    };
  });

  return { dados, total: count ?? dados.length };
}

export async function getFuncionario(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<FuncionarioComFuncoes | null> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*, funcionario_funcoes(funcao:funcoes(*))")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { funcionario_funcoes, ...funcionario } = data as unknown as Funcionario & {
    funcionario_funcoes: { funcao: FuncionarioComFuncoes["funcoes"][number] }[];
  };

  return {
    ...(funcionario as Funcionario),
    funcoes: (funcionario_funcoes ?? []).map((ff) => ff.funcao).filter(Boolean),
  };
}

async function sincronizarFuncoes(
  supabase: SupabaseClient<Database>,
  funcionarioId: string,
  funcaoIds: string[]
) {
  const { error: deleteError } = await supabase
    .from("funcionario_funcoes")
    .delete()
    .eq("funcionario_id", funcionarioId);
  if (deleteError) throw deleteError;

  if (funcaoIds.length === 0) return;

  const { error: insertError } = await supabase.from("funcionario_funcoes").insert(
    funcaoIds.map((funcaoId) => ({
      funcionario_id: funcionarioId,
      funcao_id: funcaoId,
    }))
  );
  if (insertError) throw insertError;
}

export async function createFuncionario(
  supabase: SupabaseClient<Database>,
  empresaId: string,
  input: ColaboradorInput,
  fotoUrl?: string | null
) {
  const { data, error } = await supabase
    .from("funcionarios")
    .insert({
      empresa_id: empresaId,
      nome: input.nome,
      cpf: input.cpf || null,
      telefone: input.telefone || null,
      email: input.email || null,
      data_nascimento: input.data_nascimento || null,
      cidade: input.cidade || null,
      estado: input.estado || null,
      observacoes: input.observacoes || null,
      status: input.status,
      foto_url: fotoUrl || null,
    })
    .select("*")
    .single();

  if (error) throw error;

  await sincronizarFuncoes(supabase, data.id, input.funcao_ids);

  return data;
}

export async function updateFuncionario(
  supabase: SupabaseClient<Database>,
  id: string,
  input: ColaboradorInput,
  fotoUrl?: string | null
) {
  const updatePayload: Database["public"]["Tables"]["funcionarios"]["Update"] = {
    nome: input.nome,
    cpf: input.cpf || null,
    telefone: input.telefone || null,
    email: input.email || null,
    data_nascimento: input.data_nascimento || null,
    cidade: input.cidade || null,
    estado: input.estado || null,
    observacoes: input.observacoes || null,
    status: input.status,
  };

  if (fotoUrl !== undefined) {
    updatePayload.foto_url = fotoUrl;
  }

  const { data, error } = await supabase
    .from("funcionarios")
    .update(updatePayload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;

  await sincronizarFuncoes(supabase, id, input.funcao_ids);

  return data;
}

export async function deleteFuncionario(supabase: SupabaseClient<Database>, id: string) {
  const { error } = await supabase.from("funcionarios").delete().eq("id", id);
  if (error) throw error;
}

export async function listFuncionariosAtivos(
  supabase: SupabaseClient<Database>,
  empresaId: string
): Promise<Funcionario[]> {
  const { data, error } = await supabase
    .from("funcionarios")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("status", "ativo")
    .order("nome", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
