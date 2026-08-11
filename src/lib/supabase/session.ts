import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

const PUBLIC_ROUTES = [
  "/",
  "/entrar",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/privacidade",
  "/exclusao-de-conta",
];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/convite/")) return true;
  if (pathname.startsWith("/inscricao/")) return true;
  if (pathname.startsWith("/cadastro-freelancer/")) return true;
  if (pathname.startsWith("/lista-confirmados/")) return true;
  if (pathname.startsWith("/equipe/aceitar/")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() (nao getSession()) e obrigatorio aqui: getSession() nao
  // revalida o token no servidor e, pior, chamar getSession() em varios
  // lugares (middleware + layout + pages) na mesma navegacao entra em
  // corrida na rotacao do refresh token e derruba a sessao com
  // "Invalid Refresh Token" — foi a causa real do loop de redirecionamento.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const publicRoute = isPublicRoute(pathname);

  if (!user && !publicRoute) {
    const redirectUrl = new URL("/entrar", request.url);
    redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Nao redireciona automaticamente um usuario autenticado pra longe de
  // /entrar ou /cadastro aqui: isso nao sabe se o perfil existe/foi
  // aprovado, e um usuario autenticado sem perfil (ou pendente) ficaria
  // preso num loop infinito com o redirect da layout. Quem decide pra
  // onde mandar um usuario ja logado e a propria pagina/layout, que tem
  // acesso ao estado real do perfil.

  return response;
}
