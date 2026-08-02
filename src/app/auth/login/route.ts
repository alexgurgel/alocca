import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

type LoginBody = {
  email?: string;
  senha?: string;
  redirect?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginBody;
  const email = body.email?.trim();
  const senha = body.senha;
  const requestedRedirect = body.redirect;

  if (!email || !senha) {
    return NextResponse.json({ message: "E-mail e senha s\u00e3o obrigat\u00f3rios." }, { status: 400 });
  }

  const cookiesToPersist: Array<{
    name: string;
    value: string;
    options?: Parameters<NextResponse["cookies"]["set"]>[2];
  }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookiesToPersist.push({ name, value, options });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error || !data.user) {
    console.error("Falha no login", {
      email,
      message: error?.message,
      status: error?.status,
      code: error?.code,
    });

    return NextResponse.json(
      { message: error?.message || "E-mail ou senha inv\u00e1lidos." },
      { status: 401 }
    );
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("papel")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!perfil) {
    return NextResponse.json(
      { message: "Seu usu\u00e1rio autenticou, mas n\u00e3o possui perfil cadastrado." },
      { status: 409 }
    );
  }

  const redirectTo =
    requestedRedirect && requestedRedirect.startsWith("/")
      ? requestedRedirect
      : perfil.papel === "colaborador"
        ? "/meus-convites"
        : "/painel";

  if (cookiesToPersist.length === 0) {
    return NextResponse.json(
      {
        message:
          "O login autenticou, mas a sess\u00e3o n\u00e3o foi persistida no navegador. Tente atualizar a p\u00e1gina e entrar novamente.",
      },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ ok: true, redirectTo });
  cookiesToPersist.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
