export function getLinkConvite(conviteId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/convite/${conviteId}`;
}

export function getLinkCadastroFreelancer(empresaId: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/cadastro-freelancer/${empresaId}`;
}

export function mensagemConvite(eventoNome: string, link: string) {
  return `Olá! Você foi convidado(a) para o evento "${eventoNome}". Veja os detalhes e responda por aqui: ${link}`;
}

export function getLinkWhatsApp(telefone: string | null | undefined, mensagem: string) {
  const digits = (telefone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const comCodigoPais = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${comCodigoPais}?text=${encodeURIComponent(mensagem)}`;
}

export function getLinkEmail(email: string | null | undefined, eventoNome: string, mensagem: string) {
  if (!email) return null;
  const assunto = `Convite: ${eventoNome}`;
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`;
}
