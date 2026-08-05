import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

interface EnviarEmailConfirmacaoParams {
  paraEmail: string;
  nomeFreelancer: string;
  eventoNome: string;
  funcaoNome: string;
  eventoLocal: string | null;
  eventoDataInicio: string;
}

export async function enviarEmailConfirmacaoFreelancer({
  paraEmail,
  nomeFreelancer,
  eventoNome,
  funcaoNome,
  eventoLocal,
  eventoDataInicio,
}: EnviarEmailConfirmacaoParams) {
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(eventoDataInicio));

  await getTransporter().sendMail({
    from: `Alocca <${process.env.EMAIL_USER}>`,
    to: paraEmail,
    subject: `Você foi confirmado para ${eventoNome}`,
    html: `
      <p>Olá, ${nomeFreelancer}!</p>
      <p>Sua candidatura para a função <strong>${funcaoNome}</strong> no evento <strong>${eventoNome}</strong> foi aprovada pelo organizador.</p>
      <p>
        <strong>Data:</strong> ${dataFormatada}<br />
        ${eventoLocal ? `<strong>Local:</strong> ${eventoLocal}<br />` : ""}
      </p>
      <p>Aguardamos você!</p>
      <p>Equipe Alocca</p>
    `,
  });
}
