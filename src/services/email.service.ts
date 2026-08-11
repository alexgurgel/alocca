import { Resend } from "resend";
import QRCode from "qrcode";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface EnviarEmailConfirmacaoParams {
  paraEmail: string;
  nomeFreelancer: string;
  eventoNome: string;
  funcaoNome: string;
  eventoLocal: string | null;
  eventoDataInicio: string;
  qrToken: string;
}

export async function enviarEmailConfirmacaoFreelancer({
  paraEmail,
  nomeFreelancer,
  eventoNome,
  funcaoNome,
  eventoLocal,
  eventoDataInicio,
  qrToken,
}: EnviarEmailConfirmacaoParams) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(eventoDataInicio));

  const qrCodePng = await QRCode.toBuffer(qrToken, { width: 240, margin: 1 });

  const { error } = await getResend().emails.send({
    from: "Alocca <contato@alocca.app.br>",
    to: paraEmail,
    subject: `Você foi confirmado para ${eventoNome}`,
    html: `
      <p>Olá, ${nomeFreelancer}!</p>
      <p>Sua candidatura para a função <strong>${funcaoNome}</strong> no evento <strong>${eventoNome}</strong> foi aprovada pelo organizador.</p>
      <p>
        <strong>Data:</strong> ${dataFormatada}<br />
        ${eventoLocal ? `<strong>Local:</strong> ${eventoLocal}<br />` : ""}
      </p>
      <p>Apresente o QR code abaixo na entrada do evento para fazer seu check-in:</p>
      <p><img src="cid:checkin-qr" alt="QR code de check-in" width="240" height="240" /></p>
      <p>Aguardamos você!</p>
      <p>Equipe Alocca</p>
    `,
    attachments: [
      {
        filename: "checkin-qr.png",
        content: qrCodePng,
        contentId: "checkin-qr",
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }
}
