import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarEmailConfirmacaoFreelancer } from "@/services/email.service";

export async function POST(request: Request) {
  const { conviteId } = (await request.json().catch(() => ({}))) as { conviteId?: string };

  if (!conviteId) {
    return NextResponse.json({ error: "conviteId é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("preparar_checkin_confirmacao", {
    p_convite_id: conviteId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  const dados = data?.[0];
  if (!dados) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  if (!dados.funcionario_email) {
    return NextResponse.json({ skipped: true, reason: "Freelancer sem e-mail cadastrado" });
  }

  try {
    await enviarEmailConfirmacaoFreelancer({
      paraEmail: dados.funcionario_email,
      nomeFreelancer: dados.funcionario_nome,
      eventoNome: dados.evento_nome,
      funcaoNome: dados.funcao_nome,
      eventoLocal: dados.evento_local,
      eventoDataInicio: dados.evento_data_inicio,
      qrToken: dados.qr_token,
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao enviar e-mail: ${mensagem}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
