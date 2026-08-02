import nodemailer from "nodemailer";

export class EmailNotConfiguredError extends Error {
  constructor() {
    super("Envio de e-mail nao configurado.");
    this.name = "EmailNotConfiguredError";
  }
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail(params: SendEmailParams) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() !== "false";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM;

  if (!user || !pass || !from) {
    throw new EmailNotConfiguredError();
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  const info = await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  return info;
}

interface ConfirmacaoPresencaEmailParams {
  destinatario: string;
  nome: string;
  eventoNome: string;
  funcaoNome: string;
  dataInicio: string;
  dataFim: string;
  local: string | null;
  endereco: string | null;
  linkConfirmacao: string;
}

export async function sendConfirmacaoPresencaEmail(params: ConfirmacaoPresencaEmailParams) {
  const assunto = `Confirme sua presenca: ${params.eventoNome}`;
  const localFormatado = [params.local, params.endereco].filter(Boolean).join(" - ") || "Local a definir";

  const text = [
    `Ola, ${params.nome}!`,
    "",
    `Sua candidatura para a funcao ${params.funcaoNome} foi aprovada no evento ${params.eventoNome}.`,
    `Inicio: ${new Date(params.dataInicio).toLocaleString("pt-BR")}`,
    `Fim: ${new Date(params.dataFim).toLocaleString("pt-BR")}`,
    `Local: ${localFormatado}`,
    "",
    "Confirme sua presenca pelo link abaixo:",
    params.linkConfirmacao,
    "",
    "Se voce nao puder participar, use o mesmo link para recusar.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Sua candidatura foi aprovada</h2>
      <p>Ola, <strong>${escapeHtml(params.nome)}</strong>!</p>
      <p>
        Sua candidatura para a funcao <strong>${escapeHtml(params.funcaoNome)}</strong>
        foi aprovada no evento <strong>${escapeHtml(params.eventoNome)}</strong>.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong>Inicio:</strong> ${escapeHtml(new Date(params.dataInicio).toLocaleString("pt-BR"))}</p>
        <p style="margin: 0 0 8px;"><strong>Fim:</strong> ${escapeHtml(new Date(params.dataFim).toLocaleString("pt-BR"))}</p>
        <p style="margin: 0;"><strong>Local:</strong> ${escapeHtml(localFormatado)}</p>
      </div>
      <p>Use o botao abaixo para confirmar sua presenca:</p>
      <p style="margin: 24px 0;">
        <a
          href="${escapeAttribute(params.linkConfirmacao)}"
          style="display: inline-block; padding: 12px 20px; border-radius: 10px; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600;"
        >
          Confirmar presenca
        </a>
      </p>
      <p style="font-size: 14px; color: #4b5563;">
        Se preferir, copie e cole este link no navegador:<br />
        <a href="${escapeAttribute(params.linkConfirmacao)}">${escapeHtml(params.linkConfirmacao)}</a>
      </p>
      <p style="font-size: 14px; color: #4b5563;">
        Se voce nao puder participar, use o mesmo link para recusar.
      </p>
    </div>
  `;

  return sendTransactionalEmail({
    to: params.destinatario,
    subject: assunto,
    html,
    text,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
