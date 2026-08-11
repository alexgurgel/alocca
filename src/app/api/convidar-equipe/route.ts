import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enviarConviteEquipe } from "@/services/email.service";

interface ConviteEquipeRow {
  email: string;
  empresa: { nome: string } | null;
  criado_por_perfil: { nome: string } | null;
}

export async function POST(request: Request) {
  const { conviteId } = (await request.json().catch(() => ({}))) as { conviteId?: string };

  if (!conviteId) {
    return NextResponse.json({ error: "conviteId é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: convite, error } = await supabase
    .from("convites_equipe")
    .select("email, empresa:empresas(nome), criado_por_perfil:perfis!convites_equipe_criado_por_fkey(nome)")
    .eq("id", conviteId)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
  }

  const { email, empresa, criado_por_perfil } = convite as unknown as ConviteEquipeRow;
  const origin = new URL(request.url).origin;

  try {
    await enviarConviteEquipe({
      paraEmail: email,
      empresaNome: empresa?.nome ?? "sua empresa",
      nomeConvidante: criado_por_perfil?.nome ?? "Um administrador",
      link: `${origin}/equipe/aceitar/${conviteId}`,
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao enviar e-mail: ${mensagem}` }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
