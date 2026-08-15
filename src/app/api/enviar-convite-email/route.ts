import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarEmailConvite } from "@/services/email.service";

interface ConviteRow {
  funcionario: { nome: string; email: string | null } | null;
  funcao: { nome: string } | null;
  evento: { nome: string; local: string | null; data_inicio: string } | null;
}

export async function POST(request: Request) {
  const { conviteId } = (await request.json().catch(() => ({}))) as { conviteId?: string };

  if (!conviteId) {
    return NextResponse.json({ error: "conviteId é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const origin = new URL(request.url).origin;

  const { data: convite, error } = await supabase
    .from("convites")
    .select("funcionario:funcionarios(nome, email), funcao:funcoes(nome), evento:eventos(nome, local, data_inicio)")
    .eq("id", conviteId)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  const { funcionario, funcao, evento } = convite as unknown as ConviteRow;

  if (!funcionario?.email) {
    return NextResponse.json({ skipped: true, reason: "Freelancer sem e-mail cadastrado" });
  }

  try {
    await enviarEmailConvite({
      paraEmail: funcionario.email,
      nomeFreelancer: funcionario.nome,
      eventoNome: evento?.nome ?? "evento",
      funcaoNome: funcao?.nome ?? "",
      eventoLocal: evento?.local ?? null,
      eventoDataInicio: evento?.data_inicio ?? new Date().toISOString(),
      linkConvite: `${origin}/convite/${conviteId}`,
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao enviar e-mail: ${mensagem}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
