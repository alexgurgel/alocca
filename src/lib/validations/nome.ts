import { z } from "zod";

const APENAS_LETRAS_ESPACOS_HIFEN_APOSTROFO = /^[\p{L}\s'-]+$/u;
const CONTEM_LETRA = /\p{L}/u;
const CONTEM_NUMERO = /\d/;

export function normalizarNomeCompleto(valor: string) {
  return valor.trim().replace(/\s+/g, " ");
}

export function removerNumeros(valor: string) {
  return valor.replace(/\d/g, "");
}

export const nomeCompletoSchema = z
  .string()
  .transform(normalizarNomeCompleto)
  .superRefine((valor, ctx) => {
    if (CONTEM_NUMERO.test(valor)) {
      ctx.addIssue({ code: "custom", message: "O nome não pode conter números." });
      return;
    }

    if (!CONTEM_LETRA.test(valor) || !APENAS_LETRAS_ESPACOS_HIFEN_APOSTROFO.test(valor)) {
      ctx.addIssue({ code: "custom", message: "O nome informado é inválido." });
      return;
    }

    const palavras = valor.split(" ").filter(Boolean);
    if (palavras.length < 2) {
      ctx.addIssue({ code: "custom", message: "Informe seu nome completo (nome e sobrenome)." });
      return;
    }

    if (valor.length < 8) {
      ctx.addIssue({ code: "custom", message: "O nome deve ter no mínimo 8 caracteres." });
      return;
    }

    if (valor.length > 120) {
      ctx.addIssue({ code: "custom", message: "O nome deve ter no máximo 120 caracteres." });
      return;
    }
  });
