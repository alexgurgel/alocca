import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarEmailConfirmacaoFreelancer } from "@/services/email.service";

interface ConviteConfirmacaoRow {
  evento_id: string;
  funcionario_id: string;
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

  const { data: convite, error } = await supabase
    .from("convites")
    .select(
      "evento_id, funcionario_id, funcionario:funcionarios(nome, email), funcao:funcoes(nome), evento:eventos(nome, local, data_inicio)"
    )
    .eq("id", conviteId)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  const { evento_id, funcionario_id, funcionario, funcao, evento } =
    convite as unknown as ConviteConfirmacaoRow;

  if (!funcionario?.email) {
    return NextResponse.json({ skipped: true, reason: "Freelancer sem e-mail cadastrado" });
  }

  const { data: checkin, error: checkinError } = await supabase
    .from("checkins")
    .upsert(
      { evento_id, funcionario_id, convite_id: conviteId },
      { onConflict: "evento_id,funcionario_id", ignoreDuplicates: false }
    )
    .select("qr_token")
    .single();

  if (checkinError || !checkin) {
    return NextResponse.json({ error: "Não foi possível gerar o check-in" }, { status: 500 });
  }

  try {
    await enviarEmailConfirmacaoFreelancer({
      paraEmail: funcionario.email,
      nomeFreelancer: funcionario.nome,
      eventoNome: evento?.nome ?? "evento",
      funcaoNome: funcao?.nome ?? "",
      eventoLocal: evento?.local ?? null,
      eventoDataInicio: evento?.data_inicio ?? new Date().toISOString(),
      qrToken: checkin.qr_token,
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao enviar e-mail: ${mensagem}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
