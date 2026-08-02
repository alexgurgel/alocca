import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  EmailNotConfiguredError,
  sendConfirmacaoPresencaEmail,
} from "@/services/email.service";

type CandidaturaNotificacaoRow = {
  id: string;
  nome: string;
  email: string | null;
  status: string;
  convite_id: string | null;
  evento: {
    nome: string;
    data_inicio: string;
    data_fim: string;
    local: string | null;
    endereco: string | null;
  } | null;
  funcao: {
    nome: string;
  } | null;
};

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/candidaturas/[id]/notificar-confirmacao">
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("candidaturas_evento")
    .select("id, nome, email, status, convite_id, evento:eventos(nome, data_inicio, data_fim, local, endereco), funcao:funcoes(nome)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: "Nao foi possivel carregar a candidatura." }, { status: 500 });
  }

  const candidatura = data as unknown as CandidaturaNotificacaoRow | null;

  if (!candidatura) {
    return NextResponse.json({ message: "Candidatura nao encontrada." }, { status: 404 });
  }

  if (candidatura.status !== "aprovada" || !candidatura.convite_id) {
    return NextResponse.json(
      { message: "A candidatura precisa estar aprovada para enviar a confirmacao." },
      { status: 409 }
    );
  }

  if (!candidatura.email) {
    await supabase
      .from("candidaturas_evento")
      .update({
        email_confirmacao_enviado_em: null,
        email_confirmacao_destino: null,
        email_confirmacao_erro: "Candidato sem e-mail para notificacao.",
      })
      .eq("id", candidatura.id);

    return NextResponse.json(
      { message: "A candidatura foi aprovada, mas o candidato nao possui e-mail cadastrado." },
      { status: 409 }
    );
  }

  const origin = (process.env.APP_BASE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const linkConfirmacao = `${origin}/convite/${candidatura.convite_id}`;

  try {
    await sendConfirmacaoPresencaEmail({
      destinatario: candidatura.email,
      nome: candidatura.nome,
      eventoNome: candidatura.evento?.nome ?? "Evento",
      funcaoNome: candidatura.funcao?.nome ?? "Funcao",
      dataInicio: candidatura.evento?.data_inicio ?? new Date().toISOString(),
      dataFim: candidatura.evento?.data_fim ?? new Date().toISOString(),
      local: candidatura.evento?.local ?? null,
      endereco: candidatura.evento?.endereco ?? null,
      linkConfirmacao,
    });

    await supabase
      .from("candidaturas_evento")
      .update({
        email_confirmacao_enviado_em: new Date().toISOString(),
        email_confirmacao_destino: candidatura.email,
        email_confirmacao_erro: null,
      })
      .eq("id", candidatura.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof EmailNotConfiguredError
        ? "Envio de e-mail nao configurado no ambiente."
        : error instanceof Error
          ? error.message
          : "Falha ao enviar e-mail de confirmacao.";

    await supabase
      .from("candidaturas_evento")
      .update({
        email_confirmacao_enviado_em: null,
        email_confirmacao_destino: candidatura.email,
        email_confirmacao_erro: message,
      })
      .eq("id", candidatura.id);

    const status = error instanceof EmailNotConfiguredError ? 503 : 500;
    return NextResponse.json({ message }, { status });
  }
}
