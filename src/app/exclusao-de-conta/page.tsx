import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Exclusão de conta e dados — Alocca",
  description: "Como solicitar a exclusão da sua conta e dos seus dados no Alocca.",
};

export default function ExclusaoDeContaPage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:mt-2 [&_p]:text-muted-foreground [&_ol]:mt-2 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ol]:text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_li]:pl-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exclusão de conta e dados</h1>
            <p className="mt-2 text-muted-foreground">
              Esta página explica como qualquer usuário do <strong>Alocca</strong> — administrador de
              empresa ou freelancer cadastrado — pode solicitar a exclusão da sua conta e dos seus
              dados pessoais.
            </p>
          </div>

          <div>
            <h2>Como solicitar</h2>
            <ol>
              <li>
                Envie um e-mail para{" "}
                <a
                  href="mailto:aloccaapp@gmail.com?subject=Exclus%C3%A3o%20de%20conta%20e%20dados"
                  className="font-medium text-primary hover:underline"
                >
                  aloccaapp@gmail.com
                </a>{" "}
                com o assunto <strong>&quot;Exclusão de conta e dados&quot;</strong>, de preferência a
                partir do mesmo e-mail cadastrado no Alocca.
              </li>
              <li>
                Informe seu nome completo e, se você for freelancer, o CPF usado no cadastro — isso
                garante que localizamos o registro certo.
              </li>
              <li>Confirmamos a exclusão por e-mail em até 15 dias.</li>
            </ol>
          </div>

          <div>
            <h2>O que é excluído</h2>
            <p>Ao confirmar a solicitação, removemos permanentemente:</p>
            <ul>
              <li>Nome, e-mail, telefone, CPF e data de nascimento</li>
              <li>Cidade, estado e chave PIX</li>
              <li>Histórico de convites e candidaturas associado à sua conta</li>
              <li>Credenciais de acesso (login e senha)</li>
            </ul>
            <p>
              Se você for administrador de uma empresa, os dados dos eventos e freelancers geridos
              pela empresa seguem as regras da própria empresa — entre em contato pelo mesmo e-mail
              para tratar a exclusão de dados da conta administradora.
            </p>
          </div>

          <div>
            <h2>Mais detalhes</h2>
            <p>
              Para informações completas sobre quais dados o Alocca coleta e como eles são usados,
              veja a{" "}
              <Link href="/privacidade" className="font-medium text-primary hover:underline">
                Política de Privacidade
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
