import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: "Política de Privacidade — Alocca",
  description: "Como o Alocca coleta, usa e protege os dados de produtoras de eventos e freelancers.",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:mt-2 [&_p]:text-muted-foreground [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-muted-foreground [&_li]:pl-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Política de Privacidade</h1>
            <p className="mt-2 text-muted-foreground">
              Última atualização: 5 de agosto de 2026. Esta política explica quais dados o Alocca
              coleta, para que eles são usados e quais direitos você tem sobre eles, em conformidade
              com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
          </div>

          <div>
            <h2>1. Quem somos</h2>
            <p>
              O Alocca é uma plataforma de gestão operacional para produtoras de eventos, usada para
              organizar equipes de freelancers: escalas, convites, candidaturas, check-in e controle
              financeiro. Nesta política, chamamos de <strong>administrador</strong> a pessoa que
              cadastra a empresa e usa o painel do Alocca, e de <strong>freelancer</strong> a pessoa
              que se candidata ou é convidada para trabalhar em um evento.
            </p>
          </div>

          <div>
            <h2>2. Quais dados coletamos</h2>
            <p>De administradores (quem cria a conta da empresa):</p>
            <ul>
              <li>Nome, e-mail e senha (autenticação)</li>
              <li>Nome da empresa</li>
            </ul>
            <p>De freelancers (ao se candidatar a uma vaga ou ser cadastrado pelo administrador):</p>
            <ul>
              <li>Nome completo</li>
              <li>CPF</li>
              <li>Data de nascimento (usada para confirmar que o candidato é maior de idade)</li>
              <li>Telefone e e-mail de contato</li>
              <li>Cidade e estado</li>
              <li>Chave PIX (para viabilizar o pagamento da diária pelo administrador do evento)</li>
              <li>Consentimento LGPD e data/hora em que foi dado</li>
            </ul>
          </div>

          <div>
            <h2>3. Para que usamos esses dados</h2>
            <ul>
              <li>Viabilizar o cadastro e a autenticação de administradores e freelancers</li>
              <li>Organizar escalas, convites, candidaturas e check-in de eventos</li>
              <li>Permitir que o administrador identifique e pague o freelancer pela diária trabalhada</li>
              <li>Enviar e-mails operacionais (confirmação de cadastro, aprovação de candidatura, redefinição de senha)</li>
              <li>Cumprir obrigações legais e responder a solicitações de titulares de dados</li>
            </ul>
            <p>Não usamos esses dados para publicidade, e não os vendemos a terceiros.</p>
          </div>

          <div>
            <h2>4. Com quem compartilhamos</h2>
            <p>
              Seus dados não são compartilhados com terceiros para fins comerciais. Compartilhamos
              dados apenas com prestadores de infraestrutura estritamente necessários para o
              funcionamento do Alocca:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — banco de dados e autenticação
              </li>
              <li>
                <strong>Vercel</strong> — hospedagem da aplicação
              </li>
              <li>
                <strong>Google (Gmail)</strong> — envio de e-mails transacionais (confirmação, aprovação)
              </li>
            </ul>
            <p>
              Dentro do Alocca, os dados de uma empresa ficam isolados das demais — administradores de
              uma empresa não têm acesso aos dados de freelancers cadastrados em outra empresa.
            </p>
          </div>

          <div>
            <h2>5. Por quanto tempo guardamos os dados</h2>
            <p>
              Mantemos os dados enquanto a conta estiver ativa ou enquanto forem necessários para as
              finalidades descritas nesta política. Você pode solicitar a exclusão a qualquer momento
              pelos contatos abaixo.
            </p>
          </div>

          <div>
            <h2>6. Seus direitos (Art. 18 da LGPD)</h2>
            <p>Você pode, a qualquer momento, solicitar:</p>
            <ul>
              <li>Confirmação de que tratamos seus dados e acesso a eles</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados</li>
              <li>Exclusão dos dados tratados com base no seu consentimento</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço</li>
              <li>Revogação do consentimento dado</li>
              <li>Informação sobre com quem seus dados são compartilhados</li>
            </ul>
          </div>

          <div>
            <h2>7. Como exercer seus direitos</h2>
            <p>
              Envie sua solicitação para{" "}
              <a href="mailto:aloccaapp@gmail.com" className="font-medium text-primary hover:underline">
                aloccaapp@gmail.com
              </a>
              . Responderemos em até 15 dias.
            </p>
          </div>

          <div>
            <h2>8. Segurança</h2>
            <p>
              Os dados são armazenados com controle de acesso por empresa (cada administrador só acessa
              os dados da própria empresa) e trafegam sempre por conexão criptografada (HTTPS). O
              acesso ao painel administrativo passa por uma fila de aprovação antes de ser liberado.
            </p>
          </div>

          <div>
            <h2>9. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Mudanças relevantes serão comunicadas
              pelos canais do Alocca.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
