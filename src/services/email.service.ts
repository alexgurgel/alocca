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

interface EnviarConviteEquipeParams {
  paraEmail: string;
  empresaNome: string;
  nomeConvidante: string;
  link: string;
}

export async function enviarConviteEquipe({
  paraEmail,
  empresaNome,
  nomeConvidante,
  link,
}: EnviarConviteEquipeParams) {
  await getTransporter().sendMail({
    from: `Alocca <${process.env.EMAIL_USER}>`,
    to: paraEmail,
    subject: `Você foi convidado para a equipe de ${empresaNome} na Alocca`,
    html: `
      <p>Olá!</p>
      <p>${nomeConvidante} convidou você para acessar a conta de <strong>${empresaNome}</strong> na Alocca.</p>
      <p>Clique no link abaixo para criar sua senha e começar a usar:</p>
      <p><a href="${link}">${link}</a></p>
      <p>Se você não esperava esse convite, pode ignorar este e-mail.</p>
      <p>Equipe Alocca</p>
    `,
  });
}
